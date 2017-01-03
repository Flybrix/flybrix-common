(function() {
    'use strict';

    angular.module('flybrixCommon').factory('deviceConfig', deviceConfig);

    deviceConfig.$inject = ['serial', 'commandLog', 'serializer', 'encodable'];

    function deviceConfig(serial, commandLog, serializer, encodable) {
        var eepromConfigSize = 379 + 273;

        var config;

        var desiredVersion = [1, 5, 0];  // checked at startup!

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
            return desiredVersion;
        }


        function request() {
            commandLog('Requesting current configuration data...');
            serial.send(serial.field.COM_REQ_EEPROM_DATA, [], false);
        }

        function reinit() {
            commandLog('Setting factory default configuration data...');
            serial.send(serial.field.COM_REINIT_EEPROM_DATA, [], false)
                .then(
                    function() {
                        request();
                    },
                    function(reason) {
                        commandLog(
                            'Request for factory reset failed: ' + reason);
                    });
        }

        function send(newConfig) {
            if (newConfig === undefined)
                newConfig = config;
            commandLog('Sending new configuration data...');
            var eepromConfigBytes = new ArrayBuffer(eepromConfigSize);
            var view = new DataView(eepromConfigBytes, 0);
            setConfig(view, newConfig);
            var data = new Uint8Array(eepromConfigBytes);
            serial.send(serial.field.COM_SET_EEPROM_DATA, data, false)
                .then(function() {
                    request();
                });
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

            var eepromConfigBytes = new ArrayBuffer(eepromConfigSize);
            var view = new DataView(eepromConfigBytes, 0);
            var endpoint = setConfigPartial(view, newConfig, mask, led_mask);
            var data = new Uint8Array(eepromConfigBytes.slice(0, endpoint));
            serial.send(target, data, false).then(function() {
                if (request_update) {
                    request();
                }
            });
        }

        var configHandler = (function() {
            var e = encodable;
            var ledColor = e.map([
                {key: 'red', element: e.Uint8},
                {key: 'green', element: e.Uint8},
                {key: 'blue', element: e.Uint8},
            ]);

            var ledState = e.map([
                {key: 'status', element: e.Uint16},
                {key: 'pattern', element: e.Uint8},
                {
                  key: 'colors',
                  element: e.map([
                      {key: 'right_front', element: ledColor},
                      {key: 'right_back', element: ledColor},
                      {key: 'left_front', element: ledColor},
                      {key: 'left_back', element: ledColor},
                  ])
                },
                {key: 'indicator_red', element: e.bool},
                {key: 'indicator_green', element: e.bool},
            ]);

            var coord3d = e.array(3, e.Float32);

            var version = e.array(3, e.Uint8);
            var channelMapping = e.array(6, e.Uint8);
            var channelMark = e.array(6, e.Uint16);
            var pid = e.array(7, e.Float32);
            var stParam = e.array(2, e.Float32);

            var ledStates = e.array(16, ledState, 16);

            var name = e.string(9);
            return e.map(
                [
                  {part: 0, key: 'version', element: e.array(3, e.Uint8)},
                  {part: 1, key: 'id', element: e.Uint32},
                  {part: 2, key: 'pcbOrientation', element: coord3d},
                  {part: 2, key: 'pcbTranslation', element: coord3d},
                  {part: 3, key: 'mixTableFz', element: e.array(8, e.Uint8)},
                  {part: 3, key: 'mixTableTx', element: e.array(8, e.Uint8)},
                  {part: 3, key: 'mixTableTy', element: e.array(8, e.Uint8)},
                  {part: 3, key: 'mixTableTz', element: e.array(8, e.Uint8)},
                  {part: 4, key: 'magBias', element: coord3d},
                  {part: 5, key: 'assignedChannel', element: channelMapping},
                  {part: 5, key: 'commandInversion', element: e.Uint8},
                  {part: 5, key: 'channelMidpoint', element: channelMark},
                  {part: 5, key: 'channelDeadzone', element: channelMark},
                  {part: 6, key: 'thrustMasterPIDParameters', element: pid},
                  {part: 6, key: 'pitchMasterPIDParameters', element: pid},
                  {part: 6, key: 'rollMasterPIDParameters', element: pid},
                  {part: 6, key: 'yawMasterPIDParameters', element: pid},
                  {part: 6, key: 'thrustSlavePIDParameters', element: pid},
                  {part: 6, key: 'pitchSlavePIDParameters', element: pid},
                  {part: 6, key: 'rollSlavePIDParameters', element: pid},
                  {part: 6, key: 'yawSlavePIDParameters', element: pid},
                  {part: 6, key: 'thrustGain', element: e.Float32},
                  {part: 6, key: 'pitchGain', element: e.Float32},
                  {part: 6, key: 'rollGain', element: e.Float32},
                  {part: 6, key: 'yawGain', element: e.Float32},
                  {part: 6, key: 'pidBypass', element: e.Uint8},
                  {part: 7, key: 'stateEstimationParameters', element: stParam},
                  {part: 7, key: 'enableParameters', element: stParam},
                  {part: 8, key: 'ledStates', element: ledStates},
                  {part: 9, key: 'name', element: e.string(9)},
                ],
                16);
        }());

        function applyPropertiesTo(source, destination) {
            Object.keys(source).forEach(function(key) {
                destination[key] = source[key];
            });
        }

        function setConfig(dataView, structure) {
            configHandler.encode(dataView, new serializer(), structure);
        }

        function setConfigPartial(dataView, structure, mask, led_mask) {
            var b = new serializer();
            configHandler.encodePartial(
                dataView, b, structure, [led_mask, mask]);
            return b.index;
        }

        function comSetEepromData(message_buffer) {
            commandLog('Received config!');
            config = configHandler.decode(
                new DataView(message_buffer, 0), new serializer());
            respondToSetEeprom();
        }

        function comSetPartialEepromData(message_buffer) {
            commandLog('Received partial config!');
            config = configHandler.decodePartial(
                new DataView(message_buffer, 0), new serializer(),
                angular.copy(config)),
            respondToSetEeprom();
        }

        function respondToSetEeprom() {
            if ((desiredVersion[0] !== config.version[0]) ||
                (desiredVersion[1] !== config.version[1])) {
                commandLog(
                    '<span style="color: red">WARNING: Configuration MAJOR or MINOR version mismatch!</span>');
                commandLog(
                    'eeprom version: <strong>' + config.version[0] + '.' +
                    config.version[1] + '.' + config.version[2] + '</strong>' +
                    ' - app expected version: <strong>' + desiredVersion[0] +
                    '.' + desiredVersion[1] + '.' + desiredVersion[2] +
                    '</strong>');
            } else {
                commandLog(
                    'Recieved configuration version: <span style="color: green">' +
                    config.version[0] + '.' + config.version[1] + '.' +
                    config.version[2] + '</span>');
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

        config = configHandler.empty();

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
