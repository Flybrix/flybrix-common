(function() {
    'use strict';

    angular.module('flybrixCommon').factory('serial', serial);

    serial.$inject = ['$timeout', '$q', 'cobs', 'commandLog', 'parser'];

    function serial($timeout, $q, cobs, commandLog, parser) {
        var acknowledges = [];
        var address = '';
        var commandCallback = undefined;
        var sender = function() {};
        var onStateListener = function() {};
        var onCommandListener = function() {};
        var cobsReader = new cobs.Reader(2000);
        var dataHandler = undefined;

        return {
            busy: busy,
            field: parser.CommandFields,
            send: send,
            setCommandCallback: setCommandCallback,
            setAddress: setAddress,
            setSender: setSender,
            reader: reader,
            setStateCallback: setStateCallback,
            setCommandCallback: setCommandCallback,
            setDataHandler: setDataHandler,
            getDataHandler: getDataHandler,
        };

        function setSender(callback) {
            if (sender !== undefined) {
                sender = callback;
            }
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
                sender(address, new Uint8Array(cobs.encode(bufView)));
            }, 0);

            if (log_send) {
                commandLog('Sending command <span style="color:blue">' +
                           parser.MessageType.Command + '</blue>');
            }

            return response.promise;
        }

        function busy() {
            return false;
        }

        function setCommandCallback(callback) {
            commandCallback = callback;
        }

        function getAddress() {
            return address
        }

        function setAddress(value) {
            address = value;
        }

        function setDataHandler(handler) {
            dataHandler = handler;
        }

        function getDataHandler() {
            return dataHandler;
        }

        function reader(data) {
            if (dataHandler)
                dataHandler(data, processData);
            else
                cobsReader.AppendToBuffer(data, processData);
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
                var relaxedMask = mask & ~parser.CommandFields.COM_REQ_RESPONSE;
                if (relaxedMask !== value) {
                    v.response.reject('Request was not fully processed');
                    break;
                }
                v.response.resolve();
                break;
            }
        }

        function processData(command, mask, message_buffer) {
            parser.processBinaryDatastream(command, mask, message_buffer,
                                           onStateListener, onCommandListener,
                                           acknowledge);
        };

        function byteNinNum(data, n) {
            return (data >> (8 * n)) & 0xFF;
        }
    }
}());
