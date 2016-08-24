(function() {
    'use strict';

    angular.module('flybrixCommon').factory('deviceConfig', deviceConfig);

    deviceConfig.$inject = ['serial', 'commandLog', 'serializer'];

    function deviceConfig(serial, commandLog, serializer) {
        var eepromConfigSize = 354 + 273;
        var config = new Config();

        var desiredVersion = [1, 3, 0];  // checked at startup!

        var configCallback = function() {
            commandLog('No callback defined for receiving configurations!');
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
        };

        serial.setCommandCallback(function(mask, message_buffer) {
            if (mask & serial.field.COM_SET_EEPROM_DATA) {
                comSetEepromData(message_buffer);
            }
            if (mask & serial.field.COM_SET_PARTIAL_EEPROM_DATA) {
                comSetPartialEepromData(message_buffer);
            }
        });

        return {
            request: request,
            reinit: reinit,
            send: send,
            getConfig: getConfig,
            setConfigCallback: setConfigCallback,
            getDesiredVersion: getDesiredVersion,
            field: configFields,
        };

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

        function Config() {
            this.version = [0.0, 0.0, 0.0];
            this.id = 0;
            this.pcbOrientation = [0.0, 0.0, 0.0];
            this.pcbTranslation = [0.0, 0.0, 0.0];
            this.mixTableFz = [0, 0, 0, 0, 0, 0, 0, 0];
            this.mixTableTx = [0, 0, 0, 0, 0, 0, 0, 0];
            this.mixTableTy = [0, 0, 0, 0, 0, 0, 0, 0];
            this.mixTableTz = [0, 0, 0, 0, 0, 0, 0, 0];
            this.magBias = [0.0, 0.0, 0.0];
            this.assignedChannel = [0, 0, 0, 0, 0, 0];
            this.commandInversion = 0;
            this.channelMidpoint = [0, 0, 0, 0, 0, 0];
            this.channelDeadzone = [0, 0, 0, 0, 0, 0];
            this.thrustMasterPIDParameters =
                [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
            this.pitchMasterPIDParameters = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
            this.rollMasterPIDParameters = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
            this.yawMasterPIDParameters = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
            this.thrustSlavePIDParameters = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
            this.pitchSlavePIDParameters = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
            this.rollSlavePIDParameters = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
            this.yawSlavePIDParameters = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
            this.pidBypass = 0;
            this.stateEstimationParameters = [0.0, 0.0];
            this.enableParameters = [0.0, 0.0];
            this.ledStates = Array.apply(null, Array(272)).map(function() {
                return 0;
            });
        }

        function parsePID(b, dataView, arr) {
            b.parseFloat32Array(dataView, arr);
        }

        function parse(dataView, structure) {
            var b = new serializer();
            b.parseInt8Array(dataView, structure.version);
            structure.id = dataView.getUint32(b.index, 1);
            b.add(4);
            b.parseFloat32Array(dataView, structure.pcbOrientation);
            b.parseFloat32Array(dataView, structure.pcbTranslation);
            b.parseInt8Array(dataView, structure.mixTableFz);
            b.parseInt8Array(dataView, structure.mixTableTx);
            b.parseInt8Array(dataView, structure.mixTableTy);
            b.parseInt8Array(dataView, structure.mixTableTz);
            b.parseFloat32Array(dataView, structure.magBias);
            b.parseUint8Array(dataView, structure.assignedChannel);
            structure.commandInversion = dataView.getUint8(b.index);
            b.add(1);
            b.parseUint16Array(dataView, structure.channelMidpoint);
            b.parseUint16Array(dataView, structure.channelDeadzone);
            parsePID(b, dataView, structure.thrustMasterPIDParameters);
            parsePID(b, dataView, structure.pitchMasterPIDParameters);
            parsePID(b, dataView, structure.rollMasterPIDParameters);
            parsePID(b, dataView, structure.yawMasterPIDParameters);
            parsePID(b, dataView, structure.thrustSlavePIDParameters);
            parsePID(b, dataView, structure.pitchSlavePIDParameters);
            parsePID(b, dataView, structure.rollSlavePIDParameters);
            parsePID(b, dataView, structure.yawSlavePIDParameters);
            structure.pidBypass = dataView.getUint8(b.index);
            b.add(1);
            b.parseFloat32Array(dataView, structure.stateEstimationParameters);
            b.parseFloat32Array(dataView, structure.enableParameters);
            b.parseUint8Array(dataView, structure.ledStates);
        }

        function parsePartial(dataView, structure) {
            var b = new serializer();
            var mask = dataView.getUint16(b.index, 1);
            b.add(2);

            if (mask & configFields.VERSION) {
                b.parseInt8Array(dataView, structure.version);
            }
            if (mask & configFields.ID) {
                structure.id = dataView.getUint32(b.index, 1);
                b.add(4);
            }
            if (mask & configFields.PCB) {
                b.parseFloat32Array(dataView, structure.pcbOrientation);
                b.parseFloat32Array(dataView, structure.pcbTranslation);
            }
            if (mask & configFields.MIX_TABLE) {
                b.parseInt8Array(dataView, structure.mixTableFz);
                b.parseInt8Array(dataView, structure.mixTableTx);
                b.parseInt8Array(dataView, structure.mixTableTy);
                b.parseInt8Array(dataView, structure.mixTableTz);
            }
            if (mask & configFields.MAG_BIAS) {
                b.parseFloat32Array(dataView, structure.magBias);
            }
            if (mask & configFields.CHANNEL) {
                b.parseUint8Array(dataView, structure.assignedChannel);
                structure.commandInversion = dataView.getUint8(b.index);
                b.add(1);
                b.parseUint16Array(dataView, structure.channelMidpoint);
                b.parseUint16Array(dataView, structure.channelDeadzone);
            }
            if (mask & configFields.PID_PARAMETERS) {
                parsePID(b, dataView, structure.thrustMasterPIDParameters);
                parsePID(b, dataView, structure.pitchMasterPIDParameters);
                parsePID(b, dataView, structure.rollMasterPIDParameters);
                parsePID(b, dataView, structure.yawMasterPIDParameters);
                parsePID(b, dataView, structure.thrustSlavePIDParameters);
                parsePID(b, dataView, structure.pitchSlavePIDParameters);
                parsePID(b, dataView, structure.rollSlavePIDParameters);
                parsePID(b, dataView, structure.yawSlavePIDParameters);
                structure.pidBypass = dataView.getUint8(b.index);
                b.add(1);
            }
            if (mask & configFields.STATE_PARAMETERS) {
                b.parseFloat32Array(
                    dataView, structure.stateEstimationParameters);
                b.parseFloat32Array(dataView, structure.enableParameters);
            }
            if (mask & configFields.LED_STATES) {
                var led_mask = dataView.getUint16(b.index, 1);
                b.add(2);
                var RECORD_LENGTH = 17;
                for (var i = 0; i < 16; ++i) {
                    if (led_mask & (1 << i)) {
                        for (var j = 0; j < RECORD_LENGTH; ++j) {
                            structure.ledStates[i * RECORD_LENGTH + j] =
                                dataView.getUint8(b.index);
                            b.add(1);
                        }
                    }
                }
            }
        }

        function setConfig(dataView, structure) {
            var b = new serializer();
            b.setInt8Array(dataView, structure.version);
            dataView.setUint32(b.index, structure.id, 1);
            b.add(4);
            b.setFloat32Array(dataView, structure.pcbOrientation);
            b.setFloat32Array(dataView, structure.pcbTranslation);
            b.setInt8Array(dataView, structure.mixTableFz);
            b.setInt8Array(dataView, structure.mixTableTx);
            b.setInt8Array(dataView, structure.mixTableTy);
            b.setInt8Array(dataView, structure.mixTableTz);
            b.setFloat32Array(dataView, structure.magBias);
            b.setUint8Array(dataView, structure.assignedChannel);
            dataView.setUint8(b.index, structure.commandInversion);
            b.add(1);
            b.setUint16Array(dataView, structure.channelMidpoint);
            b.setUint16Array(dataView, structure.channelDeadzone);
            b.setFloat32Array(dataView, structure.thrustMasterPIDParameters);
            b.setFloat32Array(dataView, structure.pitchMasterPIDParameters);
            b.setFloat32Array(dataView, structure.rollMasterPIDParameters);
            b.setFloat32Array(dataView, structure.yawMasterPIDParameters);
            b.setFloat32Array(dataView, structure.thrustSlavePIDParameters);
            b.setFloat32Array(dataView, structure.pitchSlavePIDParameters);
            b.setFloat32Array(dataView, structure.rollSlavePIDParameters);
            b.setFloat32Array(dataView, structure.yawSlavePIDParameters);
            dataView.setUint8(b.index, structure.pidBypass);
            b.add(1);
            b.setFloat32Array(dataView, structure.stateEstimationParameters);
            b.setFloat32Array(dataView, structure.enableParameters);
            b.setUint8Array(dataView, structure.ledStates);
        }

        function comSetEepromData(message_buffer) {
            commandLog('Received config!');
            var data = new DataView(message_buffer, 0);
            config = new Config();
            parse(data, config);
            respondToSetEeprom();
        }

        function comSetPartialEepromData(message_buffer) {
            commandLog('Received partial config!');
            var data = new DataView(message_buffer, 0);
            config = angular.copy(config);
            parsePartial(data, config);
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

        function getConfig() {
            return config;
        }
    }
}());
