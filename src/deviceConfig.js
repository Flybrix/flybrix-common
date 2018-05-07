(function() {
    'use strict';

    angular.module('flybrixCommon').factory('deviceConfig', deviceConfig);

    deviceConfig.$inject =
        ['serial', 'commandLog', 'encodable', 'firmwareVersion'];

    function deviceConfig(serial, commandLog, encodable, firmwareVersion) {
        var config;

        var configCallback = function() {
            commandLog('No callback defined for receiving configurations!');
        };

        var loggingCallback = function() {
            commandLog(
                'No callback defined for receiving logging state!' +
                ' Callback arguments: (isLogging, isLocked, delay)');
        };

        var configFields = {
            VERSION: 1 << 0,
            ID: 1 << 1,
            PCB: 1 << 2,
            MIX_TABLE: 1 << 3,
            MAG_BIAS: 1 << 4,
            CHANNEL: 1 << 5,
            PID_PARAMETERS: 1 << 6,
            STATE_PARAMETERS: 1 << 7,
            LED_STATES: 1 << 8,
            DEVICE_NAME: 1 << 9,
            VELOCITY_PID_PARAMETERS: 1 << 10,
            INERTIAL_BIAS: 1 << 11,
        };

        serial.setCommandCallback(function(mask, message_buffer) {
            if (mask & serial.field.COM_SET_EEPROM_DATA) {
                comSetEepromData(message_buffer);
            }
            if (mask & serial.field.COM_SET_PARTIAL_EEPROM_DATA) {
                comSetPartialEepromData(message_buffer);
            }
            if (mask & (serial.field.COM_SET_CARD_RECORDING |
                        serial.field.COM_SET_SD_WRITE_DELAY)) {
                var dataBuffer = new Uint8Array(message_buffer);
                if (dataBuffer.length >= 3) {
                    var delay = dataBuffer[0] | (dataBuffer[1] << 8);
                    var data = dataBuffer[2];
                    loggingCallback((data & 1) !== 0, (data & 2) !== 0, delay);
                } else {
                    commandLog('Bad data given for logging info');
                }
            }
        });

        function getDesiredVersion() {
            return firmwareVersion.desired();
        }


        function request() {
            var handlers = firmwareVersion.serializationHandler();
            commandLog('Requesting current configuration data...');
            return serial.sendStructure('Command', {
                request_response: true,
                req_partial_eeprom_data: handlers.ConfigurationFlag.empty(),
            }, false);
        }

        function reinit() {
            commandLog('Setting factory default configuration data...');
            return serial.sendStructure('Command', {
                request_response: true,
                reinit_eeprom_data: true,
            }, false)
                .then(
                    function() {
                        return request();
                    },
                    function(reason) {
                        commandLog(
                            'Request for factory reset failed: ' + reason);
                    });
        }

        function send(newConfig) {
            return sendPartial(0xffff, 0xffff, newConfig, false, true);
        }

        function sendPartial(
            mask, led_mask, newConfig, temporary, request_update) {
            if (mask === undefined) {
                mask = 0;
            }
            if (led_mask === undefined) {
                led_mask = 0;
            }
            if (newConfig === undefined) {
                newConfig = config;
            }
            var target = temporary ?
                serial.field.COM_SET_PARTIAL_TEMPORARY_CONFIG :
                serial.field.COM_SET_PARTIAL_EEPROM_DATA;

            var data = setConfigPartial(newConfig, mask, led_mask);
            return serial.send(target, data, false).then(function() {
                if (request_update) {
                    request();
                }
            })
        }

        function applyPropertiesTo(source, destination) {
            Object.keys(source).forEach(function(key) {
                destination[key] = source[key];
            });
        }

        function setConfig(structure) {
            var handler = firmwareVersion.configHandler();
            var data = new Uint8Array(handler.bytecount());
            var dataView = new DataView(data.buffer, 0);
            handler.encode(dataView, new encodable.Serializer(), structure);
            return data;
        }

        function setConfigPartial(structure, mask, led_mask) {
            var handler = firmwareVersion.configHandler();
            var data = new Uint8Array(handler.bytecount([led_mask, mask]))
                var dataView = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            handler.encodePartial(dataView, b, structure, [led_mask, mask]);
            return data;
        }

        function comSetEepromData(message_buffer) {
            //commandLog('Received config!');
            config = firmwareVersion.configHandler().decode(
                new DataView(message_buffer, 0), new encodable.Serializer());
            respondToSetEeprom();
        }

        function comSetPartialEepromData(message_buffer) {
            //commandLog('Received partial config!');
            config = firmwareVersion.configHandler().decodePartial(
                new DataView(message_buffer, 0), new encodable.Serializer(),
                angular.copy(config)),
            respondToSetEeprom();
        }

        function respondToSetEeprom() {
            firmwareVersion.set(config.version);
            if (!firmwareVersion.supported()) {
                commandLog('Received an unsupported configuration!');
                commandLog(
                    'Found version: ' + config.version[0] + '.' +
                    config.version[1] + '.' + config.version[2]  +
                    ' --- Newest version: ' +
                    firmwareVersion.desiredKey() );
            } else {
                commandLog(
                    'Received configuration data (v' +
                    config.version[0] + '.' + config.version[1] + '.' +
                    config.version[2] +')');
                configCallback();
            }
        }

        function setConfigCallback(callback) {
            configCallback = callback;
        }

        function setLoggingCallback(callback) {
            loggingCallback = callback;
        }

        function getConfig() {
            return config;
        }

        config = firmwareVersion.configHandler().empty();

        return {
            request: request,
            reinit: reinit,
            send: send,
            sendPartial: sendPartial,
            getConfig: getConfig,
            setConfigCallback: setConfigCallback,
            setLoggingCallback: setLoggingCallback,
            getDesiredVersion: getDesiredVersion,
            field: configFields,
        };
    }
}());
