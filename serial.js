(function() {
    'use strict';

    angular.module('flybrixCommon').factory('serial', serial);

    serial.$inject = ['$timeout', '$q', 'cobs', 'commandLog', 'parser'];

    function serial($timeout, $q, cobs, commandLog, parser) {
        var acknowledges = [];
        var backend = new Backend();
        var onStateListener = function() {
            commandLog('No state listener defined for serial');
        };
        var onCommandListener = function() {
            commandLog('No command listener defined for serial');
        };
        var cobsReader = new cobs.Reader(2000);
        var dataHandler = undefined;

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

        return {
            busy: busy,
            field: parser.CommandFields,
            send: send,
            setBackend: setBackend,
            setStateCallback: setStateCallback,
            setCommandCallback: setCommandCallback,
            setDataHandler: setDataHandler,
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

        function send(mask, data, log_send) {
            if (log_send === undefined)
                log_send = true;

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
                    'Sending command <span style="color:blue">' +
                    parser.MessageType.Command + '</blue>');
            }

            return response.promise;
        }

        function busy() {
            return backend.busy();
        }

        function setDataHandler(handler) {
            dataHandler = handler;
        }

        function read(data) {
            if (dataHandler)
                dataHandler(data, processData);
            else
                cobsReader.AppendToBuffer(data, processData, reportIssues);
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

        function acknowledge(mask, value) {
            while (acknowledges.length > 0) {
                var v = acknowledges.shift();
                if (v.mask !== mask) {
                    v.response.reject('Missing ACK');
                    continue;
                }
                var relaxedMask = mask;
                relaxedMask &= ~parser.CommandFields.COM_REQ_RESPONSE;
                if (relaxedMask !== value) {
                    v.response.reject('Request was not fully processed');
                    break;
                }
                v.response.resolve();
                break;
            }
        }

        function processData(command, mask, message_buffer) {
            parser.processBinaryDatastream(
                command, mask, message_buffer, onStateListener,
                onCommandListener, acknowledge);
        };

        function byteNinNum(data, n) {
            return (data >> (8 * n)) & 0xFF;
        }
    }
}());
