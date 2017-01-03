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
            var ledColor = encodable('map', [
                {key: 'red', element: encodable('number', 'Uint8')},
                {key: 'green', element: encodable('number', 'Uint8')},
                {key: 'blue', element: encodable('number', 'Uint8')},
            ]);

            var ledState = encodable('map', [
                {key: 'status', element: encodable('number', 'Uint16')},
                {key: 'pattern', element: encodable('number', 'Uint8')},
                {
                  key: 'colors',
                  element: encodable(
                      'map',
                      [
                        {key: 'right_front', element: ledColor},
                        {key: 'right_back', element: ledColor},
                        {key: 'left_front', element: ledColor},
                        {key: 'left_back', element: ledColor},
                      ])
                },
                {key: 'indicator_red', element: encodable('bool')},
                {key: 'indicator_green', element: encodable('bool')},
            ]);

            var u8 = encodable('number', 'Uint8');
            var version = encodable('array', {count: 3, element: u8});
            var id = encodable('number', 'Uint32');
            var f32 = encodable('number', 'Float32');
            var floatArr3Elem = encodable('array', {count: 3, element: f32});
            var mixTableCoord = encodable('array', {count: 8, element: u8});
            var channelAssign = encodable('array', {count: 6, element: u8});
            var channelValue = encodable('array', {
                count: 6,
                element: encodable('number', 'Uint16'),
            });
            var pid = encodable('array', {count: 7, element: f32});
            var ledStates = encodable('array', {
                count: 16,
                element: ledState,
            });
            var f32a2e = encodable('array', {count: 2, element: f32});

            var ledStates = encodable(
                'array', {
                    count: 16,
                    element: ledState,
                },
                16);

            var name = encodable('string', 9);
            return encodable(
                'map',
                [
                  {key: 'version', element: version, part: 0},
                  {key: 'id', element: id, part: 1},
                  {key: 'pcbOrientation', element: floatArr3Elem, part: 2},
                  {key: 'pcbTranslation', element: floatArr3Elem, part: 2},
                  {key: 'mixTableFz', element: mixTableCoord, part: 3},
                  {key: 'mixTableTx', element: mixTableCoord, part: 3},
                  {key: 'mixTableTy', element: mixTableCoord, part: 3},
                  {key: 'mixTableTz', element: mixTableCoord, part: 3},
                  {key: 'magBias', element: floatArr3Elem, part: 4},
                  {key: 'assignedChannel', element: channelAssign, part: 5},
                  {key: 'commandInversion', element: u8, part: 5},
                  {key: 'channelMidpoint', element: channelValue, part: 5},
                  {key: 'channelDeadzone', element: channelValue, part: 5},
                  {key: 'thrustMasterPIDParameters', element: pid, part: 6},
                  {key: 'pitchMasterPIDParameters', element: pid, part: 6},
                  {key: 'rollMasterPIDParameters', element: pid, part: 6},
                  {key: 'yawMasterPIDParameters', element: pid, part: 6},
                  {key: 'thrustSlavePIDParameters', element: pid, part: 6},
                  {key: 'pitchSlavePIDParameters', element: pid, part: 6},
                  {key: 'rollSlavePIDParameters', element: pid, part: 6},
                  {key: 'yawSlavePIDParameters', element: pid, part: 6},
                  {key: 'thrustGain', element: f32, part: 6},
                  {key: 'pitchGain', element: f32, part: 6},
                  {key: 'rollGain', element: f32, part: 6},
                  {key: 'yawGain', element: f32, part: 6},
                  {key: 'pidBypass', element: u8, part: 6},
                  {key: 'stateEstimationParameters', element: f32a2e, part: 7},
                  {key: 'enableParameters', element: f32a2e, part: 7},
                  {key: 'ledStates', element: ledStates, part: 8},
                  {key: 'name', element: encodable('string', 9), part: 9},
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
