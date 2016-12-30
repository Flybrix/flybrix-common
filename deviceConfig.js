(function() {
    'use strict';

    angular.module('flybrixCommon').factory('deviceConfig', deviceConfig);

    deviceConfig.$inject = ['serial', 'commandLog', 'serializer'];

    function deviceConfig(serial, commandLog, serializer) {
        var eepromConfigSize = 379 + 273;

        var config;

        var desiredVersion = [1, 4, 0];  // checked at startup!

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

        function LedColor(r, g, b) {
            this.red = r;
            this.green = g;
            this.blue = b;
        }

        function ledColorParse(v, serializer, dataView) {
            v.red = dataView.getUint8(serializer.index, 1);
            serializer.add(1);
            v.green = dataView.getUint8(serializer.index, 1);
            serializer.add(1);
            v.blue = dataView.getUint8(serializer.index, 1);
            serializer.add(1);
        };

        function ledColorSerialize(v, serializer, dataView) {
            dataView.setUint8(serializer.index, v.red);
            serializer.add(1);
            dataView.setUint8(serializer.index, v.green);
            serializer.add(1);
            dataView.setUint8(serializer.index, v.blue);
            serializer.add(1);
        };

        function LedState() {
            this.status = 0;
            this.pattern = 0;
            this.colors = {
                right_front: new LedColor(0, 0, 0),
                right_back: new LedColor(0, 0, 0),
                left_front: new LedColor(0, 0, 0),
                left_back: new LedColor(0, 0, 0),
            };
            this.indicator_red = false;
            this.indicator_green = false;
        }

        function ledStateParse(v, serializer, dataView) {
            v.status = dataView.getUint16(serializer.index, 1);
            serializer.add(2);
            v.pattern = dataView.getUint8(serializer.index, 1);
            serializer.add(1);
            ledColorParse(v.colors.right_front, serializer, dataView);
            ledColorParse(v.colors.right_back, serializer, dataView);
            ledColorParse(v.colors.left_front, serializer, dataView);
            ledColorParse(v.colors.left_back, serializer, dataView);
            v.indicator_red = dataView.getUint8(serializer.index, 1) !== 0;
            serializer.add(1);
            v.indicator_green = dataView.getUint8(serializer.index, 1) !== 0;
            serializer.add(1);
        };

        function ledStateSerialize(v, serializer, dataView) {
            dataView.setUint16(serializer.index, v.status, 1);
            serializer.add(2);
            dataView.setUint8(serializer.index, v.pattern);
            serializer.add(1);
            ledColorSerialize(v.colors.right_front, serializer, dataView);
            ledColorSerialize(v.colors.right_back, serializer, dataView);
            ledColorSerialize(v.colors.left_front, serializer, dataView);
            ledColorSerialize(v.colors.left_back, serializer, dataView);
            dataView.setUint8(serializer.index, v.indicator_red ? 1 : 0);
            serializer.add(1);
            dataView.setUint8(serializer.index, v.indicator_green ? 1 : 0);
            serializer.add(1);
        };

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
            this.thrustGain = 0.0;
            this.pitchGain = 0.0;
            this.rollGain = 0.0;
            this.yawGain = 0.0;
            this.pidBypass = 0;
            this.stateEstimationParameters = [0.0, 0.0];
            this.enableParameters = [0.0, 0.0];
            this.ledStates = Array.apply(null, Array(16)).map(function() {
                return new LedState();
            });
            this.name = '';
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
            structure.thrustGain = dataView.getFloat32(b.index, 1);
            b.add(4);
            structure.pitchGain = dataView.getFloat32(b.index, 1);
            b.add(4);
            structure.rollGain = dataView.getFloat32(b.index, 1);
            b.add(4);
            structure.yawGain = dataView.getFloat32(b.index, 1);
            b.add(4);
            structure.pidBypass = dataView.getUint8(b.index);
            b.add(1);
            b.parseFloat32Array(dataView, structure.stateEstimationParameters);
            b.parseFloat32Array(dataView, structure.enableParameters);
            structure.ledStates.forEach(function(ledState) {
                ledStateParse(ledState, b, dataView);
            });
            var stringData = new Uint8Array(9);
            b.parseUint8Array(dataView, stringData);
            structure.name = asciiDecode(stringData);
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
                structure.thrustGain = dataView.getFloat32(b.index, 1);
                b.add(4);
                structure.pitchGain = dataView.getFloat32(b.index, 1);
                b.add(4);
                structure.rollGain = dataView.getFloat32(b.index, 1);
                b.add(4);
                structure.yawGain = dataView.getFloat32(b.index, 1);
                b.add(4);
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
                        ledStateParse(structure.ledStates[i], b, dataView);
                    }
                }
            }
            if (mask & configFields.DEVICE_NAME) {
                var stringData = new Uint8Array(9);
                b.parseUint8Array(dataView, stringData);
                structure.name = asciiDecode(stringData);
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
            dataView.setFloat32(b.index, structure.thrustGain, 1);
            b.add(4);
            dataView.setFloat32(b.index, structure.pitchGain, 1);
            b.add(4);
            dataView.setFloat32(b.index, structure.rollGain, 1);
            b.add(4);
            dataView.setFloat32(b.index, structure.yawGain, 1);
            b.add(4);
            dataView.setUint8(b.index, structure.pidBypass);
            b.add(1);
            b.setFloat32Array(dataView, structure.stateEstimationParameters);
            b.setFloat32Array(dataView, structure.enableParameters);
            structure.ledStates.forEach(function(ledState) {
                ledStateSerialize(ledState, b, dataView);
            });
            b.setUint8Array(dataView, asciiEncode(structure.name, 9));
        }

        function setConfigPartial(dataView, structure, mask, led_mask) {
            var b = new serializer();
            dataView.setUint16(b.index, mask, 1);
            b.add(2);
            if (mask & configFields.VERSION) {
                b.setInt8Array(dataView, structure.version);
            }
            if (mask & configFields.ID) {
                dataView.setUint32(b.index, structure.id, 1);
                b.add(4);
            }
            if (mask & configFields.PCB) {
                b.setFloat32Array(dataView, structure.pcbOrientation);
                b.setFloat32Array(dataView, structure.pcbTranslation);
            }
            if (mask & configFields.MIX_TABLE) {
                b.setInt8Array(dataView, structure.mixTableFz);
                b.setInt8Array(dataView, structure.mixTableTx);
                b.setInt8Array(dataView, structure.mixTableTy);
                b.setInt8Array(dataView, structure.mixTableTz);
            }
            if (mask & configFields.MAG_BIAS) {
                b.setFloat32Array(dataView, structure.magBias);
            }
            if (mask & configFields.CHANNEL) {
                b.setUint8Array(dataView, structure.assignedChannel);
                dataView.setUint8(b.index, structure.commandInversion);
                b.add(1);
                b.setUint16Array(dataView, structure.channelMidpoint);
                b.setUint16Array(dataView, structure.channelDeadzone);
            }
            if (mask & configFields.PID_PARAMETERS) {
                b.setFloat32Array(
                    dataView, structure.thrustMasterPIDParameters);
                b.setFloat32Array(dataView, structure.pitchMasterPIDParameters);
                b.setFloat32Array(dataView, structure.rollMasterPIDParameters);
                b.setFloat32Array(dataView, structure.yawMasterPIDParameters);
                b.setFloat32Array(dataView, structure.thrustSlavePIDParameters);
                b.setFloat32Array(dataView, structure.pitchSlavePIDParameters);
                b.setFloat32Array(dataView, structure.rollSlavePIDParameters);
                b.setFloat32Array(dataView, structure.yawSlavePIDParameters);
                dataView.setFloat32(b.index, structure.thrustGain, 1);
                b.add(4);
                dataView.setFloat32(b.index, structure.pitchGain, 1);
                b.add(4);
                dataView.setFloat32(b.index, structure.rollGain, 1);
                b.add(4);
                dataView.setFloat32(b.index, structure.yawGain, 1);
                b.add(4);
                dataView.setUint8(b.index, structure.pidBypass);
                b.add(1);
            }
            if (mask & configFields.STATE_PARAMETERS) {
                b.setFloat32Array(
                    dataView, structure.stateEstimationParameters);
                b.setFloat32Array(dataView, structure.enableParameters);
            }
            if (mask & configFields.LED_STATES) {
                dataView.setUint16(b.index, led_mask, 1);
                b.add(2);
                for (var i = 0; i < 16; ++i) {
                    if (led_mask & (1 << i)) {
                        ledStateSerialize(structure.ledStates[i], b, dataView);
                    }
                }
            }
            if (mask & configFields.DEVICE_NAME) {
                b.setUint8Array(dataView, asciiEncode(structure.name, 9));
            }
            return b.index;
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

        function setLoggingCallback(callback) {
            loggingCallback = callback;
        }

        function getConfig() {
            return config;
        }

        function asciiEncode(name, length) {
            var response = new Uint8Array(length);
            name.split('').forEach(function(c, idx) {
                response[idx] = c.charCodeAt(0);
            });
            response[length - 1] = 0;
            return response;
        }

        function asciiDecode(name) {
            var response = '';
            for (var i = 0; i < name.length && i < 8; ++i) {
                if (name[i] === 0) {
                    return response;
                }
                response += String.fromCharCode(name[i]);
            }
            return response;
        }

        config = new Config();

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
