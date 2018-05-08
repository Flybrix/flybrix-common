(function() {
    'use strict';

    angular.module('flybrixCommon').factory('serial', serial);

    serial.$inject = ['$timeout', '$q', 'cobs', 'commandLog', 'parser', 'firmwareVersion', 'serializationHandler'];

    function serial($timeout, $q, cobs, commandLog, parser, firmwareVersion, serializationHandler) {
        var acknowledges = [];
        var backend = new Backend();
        var onStateListener = function() {
            commandLog('No state listener defined for serial');
        };
        var onCommandListener = function() {
            commandLog('No command listener defined for serial');
        };
        var onDebugListener = function() {
            commandLog('No debug listener defined for serial');
        };
        var onHistoryListener = function() {
            commandLog('No history listener defined for serial');
        };

        var onReceiveListeners = [];

        var cobsReader = new cobs.Reader(2000);
        var bytesHandler = undefined;

        function Backend() {
        }

        Backend.prototype.busy = function() {
            return false;
        };

        Backend.prototype.send = function(data) {
            commandLog('No "send" defined for serial backend');
        };

        Backend.prototype.onRead = function(data) {
            commandLog('No "onRead" defined for serial backend');
        };

        var MessageTypeInversion = [];

        MessageTypeInversion[0] = 'State';
        MessageTypeInversion[1] = 'Command';
        MessageTypeInversion[3] = 'DebugString';
        MessageTypeInversion[4] = 'HistoryData';
        MessageTypeInversion[255] = 'Response';

        addOnReceiveCallback(function(messageType, message) {
            if (messageType === 'Response') {
                acknowledge(message.mask, message.ack);
            }
        });

        return {
            busy: busy,
            field: parser.CommandFields,
            send: send,
            sendStructure: sendStructure,
            setBackend: setBackend,
            addOnReceiveCallback: addOnReceiveCallback,
            removeOnReceiveCallback: removeOnReceiveCallback,
            setCommandCallback: setCommandCallback,
            setBytesHandler: setBytesHandler,
            handlePostConnect: handlePostConnect,
            Backend: Backend,
        };

        function setBackend(v) {
            backend = v;
            backend.onRead = read;
        }

        function handlePostConnect() {
            return requestFirmwareVersion();
        }

        function requestFirmwareVersion() {
            return send(
                parser.CommandFields.COM_REQ_PARTIAL_EEPROM_DATA, [1, 0, 0, 0]);
        }

        function sendStructure(messageType, data, log_send) {
            var handlers = firmwareVersion.serializationHandler();

            var response = $q.defer();
            if (!(messageType in parser.MessageType)) {
                response.reject('Message type "' + messageType +
                    '" not supported by app, supported message types are:' +
                    Object.keys(parser.MessageType).join(', '));
                return response.promise;
            }
            if (!(messageType in handlers)) {
                response.reject('Message type "' + messageType +
                    '" not supported by firmware, supported message types are:' +
                    Object.keys(handlers).join(', '));
                return response.promise;
            }
            var typeCode = parser.MessageType[messageType];
            var handler = handlers[messageType];

            var buffer = new Uint8Array(handler.byteCount);

            var serializer = new serializationHandler.Serializer(new DataView(buffer.buffer));
            handler.encode(serializer, data);
            var mask = handler.maskArray(data);
            if (mask.length < 5) {
                mask = (mask[0] << 0) | (mask[1] << 8) | (mask[2] << 16) | (mask[3] << 24);
            }

            var dataLength = serializer.index;

            var output = new Uint8Array(dataLength + 3);
            output[0] = output[1] = typeCode;
            for (var idx = 0; idx < dataLength; ++idx) {
                output[0] ^= output[idx + 2] = buffer[idx];
            }
            output[dataLength + 2] = 0;

            acknowledges.push({
                mask: mask,
                response: response,
            });

            $timeout(function() {
                backend.send(new Uint8Array(cobs.encode(output)));
            }, 0);

            if (log_send) {
                commandLog('Sending command ' + typeCode);
            }

            return response.promise;
        }

        function send(mask, data, log_send) {
            if (log_send === undefined)
                log_send = false;

            var response = $q.defer();

            mask |= parser.CommandFields.COM_REQ_RESPONSE;  // force responses

            var checksum = 0;
            var bufferOut, bufView;

            // always reserve 1 byte for protocol overhead !
            if (typeof data === 'object') {
                var size = 7 + data.length;
                bufView = new Uint8Array(size);
                checksum ^= bufView[1] = parser.MessageType.Command;
                for (var i = 0; i < 4; ++i)
                    checksum ^= bufView[i + 2] = byteNinNum(mask, i);
                for (var i = 0; i < data.length; i++)
                    checksum ^= bufView[i + 6] = data[i];
            } else {
                bufferOut = new ArrayBuffer(8);
                bufView = new Uint8Array(bufferOut);
                checksum ^= bufView[1] = parser.MessageType.Command;
                for (var i = 0; i < 4; ++i)
                    checksum ^= bufView[i + 2] = byteNinNum(mask, i);
                checksum ^= bufView[6] = data;  // payload
            }
            bufView[0] = checksum;  // crc
            bufView[bufView.length - 1] = 0;

            acknowledges.push({
                mask: mask,
                response: response,
            });

            $timeout(function() {
                backend.send(new Uint8Array(cobs.encode(bufView)));
            }, 0);

            if (log_send) {
                commandLog(
                    'Sending command ' + parser.MessageType.Command );
            }

            return response.promise;
        }

        function busy() {
            return backend.busy();
        }

        function setBytesHandler(handler) {
            bytesHandler = handler;
        }

        function setDataHandler(handler) {
            console.warn('Deprecated setDataHandler, use setBytesHandler')
            if (!handler) {
                bytesHandler = undefined;
                return;
            }
            setBytesHandler(function(data, callback) {
                handler(data, function(command, mask, message_buffer) {
                    var input = new Uint8Array(message_buffer);
                    var output = new Uint8Array(input.length + 5);
                    output[0] = command;
                    var byte;
                    for (byte = 1; byte < 5; ++byte) {
                        output[byte] = mask & 0xff;
                        mask >>= 8;
                    }
                    for (byte = 0; byte < input.length; ++byte) {
                        output[byte + 5] = input[byte];
                    }
                    callback(output);
                });
            });
        }

        function read(data) {
            if (bytesHandler)
                bytesHandler(data, processData);
            else
                cobsReader.readBytes(data, processData, reportIssues);
        }

        function reportIssues(issue, text) {
            commandLog('COBS decoding failed (' + issue + '): ' + text);
        }

        function setStateCallback(callback) {
            onStateListener = callback;
        }

        function setCommandCallback(callback) {
            onCommandListener = callback;
        }

        function setHistoryCallback(callback) {
            onHistoryListener = callback;
        }

        function setDebugCallback(callback) {
            onDebugListener = callback;
        }

        function addOnReceiveCallback(callback) {
            onReceiveListeners = onReceiveListeners.concat([callback]);
        }

        function removeOnReceiveCallback(callback) {
            onReceiveListeners = onReceiveListeners.filter(function(cb) {
                return cb === callback;
            });
        }

        function acknowledge(mask, value) {
            while (acknowledges.length > 0) {
                var v = acknowledges.shift();
                if (v.mask ^ mask) {
                    v.response.reject('Missing ACK');
                    continue;
                }
                var relaxedMask = mask;
                relaxedMask &= ~parser.CommandFields.COM_REQ_RESPONSE;
                if (relaxedMask ^ value) {
                    v.response.reject('Request was not fully processed');
                    break;
                }
                v.response.resolve();
                break;
            }
        }

        function processData(bytes) {
            var messageType = MessageTypeInversion[bytes[0]];
            var handler = firmwareVersion.serializationHandler()[messageType];
            if (!messageType || !handler) {
                commandLog('Illegal message type passed from firmware');
                return;
            }
            var serializer = new serializationHandler.Serializer(new DataView(bytes.buffer, 1));
            var message = handler.decode(serializer);
            onReceiveListeners.forEach(function(listener) {
                listener(messageType, message);
            });
        }

        function byteNinNum(data, n) {
            return (data >> (8 * n)) & 0xFF;
        }
    }
}());
