(function() {
    'use strict';

    angular.module('flybrixCommon', []);
}());

(function() {
    'use strict';

    angular.module('flybrixCommon').factory('calibration', calibration);

    calibration.$inject = ['commandLog', 'serial'];

    function calibration(commandLog, serial) {
        return {
            magnetometer: magnetometer,
            accelerometer: {
                flat: calibrateAccelerometer.bind(null, 'flat', 0),
                forward: calibrateAccelerometer.bind(null, 'lean forward', 1),
                back: calibrateAccelerometer.bind(null, 'lean back', 2),
                right: calibrateAccelerometer.bind(null, 'lean right', 3),
                left: calibrateAccelerometer.bind(null, 'lean left', 4),
            },
            finish: finish,
        };

        function magnetometer() {
            commandLog("Calibrating magnetometer bias");
            return serial.sendStructure('Command', {
                request_response: true,
                set_calibration: {
                    enabled: true,
                    mode: 0,
                },
            }, false);
        }

        function calibrateAccelerometer(poseDescription, poseId) {
            commandLog("Calibrating gravity for pose: " + poseDescription);
            return serial.sendStructure('Command', {
                request_response: true,
                set_calibration: {
                    enabled: true,
                    mode: poseId + 1,
                },
            }, false);
        }

        function finish() {
            commandLog("Finishing calibration");
            return serial.sendStructure('Command', {
                request_response: true,
                set_calibration: {
                    enabled: false,
                    mode: 0,
                },
            }, false);
        }
    }
}());

(function() {
    'use strict';

    angular.module('flybrixCommon').factory('cobs', cobs);

    function cobs() {
        return {
            Reader: Reader,
            encode: encode,
        };
    }


    function Reader(capacity) {
        if (capacity === undefined) {
            capacity = 2000;
        }
        this.N = capacity;
        this.buffer = new Uint8Array(capacity);
        this.ready_for_new_message = true;
        this.buffer_length = 0;
    }

    function cobsDecode(reader) {
        var src_ptr = 0;
        var dst_ptr = 0;
        var leftover_length = 0;
        var append_zero = false;
        while (reader.buffer[src_ptr]) {
            if (!leftover_length) {
                if (append_zero)
                    reader.buffer[dst_ptr++] = 0;
                leftover_length = reader.buffer[src_ptr++] - 1;
                append_zero = leftover_length < 0xFE;
            } else {
                --leftover_length;
                reader.buffer[dst_ptr++] = reader.buffer[src_ptr++];
            }
        }

        return leftover_length ? 0 : dst_ptr;
    }

    Reader.prototype.AppendToBuffer = function(data, callback, onError) {
        for (var i = 0; i < data.length; i++) {
            var c = data[i];
            if (this.ready_for_new_message) {
                // first byte of a new message
                this.ready_for_new_message = false;
                this.buffer_length = 0;
            }

            this.buffer[this.buffer_length++] = c;

            if (c && this.buffer_length == this.N) {
                // buffer overflow, probably due to errors in data
                onError('overflow', 'buffer overflow in COBS decoding');
                this.ready_for_new_message = true;
                continue;
            }

            if (!c) {
                this.buffer_length = cobsDecode(this);
                var failed_decode = (this.buffer_length === 0);
                if (failed_decode) {
                    this.buffer[0] = 1;
                }
                for (var j = 1; j < this.buffer_length; ++j) {
                    this.buffer[0] ^= this.buffer[j];
                }
                if (this.buffer[0] === 0) {  // check sum is correct
                    this.ready_for_new_message = true;
                    if (this.buffer_length > 5) {
                        var command = this.buffer[1];
                        var mask = 0;
                        for (var k = 0; k < 4; ++k) {
                            mask |= this.buffer[k + 2] << (k * 8);
                        }
                        callback(command, mask,
                                 this.buffer.subarray(6, this.buffer_length)
                                     .slice()
                                     .buffer);
                    } else {
                        onError('short', 'Too short packet');
                    }
                } else {  // bad checksum
                    this.ready_for_new_message = true;
                    var bytes = "";
                    var message = "";
                    for (var j = 0; j < this.buffer_length; j++) {
                        bytes += this.buffer[j] + ",";
                        message += String.fromCharCode(this.buffer[j]);
                    }
                    if (failed_decode) {
                        onError('frame', 'Unexpected ending of packet');
                    } else {
                        var msg = 'BAD CHECKSUM (' + this.buffer_length +
                                  ' bytes)' + bytes + message;
                        onError('checksum', msg);
                    }
                }
            }
        }
    };

    function encode(buf) {
        var retval =
            new Uint8Array(Math.floor((buf.byteLength * 255 + 761) / 254));
        var len = 1;
        var pos_ctr = 0;
        for (var i = 0; i < buf.length; ++i) {
            if (retval[pos_ctr] == 0xFE) {
                retval[pos_ctr] = 0xFF;
                pos_ctr = len++;
                retval[pos_ctr] = 0;
            }
            var val = buf[i];
            ++retval[pos_ctr];
            if (val) {
                retval[len++] = val;
            } else {
                pos_ctr = len++;
                retval[pos_ctr] = 0;
            }
        }
        return retval.subarray(0, len).slice().buffer;
    };
}());

(function() {
    'use strict';

    angular.module('flybrixCommon').factory('commandLog', commandLog);

    commandLog.$inject = ['$q'];

    function commandLog($q) {
        var messages = [];
        var responder = $q.defer();

        var service = log;
        service.log = log;
        service.clearSubscribers = clearSubscribers;
        service.onMessage = onMessage;
        service.read = read;

        return service;

        function log(message) {
            if (message !== undefined) {
                messages.push(message);
                responder.notify(read());
            }
        }

        function read() {
            return messages;
        }

        function clearSubscribers() {
            responder = $q.defer();
        }

        function onMessage(callback) {
            return responder.promise.then(undefined, undefined, callback);
        }
    }
}());

(function() {
    'use strict';

    angular.module('flybrixCommon').factory('configHandler', configHandler);

    configHandler.$inject = ['encodable'];

    function configHandler(encodable) {
        var handlers = {};

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

        var handlerArray = [
            {part: 0, key: 'version', element: e.array(3, e.Uint8)},
            {part: 1, key: 'id', element: e.Uint32},
            {part: 2, key: 'pcbOrientation', element: coord3d},
            {part: 2, key: 'pcbTranslation', element: coord3d},
            {part: 3, key: 'mixTableFz', element: e.array(8, e.Int8)},
            {part: 3, key: 'mixTableTx', element: e.array(8, e.Int8)},
            {part: 3, key: 'mixTableTy', element: e.array(8, e.Int8)},
            {part: 3, key: 'mixTableTz', element: e.array(8, e.Int8)},
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
            {part: 6, key: 'pidBypass', element: e.Uint8},
            {part: 7, key: 'stateEstimationParameters', element: stParam},
            {part: 7, key: 'enableParameters', element: stParam},
            {part: 8, key: 'ledStates', element: ledStates},
            {part: 9, key: 'name', element: e.string(9)},
        ];

        handlers['1.4.0'] = e.map(handlerArray.slice(), 16);

        var gainHandlers = [
            {part: 6, key: 'thrustGain', element: e.Float32},
            {part: 6, key: 'pitchGain', element: e.Float32},
            {part: 6, key: 'rollGain', element: e.Float32},
            {part: 6, key: 'yawGain', element: e.Float32},
        ];

        handlerArray = handlerArray.slice(0, 21).concat(
            gainHandlers, handlerArray.slice(21));

        handlers['1.5.0'] = e.map(handlerArray.slice(), 16);

        var velocityPidHandlers = [
            {part: 10, key: 'forwardMasterPIDParameters', element: pid},
            {part: 10, key: 'rightMasterPIDParameters', element: pid},
            {part: 10, key: 'upMasterPIDParameters', element: pid},
            {part: 10, key: 'forwardSlavePIDParameters', element: pid},
            {part: 10, key: 'rightSlavePIDParameters', element: pid},
            {part: 10, key: 'upSlavePIDParameters', element: pid},
            {part: 10, key: 'velocityPidBypass', element: e.Uint8},
            {part: 11, key: 'inertialBiasAccel', element: coord3d},
            {part: 11, key: 'inertialBiasGyro', element: coord3d},
        ];

        handlerArray = handlerArray.concat(velocityPidHandlers);

        handlers['1.6.0'] = e.map(handlerArray.slice(), 16);

        return handlers;
    }

}());

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

(function() {
    angular.module('flybrixCommon').factory('encodable', function() {
        return encodable;
    });

    var encodable = {
        string: compileString,
        map: compileMap,
        array: compileArray,
        polyarray: compilePolyarray,
        Serializer: Serializer,
    };

    function Serializer() {
        this.index = 0;
    }

    Serializer.prototype.add = function(increment) {
        this.index += increment;
    };

    // Handling numbers

    function numberZero() {
        return 0;
    }

    ['Uint', 'Int'].forEach(function(keyPrefix) {
        [1, 2, 4].forEach(function(byteCount) {
            var key = keyPrefix + (byteCount * 8);
            function encode(dataView, serializer, data) {
                dataView['set' + key](serializer.index, data, 1);
                serializer.add(byteCount);
            }
            function decode(dataView, serializer) {
                var data = dataView['get' + key](serializer.index, 1);
                serializer.add(byteCount);
                return data;
            }
            function bytecount() {
                return byteCount;
            }
            encodable[key] = new Handler(bytecount, encode, decode, numberZero);
        });
    });
    [4, 8].forEach(function(byteCount) {
        var key = 'Float' + (byteCount * 8);
        function encode(dataView, serializer, data) {
            dataView['set' + key](serializer.index, data, 1);
            serializer.add(byteCount);
        }
        function decode(dataView, serializer) {
            var data = dataView['get' + key](serializer.index, 1);
            serializer.add(byteCount);
            return data;
        }
        function bytecount() {
            return byteCount;
        }
        encodable[key] = new Handler(bytecount, encode, decode, numberZero);
    });

    function compileNumber(type) {
        var handler = encodable['Uint' + type];
        if (handler === undefined) {
            throw new Error(
                'Unsupported split bit count: ' + type +
                '. Allowed counts: 8, 16, 32, 64');
        }
        return handler;
    }

    // Handling bools

    encodable.bool = new Handler(
        function() {
            return 1;
        },
        function(dataView, serializer, data) {
            encodable.Uint8.encode(dataView, serializer, data ? 1 : 0)
        },
        function(dataView, serializer) {
            return encodable.Uint8.decode(dataView, serializer) !== 0;
        },
        function() {
            return false;
        });

    // Handling strings

    function compileString(length) {
        var handler = compileArray(length, encodable.Uint8);
        function encode(dataView, serializer, data) {
            handler.encode(dataView, serializer, asciiEncode(data, length));
        }
        function decode(dataView, serializer) {
            return asciiDecode(handler.decode(dataView, serializer), length);
        }
        function empty() {
            return '';
        }
        function bytecount() {
            return length;
        }
        return new Handler(bytecount, encode, decode, empty);
    }

    function asciiEncode(name, length) {
        var response = new Uint8Array(length);
        name.split('').forEach(function(c, idx) {
            response[idx] = c.charCodeAt(0);
        });
        response[length - 1] = 0;
        return response;
    }

    function asciiDecode(name, length) {
        var response = '';
        var l = Math.min(name.length, length - 1);
        for (var i = 0; i < l; ++i) {
            if (name[i] === 0) {
                return response;
            }
            response += String.fromCharCode(name[i]);
        }
        return response;
    }

    // Handling arrays

    function compileArray(length, element, splitBits) {
        if (length === undefined) {
            throw new Error('Array type requires length');
        }
        if (!(element instanceof Handler)) {
            throw new Error('Array type requires Handler type as element');
        }
        function encode(dataView, serializer, data) {
            for (var i = 0; i < length; ++i) {
                element.encode(dataView, serializer, data[i]);
            }
        }
        function decode(dataView, serializer) {
            var data = [];
            for (var i = 0; i < length; ++i) {
                data.push(element.decode(dataView, serializer));
            }
            return data;
        }
        function empty() {
            var data = [];
            for (var i = 0; i < length; ++i) {
                data.push(element.empty());
            }
            return data;
        }
        var handler;
        if (splitBits !== undefined) {
            var numberEncoder = compileNumber(splitBits);
            function encodePartialSplit(dataView, serializer, data, masks) {
                var mask = masks.pop();
                numberEncoder.encode(dataView, serializer, mask);
                for (var i = 0; i < length; ++i) {
                    if (mask & (1 << i)) {
                        element.encodePartial(
                            dataView, serializer, data[i], masks);
                    }
                }
            }
            function decodePartialSplit(dataView, serializer, original) {
                var mask = numberEncoder.decode(dataView, serializer);
                var data = [];
                for (var i = 0; i < length; ++i) {
                    if (mask & (1 << i)) {
                        data.push(element.decodePartial(
                            dataView, serializer, original[i]));
                    } else {
                        data.push(original[i]);
                    }
                }
                return data;
            }
            function bytecountSplit(masks) {
                var mask;
                var nomask = true;
                if (masks !== undefined) {
                    mask = masks.pop();
                    nomask = false;
                }
                var accum = nomask ? 0 : splitBits / 8;
                for (var i = 0; i < length; ++i) {
                    if (nomask || (mask & (1 << i))) {
                        accum += element.bytecount(masks);
                    }
                }
                return accum;
            }
            handler = new Handler(
                bytecountSplit, encode, decode, empty, encodePartialSplit,
                decodePartialSplit);
        } else {
            function encodePartial(dataView, serializer, data, masks) {
                for (var i = 0; i < length; ++i) {
                    element.encodePartial(dataView, serializer, data[i], masks);
                }
            }
            function decodePartial(dataView, serializer, original) {
                var data = [];
                for (var i = 0; i < length; ++i) {
                    data.push(element.decodePartial(
                        dataView, serializer, original[i]));
                }
                return data;
            }
            function bytecount(masks) {
                var accum = 0;
                for (var i = 0; i < length; ++i) {
                    accum += element.bytecount(masks);
                }
                return accum;
            }
            handler = new Handler(
                bytecount, encode, decode, empty, encodePartial, decodePartial);
        }
        handler.children = {
            element: element,
            count: length,
        };
        return handler;
    }

    // Handling polyarrays

    function compilePolyarray(properties, splitBits) {
        var length = properties.length;
        if (length === undefined) {
            throw new Error(
                'Polyarray type requires an array of Handler objects');
        }
        properties.forEach(function(property) {
            if (!(property instanceof Handler)) {
                throw new Error(
                    'Polyarray type requires an array of Handler objects');
            }
        });
        function encode(dataView, serializer, data) {
            properties.forEach(function(property, idx) {
                property.encode(dataView, serializer, data[idx]);
            });
        }
        function decode(dataView, serializer) {
            var data = [];
            properties.forEach(function(property, idx) {
                data.push(property.decode(dataView, serializer));
            });
            return data;
        }
        function empty() {
            var data = [];
            properties.forEach(function(property) {
                data.push(property.empty());
            });
            return data;
        }
        var handler;
        var byteCount = properties.reduce(function(accum, v) {
            return accum + v.bytecount;
        }, 0);
        if (splitBits !== undefined) {
            var numberEncoder = compileNumber(splitBits);
            function encodePartialSplit(dataView, serializer, data, masks) {
                var mask = masks.pop();
                numberEncoder.encode(dataView, serializer, mask);
                properties.forEach(function(property, idx) {
                    if (mask & (1 << idx)) {
                        property.encodePartial(
                            dataView, serializer, data[idx], masks);
                    }
                });
            }
            function decodePartialSplit(dataView, serializer, original) {
                var mask = numberEncoder.decode(dataView, serializer);
                var data = [];
                properties.forEach(function(property, idx) {
                    if (mask & (1 << idx)) {
                        data.push(property.decodePartial(
                            dataView, serializer, original[idx]));
                    } else {
                        data.push(original[idx]);
                    }
                });
                return data;
            }
            function bytecountSplit(masks) {
                var mask;
                var nomask = true;
                if (masks !== undefined) {
                    mask = masks.pop();
                    nomask = false;
                }
                return properties.reduce(function(accum, v, idx) {
                    if (!nomask && (!(mask & (1 << idx)))) {
                        return accum;
                    }
                    return accum + v.bytecount(masks);
                }, nomask ? 0 : splitBits / 8);
            }
            handler = new Handler(
                bytecountSplit, encode, decode, empty, encodePartialSplit,
                decodePartialSplit);
        } else {
            function encodePartial(dataView, serializer, data, masks) {
                properties.forEach(function(property, idx) {
                    property.encodePartial(
                        dataView, serializer, data[idx], masks);
                });
            }
            function decodePartial(dataView, serializer, original) {
                var data = [];
                properties.forEach(function(property, idx) {
                    data.push(property.decodePartial(
                        dataView, serializer, original[idx]));
                });
                return data;
            }
            function bytecount(masks) {
                return properties.reduce(function(accum, v) {
                    return accum + v.bytecount(masks);
                }, 0);
            }
            handler = new Handler(
                bytecount, encode, decode, empty, encodePartial, decodePartial);
        }
        handler.children = properties;
        return handler;
    }

    // Handling maps

    function compileMap(properties, splitBits) {
        var length = properties.length;
        if (length === undefined) {
            throw new Error(
                'Map type requires an array of ' +
                '{key: String, element: Handler} maps');
        }
        properties.forEach(function(property) {
            if (property.key === undefined ||
                !(property.element instanceof Handler)) {
                throw new Error(
                    'Map type requires an array of ' +
                    '{key: String, element: Handler} maps');
            }
        });
        if (splitBits !== undefined) {
            properties.forEach(function(property) {
                if (property.part === undefined) {
                    throw new Error(
                        'Map type requires an array of ' +
                        '{key: String, element: Handler, part: Number}' +
                        ' maps when split bits are defined');
                }
            });
        }
        function encode(dataView, serializer, data) {
            properties.forEach(function(property) {
                property.element.encode(
                    dataView, serializer, data[property.key]);
            });
        }
        function decode(dataView, serializer) {
            var data = {};
            properties.forEach(function(property) {
                data[property.key] =
                    property.element.decode(dataView, serializer);
            });
            return data;
        }
        function empty() {
            var data = {};
            properties.forEach(function(property) {
                data[property.key] = property.element.empty();
            });
            return data;
        }
        var handler;
        if (splitBits !== undefined) {
            var numberEncoder = compileNumber(splitBits);
            function encodePartialSplit(dataView, serializer, data, masks) {
                var mask = masks.pop();
                numberEncoder.encode(dataView, serializer, mask);
                properties.forEach(function(property) {
                    if (mask & (1 << property.part)) {
                        property.element.encodePartial(
                            dataView, serializer, data[property.key], masks);
                    }
                });
            }
            function decodePartialSplit(dataView, serializer, original) {
                var mask = numberEncoder.decode(dataView, serializer);
                var data = {};
                properties.forEach(function(property) {
                    if (mask & (1 << property.part)) {
                        data[property.key] = property.element.decodePartial(
                            dataView, serializer, original[property.key]);
                    } else {
                        data[property.key] = original[property.key];
                    }
                });
                return data;
            }
            function bytecountSplit(masks) {
                var mask;
                var nomask = true;
                if (masks !== undefined) {
                    mask = masks.pop();
                    nomask = false;
                }
                return properties.reduce(function(accum, v) {
                    if (!nomask && (!(mask & (1 << v.part)))) {
                        return accum;
                    }
                    return accum + v.element.bytecount(masks);
                }, nomask ? 0 : splitBits / 8);
            }
            handler = new Handler(
                bytecountSplit, encode, decode, empty, encodePartialSplit,
                decodePartialSplit);
        } else {
            function encodePartial(dataView, serializer, data, masks) {
                properties.forEach(function(property) {
                    property.element.encodePartial(
                        dataView, serializer, data[property.key], masks);
                });
            }
            function decodePartial(dataView, serializer, original) {
                var data = {};
                properties.forEach(function(property) {
                    data[property.key] = property.element.decodePartial(
                        dataView, serializer, original[property.key]);
                });
                return data;
            }
            function bytecount(masks) {
                return properties.reduce(function(accum, v) {
                    return accum + v.element.bytecount(masks);
                }, 0);
            }
            handler = new Handler(
                bytecount, encode, decode, empty, encodePartial, decodePartial);
        }
        handler.children = properties;
        return handler;
    }

    function Handler(
        bytecount, encode, decode, empty, encodePartial, decodePartial) {
        encodePartial = encodePartial || encode;
        decodePartial = decodePartial || decode;
        this.bytecount = bytecount;
        this.encode = encode;
        this.decode = decode;
        this.encodePartial = encodePartial;
        this.decodePartial = decodePartial;
        this.empty = empty;
    }
}());

(function() {
    'use strict';

    angular.module('flybrixCommon').factory('firmwareVersion', firmwareVersion);

    firmwareVersion.$inject = ['configHandler', 'serializationHandler'];

    function firmwareVersion(configHandler, serializationHandler) {
        var version = [0, 0, 0];
        var key = '0.0.0';
        var supported = {
            '1.4.0': true,
            '1.5.0': true,
            '1.6.0': true,
        };

        var desired = [1, 6, 0];
        var desiredKey = '1.6.0';

        var defaultConfigHandler = configHandler[desiredKey];
        var currentConfigHandler = defaultConfigHandler;
        var defaultSerializationHandler = serializationHandler.getHandler(desiredKey);
        var currentSerializationHandler = defaultSerializationHandler;

        var fieldVersionMasks = {
            '1.4.0': 0x7FFFFFF,
            '1.5.0': 0x7FFFFFF,
            '1.6.0': 0x7FFFFFF,
        };
        var stateMask = 0xFFFFFFFF;

        return {
            set: function(value) {
                version = value;
                key = value.join('.');
                currentConfigHandler =
                    configHandler[key] || defaultConfigHandler;
                currentSerializationHandler =
                    serializationHandler.getHandler(desiredKey) || defaultSerializationHandler;
                stateMask = fieldVersionMasks[key] || 0xFFFFFFFF;
            },
            get: function() {
                return version;
            },
            key: function() {
                return key;
            },
            supported: function() {
                return supported[key] === true;
            },
            desired: function() {
                return desired;
            },
            desiredKey: function() {
                return desiredKey;
            },
            configHandler: function() {
                return currentConfigHandler;
            },
            serializationHandler: function() {
                return currentSerializationHandler;
            },
            stateMask: function() {
                return stateMask;
            }
        };
    }

}());

(function() {
    'use strict';

    angular.module('flybrixCommon').factory('led', led);

    led.$inject = ['deviceConfig'];

    function led(deviceConfig) {
        var LedPatterns = {
            NO_OVERRIDE: 0,
            FLASH: 1,
            BEACON: 2,
            BREATHE: 3,
            ALTERNATE: 4,
            SOLID: 5,
        };

        var keys = ['right_front', 'right_back', 'left_front', 'left_back'];
        var colors = {};

        keys.forEach(function(key) {
            colors[key] = {
                red: 0,
                green: 0,
                blue: 0,
            }
        });

        var ledState = {
            status: 65535,
            pattern: LedPatterns.SOLID,
            colors: colors,
            indicator_red: false,
            indicator_green: false,
        }

        var configPart = {ledStates: [ledState]};

        function set(
            color_rf, color_rb, color_lf, color_lb, pattern, red, green) {
            if (pattern > 0 && pattern < 6) {
                ledState.pattern = pattern;
            }
            [color_rf, color_rb, color_lf, color_lb].forEach(function(
                color, idx) {
                if (!color) {
                    return;
                }
                var v = colors[keys[idx]];
                v.red = color.red;
                v.green = color.green;
                v.blue = color.blue;
            });
            if (red !== undefined) {
                ledState.indicator_red = red;
            }
            if (green !== undefined) {
                ledState.indicator_green = green;
            }

            apply();
        }

        function setSimple(red, green, blue) {
            var color = {red: red || 0, green: green || 0, blue: blue || 0};
            set(color, color, color, color, LedPatterns.SOLID);
        }

        function apply() {
            deviceConfig.sendPartial(
                deviceConfig.field.LED_STATES,  // Set LED state part
                1,           // more specifically, the first state 2^0 = 1
                configPart,  // to our partial configuration
                true  // and set the "temporary" flag, not changing EEPROM
                );
        }

        return {
            set: set,
            setSimple: setSimple,
            patterns: LedPatterns,
        };
    }

}());

(function() {
    'use strict';

    angular.module('flybrixCommon').factory('parser', parser);

    parser.$inject = ['commandLog', 'encodable', 'firmwareVersion'];

    function parser(commandLog, encodable, firmwareVersion) {
        var MessageType = {
            State: 0,
            Command: 1,
            DebugString: 3,
            HistoryData: 4,
            Response: 255,
        };

        var CommandFields = {
            COM_REQ_RESPONSE: 1 << 0,
            COM_SET_EEPROM_DATA: 1 << 1,
            COM_REINIT_EEPROM_DATA: 1 << 2,
            COM_REQ_EEPROM_DATA: 1 << 3,
            COM_REQ_ENABLE_ITERATION: 1 << 4,
            COM_MOTOR_OVERRIDE_SPEED_0: 1 << 5,
            COM_MOTOR_OVERRIDE_SPEED_1: 1 << 6,
            COM_MOTOR_OVERRIDE_SPEED_2: 1 << 7,
            COM_MOTOR_OVERRIDE_SPEED_3: 1 << 8,
            COM_MOTOR_OVERRIDE_SPEED_4: 1 << 9,
            COM_MOTOR_OVERRIDE_SPEED_5: 1 << 10,
            COM_MOTOR_OVERRIDE_SPEED_6: 1 << 11,
            COM_MOTOR_OVERRIDE_SPEED_7: 1 << 12,
            COM_MOTOR_OVERRIDE_SPEED_ALL: (1 << 5) | (1 << 6) | (1 << 7) |
                (1 << 8) | (1 << 9) | (1 << 10) | (1 << 11) | (1 << 12),
            COM_SET_COMMAND_OVERRIDE: 1 << 13,
            COM_SET_STATE_MASK: 1 << 14,
            COM_SET_STATE_DELAY: 1 << 15,
            COM_SET_SD_WRITE_DELAY: 1 << 16,
            COM_SET_LED: 1 << 17,
            COM_SET_SERIAL_RC: 1 << 18,
            COM_SET_CARD_RECORDING: 1 << 19,
            COM_SET_PARTIAL_EEPROM_DATA: 1 << 20,
            COM_REINIT_PARTIAL_EEPROM_DATA: 1 << 21,
            COM_REQ_PARTIAL_EEPROM_DATA: 1 << 22,
            COM_REQ_CARD_RECORDING_STATE: 1 << 23,
            COM_SET_PARTIAL_TEMPORARY_CONFIG: 1 << 24,
            COM_SET_COMMAND_SOURCES: 1 << 25,
            COM_SET_CALIBRATION: 1 << 26,
        };

        var StateFields = {
            STATE_ALL: 0xFFFFFFFF,
            STATE_NONE: 0,
            STATE_MICROS: 1 << 0,
            STATE_STATUS: 1 << 1,
            STATE_V0: 1 << 2,
            STATE_I0: 1 << 3,
            STATE_I1: 1 << 4,
            STATE_ACCEL: 1 << 5,
            STATE_GYRO: 1 << 6,
            STATE_MAG: 1 << 7,
            STATE_TEMPERATURE: 1 << 8,
            STATE_PRESSURE: 1 << 9,
            STATE_RX_PPM: 1 << 10,
            STATE_AUX_CHAN_MASK: 1 << 11,
            STATE_COMMANDS: 1 << 12,
            STATE_F_AND_T: 1 << 13,
            STATE_PID_FZ_MASTER: 1 << 14,
            STATE_PID_TX_MASTER: 1 << 15,
            STATE_PID_TY_MASTER: 1 << 16,
            STATE_PID_TZ_MASTER: 1 << 17,
            STATE_PID_FZ_SLAVE: 1 << 18,
            STATE_PID_TX_SLAVE: 1 << 19,
            STATE_PID_TY_SLAVE: 1 << 20,
            STATE_PID_TZ_SLAVE: 1 << 21,
            STATE_MOTOR_OUT: 1 << 22,
            STATE_KINE_ANGLE: 1 << 23,
            STATE_KINE_RATE: 1 << 24,
            STATE_KINE_ALTITUDE: 1 << 25,
            STATE_LOOP_COUNT: 1 << 26,
        };

        var StatusCodes = {
            STATUS_BOOT: 0x0001,
            STATUS_MPU_FAIL: 0x0002,
            STATUS_BMP_FAIL: 0x0004,
            STATUS_RX_FAIL: 0x0008,

            STATUS_IDLE: 0x0010,

            STATUS_ENABLING: 0x0020,
            STATUS_CLEAR_MPU_BIAS: 0x0040,
            STATUS_SET_MPU_BIAS: 0x0080,

            STATUS_FAIL_STABILITY: 0x0100,
            STATUS_FAIL_ANGLE: 0x0200,
            STATUS_FAIL_OTHER: 0x4000,

            STATUS_ENABLED: 0x0400,
            STATUS_BATTERY_LOW: 0x0800,

            STATUS_TEMP_WARNING: 0x1000,
            STATUS_LOG_FULL: 0x2000,
            STATUS_OVERRIDE: 0x8000,
        };

        var last_timestamp_us = 0;

        var stateHandler = (function() {
            var e = encodable;
            var pidHandler = e.polyarray([
                e.Uint32, e.Float32, e.Float32, e.Float32, e.Float32, e.Float32
            ]);
            return e.map([
                {key: 'timestamp_us', element: e.Uint32},
                {key: 'status', element: e.Uint16},
                {key: 'V0_raw', element: e.Uint16},
                {key: 'I0_raw', element: e.Uint16},
                {key: 'I1_raw', element: e.Uint16},
                {key: 'accel', element: e.array(3, e.Float32)},
                {key: 'gyro', element: e.array(3, e.Float32)},
                {key: 'mag', element: e.array(3, e.Float32)},
                {key: 'temperature', element: e.Uint16},
                {key: 'pressure', element: e.Uint32},
                {key: 'ppm', element: e.array(6, e.Int16)},
                {key: 'AUX_chan_mask', element: e.Uint8},
                // throttle, pitch, roll, yaw
                {key: 'command', element: e.array(4, e.Int16)},
                // Fz, Tx, Ty, Tz
                {key: 'control', element: e.array(4, e.Float32)},
                // time, input, setpoint, p_term, i_term, d_term
                {key: 'pid_master_Fz', element: pidHandler},
                {key: 'pid_master_Tx', element: pidHandler},
                {key: 'pid_master_Ty', element: pidHandler},
                {key: 'pid_master_Tz', element: pidHandler},
                {key: 'pid_slave_Fz', element: pidHandler},
                {key: 'pid_slave_Tx', element: pidHandler},
                {key: 'pid_slave_Ty', element: pidHandler},
                {key: 'pid_slave_Tz', element: pidHandler},
                {key: 'MotorOut', element: e.array(8, e.Int16)},
                {key: 'kinematicsAngle', element: e.array(3, e.Float32)},
                {key: 'kinematicsRate', element: e.array(3, e.Float32)},
                {key: 'kinematicsAltitude', element: e.Float32},
                {key: 'loopCount', element: e.Uint32},
            ]);
        }());

        function processBinaryDatastream(
            command, mask, message_buffer, cb_state, cb_command, cb_debug, cb_history, cb_ack) {
            dispatch(command, mask, message_buffer, 
                function() {callbackStateHelper(mask, message_buffer, cb_state)},
                cb_command, cb_debug, cb_history, cb_ack);
        }

        function dispatch(
            command, mask, message_buffer, cb_state, cb_command, cb_debug, cb_history, cb_ack) {
            switch (command) {
                case MessageType.State:
                    cb_state(mask, message_buffer);
                    break;
                case MessageType.Command:
                    cb_command(mask, message_buffer);
                    break;
                case MessageType.DebugString:
                    var debug_string = arraybuffer2string(message_buffer);
                    cb_debug(debug_string);
                    break;
                case MessageType.HistoryData:
                    var debug_string = arraybuffer2string(message_buffer);
                    cb_history(debug_string);
                    break;
                case MessageType.Response:
                    var data = new DataView(message_buffer, 0);
                    cb_ack(mask, data.getInt32(0, 1));
                    break;
                default:
                    break;
            }
        }

        function arraybuffer2string(buf) {
            return String.fromCharCode.apply(null, new Uint8Array(buf));
        }

        function callbackStateHelper(mask, message_buffer, cb_state) {
            var state = stateHandler.empty();
            var state_data_mask = [];  // TODO: get rid of this in general
            var data = new DataView(message_buffer, 0);
            var b = new encodable.Serializer();
            var serial_update_rate_Hz = 0;

            mask &= firmwareVersion.stateMask();

            stateHandler.children.forEach(function(child, idx) {
                var submask = (1 << idx);
                if (!(mask & submask)) {
                    return;
                }
                state_data_mask[idx] = true;
                var handler = child.element;
                var key = child.key;
                state[key] = handler.decode(data, b);
            });

            if (mask & StateFields.STATE_MICROS) {
                serial_update_rate_Hz =
                    1000000 / (state.timestamp_us - last_timestamp_us);
                last_timestamp_us = state.timestamp_us;
            }
            if (mask & StateFields.STATE_TEMPERATURE) {
                state.temperature /= 100.0;  // temperature
            }
            if (mask & StateFields.STATE_PRESSURE) {
                state.pressure /= 256.0;  // pressure (Q24.8)
            }
            cb_state(state, state_data_mask, serial_update_rate_Hz);
        }

        return {
            processBinaryDatastream: processBinaryDatastream,
            MessageType: MessageType,
            CommandFields: CommandFields,
            StatusCodes: StatusCodes,
            StateFields: StateFields,
        };
    }
}());

(function() {
    'use strict';

    angular.module('flybrixCommon').factory('presets', presets);

    presets.$inject = ['firmwareVersion', 'parser'];

    function presets(firmwareVersion, parser) {
        var LedPatterns = {
            NO_OVERRIDE: 0,
            FLASH: 1,
            BEACON: 2,
            BREATHE: 3,
            ALTERNATE: 4,
            SOLID: 5,
        };

        var Color = {
            Black: 0x000000,
            Red: 0xff0000,
            Green: 0x008000,
            Orange: 0xffa500,
            Blue: 0x0000ff,
        };

        function toRgb(color) {
            return {
                red: (color >> 16) & 0xff,
                green: (color >> 8) & 0xff,
                blue: color & 0xff,
            };
        }

        function makeLedCase(mask, pattern, color1, color2, red, green) {
            if (color2 === undefined) {
                color2 = color1;
            }
            color1 = toRgb(color1);
            color2 = toRgb(color2);
            red = red || false;
            green = green || false;
            return {
                status: mask,
                pattern: pattern,
                colors: {
                    right_front: color1,
                    right_back: color1,
                    left_front: color2,
                    left_back: color2,
                },
                indicator_red: red,
                indicator_green: green,
            };
        }

        function fade(color) {
            var r = (color >> 16) & 0xff;
            var g = (color >> 8) & 0xff;
            var b = color & 0xff;
            r *= 0.9;
            g *= 0.9;
            b *= 0.9;
            return (Math.floor(r) << 16) | (Math.floor(g) << 8) | Math.floor(b);
        }

        var ledStates = [
            makeLedCase(
                parser.StatusCodes.STATUS_MPU_FAIL, LedPatterns.SOLID,
                fade(Color.Black), fade(Color.Red), true),
            makeLedCase(
                parser.StatusCodes.STATUS_BMP_FAIL, LedPatterns.SOLID,
                fade(Color.Red), fade(Color.Black), true),
            makeLedCase(
                parser.StatusCodes.STATUS_BOOT, LedPatterns.SOLID,
                fade(Color.Green)),
            makeLedCase(
                parser.StatusCodes.STATUS_RX_FAIL, LedPatterns.FLASH,
                fade(Color.Orange)),
            makeLedCase(
                parser.StatusCodes.STATUS_FAIL_OTHER, LedPatterns.ALTERNATE,
                fade(Color.Blue)),
            makeLedCase(
                parser.StatusCodes.STATUS_FAIL_STABILITY, LedPatterns.FLASH,
                fade(Color.Black), fade(Color.Blue)),
            makeLedCase(
                parser.StatusCodes.STATUS_FAIL_ANGLE, LedPatterns.FLASH,
                fade(Color.Blue), fade(Color.Black)),
            makeLedCase(
                parser.StatusCodes.STATUS_OVERRIDE, LedPatterns.BEACON,
                fade(Color.Red)),
            makeLedCase(
                parser.StatusCodes.STATUS_TEMP_WARNING, LedPatterns.FLASH,
                fade(Color.Red)),
            makeLedCase(
                parser.StatusCodes.STATUS_BATTERY_LOW, LedPatterns.BEACON,
                fade(Color.Orange)),
            makeLedCase(
                parser.StatusCodes.STATUS_ENABLING, LedPatterns.FLASH,
                fade(Color.Blue)),
            makeLedCase(
                parser.StatusCodes.STATUS_ENABLED, LedPatterns.BEACON,
                fade(Color.Blue)),
            makeLedCase(
                parser.StatusCodes.STATUS_IDLE, LedPatterns.BEACON,
                fade(Color.Green)),
            makeLedCase(0, 0, 0),
            makeLedCase(0, 0, 0),
            makeLedCase(0, 0, 0),
        ];

        var template = {
            pcbOrientation: [0, 0, 0],
            pcbTranslation: [0, 0, 0],
            magBias: [0, 0, 0],
            assignedChannel: [2, 1, 0, 3, 4, 5],
            commandInversion: 6,
            channelMidpoint: [1515, 1515, 1500, 1520, 1500, 1500],
            channelDeadzone: [20, 20, 20, 40, 20, 20],
            thrustMasterPIDParameters: [1, 0, 0, 0, 0.005, 0.005, 1],
            pitchMasterPIDParameters: [10, 1, 0, 10, 0.005, 0.005, 10],
            rollMasterPIDParameters: [10, 1, 0, 10, 0.005, 0.005, 10],
            yawMasterPIDParameters: [5, 1, 0, 10, 0.005, 0.005, 180],
            thrustSlavePIDParameters: [1, 0, 0, 10, 0.001, 0.001, 0.3],
            pitchSlavePIDParameters: [10, 4, 0, 30, 0.001, 0.001, 30],
            rollSlavePIDParameters: [10, 4, 0, 30, 0.001, 0.001, 30],
            yawSlavePIDParameters: [30, 5, 0, 20, 0.001, 0.001, 240],
            thrustGain: 4095,
            pitchGain: 2047,
            rollGain: 2047,
            yawGain: 2047,
            pidBypass: 25,
            stateEstimationParameters: [1, 0.01],
            enableParameters: [0.001, 30],
            ledStates: ledStates,
            name: 'FLYBRIX',
            forwardMasterPIDParameters: [10, 1, 0, 10, 0.005, 0.005, 10],
            rightMasterPIDParameters: [10, 1, 0, 10, 0.005, 0.005, 10],
            upMasterPIDParameters: [10, 1, 0, 10, 0.005, 0.005, 10],
            forwardSlavePIDParameters: [10, 4, 0, 30, 0.001, 0.001, 30],
            rightSlavePIDParameters: [10, 4, 0, 30, 0.001, 0.001, 30],
            upSlavePIDParameters: [10, 4, 0, 30, 0.001, 0.001, 30],
            velocityPidBypass: 119,
            inertialBiasAccel: [0, 0, 0],
            inertialBiasGyro: [0, 0, 0],
        };

        return {
            get: get,
        }

        function get(id) {
            id = Math.floor(id);
            if (!(id >= 0 && id < 3)) {
                id = 0;
            }
            var handler = firmwareVersion.configHandler();
            var value = {};
            angular.copy(template);
            handler.children.forEach(function(child) {
                var key = child.key;
                value[key] = angular.copy(template[key]);
            });
            value.id = id;
            value.version = firmwareVersion.get().slice();
            switch (id) {
                case 0:
                    value.mixTableFz = [1, 1, 0, 0, 0, 0, 1, 1];
                    value.mixTableTx = [1, 1, 0, 0, 0, 0, -1, -1];
                    value.mixTableTy = [-1, 1, 0, 0, 0, 0, -1, 1];
                    value.mixTableTz = [1, -1, 0, 0, 0, 0, -1, 1];
                    break;
                case 1:
                    value.mixTableFz = [1, 1, 1, 1, 0, 0, 1, 1];
                    value.mixTableTx = [1, 1, 0, 0, 0, 0, -1, -1];
                    value.mixTableTy = [-1, 1, -1, 1, 0, 0, -1, 1];
                    value.mixTableTz = [1, -1, -1, 1, 0, 0, 1, -1];
                    break;
                case 2:
                    value.mixTableFz = [1, 1, 1, 1, 1, 1, 1, 1];
                    value.mixTableTx = [1, 1, 1, 1, -1, -1, -1, -1];
                    value.mixTableTy = [-1, 1, -1, 1, -1, 1, -1, 1];
                    value.mixTableTz = [1, -1, -1, 1, 1, -1, -1, 1];
                    break;
            }
            return value;
        }
    }

}());

(function() {
    'use strict';

    angular.module('flybrixCommon').factory('rcData', rcData);

    rcData.$inject = ['serial'];

    function rcData(serial) {
        var AUX = {
            LOW: 0,
            MID: 1,
            HIGH: 2,
        };
        var auxNames = ['low', 'mid', 'high'];

        var throttle = -1;
        var pitch = 0;
        var roll = 0;
        var yaw = 0;
        // defaults to high -- low is enabling; high is disabling
        var aux1 = AUX.HIGH;
        // defaults to ?? -- need to check transmitter behavior
        var aux2 = AUX.HIGH;

        var urgent = true;

        return {
            setThrottle: setThrottle,
            setPitch: setPitch,
            setRoll: setRoll,
            setYaw: setYaw,
            setAux1: setAux1,
            setAux2: setAux2,
            getThrottle: getThrottle,
            getPitch: getPitch,
            getRoll: getRoll,
            getYaw: getYaw,
            getAux1: getAux1,
            getAux2: getAux2,
            AUX: AUX,
            send: send,
            forceNextSend: forceNextSend,
        };

        function send() {
            if (!urgent && serial.busy()) {
                return;
            }
            urgent = false;

            var command = {};

            // invert pitch and roll
            var throttle_threshold =
                -0.8;  // keep bottom 10% of throttle stick to mean 'off'
            command.throttle = constrain(
                (throttle - throttle_threshold) * 4095 /
                    (1 - throttle_threshold),
                0, 4095);
            command.pitch =
                constrain(-(applyDeadzone(pitch, 0.1)) * 4095 / 2, -2047, 2047);
            command.roll =
                constrain((applyDeadzone(roll, 0.1)) * 4095 / 2, -2047, 2047);
            command.yaw =
                constrain(-(applyDeadzone(yaw, 0.1)) * 4095 / 2, -2047, 2047);

            var aux_mask = {};
            // aux1_low, aux1_mid, aux1_high, and same with aux2
            aux_mask['aux1_' + auxNames[aux1]] = true;
            aux_mask['aux2_' + auxNames[aux2]] = true;

            return serial.sendStructure('Command', {
                request_response: true,
                set_serial_rc: {
                    enabled: true,
                    command: command,
                    aux_mask: aux_mask,
                },
            }, false);
        }

        function setThrottle(v) {
            throttle = v;
        }

        function setPitch(v) {
            pitch = v;
        }

        function setRoll(v) {
            roll = v;
        }

        function setYaw(v) {
            yaw = v;
        }

        function setAux1(v) {
            aux1 = Math.max(0, Math.min(2, v));
        }

        function setAux2(v) {
            aux2 = Math.max(0, Math.min(2, v));
        }

        function getThrottle() {
            return throttle;
        }

        function getPitch() {
            return pitch;
        }

        function getRoll() {
            return roll;
        }

        function getYaw() {
            return yaw;
        }

        function getAux1() {
            return aux1;
        }

        function getAux2() {
            return aux2;
        }

        function forceNextSend() {
            urgent = true;
        }

        function constrain(x, xmin, xmax) {
            return Math.max(xmin, Math.min(x, xmax));
        }

        function applyDeadzone(value, deadzone) {
            if (value > deadzone) {
                return value - deadzone;
            }
            if (value < -deadzone) {
                return value + deadzone;
            }
            return 0;
        }
    }
}());

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
            sendStructure: sendStructure,
            setBackend: setBackend,
            setStateCallback: setStateCallback,
            setCommandCallback: setCommandCallback,
            setDebugCallback: setDebugCallback,
            setHistoryCallback: setHistoryCallback,
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

        function setHistoryCallback(callback) {
            onHistoryListener = callback;
        }

        function setDebugCallback(callback) {
            onDebugListener = callback;
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
                onCommandListener, onDebugListener, onHistoryListener, acknowledge);
        };

        function byteNinNum(data, n) {
            return (data >> (8 * n)) & 0xFF;
        }
    }
}());

(function () {
    'use strict';

    serializationHandler.$inject = [];

    angular.module('flybrixCommon').factory('serializationHandler', serializationHandler);

    function serializationHandler() {
        var handlerCache = {};
        var version = 'Version = { major: u8, minor: u8, patch: u8 };';
        var configId = 'ConfigID = { id: u32 };';

        var vector3f = 'Vector3f = { x: f32, y: f32, z: f32 };';

        var pcbTransform = 'PcbTransform = { orientation: Vector3f, translation: Vector3f };';
        var mixTable = 'MixTable = { fz: [i8:8], tx: [i8:8], ty: [i8:8], tz: [i8:8] };';
        var magBias = 'MagBias = { offset: Vector3f };';
        var channelProperties = 'ChannelProperties = {' +
            'assignment: [u8:6],' +
            'inversion: u8,' +
            'midpoint: [u16:6],' +
            'deadzone: [u16:6] };';

        var pidSettings = 'PIDSettings = {' +
            'kp: f32,' +
            'ki: f32,' +
            'kd: f32,' +
            'integral_windup_guard: f32,' +
            'd_filter_time: f32,' +
            'setpoint_filter_time: f32,' +
            'command_to_value: f32 };';
        var pidParameters14 = 'PIDParameters = {' +
            'thrust_master: PIDSettings,' +
            'pitch_master: PIDSettings,' +
            'roll_master: PIDSettings,' +
            'yaw_master: PIDSettings,' +
            'thrust_slave: PIDSettings,' +
            'pitch_slave: PIDSettings,' +
            'roll_slave: PIDSettings,' +
            'yaw_slave: PIDSettings,' +
            'pid_bypass: u8 };';
        var pidParameters = 'PIDParameters = {' +
            'thrust_master: PIDSettings,' +
            'pitch_master: PIDSettings,' +
            'roll_master: PIDSettings,' +
            'yaw_master: PIDSettings,' +
            'thrust_slave: PIDSettings,' +
            'pitch_slave: PIDSettings,' +
            'roll_slave: PIDSettings,' +
            'yaw_slave: PIDSettings,' +
            'thrust_gain: f32,' +
            'pitch_gain: f32,' +
            'roll_gain: f32,' +
            'yaw_gain: f32,' +
            'pid_bypass: u8 };';

        var stateParameters = 'StateParameters = { state_estimation: [f32:2], enable: [f32:2] };';

        var color = 'Color = { red: u8, green: u8, blue: u8 };';
        var ledStateCase = 'LEDStateCase = {' +
            'status: u16,' +
            'pattern: u8,' +
            'color_right_front: Color,' +
            'color_right_back: Color,' +
            'color_left_front: Color,' +
            'color_left_back: Color,' +
            'indicator_red: bool,' +
            'indicator_green: bool };';
        var ledStates = 'LEDStates = { states: [/16/LEDStateCase:16] };';
        var ledStatesFixed = 'LEDStatesFixed = { states: [LEDStateCase:16] };';

        var deviceName = 'DeviceName = { value: s9 };';

        var velocityPidParameters = 'VelocityPIDParameters = {' +
            'forward_master: PIDSettings,' +
            'right_master: PIDSettings,' +
            'up_master: PIDSettings,' +
            'forward_slave: PIDSettings,' +
            'right_slave: PIDSettings,' +
            'up_slave: PIDSettings,' +
            'pid_bypass: u8 };';

        var inertialBias = 'InertialBias = { accel: Vector3f, gyro: Vector3f };';

        var config1415 = 'Configuration = {/16/' +
            'version: Version,' +
            'config_id: ConfigID,' +
            'pcb_transform: PcbTransform,' +
            'mix_table: MixTable,' +
            'mag_bias: MagBias,' +
            'channel: ChannelProperties,' +
            'pid_parameters: PIDParameters,' +
            'state_parameters: StateParameters,' +
            'led_states: LEDStates,' +
            'device_name: DeviceName };';

        var configFixed1415 = 'ConfigurationFixed = {' +
            'version: Version,' +
            'config_id: ConfigID,' +
            'pcb_transform: PcbTransform,' +
            'mix_table: MixTable,' +
            'mag_bias: MagBias,' +
            'channel: ChannelProperties,' +
            'pid_parameters: PIDParameters,' +
            'state_parameters: StateParameters,' +
            'led_states: LEDStatesFixed,' +
            'device_name: DeviceName };';

        var config = 'Configuration = {/16/' +
            'version: Version,' +
            'config_id: ConfigID,' +
            'pcb_transform: PcbTransform,' +
            'mix_table: MixTable,' +
            'mag_bias: MagBias,' +
            'channel: ChannelProperties,' +
            'pid_parameters: PIDParameters,' +
            'state_parameters: StateParameters,' +
            'led_states: LEDStates,' +
            'device_name: DeviceName,' +
            'velocity_pid_parameters: VelocityPIDParameters,' +
            'inertial_bias: InertialBias };';

        var configFixed = 'ConfigurationFixed = {' +
            'version: Version,' +
            'config_id: ConfigID,' +
            'pcb_transform: PcbTransform,' +
            'mix_table: MixTable,' +
            'mag_bias: MagBias,' +
            'channel: ChannelProperties,' +
            'pid_parameters: PIDParameters,' +
            'state_parameters: StateParameters,' +
            'led_states: LEDStatesFixed,' +
            'device_name: DeviceName,' +
            'velocity_pid_parameters: VelocityPIDParameters,' +
            'inertial_bias: InertialBias };';

        var configFlag14 = 'ConfigurationFlag = {/16/' +
            'version: void,' +
            'config_id: void,' +
            'pcb_transform: void,' +
            'mix_table: void,' +
            'mag_bias: void,' +
            'channel: void,' +
            'pid_parameters: void,' +
            'state_parameters: void,' +
            'led_states: [// void:16],' +
            'device_name: void};';

        var configFlag = 'ConfigurationFlag = {/16/' +
            'version: void,' +
            'config_id: void,' +
            'pcb_transform: void,' +
            'mix_table: void,' +
            'mag_bias: void,' +
            'channel: void,' +
            'pid_parameters: void,' +
            'state_parameters: void,' +
            'led_states: [// void:16],' +
            'device_name: void,' +
            'velocity_pid_parameters: void,' +
            'inertial_bias: void };';

        var configFull14 = vector3f + pidSettings + version + configId + pcbTransform +
            mixTable + magBias + channelProperties + pidParameters14 + stateParameters +
            color + ledStateCase + ledStates + ledStatesFixed + deviceName +
            config1415 + configFixed1415 + configFlag14;
        var configFull15 = vector3f + pidSettings + version + configId + pcbTransform + mixTable +
            magBias + channelProperties + pidParameters + stateParameters +
            color + ledStateCase + ledStates + ledStatesFixed + deviceName +
            config1415 + configFixed1415 + configFlag;
        var configFull16 = vector3f + pidSettings + version + configId + pcbTransform + mixTable +
            magBias + channelProperties + pidParameters + stateParameters +
            color + ledStateCase + ledStates + ledStatesFixed + deviceName +
            inertialBias + velocityPidParameters +
            config + configFixed + configFlag;

        var state = 'Rotation = { roll: f32, pitch: f32, yaw: f32 };' +
            'PIDState = {' +
            'timestamp_us: u32,' +
            'input: f32,' +
            'setpoint: f32,' +
            'p_term: f32,' +
            'i_term: f32,' +
            'd_term: f32 };' +
            'RcCommand = { throttle: i16, pitch: i16, roll: i16, yaw: i16 };' +
            'State = {/32/' +
            'timestamp_us: u32,' +
            'status: u16,' +
            'v0_raw: u16,' +
            'i0_raw: u16,' +
            'i1_raw: u16,' +
            'accel: Vector3f,' +
            'gyro: Vector3f,' +
            'mag: Vector3f,' +
            'temperature: u16,' +
            'pressure: u32,' +
            'ppm: [i16:6],' +
            'aux_chan_mask: u8,' +
            'command: RcCommand,' +
            'control: { fz: f32, tx: f32, ty: f32, tz: f32 },' +
            'pid_master_fz: PIDState,' +
            'pid_master_tx: PIDState,' +
            'pid_master_ty: PIDState,' +
            'pid_master_tz: PIDState,' +
            'pid_slave_fz: PIDState,' +
            'pid_slave_tx: PIDState,' +
            'pid_slave_ty: PIDState,' +
            'pid_slave_tz: PIDState,' +
            'motor_out: [i16:8],' +
            'kinematics_angle: Rotation,' +
            'kinematics_rate: Rotation,' +
            'kinematics_altitude: f32,' +
            'loop_count: u32 };';

        var auxMask = 'AuxMask = {//' +
            'aux1_low: void,' +
            'aux1_mid: void,' +
            'aux1_high: void,' +
            'aux2_low: void,' +
            'aux2_mid: void,' +
            'aux2_high: void };';

        var commands = auxMask + 'Command = {/32/' +
            'request_response: void,' +
            'set_eeprom_data: ConfigurationFixed,' +
            'reinit_eeprom_data: void,' +
            'request_eeprom_data: void,' +
            'request_enable_iteration: u8,' +
            'motor_override_speed_0: u16,' +
            'motor_override_speed_1: u16,' +
            'motor_override_speed_2: u16,' +
            'motor_override_speed_3: u16,' +
            'motor_override_speed_4: u16,' +
            'motor_override_speed_5: u16,' +
            'motor_override_speed_6: u16,' +
            'motor_override_speed_7: u16,' +
            'set_command_override: bool,' +
            'set_state_mask: u32,' +
            'set_state_delay: u16,' +
            'set_sd_write_delay: u16,' +
            'set_led: {' +
            '  pattern: u8,' +
            '  color_right: Color,' +
            '  color_left: Color,' +
            '  indicator_red: bool,' +
            '  indicator_green: bool },' +
            'set_serial_rc: { enabled: bool, command: RcCommand, aux_mask: AuxMask },' +
            'set_card_recording_state: {/8/ record_to_card: void, lock_recording_state: void },' +
            'set_partial_eeprom_data: Configuration,' +
            'reinit_partial_eeprom_data: ConfigurationFlag,' +
            'req_partial_eeprom_data: ConfigurationFlag,' +
            'req_card_recording_state: void,' +
            'set_partial_temporary_config: Configuration,' +
            'set_command_sources: {/8/ serial: void, radio: void },' +
            'set_calibration: { enabled: bool, mode: u8 },' +
            'set_autopilot_enabled: bool,' +
            'set_usb_mode: u8};';

        var debugString = "DebugString = { depricated_mask: u32, message: s };";
        var historyData = "HistoryData = DebugString;";
        var response = "Response = { mask: u32, ack: u32 };";

        var handler14 = configFull14 + state + commands + debugString + historyData + response;
        var handler15 = configFull15 + state + commands + debugString + historyData + response;
        var handler16 = configFull16 + state + commands + debugString + historyData + response;

        handlerCache['1.4.0'] = FlybrixSerialization.parse(handler14);
        handlerCache['1.5.0'] = handlerCache['1.5.1'] = FlybrixSerialization.parse(handler15);
        handlerCache['1.6.0'] = FlybrixSerialization.parse(handler16);

        return {
            Serializer: FlybrixSerialization.Serializer,
            getHandler: function (firmware) {
                return handlerCache[firmware];
            }
        };
    }

}());

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZS5qcyIsImNhbGlicmF0aW9uLmpzIiwiY29icy5qcyIsImNvbW1hbmRMb2cuanMiLCJjb25maWdIYW5kbGVyLmpzIiwiZGV2aWNlQ29uZmlnLmpzIiwiZW5jb2RhYmxlLmpzIiwiZmlybXdhcmVWZXJzaW9uLmpzIiwibGVkLmpzIiwicGFyc2VyLmpzIiwicHJlc2V0cy5qcyIsInJjRGF0YS5qcyIsInNlcmlhbC5qcyIsInNlcmlhbGl6YXRpb25IYW5kbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25kQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDak9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJmbHlicml4LWNvbW1vbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgnZmx5YnJpeENvbW1vbicsIFtdKTtcclxufSgpKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdmbHlicml4Q29tbW9uJykuZmFjdG9yeSgnY2FsaWJyYXRpb24nLCBjYWxpYnJhdGlvbik7XHJcblxyXG4gICAgY2FsaWJyYXRpb24uJGluamVjdCA9IFsnY29tbWFuZExvZycsICdzZXJpYWwnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBjYWxpYnJhdGlvbihjb21tYW5kTG9nLCBzZXJpYWwpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBtYWduZXRvbWV0ZXI6IG1hZ25ldG9tZXRlcixcclxuICAgICAgICAgICAgYWNjZWxlcm9tZXRlcjoge1xyXG4gICAgICAgICAgICAgICAgZmxhdDogY2FsaWJyYXRlQWNjZWxlcm9tZXRlci5iaW5kKG51bGwsICdmbGF0JywgMCksXHJcbiAgICAgICAgICAgICAgICBmb3J3YXJkOiBjYWxpYnJhdGVBY2NlbGVyb21ldGVyLmJpbmQobnVsbCwgJ2xlYW4gZm9yd2FyZCcsIDEpLFxyXG4gICAgICAgICAgICAgICAgYmFjazogY2FsaWJyYXRlQWNjZWxlcm9tZXRlci5iaW5kKG51bGwsICdsZWFuIGJhY2snLCAyKSxcclxuICAgICAgICAgICAgICAgIHJpZ2h0OiBjYWxpYnJhdGVBY2NlbGVyb21ldGVyLmJpbmQobnVsbCwgJ2xlYW4gcmlnaHQnLCAzKSxcclxuICAgICAgICAgICAgICAgIGxlZnQ6IGNhbGlicmF0ZUFjY2VsZXJvbWV0ZXIuYmluZChudWxsLCAnbGVhbiBsZWZ0JywgNCksXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGZpbmlzaDogZmluaXNoLFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIG1hZ25ldG9tZXRlcigpIHtcclxuICAgICAgICAgICAgY29tbWFuZExvZyhcIkNhbGlicmF0aW5nIG1hZ25ldG9tZXRlciBiaWFzXCIpO1xyXG4gICAgICAgICAgICByZXR1cm4gc2VyaWFsLnNlbmRTdHJ1Y3R1cmUoJ0NvbW1hbmQnLCB7XHJcbiAgICAgICAgICAgICAgICByZXF1ZXN0X3Jlc3BvbnNlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgc2V0X2NhbGlicmF0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZW5hYmxlZDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBtb2RlOiAwLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSwgZmFsc2UpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gY2FsaWJyYXRlQWNjZWxlcm9tZXRlcihwb3NlRGVzY3JpcHRpb24sIHBvc2VJZCkge1xyXG4gICAgICAgICAgICBjb21tYW5kTG9nKFwiQ2FsaWJyYXRpbmcgZ3Jhdml0eSBmb3IgcG9zZTogXCIgKyBwb3NlRGVzY3JpcHRpb24pO1xyXG4gICAgICAgICAgICByZXR1cm4gc2VyaWFsLnNlbmRTdHJ1Y3R1cmUoJ0NvbW1hbmQnLCB7XHJcbiAgICAgICAgICAgICAgICByZXF1ZXN0X3Jlc3BvbnNlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgc2V0X2NhbGlicmF0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZW5hYmxlZDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBtb2RlOiBwb3NlSWQgKyAxLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSwgZmFsc2UpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZmluaXNoKCkge1xyXG4gICAgICAgICAgICBjb21tYW5kTG9nKFwiRmluaXNoaW5nIGNhbGlicmF0aW9uXCIpO1xyXG4gICAgICAgICAgICByZXR1cm4gc2VyaWFsLnNlbmRTdHJ1Y3R1cmUoJ0NvbW1hbmQnLCB7XHJcbiAgICAgICAgICAgICAgICByZXF1ZXN0X3Jlc3BvbnNlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgc2V0X2NhbGlicmF0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZW5hYmxlZDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgbW9kZTogMCxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0sIGZhbHNlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgnZmx5YnJpeENvbW1vbicpLmZhY3RvcnkoJ2NvYnMnLCBjb2JzKTtcclxuXHJcbiAgICBmdW5jdGlvbiBjb2JzKCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIFJlYWRlcjogUmVhZGVyLFxyXG4gICAgICAgICAgICBlbmNvZGU6IGVuY29kZSxcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBmdW5jdGlvbiBSZWFkZXIoY2FwYWNpdHkpIHtcclxuICAgICAgICBpZiAoY2FwYWNpdHkgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBjYXBhY2l0eSA9IDIwMDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuTiA9IGNhcGFjaXR5O1xyXG4gICAgICAgIHRoaXMuYnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoY2FwYWNpdHkpO1xyXG4gICAgICAgIHRoaXMucmVhZHlfZm9yX25ld19tZXNzYWdlID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmJ1ZmZlcl9sZW5ndGggPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNvYnNEZWNvZGUocmVhZGVyKSB7XHJcbiAgICAgICAgdmFyIHNyY19wdHIgPSAwO1xyXG4gICAgICAgIHZhciBkc3RfcHRyID0gMDtcclxuICAgICAgICB2YXIgbGVmdG92ZXJfbGVuZ3RoID0gMDtcclxuICAgICAgICB2YXIgYXBwZW5kX3plcm8gPSBmYWxzZTtcclxuICAgICAgICB3aGlsZSAocmVhZGVyLmJ1ZmZlcltzcmNfcHRyXSkge1xyXG4gICAgICAgICAgICBpZiAoIWxlZnRvdmVyX2xlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGFwcGVuZF96ZXJvKVxyXG4gICAgICAgICAgICAgICAgICAgIHJlYWRlci5idWZmZXJbZHN0X3B0cisrXSA9IDA7XHJcbiAgICAgICAgICAgICAgICBsZWZ0b3Zlcl9sZW5ndGggPSByZWFkZXIuYnVmZmVyW3NyY19wdHIrK10gLSAxO1xyXG4gICAgICAgICAgICAgICAgYXBwZW5kX3plcm8gPSBsZWZ0b3Zlcl9sZW5ndGggPCAweEZFO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLS1sZWZ0b3Zlcl9sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICByZWFkZXIuYnVmZmVyW2RzdF9wdHIrK10gPSByZWFkZXIuYnVmZmVyW3NyY19wdHIrK107XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBsZWZ0b3Zlcl9sZW5ndGggPyAwIDogZHN0X3B0cjtcclxuICAgIH1cclxuXHJcbiAgICBSZWFkZXIucHJvdG90eXBlLkFwcGVuZFRvQnVmZmVyID0gZnVuY3Rpb24oZGF0YSwgY2FsbGJhY2ssIG9uRXJyb3IpIHtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIGMgPSBkYXRhW2ldO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5yZWFkeV9mb3JfbmV3X21lc3NhZ2UpIHtcclxuICAgICAgICAgICAgICAgIC8vIGZpcnN0IGJ5dGUgb2YgYSBuZXcgbWVzc2FnZVxyXG4gICAgICAgICAgICAgICAgdGhpcy5yZWFkeV9mb3JfbmV3X21lc3NhZ2UgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYnVmZmVyX2xlbmd0aCA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuYnVmZmVyW3RoaXMuYnVmZmVyX2xlbmd0aCsrXSA9IGM7XHJcblxyXG4gICAgICAgICAgICBpZiAoYyAmJiB0aGlzLmJ1ZmZlcl9sZW5ndGggPT0gdGhpcy5OKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBidWZmZXIgb3ZlcmZsb3csIHByb2JhYmx5IGR1ZSB0byBlcnJvcnMgaW4gZGF0YVxyXG4gICAgICAgICAgICAgICAgb25FcnJvcignb3ZlcmZsb3cnLCAnYnVmZmVyIG92ZXJmbG93IGluIENPQlMgZGVjb2RpbmcnKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVhZHlfZm9yX25ld19tZXNzYWdlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoIWMpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYnVmZmVyX2xlbmd0aCA9IGNvYnNEZWNvZGUodGhpcyk7XHJcbiAgICAgICAgICAgICAgICB2YXIgZmFpbGVkX2RlY29kZSA9ICh0aGlzLmJ1ZmZlcl9sZW5ndGggPT09IDApO1xyXG4gICAgICAgICAgICAgICAgaWYgKGZhaWxlZF9kZWNvZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmJ1ZmZlclswXSA9IDE7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMTsgaiA8IHRoaXMuYnVmZmVyX2xlbmd0aDsgKytqKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5idWZmZXJbMF0gXj0gdGhpcy5idWZmZXJbal07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5idWZmZXJbMF0gPT09IDApIHsgIC8vIGNoZWNrIHN1bSBpcyBjb3JyZWN0XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWFkeV9mb3JfbmV3X21lc3NhZ2UgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmJ1ZmZlcl9sZW5ndGggPiA1KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjb21tYW5kID0gdGhpcy5idWZmZXJbMV07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtYXNrID0gMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgayA9IDA7IGsgPCA0OyArK2spIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hc2sgfD0gdGhpcy5idWZmZXJbayArIDJdIDw8IChrICogOCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soY29tbWFuZCwgbWFzayxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5idWZmZXIuc3ViYXJyYXkoNiwgdGhpcy5idWZmZXJfbGVuZ3RoKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnNsaWNlKClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5idWZmZXIpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uRXJyb3IoJ3Nob3J0JywgJ1RvbyBzaG9ydCBwYWNrZXQnKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgeyAgLy8gYmFkIGNoZWNrc3VtXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWFkeV9mb3JfbmV3X21lc3NhZ2UgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBieXRlcyA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgdGhpcy5idWZmZXJfbGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnl0ZXMgKz0gdGhpcy5idWZmZXJbal0gKyBcIixcIjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZSArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKHRoaXMuYnVmZmVyW2pdKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZhaWxlZF9kZWNvZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgb25FcnJvcignZnJhbWUnLCAnVW5leHBlY3RlZCBlbmRpbmcgb2YgcGFja2V0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG1zZyA9ICdCQUQgQ0hFQ0tTVU0gKCcgKyB0aGlzLmJ1ZmZlcl9sZW5ndGggK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyBieXRlcyknICsgYnl0ZXMgKyBtZXNzYWdlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkVycm9yKCdjaGVja3N1bScsIG1zZyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBmdW5jdGlvbiBlbmNvZGUoYnVmKSB7XHJcbiAgICAgICAgdmFyIHJldHZhbCA9XHJcbiAgICAgICAgICAgIG5ldyBVaW50OEFycmF5KE1hdGguZmxvb3IoKGJ1Zi5ieXRlTGVuZ3RoICogMjU1ICsgNzYxKSAvIDI1NCkpO1xyXG4gICAgICAgIHZhciBsZW4gPSAxO1xyXG4gICAgICAgIHZhciBwb3NfY3RyID0gMDtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGJ1Zi5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICBpZiAocmV0dmFsW3Bvc19jdHJdID09IDB4RkUpIHtcclxuICAgICAgICAgICAgICAgIHJldHZhbFtwb3NfY3RyXSA9IDB4RkY7XHJcbiAgICAgICAgICAgICAgICBwb3NfY3RyID0gbGVuKys7XHJcbiAgICAgICAgICAgICAgICByZXR2YWxbcG9zX2N0cl0gPSAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciB2YWwgPSBidWZbaV07XHJcbiAgICAgICAgICAgICsrcmV0dmFsW3Bvc19jdHJdO1xyXG4gICAgICAgICAgICBpZiAodmFsKSB7XHJcbiAgICAgICAgICAgICAgICByZXR2YWxbbGVuKytdID0gdmFsO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcG9zX2N0ciA9IGxlbisrO1xyXG4gICAgICAgICAgICAgICAgcmV0dmFsW3Bvc19jdHJdID0gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmV0dmFsLnN1YmFycmF5KDAsIGxlbikuc2xpY2UoKS5idWZmZXI7XHJcbiAgICB9O1xyXG59KCkpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ2ZseWJyaXhDb21tb24nKS5mYWN0b3J5KCdjb21tYW5kTG9nJywgY29tbWFuZExvZyk7XHJcblxyXG4gICAgY29tbWFuZExvZy4kaW5qZWN0ID0gWyckcSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGNvbW1hbmRMb2coJHEpIHtcclxuICAgICAgICB2YXIgbWVzc2FnZXMgPSBbXTtcclxuICAgICAgICB2YXIgcmVzcG9uZGVyID0gJHEuZGVmZXIoKTtcclxuXHJcbiAgICAgICAgdmFyIHNlcnZpY2UgPSBsb2c7XHJcbiAgICAgICAgc2VydmljZS5sb2cgPSBsb2c7XHJcbiAgICAgICAgc2VydmljZS5jbGVhclN1YnNjcmliZXJzID0gY2xlYXJTdWJzY3JpYmVycztcclxuICAgICAgICBzZXJ2aWNlLm9uTWVzc2FnZSA9IG9uTWVzc2FnZTtcclxuICAgICAgICBzZXJ2aWNlLnJlYWQgPSByZWFkO1xyXG5cclxuICAgICAgICByZXR1cm4gc2VydmljZTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gbG9nKG1lc3NhZ2UpIHtcclxuICAgICAgICAgICAgaWYgKG1lc3NhZ2UgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgbWVzc2FnZXMucHVzaChtZXNzYWdlKTtcclxuICAgICAgICAgICAgICAgIHJlc3BvbmRlci5ub3RpZnkocmVhZCgpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gcmVhZCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG1lc3NhZ2VzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gY2xlYXJTdWJzY3JpYmVycygpIHtcclxuICAgICAgICAgICAgcmVzcG9uZGVyID0gJHEuZGVmZXIoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIG9uTWVzc2FnZShjYWxsYmFjaykge1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uZGVyLnByb21pc2UudGhlbih1bmRlZmluZWQsIHVuZGVmaW5lZCwgY2FsbGJhY2spO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSgpKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdmbHlicml4Q29tbW9uJykuZmFjdG9yeSgnY29uZmlnSGFuZGxlcicsIGNvbmZpZ0hhbmRsZXIpO1xyXG5cclxuICAgIGNvbmZpZ0hhbmRsZXIuJGluamVjdCA9IFsnZW5jb2RhYmxlJ107XHJcblxyXG4gICAgZnVuY3Rpb24gY29uZmlnSGFuZGxlcihlbmNvZGFibGUpIHtcclxuICAgICAgICB2YXIgaGFuZGxlcnMgPSB7fTtcclxuXHJcbiAgICAgICAgdmFyIGUgPSBlbmNvZGFibGU7XHJcbiAgICAgICAgdmFyIGxlZENvbG9yID0gZS5tYXAoW1xyXG4gICAgICAgICAgICB7a2V5OiAncmVkJywgZWxlbWVudDogZS5VaW50OH0sXHJcbiAgICAgICAgICAgIHtrZXk6ICdncmVlbicsIGVsZW1lbnQ6IGUuVWludDh9LFxyXG4gICAgICAgICAgICB7a2V5OiAnYmx1ZScsIGVsZW1lbnQ6IGUuVWludDh9LFxyXG4gICAgICAgIF0pO1xyXG5cclxuICAgICAgICB2YXIgbGVkU3RhdGUgPSBlLm1hcChbXHJcbiAgICAgICAgICAgIHtrZXk6ICdzdGF0dXMnLCBlbGVtZW50OiBlLlVpbnQxNn0sXHJcbiAgICAgICAgICAgIHtrZXk6ICdwYXR0ZXJuJywgZWxlbWVudDogZS5VaW50OH0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICBrZXk6ICdjb2xvcnMnLFxyXG4gICAgICAgICAgICAgIGVsZW1lbnQ6IGUubWFwKFtcclxuICAgICAgICAgICAgICAgICAge2tleTogJ3JpZ2h0X2Zyb250JywgZWxlbWVudDogbGVkQ29sb3J9LFxyXG4gICAgICAgICAgICAgICAgICB7a2V5OiAncmlnaHRfYmFjaycsIGVsZW1lbnQ6IGxlZENvbG9yfSxcclxuICAgICAgICAgICAgICAgICAge2tleTogJ2xlZnRfZnJvbnQnLCBlbGVtZW50OiBsZWRDb2xvcn0sXHJcbiAgICAgICAgICAgICAgICAgIHtrZXk6ICdsZWZ0X2JhY2snLCBlbGVtZW50OiBsZWRDb2xvcn0sXHJcbiAgICAgICAgICAgICAgXSlcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAge2tleTogJ2luZGljYXRvcl9yZWQnLCBlbGVtZW50OiBlLmJvb2x9LFxyXG4gICAgICAgICAgICB7a2V5OiAnaW5kaWNhdG9yX2dyZWVuJywgZWxlbWVudDogZS5ib29sfSxcclxuICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgdmFyIGNvb3JkM2QgPSBlLmFycmF5KDMsIGUuRmxvYXQzMik7XHJcblxyXG4gICAgICAgIHZhciB2ZXJzaW9uID0gZS5hcnJheSgzLCBlLlVpbnQ4KTtcclxuICAgICAgICB2YXIgY2hhbm5lbE1hcHBpbmcgPSBlLmFycmF5KDYsIGUuVWludDgpO1xyXG4gICAgICAgIHZhciBjaGFubmVsTWFyayA9IGUuYXJyYXkoNiwgZS5VaW50MTYpO1xyXG4gICAgICAgIHZhciBwaWQgPSBlLmFycmF5KDcsIGUuRmxvYXQzMik7XHJcbiAgICAgICAgdmFyIHN0UGFyYW0gPSBlLmFycmF5KDIsIGUuRmxvYXQzMik7XHJcblxyXG4gICAgICAgIHZhciBsZWRTdGF0ZXMgPSBlLmFycmF5KDE2LCBsZWRTdGF0ZSwgMTYpO1xyXG5cclxuICAgICAgICB2YXIgbmFtZSA9IGUuc3RyaW5nKDkpO1xyXG5cclxuICAgICAgICB2YXIgaGFuZGxlckFycmF5ID0gW1xyXG4gICAgICAgICAgICB7cGFydDogMCwga2V5OiAndmVyc2lvbicsIGVsZW1lbnQ6IGUuYXJyYXkoMywgZS5VaW50OCl9LFxyXG4gICAgICAgICAgICB7cGFydDogMSwga2V5OiAnaWQnLCBlbGVtZW50OiBlLlVpbnQzMn0sXHJcbiAgICAgICAgICAgIHtwYXJ0OiAyLCBrZXk6ICdwY2JPcmllbnRhdGlvbicsIGVsZW1lbnQ6IGNvb3JkM2R9LFxyXG4gICAgICAgICAgICB7cGFydDogMiwga2V5OiAncGNiVHJhbnNsYXRpb24nLCBlbGVtZW50OiBjb29yZDNkfSxcclxuICAgICAgICAgICAge3BhcnQ6IDMsIGtleTogJ21peFRhYmxlRnonLCBlbGVtZW50OiBlLmFycmF5KDgsIGUuSW50OCl9LFxyXG4gICAgICAgICAgICB7cGFydDogMywga2V5OiAnbWl4VGFibGVUeCcsIGVsZW1lbnQ6IGUuYXJyYXkoOCwgZS5JbnQ4KX0sXHJcbiAgICAgICAgICAgIHtwYXJ0OiAzLCBrZXk6ICdtaXhUYWJsZVR5JywgZWxlbWVudDogZS5hcnJheSg4LCBlLkludDgpfSxcclxuICAgICAgICAgICAge3BhcnQ6IDMsIGtleTogJ21peFRhYmxlVHonLCBlbGVtZW50OiBlLmFycmF5KDgsIGUuSW50OCl9LFxyXG4gICAgICAgICAgICB7cGFydDogNCwga2V5OiAnbWFnQmlhcycsIGVsZW1lbnQ6IGNvb3JkM2R9LFxyXG4gICAgICAgICAgICB7cGFydDogNSwga2V5OiAnYXNzaWduZWRDaGFubmVsJywgZWxlbWVudDogY2hhbm5lbE1hcHBpbmd9LFxyXG4gICAgICAgICAgICB7cGFydDogNSwga2V5OiAnY29tbWFuZEludmVyc2lvbicsIGVsZW1lbnQ6IGUuVWludDh9LFxyXG4gICAgICAgICAgICB7cGFydDogNSwga2V5OiAnY2hhbm5lbE1pZHBvaW50JywgZWxlbWVudDogY2hhbm5lbE1hcmt9LFxyXG4gICAgICAgICAgICB7cGFydDogNSwga2V5OiAnY2hhbm5lbERlYWR6b25lJywgZWxlbWVudDogY2hhbm5lbE1hcmt9LFxyXG4gICAgICAgICAgICB7cGFydDogNiwga2V5OiAndGhydXN0TWFzdGVyUElEUGFyYW1ldGVycycsIGVsZW1lbnQ6IHBpZH0sXHJcbiAgICAgICAgICAgIHtwYXJ0OiA2LCBrZXk6ICdwaXRjaE1hc3RlclBJRFBhcmFtZXRlcnMnLCBlbGVtZW50OiBwaWR9LFxyXG4gICAgICAgICAgICB7cGFydDogNiwga2V5OiAncm9sbE1hc3RlclBJRFBhcmFtZXRlcnMnLCBlbGVtZW50OiBwaWR9LFxyXG4gICAgICAgICAgICB7cGFydDogNiwga2V5OiAneWF3TWFzdGVyUElEUGFyYW1ldGVycycsIGVsZW1lbnQ6IHBpZH0sXHJcbiAgICAgICAgICAgIHtwYXJ0OiA2LCBrZXk6ICd0aHJ1c3RTbGF2ZVBJRFBhcmFtZXRlcnMnLCBlbGVtZW50OiBwaWR9LFxyXG4gICAgICAgICAgICB7cGFydDogNiwga2V5OiAncGl0Y2hTbGF2ZVBJRFBhcmFtZXRlcnMnLCBlbGVtZW50OiBwaWR9LFxyXG4gICAgICAgICAgICB7cGFydDogNiwga2V5OiAncm9sbFNsYXZlUElEUGFyYW1ldGVycycsIGVsZW1lbnQ6IHBpZH0sXHJcbiAgICAgICAgICAgIHtwYXJ0OiA2LCBrZXk6ICd5YXdTbGF2ZVBJRFBhcmFtZXRlcnMnLCBlbGVtZW50OiBwaWR9LFxyXG4gICAgICAgICAgICB7cGFydDogNiwga2V5OiAncGlkQnlwYXNzJywgZWxlbWVudDogZS5VaW50OH0sXHJcbiAgICAgICAgICAgIHtwYXJ0OiA3LCBrZXk6ICdzdGF0ZUVzdGltYXRpb25QYXJhbWV0ZXJzJywgZWxlbWVudDogc3RQYXJhbX0sXHJcbiAgICAgICAgICAgIHtwYXJ0OiA3LCBrZXk6ICdlbmFibGVQYXJhbWV0ZXJzJywgZWxlbWVudDogc3RQYXJhbX0sXHJcbiAgICAgICAgICAgIHtwYXJ0OiA4LCBrZXk6ICdsZWRTdGF0ZXMnLCBlbGVtZW50OiBsZWRTdGF0ZXN9LFxyXG4gICAgICAgICAgICB7cGFydDogOSwga2V5OiAnbmFtZScsIGVsZW1lbnQ6IGUuc3RyaW5nKDkpfSxcclxuICAgICAgICBdO1xyXG5cclxuICAgICAgICBoYW5kbGVyc1snMS40LjAnXSA9IGUubWFwKGhhbmRsZXJBcnJheS5zbGljZSgpLCAxNik7XHJcblxyXG4gICAgICAgIHZhciBnYWluSGFuZGxlcnMgPSBbXHJcbiAgICAgICAgICAgIHtwYXJ0OiA2LCBrZXk6ICd0aHJ1c3RHYWluJywgZWxlbWVudDogZS5GbG9hdDMyfSxcclxuICAgICAgICAgICAge3BhcnQ6IDYsIGtleTogJ3BpdGNoR2FpbicsIGVsZW1lbnQ6IGUuRmxvYXQzMn0sXHJcbiAgICAgICAgICAgIHtwYXJ0OiA2LCBrZXk6ICdyb2xsR2FpbicsIGVsZW1lbnQ6IGUuRmxvYXQzMn0sXHJcbiAgICAgICAgICAgIHtwYXJ0OiA2LCBrZXk6ICd5YXdHYWluJywgZWxlbWVudDogZS5GbG9hdDMyfSxcclxuICAgICAgICBdO1xyXG5cclxuICAgICAgICBoYW5kbGVyQXJyYXkgPSBoYW5kbGVyQXJyYXkuc2xpY2UoMCwgMjEpLmNvbmNhdChcclxuICAgICAgICAgICAgZ2FpbkhhbmRsZXJzLCBoYW5kbGVyQXJyYXkuc2xpY2UoMjEpKTtcclxuXHJcbiAgICAgICAgaGFuZGxlcnNbJzEuNS4wJ10gPSBlLm1hcChoYW5kbGVyQXJyYXkuc2xpY2UoKSwgMTYpO1xyXG5cclxuICAgICAgICB2YXIgdmVsb2NpdHlQaWRIYW5kbGVycyA9IFtcclxuICAgICAgICAgICAge3BhcnQ6IDEwLCBrZXk6ICdmb3J3YXJkTWFzdGVyUElEUGFyYW1ldGVycycsIGVsZW1lbnQ6IHBpZH0sXHJcbiAgICAgICAgICAgIHtwYXJ0OiAxMCwga2V5OiAncmlnaHRNYXN0ZXJQSURQYXJhbWV0ZXJzJywgZWxlbWVudDogcGlkfSxcclxuICAgICAgICAgICAge3BhcnQ6IDEwLCBrZXk6ICd1cE1hc3RlclBJRFBhcmFtZXRlcnMnLCBlbGVtZW50OiBwaWR9LFxyXG4gICAgICAgICAgICB7cGFydDogMTAsIGtleTogJ2ZvcndhcmRTbGF2ZVBJRFBhcmFtZXRlcnMnLCBlbGVtZW50OiBwaWR9LFxyXG4gICAgICAgICAgICB7cGFydDogMTAsIGtleTogJ3JpZ2h0U2xhdmVQSURQYXJhbWV0ZXJzJywgZWxlbWVudDogcGlkfSxcclxuICAgICAgICAgICAge3BhcnQ6IDEwLCBrZXk6ICd1cFNsYXZlUElEUGFyYW1ldGVycycsIGVsZW1lbnQ6IHBpZH0sXHJcbiAgICAgICAgICAgIHtwYXJ0OiAxMCwga2V5OiAndmVsb2NpdHlQaWRCeXBhc3MnLCBlbGVtZW50OiBlLlVpbnQ4fSxcclxuICAgICAgICAgICAge3BhcnQ6IDExLCBrZXk6ICdpbmVydGlhbEJpYXNBY2NlbCcsIGVsZW1lbnQ6IGNvb3JkM2R9LFxyXG4gICAgICAgICAgICB7cGFydDogMTEsIGtleTogJ2luZXJ0aWFsQmlhc0d5cm8nLCBlbGVtZW50OiBjb29yZDNkfSxcclxuICAgICAgICBdO1xyXG5cclxuICAgICAgICBoYW5kbGVyQXJyYXkgPSBoYW5kbGVyQXJyYXkuY29uY2F0KHZlbG9jaXR5UGlkSGFuZGxlcnMpO1xyXG5cclxuICAgICAgICBoYW5kbGVyc1snMS42LjAnXSA9IGUubWFwKGhhbmRsZXJBcnJheS5zbGljZSgpLCAxNik7XHJcblxyXG4gICAgICAgIHJldHVybiBoYW5kbGVycztcclxuICAgIH1cclxuXHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgnZmx5YnJpeENvbW1vbicpLmZhY3RvcnkoJ2RldmljZUNvbmZpZycsIGRldmljZUNvbmZpZyk7XHJcblxyXG4gICAgZGV2aWNlQ29uZmlnLiRpbmplY3QgPVxyXG4gICAgICAgIFsnc2VyaWFsJywgJ2NvbW1hbmRMb2cnLCAnZW5jb2RhYmxlJywgJ2Zpcm13YXJlVmVyc2lvbiddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGRldmljZUNvbmZpZyhzZXJpYWwsIGNvbW1hbmRMb2csIGVuY29kYWJsZSwgZmlybXdhcmVWZXJzaW9uKSB7XHJcbiAgICAgICAgdmFyIGNvbmZpZztcclxuXHJcbiAgICAgICAgdmFyIGNvbmZpZ0NhbGxiYWNrID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGNvbW1hbmRMb2coJ05vIGNhbGxiYWNrIGRlZmluZWQgZm9yIHJlY2VpdmluZyBjb25maWd1cmF0aW9ucyEnKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgbG9nZ2luZ0NhbGxiYWNrID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGNvbW1hbmRMb2coXHJcbiAgICAgICAgICAgICAgICAnTm8gY2FsbGJhY2sgZGVmaW5lZCBmb3IgcmVjZWl2aW5nIGxvZ2dpbmcgc3RhdGUhJyArXHJcbiAgICAgICAgICAgICAgICAnIENhbGxiYWNrIGFyZ3VtZW50czogKGlzTG9nZ2luZywgaXNMb2NrZWQsIGRlbGF5KScpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHZhciBjb25maWdGaWVsZHMgPSB7XHJcbiAgICAgICAgICAgIFZFUlNJT046IDEgPDwgMCxcclxuICAgICAgICAgICAgSUQ6IDEgPDwgMSxcclxuICAgICAgICAgICAgUENCOiAxIDw8IDIsXHJcbiAgICAgICAgICAgIE1JWF9UQUJMRTogMSA8PCAzLFxyXG4gICAgICAgICAgICBNQUdfQklBUzogMSA8PCA0LFxyXG4gICAgICAgICAgICBDSEFOTkVMOiAxIDw8IDUsXHJcbiAgICAgICAgICAgIFBJRF9QQVJBTUVURVJTOiAxIDw8IDYsXHJcbiAgICAgICAgICAgIFNUQVRFX1BBUkFNRVRFUlM6IDEgPDwgNyxcclxuICAgICAgICAgICAgTEVEX1NUQVRFUzogMSA8PCA4LFxyXG4gICAgICAgICAgICBERVZJQ0VfTkFNRTogMSA8PCA5LFxyXG4gICAgICAgICAgICBWRUxPQ0lUWV9QSURfUEFSQU1FVEVSUzogMSA8PCAxMCxcclxuICAgICAgICAgICAgSU5FUlRJQUxfQklBUzogMSA8PCAxMSxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBzZXJpYWwuc2V0Q29tbWFuZENhbGxiYWNrKGZ1bmN0aW9uKG1hc2ssIG1lc3NhZ2VfYnVmZmVyKSB7XHJcbiAgICAgICAgICAgIGlmIChtYXNrICYgc2VyaWFsLmZpZWxkLkNPTV9TRVRfRUVQUk9NX0RBVEEpIHtcclxuICAgICAgICAgICAgICAgIGNvbVNldEVlcHJvbURhdGEobWVzc2FnZV9idWZmZXIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChtYXNrICYgc2VyaWFsLmZpZWxkLkNPTV9TRVRfUEFSVElBTF9FRVBST01fREFUQSkge1xyXG4gICAgICAgICAgICAgICAgY29tU2V0UGFydGlhbEVlcHJvbURhdGEobWVzc2FnZV9idWZmZXIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChtYXNrICYgKHNlcmlhbC5maWVsZC5DT01fU0VUX0NBUkRfUkVDT1JESU5HIHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VyaWFsLmZpZWxkLkNPTV9TRVRfU0RfV1JJVEVfREVMQVkpKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZGF0YUJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KG1lc3NhZ2VfYnVmZmVyKTtcclxuICAgICAgICAgICAgICAgIGlmIChkYXRhQnVmZmVyLmxlbmd0aCA+PSAzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRlbGF5ID0gZGF0YUJ1ZmZlclswXSB8IChkYXRhQnVmZmVyWzFdIDw8IDgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBkYXRhID0gZGF0YUJ1ZmZlclsyXTtcclxuICAgICAgICAgICAgICAgICAgICBsb2dnaW5nQ2FsbGJhY2soKGRhdGEgJiAxKSAhPT0gMCwgKGRhdGEgJiAyKSAhPT0gMCwgZGVsYXkpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBjb21tYW5kTG9nKCdCYWQgZGF0YSBnaXZlbiBmb3IgbG9nZ2luZyBpbmZvJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0RGVzaXJlZFZlcnNpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmaXJtd2FyZVZlcnNpb24uZGVzaXJlZCgpO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHJlcXVlc3QoKSB7XHJcbiAgICAgICAgICAgIHZhciBoYW5kbGVycyA9IGZpcm13YXJlVmVyc2lvbi5zZXJpYWxpemF0aW9uSGFuZGxlcigpO1xyXG4gICAgICAgICAgICBjb21tYW5kTG9nKCdSZXF1ZXN0aW5nIGN1cnJlbnQgY29uZmlndXJhdGlvbiBkYXRhLi4uJyk7XHJcbiAgICAgICAgICAgIHJldHVybiBzZXJpYWwuc2VuZFN0cnVjdHVyZSgnQ29tbWFuZCcsIHtcclxuICAgICAgICAgICAgICAgIHJlcXVlc3RfcmVzcG9uc2U6IHRydWUsXHJcbiAgICAgICAgICAgICAgICByZXFfcGFydGlhbF9lZXByb21fZGF0YTogaGFuZGxlcnMuQ29uZmlndXJhdGlvbkZsYWcuZW1wdHkoKSxcclxuICAgICAgICAgICAgfSwgZmFsc2UpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gcmVpbml0KCkge1xyXG4gICAgICAgICAgICBjb21tYW5kTG9nKCdTZXR0aW5nIGZhY3RvcnkgZGVmYXVsdCBjb25maWd1cmF0aW9uIGRhdGEuLi4nKTtcclxuICAgICAgICAgICAgcmV0dXJuIHNlcmlhbC5zZW5kU3RydWN0dXJlKCdDb21tYW5kJywge1xyXG4gICAgICAgICAgICAgICAgcmVxdWVzdF9yZXNwb25zZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHJlaW5pdF9lZXByb21fZGF0YTogdHJ1ZSxcclxuICAgICAgICAgICAgfSwgZmFsc2UpXHJcbiAgICAgICAgICAgICAgICAudGhlbihcclxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlcXVlc3QoKTtcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKHJlYXNvbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21tYW5kTG9nKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1JlcXVlc3QgZm9yIGZhY3RvcnkgcmVzZXQgZmFpbGVkOiAnICsgcmVhc29uKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNlbmQobmV3Q29uZmlnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzZW5kUGFydGlhbCgweGZmZmYsIDB4ZmZmZiwgbmV3Q29uZmlnLCBmYWxzZSwgdHJ1ZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZW5kUGFydGlhbChcclxuICAgICAgICAgICAgbWFzaywgbGVkX21hc2ssIG5ld0NvbmZpZywgdGVtcG9yYXJ5LCByZXF1ZXN0X3VwZGF0ZSkge1xyXG4gICAgICAgICAgICBpZiAobWFzayA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICBtYXNrID0gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAobGVkX21hc2sgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgbGVkX21hc2sgPSAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChuZXdDb25maWcgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgbmV3Q29uZmlnID0gY29uZmlnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciB0YXJnZXQgPSB0ZW1wb3JhcnkgP1xyXG4gICAgICAgICAgICAgICAgc2VyaWFsLmZpZWxkLkNPTV9TRVRfUEFSVElBTF9URU1QT1JBUllfQ09ORklHIDpcclxuICAgICAgICAgICAgICAgIHNlcmlhbC5maWVsZC5DT01fU0VUX1BBUlRJQUxfRUVQUk9NX0RBVEE7XHJcblxyXG4gICAgICAgICAgICB2YXIgZGF0YSA9IHNldENvbmZpZ1BhcnRpYWwobmV3Q29uZmlnLCBtYXNrLCBsZWRfbWFzayk7XHJcbiAgICAgICAgICAgIHJldHVybiBzZXJpYWwuc2VuZCh0YXJnZXQsIGRhdGEsIGZhbHNlKS50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlcXVlc3RfdXBkYXRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVxdWVzdCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYXBwbHlQcm9wZXJ0aWVzVG8oc291cmNlLCBkZXN0aW5hdGlvbikge1xyXG4gICAgICAgICAgICBPYmplY3Qua2V5cyhzb3VyY2UpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XHJcbiAgICAgICAgICAgICAgICBkZXN0aW5hdGlvbltrZXldID0gc291cmNlW2tleV07XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2V0Q29uZmlnKHN0cnVjdHVyZSkge1xyXG4gICAgICAgICAgICB2YXIgaGFuZGxlciA9IGZpcm13YXJlVmVyc2lvbi5jb25maWdIYW5kbGVyKCk7XHJcbiAgICAgICAgICAgIHZhciBkYXRhID0gbmV3IFVpbnQ4QXJyYXkoaGFuZGxlci5ieXRlY291bnQoKSk7XHJcbiAgICAgICAgICAgIHZhciBkYXRhVmlldyA9IG5ldyBEYXRhVmlldyhkYXRhLmJ1ZmZlciwgMCk7XHJcbiAgICAgICAgICAgIGhhbmRsZXIuZW5jb2RlKGRhdGFWaWV3LCBuZXcgZW5jb2RhYmxlLlNlcmlhbGl6ZXIoKSwgc3RydWN0dXJlKTtcclxuICAgICAgICAgICAgcmV0dXJuIGRhdGE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZXRDb25maWdQYXJ0aWFsKHN0cnVjdHVyZSwgbWFzaywgbGVkX21hc2spIHtcclxuICAgICAgICAgICAgdmFyIGhhbmRsZXIgPSBmaXJtd2FyZVZlcnNpb24uY29uZmlnSGFuZGxlcigpO1xyXG4gICAgICAgICAgICB2YXIgZGF0YSA9IG5ldyBVaW50OEFycmF5KGhhbmRsZXIuYnl0ZWNvdW50KFtsZWRfbWFzaywgbWFza10pKVxyXG4gICAgICAgICAgICAgICAgdmFyIGRhdGFWaWV3ID0gbmV3IERhdGFWaWV3KGRhdGEuYnVmZmVyLCAwKTtcclxuICAgICAgICAgICAgdmFyIGIgPSBuZXcgZW5jb2RhYmxlLlNlcmlhbGl6ZXIoKTtcclxuICAgICAgICAgICAgaGFuZGxlci5lbmNvZGVQYXJ0aWFsKGRhdGFWaWV3LCBiLCBzdHJ1Y3R1cmUsIFtsZWRfbWFzaywgbWFza10pO1xyXG4gICAgICAgICAgICByZXR1cm4gZGF0YTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGNvbVNldEVlcHJvbURhdGEobWVzc2FnZV9idWZmZXIpIHtcclxuICAgICAgICAgICAgLy9jb21tYW5kTG9nKCdSZWNlaXZlZCBjb25maWchJyk7XHJcbiAgICAgICAgICAgIGNvbmZpZyA9IGZpcm13YXJlVmVyc2lvbi5jb25maWdIYW5kbGVyKCkuZGVjb2RlKFxyXG4gICAgICAgICAgICAgICAgbmV3IERhdGFWaWV3KG1lc3NhZ2VfYnVmZmVyLCAwKSwgbmV3IGVuY29kYWJsZS5TZXJpYWxpemVyKCkpO1xyXG4gICAgICAgICAgICByZXNwb25kVG9TZXRFZXByb20oKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGNvbVNldFBhcnRpYWxFZXByb21EYXRhKG1lc3NhZ2VfYnVmZmVyKSB7XHJcbiAgICAgICAgICAgIC8vY29tbWFuZExvZygnUmVjZWl2ZWQgcGFydGlhbCBjb25maWchJyk7XHJcbiAgICAgICAgICAgIGNvbmZpZyA9IGZpcm13YXJlVmVyc2lvbi5jb25maWdIYW5kbGVyKCkuZGVjb2RlUGFydGlhbChcclxuICAgICAgICAgICAgICAgIG5ldyBEYXRhVmlldyhtZXNzYWdlX2J1ZmZlciwgMCksIG5ldyBlbmNvZGFibGUuU2VyaWFsaXplcigpLFxyXG4gICAgICAgICAgICAgICAgYW5ndWxhci5jb3B5KGNvbmZpZykpLFxyXG4gICAgICAgICAgICByZXNwb25kVG9TZXRFZXByb20oKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHJlc3BvbmRUb1NldEVlcHJvbSgpIHtcclxuICAgICAgICAgICAgZmlybXdhcmVWZXJzaW9uLnNldChjb25maWcudmVyc2lvbik7XHJcbiAgICAgICAgICAgIGlmICghZmlybXdhcmVWZXJzaW9uLnN1cHBvcnRlZCgpKSB7XHJcbiAgICAgICAgICAgICAgICBjb21tYW5kTG9nKCdSZWNlaXZlZCBhbiB1bnN1cHBvcnRlZCBjb25maWd1cmF0aW9uIScpO1xyXG4gICAgICAgICAgICAgICAgY29tbWFuZExvZyhcclxuICAgICAgICAgICAgICAgICAgICAnRm91bmQgdmVyc2lvbjogJyArIGNvbmZpZy52ZXJzaW9uWzBdICsgJy4nICtcclxuICAgICAgICAgICAgICAgICAgICBjb25maWcudmVyc2lvblsxXSArICcuJyArIGNvbmZpZy52ZXJzaW9uWzJdICArXHJcbiAgICAgICAgICAgICAgICAgICAgJyAtLS0gTmV3ZXN0IHZlcnNpb246ICcgK1xyXG4gICAgICAgICAgICAgICAgICAgIGZpcm13YXJlVmVyc2lvbi5kZXNpcmVkS2V5KCkgKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbW1hbmRMb2coXHJcbiAgICAgICAgICAgICAgICAgICAgJ1JlY2VpdmVkIGNvbmZpZ3VyYXRpb24gZGF0YSAodicgK1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZy52ZXJzaW9uWzBdICsgJy4nICsgY29uZmlnLnZlcnNpb25bMV0gKyAnLicgK1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZy52ZXJzaW9uWzJdICsnKScpO1xyXG4gICAgICAgICAgICAgICAgY29uZmlnQ2FsbGJhY2soKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2V0Q29uZmlnQ2FsbGJhY2soY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgY29uZmlnQ2FsbGJhY2sgPSBjYWxsYmFjaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNldExvZ2dpbmdDYWxsYmFjayhjYWxsYmFjaykge1xyXG4gICAgICAgICAgICBsb2dnaW5nQ2FsbGJhY2sgPSBjYWxsYmFjaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdldENvbmZpZygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGNvbmZpZztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbmZpZyA9IGZpcm13YXJlVmVyc2lvbi5jb25maWdIYW5kbGVyKCkuZW1wdHkoKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVxdWVzdDogcmVxdWVzdCxcclxuICAgICAgICAgICAgcmVpbml0OiByZWluaXQsXHJcbiAgICAgICAgICAgIHNlbmQ6IHNlbmQsXHJcbiAgICAgICAgICAgIHNlbmRQYXJ0aWFsOiBzZW5kUGFydGlhbCxcclxuICAgICAgICAgICAgZ2V0Q29uZmlnOiBnZXRDb25maWcsXHJcbiAgICAgICAgICAgIHNldENvbmZpZ0NhbGxiYWNrOiBzZXRDb25maWdDYWxsYmFjayxcclxuICAgICAgICAgICAgc2V0TG9nZ2luZ0NhbGxiYWNrOiBzZXRMb2dnaW5nQ2FsbGJhY2ssXHJcbiAgICAgICAgICAgIGdldERlc2lyZWRWZXJzaW9uOiBnZXREZXNpcmVkVmVyc2lvbixcclxuICAgICAgICAgICAgZmllbGQ6IGNvbmZpZ0ZpZWxkcyxcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59KCkpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgICBhbmd1bGFyLm1vZHVsZSgnZmx5YnJpeENvbW1vbicpLmZhY3RvcnkoJ2VuY29kYWJsZScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBlbmNvZGFibGU7XHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgZW5jb2RhYmxlID0ge1xyXG4gICAgICAgIHN0cmluZzogY29tcGlsZVN0cmluZyxcclxuICAgICAgICBtYXA6IGNvbXBpbGVNYXAsXHJcbiAgICAgICAgYXJyYXk6IGNvbXBpbGVBcnJheSxcclxuICAgICAgICBwb2x5YXJyYXk6IGNvbXBpbGVQb2x5YXJyYXksXHJcbiAgICAgICAgU2VyaWFsaXplcjogU2VyaWFsaXplcixcclxuICAgIH07XHJcblxyXG4gICAgZnVuY3Rpb24gU2VyaWFsaXplcigpIHtcclxuICAgICAgICB0aGlzLmluZGV4ID0gMDtcclxuICAgIH1cclxuXHJcbiAgICBTZXJpYWxpemVyLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbihpbmNyZW1lbnQpIHtcclxuICAgICAgICB0aGlzLmluZGV4ICs9IGluY3JlbWVudDtcclxuICAgIH07XHJcblxyXG4gICAgLy8gSGFuZGxpbmcgbnVtYmVyc1xyXG5cclxuICAgIGZ1bmN0aW9uIG51bWJlclplcm8oKSB7XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9XHJcblxyXG4gICAgWydVaW50JywgJ0ludCddLmZvckVhY2goZnVuY3Rpb24oa2V5UHJlZml4KSB7XHJcbiAgICAgICAgWzEsIDIsIDRdLmZvckVhY2goZnVuY3Rpb24oYnl0ZUNvdW50KSB7XHJcbiAgICAgICAgICAgIHZhciBrZXkgPSBrZXlQcmVmaXggKyAoYnl0ZUNvdW50ICogOCk7XHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGVuY29kZShkYXRhVmlldywgc2VyaWFsaXplciwgZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgZGF0YVZpZXdbJ3NldCcgKyBrZXldKHNlcmlhbGl6ZXIuaW5kZXgsIGRhdGEsIDEpO1xyXG4gICAgICAgICAgICAgICAgc2VyaWFsaXplci5hZGQoYnl0ZUNvdW50KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmdW5jdGlvbiBkZWNvZGUoZGF0YVZpZXcsIHNlcmlhbGl6ZXIpIHtcclxuICAgICAgICAgICAgICAgIHZhciBkYXRhID0gZGF0YVZpZXdbJ2dldCcgKyBrZXldKHNlcmlhbGl6ZXIuaW5kZXgsIDEpO1xyXG4gICAgICAgICAgICAgICAgc2VyaWFsaXplci5hZGQoYnl0ZUNvdW50KTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBkYXRhO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGJ5dGVjb3VudCgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBieXRlQ291bnQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZW5jb2RhYmxlW2tleV0gPSBuZXcgSGFuZGxlcihieXRlY291bnQsIGVuY29kZSwgZGVjb2RlLCBudW1iZXJaZXJvKTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG4gICAgWzQsIDhdLmZvckVhY2goZnVuY3Rpb24oYnl0ZUNvdW50KSB7XHJcbiAgICAgICAgdmFyIGtleSA9ICdGbG9hdCcgKyAoYnl0ZUNvdW50ICogOCk7XHJcbiAgICAgICAgZnVuY3Rpb24gZW5jb2RlKGRhdGFWaWV3LCBzZXJpYWxpemVyLCBkYXRhKSB7XHJcbiAgICAgICAgICAgIGRhdGFWaWV3WydzZXQnICsga2V5XShzZXJpYWxpemVyLmluZGV4LCBkYXRhLCAxKTtcclxuICAgICAgICAgICAgc2VyaWFsaXplci5hZGQoYnl0ZUNvdW50KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZnVuY3Rpb24gZGVjb2RlKGRhdGFWaWV3LCBzZXJpYWxpemVyKSB7XHJcbiAgICAgICAgICAgIHZhciBkYXRhID0gZGF0YVZpZXdbJ2dldCcgKyBrZXldKHNlcmlhbGl6ZXIuaW5kZXgsIDEpO1xyXG4gICAgICAgICAgICBzZXJpYWxpemVyLmFkZChieXRlQ291bnQpO1xyXG4gICAgICAgICAgICByZXR1cm4gZGF0YTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZnVuY3Rpb24gYnl0ZWNvdW50KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gYnl0ZUNvdW50O1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbmNvZGFibGVba2V5XSA9IG5ldyBIYW5kbGVyKGJ5dGVjb3VudCwgZW5jb2RlLCBkZWNvZGUsIG51bWJlclplcm8pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZnVuY3Rpb24gY29tcGlsZU51bWJlcih0eXBlKSB7XHJcbiAgICAgICAgdmFyIGhhbmRsZXIgPSBlbmNvZGFibGVbJ1VpbnQnICsgdHlwZV07XHJcbiAgICAgICAgaWYgKGhhbmRsZXIgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXHJcbiAgICAgICAgICAgICAgICAnVW5zdXBwb3J0ZWQgc3BsaXQgYml0IGNvdW50OiAnICsgdHlwZSArXHJcbiAgICAgICAgICAgICAgICAnLiBBbGxvd2VkIGNvdW50czogOCwgMTYsIDMyLCA2NCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gaGFuZGxlcjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBIYW5kbGluZyBib29sc1xyXG5cclxuICAgIGVuY29kYWJsZS5ib29sID0gbmV3IEhhbmRsZXIoXHJcbiAgICAgICAgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAxO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZnVuY3Rpb24oZGF0YVZpZXcsIHNlcmlhbGl6ZXIsIGRhdGEpIHtcclxuICAgICAgICAgICAgZW5jb2RhYmxlLlVpbnQ4LmVuY29kZShkYXRhVmlldywgc2VyaWFsaXplciwgZGF0YSA/IDEgOiAwKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZnVuY3Rpb24oZGF0YVZpZXcsIHNlcmlhbGl6ZXIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGVuY29kYWJsZS5VaW50OC5kZWNvZGUoZGF0YVZpZXcsIHNlcmlhbGl6ZXIpICE9PSAwO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAvLyBIYW5kbGluZyBzdHJpbmdzXHJcblxyXG4gICAgZnVuY3Rpb24gY29tcGlsZVN0cmluZyhsZW5ndGgpIHtcclxuICAgICAgICB2YXIgaGFuZGxlciA9IGNvbXBpbGVBcnJheShsZW5ndGgsIGVuY29kYWJsZS5VaW50OCk7XHJcbiAgICAgICAgZnVuY3Rpb24gZW5jb2RlKGRhdGFWaWV3LCBzZXJpYWxpemVyLCBkYXRhKSB7XHJcbiAgICAgICAgICAgIGhhbmRsZXIuZW5jb2RlKGRhdGFWaWV3LCBzZXJpYWxpemVyLCBhc2NpaUVuY29kZShkYXRhLCBsZW5ndGgpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZnVuY3Rpb24gZGVjb2RlKGRhdGFWaWV3LCBzZXJpYWxpemVyKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBhc2NpaURlY29kZShoYW5kbGVyLmRlY29kZShkYXRhVmlldywgc2VyaWFsaXplciksIGxlbmd0aCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZ1bmN0aW9uIGVtcHR5KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZ1bmN0aW9uIGJ5dGVjb3VudCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGxlbmd0aDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5ldyBIYW5kbGVyKGJ5dGVjb3VudCwgZW5jb2RlLCBkZWNvZGUsIGVtcHR5KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBhc2NpaUVuY29kZShuYW1lLCBsZW5ndGgpIHtcclxuICAgICAgICB2YXIgcmVzcG9uc2UgPSBuZXcgVWludDhBcnJheShsZW5ndGgpO1xyXG4gICAgICAgIG5hbWUuc3BsaXQoJycpLmZvckVhY2goZnVuY3Rpb24oYywgaWR4KSB7XHJcbiAgICAgICAgICAgIHJlc3BvbnNlW2lkeF0gPSBjLmNoYXJDb2RlQXQoMCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmVzcG9uc2VbbGVuZ3RoIC0gMV0gPSAwO1xyXG4gICAgICAgIHJldHVybiByZXNwb25zZTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBhc2NpaURlY29kZShuYW1lLCBsZW5ndGgpIHtcclxuICAgICAgICB2YXIgcmVzcG9uc2UgPSAnJztcclxuICAgICAgICB2YXIgbCA9IE1hdGgubWluKG5hbWUubGVuZ3RoLCBsZW5ndGggLSAxKTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGw7ICsraSkge1xyXG4gICAgICAgICAgICBpZiAobmFtZVtpXSA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJlc3BvbnNlICs9IFN0cmluZy5mcm9tQ2hhckNvZGUobmFtZVtpXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXNwb25zZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBIYW5kbGluZyBhcnJheXNcclxuXHJcbiAgICBmdW5jdGlvbiBjb21waWxlQXJyYXkobGVuZ3RoLCBlbGVtZW50LCBzcGxpdEJpdHMpIHtcclxuICAgICAgICBpZiAobGVuZ3RoID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBcnJheSB0eXBlIHJlcXVpcmVzIGxlbmd0aCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIShlbGVtZW50IGluc3RhbmNlb2YgSGFuZGxlcikpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBcnJheSB0eXBlIHJlcXVpcmVzIEhhbmRsZXIgdHlwZSBhcyBlbGVtZW50Jyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZ1bmN0aW9uIGVuY29kZShkYXRhVmlldywgc2VyaWFsaXplciwgZGF0YSkge1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LmVuY29kZShkYXRhVmlldywgc2VyaWFsaXplciwgZGF0YVtpXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZnVuY3Rpb24gZGVjb2RlKGRhdGFWaWV3LCBzZXJpYWxpemVyKSB7XHJcbiAgICAgICAgICAgIHZhciBkYXRhID0gW107XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyArK2kpIHtcclxuICAgICAgICAgICAgICAgIGRhdGEucHVzaChlbGVtZW50LmRlY29kZShkYXRhVmlldywgc2VyaWFsaXplcikpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBkYXRhO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmdW5jdGlvbiBlbXB0eSgpIHtcclxuICAgICAgICAgICAgdmFyIGRhdGEgPSBbXTtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICAgICAgZGF0YS5wdXNoKGVsZW1lbnQuZW1wdHkoKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGRhdGE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBoYW5kbGVyO1xyXG4gICAgICAgIGlmIChzcGxpdEJpdHMgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICB2YXIgbnVtYmVyRW5jb2RlciA9IGNvbXBpbGVOdW1iZXIoc3BsaXRCaXRzKTtcclxuICAgICAgICAgICAgZnVuY3Rpb24gZW5jb2RlUGFydGlhbFNwbGl0KGRhdGFWaWV3LCBzZXJpYWxpemVyLCBkYXRhLCBtYXNrcykge1xyXG4gICAgICAgICAgICAgICAgdmFyIG1hc2sgPSBtYXNrcy5wb3AoKTtcclxuICAgICAgICAgICAgICAgIG51bWJlckVuY29kZXIuZW5jb2RlKGRhdGFWaWV3LCBzZXJpYWxpemVyLCBtYXNrKTtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyArK2kpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobWFzayAmICgxIDw8IGkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuZW5jb2RlUGFydGlhbChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFWaWV3LCBzZXJpYWxpemVyLCBkYXRhW2ldLCBtYXNrcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGRlY29kZVBhcnRpYWxTcGxpdChkYXRhVmlldywgc2VyaWFsaXplciwgb3JpZ2luYWwpIHtcclxuICAgICAgICAgICAgICAgIHZhciBtYXNrID0gbnVtYmVyRW5jb2Rlci5kZWNvZGUoZGF0YVZpZXcsIHNlcmlhbGl6ZXIpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGRhdGEgPSBbXTtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyArK2kpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobWFzayAmICgxIDw8IGkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEucHVzaChlbGVtZW50LmRlY29kZVBhcnRpYWwoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhVmlldywgc2VyaWFsaXplciwgb3JpZ2luYWxbaV0pKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnB1c2gob3JpZ2luYWxbaV0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBkYXRhO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGJ5dGVjb3VudFNwbGl0KG1hc2tzKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbWFzaztcclxuICAgICAgICAgICAgICAgIHZhciBub21hc2sgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgaWYgKG1hc2tzICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBtYXNrID0gbWFza3MucG9wKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbm9tYXNrID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB2YXIgYWNjdW0gPSBub21hc2sgPyAwIDogc3BsaXRCaXRzIC8gODtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyArK2kpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobm9tYXNrIHx8IChtYXNrICYgKDEgPDwgaSkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjY3VtICs9IGVsZW1lbnQuYnl0ZWNvdW50KG1hc2tzKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYWNjdW07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaGFuZGxlciA9IG5ldyBIYW5kbGVyKFxyXG4gICAgICAgICAgICAgICAgYnl0ZWNvdW50U3BsaXQsIGVuY29kZSwgZGVjb2RlLCBlbXB0eSwgZW5jb2RlUGFydGlhbFNwbGl0LFxyXG4gICAgICAgICAgICAgICAgZGVjb2RlUGFydGlhbFNwbGl0KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBmdW5jdGlvbiBlbmNvZGVQYXJ0aWFsKGRhdGFWaWV3LCBzZXJpYWxpemVyLCBkYXRhLCBtYXNrcykge1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuZW5jb2RlUGFydGlhbChkYXRhVmlldywgc2VyaWFsaXplciwgZGF0YVtpXSwgbWFza3MpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGRlY29kZVBhcnRpYWwoZGF0YVZpZXcsIHNlcmlhbGl6ZXIsIG9yaWdpbmFsKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGEucHVzaChlbGVtZW50LmRlY29kZVBhcnRpYWwoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFWaWV3LCBzZXJpYWxpemVyLCBvcmlnaW5hbFtpXSkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRhdGE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZnVuY3Rpb24gYnl0ZWNvdW50KG1hc2tzKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgYWNjdW0gPSAwO1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGFjY3VtICs9IGVsZW1lbnQuYnl0ZWNvdW50KG1hc2tzKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBhY2N1bTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBoYW5kbGVyID0gbmV3IEhhbmRsZXIoXHJcbiAgICAgICAgICAgICAgICBieXRlY291bnQsIGVuY29kZSwgZGVjb2RlLCBlbXB0eSwgZW5jb2RlUGFydGlhbCwgZGVjb2RlUGFydGlhbCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGhhbmRsZXIuY2hpbGRyZW4gPSB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQ6IGVsZW1lbnQsXHJcbiAgICAgICAgICAgIGNvdW50OiBsZW5ndGgsXHJcbiAgICAgICAgfTtcclxuICAgICAgICByZXR1cm4gaGFuZGxlcjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBIYW5kbGluZyBwb2x5YXJyYXlzXHJcblxyXG4gICAgZnVuY3Rpb24gY29tcGlsZVBvbHlhcnJheShwcm9wZXJ0aWVzLCBzcGxpdEJpdHMpIHtcclxuICAgICAgICB2YXIgbGVuZ3RoID0gcHJvcGVydGllcy5sZW5ndGg7XHJcbiAgICAgICAgaWYgKGxlbmd0aCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcclxuICAgICAgICAgICAgICAgICdQb2x5YXJyYXkgdHlwZSByZXF1aXJlcyBhbiBhcnJheSBvZiBIYW5kbGVyIG9iamVjdHMnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHJvcGVydGllcy5mb3JFYWNoKGZ1bmN0aW9uKHByb3BlcnR5KSB7XHJcbiAgICAgICAgICAgIGlmICghKHByb3BlcnR5IGluc3RhbmNlb2YgSGFuZGxlcikpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcclxuICAgICAgICAgICAgICAgICAgICAnUG9seWFycmF5IHR5cGUgcmVxdWlyZXMgYW4gYXJyYXkgb2YgSGFuZGxlciBvYmplY3RzJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBmdW5jdGlvbiBlbmNvZGUoZGF0YVZpZXcsIHNlcmlhbGl6ZXIsIGRhdGEpIHtcclxuICAgICAgICAgICAgcHJvcGVydGllcy5mb3JFYWNoKGZ1bmN0aW9uKHByb3BlcnR5LCBpZHgpIHtcclxuICAgICAgICAgICAgICAgIHByb3BlcnR5LmVuY29kZShkYXRhVmlldywgc2VyaWFsaXplciwgZGF0YVtpZHhdKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZ1bmN0aW9uIGRlY29kZShkYXRhVmlldywgc2VyaWFsaXplcikge1xyXG4gICAgICAgICAgICB2YXIgZGF0YSA9IFtdO1xyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzLmZvckVhY2goZnVuY3Rpb24ocHJvcGVydHksIGlkeCkge1xyXG4gICAgICAgICAgICAgICAgZGF0YS5wdXNoKHByb3BlcnR5LmRlY29kZShkYXRhVmlldywgc2VyaWFsaXplcikpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIGRhdGE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZ1bmN0aW9uIGVtcHR5KCkge1xyXG4gICAgICAgICAgICB2YXIgZGF0YSA9IFtdO1xyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzLmZvckVhY2goZnVuY3Rpb24ocHJvcGVydHkpIHtcclxuICAgICAgICAgICAgICAgIGRhdGEucHVzaChwcm9wZXJ0eS5lbXB0eSgpKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiBkYXRhO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgaGFuZGxlcjtcclxuICAgICAgICB2YXIgYnl0ZUNvdW50ID0gcHJvcGVydGllcy5yZWR1Y2UoZnVuY3Rpb24oYWNjdW0sIHYpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGFjY3VtICsgdi5ieXRlY291bnQ7XHJcbiAgICAgICAgfSwgMCk7XHJcbiAgICAgICAgaWYgKHNwbGl0Qml0cyAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHZhciBudW1iZXJFbmNvZGVyID0gY29tcGlsZU51bWJlcihzcGxpdEJpdHMpO1xyXG4gICAgICAgICAgICBmdW5jdGlvbiBlbmNvZGVQYXJ0aWFsU3BsaXQoZGF0YVZpZXcsIHNlcmlhbGl6ZXIsIGRhdGEsIG1hc2tzKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbWFzayA9IG1hc2tzLnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgbnVtYmVyRW5jb2Rlci5lbmNvZGUoZGF0YVZpZXcsIHNlcmlhbGl6ZXIsIG1hc2spO1xyXG4gICAgICAgICAgICAgICAgcHJvcGVydGllcy5mb3JFYWNoKGZ1bmN0aW9uKHByb3BlcnR5LCBpZHgpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobWFzayAmICgxIDw8IGlkeCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHkuZW5jb2RlUGFydGlhbChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFWaWV3LCBzZXJpYWxpemVyLCBkYXRhW2lkeF0sIG1hc2tzKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmdW5jdGlvbiBkZWNvZGVQYXJ0aWFsU3BsaXQoZGF0YVZpZXcsIHNlcmlhbGl6ZXIsIG9yaWdpbmFsKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbWFzayA9IG51bWJlckVuY29kZXIuZGVjb2RlKGRhdGFWaWV3LCBzZXJpYWxpemVyKTtcclxuICAgICAgICAgICAgICAgIHZhciBkYXRhID0gW107XHJcbiAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzLmZvckVhY2goZnVuY3Rpb24ocHJvcGVydHksIGlkeCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChtYXNrICYgKDEgPDwgaWR4KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnB1c2gocHJvcGVydHkuZGVjb2RlUGFydGlhbChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFWaWV3LCBzZXJpYWxpemVyLCBvcmlnaW5hbFtpZHhdKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5wdXNoKG9yaWdpbmFsW2lkeF0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRhdGE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZnVuY3Rpb24gYnl0ZWNvdW50U3BsaXQobWFza3MpIHtcclxuICAgICAgICAgICAgICAgIHZhciBtYXNrO1xyXG4gICAgICAgICAgICAgICAgdmFyIG5vbWFzayA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBpZiAobWFza3MgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG1hc2sgPSBtYXNrcy5wb3AoKTtcclxuICAgICAgICAgICAgICAgICAgICBub21hc2sgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBwcm9wZXJ0aWVzLnJlZHVjZShmdW5jdGlvbihhY2N1bSwgdiwgaWR4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFub21hc2sgJiYgKCEobWFzayAmICgxIDw8IGlkeCkpKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYWNjdW07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhY2N1bSArIHYuYnl0ZWNvdW50KG1hc2tzKTtcclxuICAgICAgICAgICAgICAgIH0sIG5vbWFzayA/IDAgOiBzcGxpdEJpdHMgLyA4KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBoYW5kbGVyID0gbmV3IEhhbmRsZXIoXHJcbiAgICAgICAgICAgICAgICBieXRlY291bnRTcGxpdCwgZW5jb2RlLCBkZWNvZGUsIGVtcHR5LCBlbmNvZGVQYXJ0aWFsU3BsaXQsXHJcbiAgICAgICAgICAgICAgICBkZWNvZGVQYXJ0aWFsU3BsaXQpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGVuY29kZVBhcnRpYWwoZGF0YVZpZXcsIHNlcmlhbGl6ZXIsIGRhdGEsIG1hc2tzKSB7XHJcbiAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzLmZvckVhY2goZnVuY3Rpb24ocHJvcGVydHksIGlkeCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnR5LmVuY29kZVBhcnRpYWwoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFWaWV3LCBzZXJpYWxpemVyLCBkYXRhW2lkeF0sIG1hc2tzKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGRlY29kZVBhcnRpYWwoZGF0YVZpZXcsIHNlcmlhbGl6ZXIsIG9yaWdpbmFsKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgcHJvcGVydGllcy5mb3JFYWNoKGZ1bmN0aW9uKHByb3BlcnR5LCBpZHgpIHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRhLnB1c2gocHJvcGVydHkuZGVjb2RlUGFydGlhbChcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVZpZXcsIHNlcmlhbGl6ZXIsIG9yaWdpbmFsW2lkeF0pKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRhdGE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZnVuY3Rpb24gYnl0ZWNvdW50KG1hc2tzKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvcGVydGllcy5yZWR1Y2UoZnVuY3Rpb24oYWNjdW0sIHYpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYWNjdW0gKyB2LmJ5dGVjb3VudChtYXNrcyk7XHJcbiAgICAgICAgICAgICAgICB9LCAwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBoYW5kbGVyID0gbmV3IEhhbmRsZXIoXHJcbiAgICAgICAgICAgICAgICBieXRlY291bnQsIGVuY29kZSwgZGVjb2RlLCBlbXB0eSwgZW5jb2RlUGFydGlhbCwgZGVjb2RlUGFydGlhbCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGhhbmRsZXIuY2hpbGRyZW4gPSBwcm9wZXJ0aWVzO1xyXG4gICAgICAgIHJldHVybiBoYW5kbGVyO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEhhbmRsaW5nIG1hcHNcclxuXHJcbiAgICBmdW5jdGlvbiBjb21waWxlTWFwKHByb3BlcnRpZXMsIHNwbGl0Qml0cykge1xyXG4gICAgICAgIHZhciBsZW5ndGggPSBwcm9wZXJ0aWVzLmxlbmd0aDtcclxuICAgICAgICBpZiAobGVuZ3RoID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxyXG4gICAgICAgICAgICAgICAgJ01hcCB0eXBlIHJlcXVpcmVzIGFuIGFycmF5IG9mICcgK1xyXG4gICAgICAgICAgICAgICAgJ3trZXk6IFN0cmluZywgZWxlbWVudDogSGFuZGxlcn0gbWFwcycpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwcm9wZXJ0aWVzLmZvckVhY2goZnVuY3Rpb24ocHJvcGVydHkpIHtcclxuICAgICAgICAgICAgaWYgKHByb3BlcnR5LmtleSA9PT0gdW5kZWZpbmVkIHx8XHJcbiAgICAgICAgICAgICAgICAhKHByb3BlcnR5LmVsZW1lbnQgaW5zdGFuY2VvZiBIYW5kbGVyKSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxyXG4gICAgICAgICAgICAgICAgICAgICdNYXAgdHlwZSByZXF1aXJlcyBhbiBhcnJheSBvZiAnICtcclxuICAgICAgICAgICAgICAgICAgICAne2tleTogU3RyaW5nLCBlbGVtZW50OiBIYW5kbGVyfSBtYXBzJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBpZiAoc3BsaXRCaXRzICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgcHJvcGVydGllcy5mb3JFYWNoKGZ1bmN0aW9uKHByb3BlcnR5KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAocHJvcGVydHkucGFydCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnTWFwIHR5cGUgcmVxdWlyZXMgYW4gYXJyYXkgb2YgJyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICd7a2V5OiBTdHJpbmcsIGVsZW1lbnQ6IEhhbmRsZXIsIHBhcnQ6IE51bWJlcn0nICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJyBtYXBzIHdoZW4gc3BsaXQgYml0cyBhcmUgZGVmaW5lZCcpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZnVuY3Rpb24gZW5jb2RlKGRhdGFWaWV3LCBzZXJpYWxpemVyLCBkYXRhKSB7XHJcbiAgICAgICAgICAgIHByb3BlcnRpZXMuZm9yRWFjaChmdW5jdGlvbihwcm9wZXJ0eSkge1xyXG4gICAgICAgICAgICAgICAgcHJvcGVydHkuZWxlbWVudC5lbmNvZGUoXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YVZpZXcsIHNlcmlhbGl6ZXIsIGRhdGFbcHJvcGVydHkua2V5XSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmdW5jdGlvbiBkZWNvZGUoZGF0YVZpZXcsIHNlcmlhbGl6ZXIpIHtcclxuICAgICAgICAgICAgdmFyIGRhdGEgPSB7fTtcclxuICAgICAgICAgICAgcHJvcGVydGllcy5mb3JFYWNoKGZ1bmN0aW9uKHByb3BlcnR5KSB7XHJcbiAgICAgICAgICAgICAgICBkYXRhW3Byb3BlcnR5LmtleV0gPVxyXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnR5LmVsZW1lbnQuZGVjb2RlKGRhdGFWaWV3LCBzZXJpYWxpemVyKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiBkYXRhO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmdW5jdGlvbiBlbXB0eSgpIHtcclxuICAgICAgICAgICAgdmFyIGRhdGEgPSB7fTtcclxuICAgICAgICAgICAgcHJvcGVydGllcy5mb3JFYWNoKGZ1bmN0aW9uKHByb3BlcnR5KSB7XHJcbiAgICAgICAgICAgICAgICBkYXRhW3Byb3BlcnR5LmtleV0gPSBwcm9wZXJ0eS5lbGVtZW50LmVtcHR5KCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gZGF0YTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGhhbmRsZXI7XHJcbiAgICAgICAgaWYgKHNwbGl0Qml0cyAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHZhciBudW1iZXJFbmNvZGVyID0gY29tcGlsZU51bWJlcihzcGxpdEJpdHMpO1xyXG4gICAgICAgICAgICBmdW5jdGlvbiBlbmNvZGVQYXJ0aWFsU3BsaXQoZGF0YVZpZXcsIHNlcmlhbGl6ZXIsIGRhdGEsIG1hc2tzKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbWFzayA9IG1hc2tzLnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgbnVtYmVyRW5jb2Rlci5lbmNvZGUoZGF0YVZpZXcsIHNlcmlhbGl6ZXIsIG1hc2spO1xyXG4gICAgICAgICAgICAgICAgcHJvcGVydGllcy5mb3JFYWNoKGZ1bmN0aW9uKHByb3BlcnR5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1hc2sgJiAoMSA8PCBwcm9wZXJ0eS5wYXJ0KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eS5lbGVtZW50LmVuY29kZVBhcnRpYWwoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhVmlldywgc2VyaWFsaXplciwgZGF0YVtwcm9wZXJ0eS5rZXldLCBtYXNrcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZnVuY3Rpb24gZGVjb2RlUGFydGlhbFNwbGl0KGRhdGFWaWV3LCBzZXJpYWxpemVyLCBvcmlnaW5hbCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIG1hc2sgPSBudW1iZXJFbmNvZGVyLmRlY29kZShkYXRhVmlldywgc2VyaWFsaXplcik7XHJcbiAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IHt9O1xyXG4gICAgICAgICAgICAgICAgcHJvcGVydGllcy5mb3JFYWNoKGZ1bmN0aW9uKHByb3BlcnR5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1hc2sgJiAoMSA8PCBwcm9wZXJ0eS5wYXJ0KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhW3Byb3BlcnR5LmtleV0gPSBwcm9wZXJ0eS5lbGVtZW50LmRlY29kZVBhcnRpYWwoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhVmlldywgc2VyaWFsaXplciwgb3JpZ2luYWxbcHJvcGVydHkua2V5XSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVtwcm9wZXJ0eS5rZXldID0gb3JpZ2luYWxbcHJvcGVydHkua2V5XTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBkYXRhO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGJ5dGVjb3VudFNwbGl0KG1hc2tzKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbWFzaztcclxuICAgICAgICAgICAgICAgIHZhciBub21hc2sgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgaWYgKG1hc2tzICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBtYXNrID0gbWFza3MucG9wKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbm9tYXNrID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvcGVydGllcy5yZWR1Y2UoZnVuY3Rpb24oYWNjdW0sIHYpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIW5vbWFzayAmJiAoIShtYXNrICYgKDEgPDwgdi5wYXJ0KSkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhY2N1bTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFjY3VtICsgdi5lbGVtZW50LmJ5dGVjb3VudChtYXNrcyk7XHJcbiAgICAgICAgICAgICAgICB9LCBub21hc2sgPyAwIDogc3BsaXRCaXRzIC8gOCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaGFuZGxlciA9IG5ldyBIYW5kbGVyKFxyXG4gICAgICAgICAgICAgICAgYnl0ZWNvdW50U3BsaXQsIGVuY29kZSwgZGVjb2RlLCBlbXB0eSwgZW5jb2RlUGFydGlhbFNwbGl0LFxyXG4gICAgICAgICAgICAgICAgZGVjb2RlUGFydGlhbFNwbGl0KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBmdW5jdGlvbiBlbmNvZGVQYXJ0aWFsKGRhdGFWaWV3LCBzZXJpYWxpemVyLCBkYXRhLCBtYXNrcykge1xyXG4gICAgICAgICAgICAgICAgcHJvcGVydGllcy5mb3JFYWNoKGZ1bmN0aW9uKHByb3BlcnR5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydHkuZWxlbWVudC5lbmNvZGVQYXJ0aWFsKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhVmlldywgc2VyaWFsaXplciwgZGF0YVtwcm9wZXJ0eS5rZXldLCBtYXNrcyk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmdW5jdGlvbiBkZWNvZGVQYXJ0aWFsKGRhdGFWaWV3LCBzZXJpYWxpemVyLCBvcmlnaW5hbCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGRhdGEgPSB7fTtcclxuICAgICAgICAgICAgICAgIHByb3BlcnRpZXMuZm9yRWFjaChmdW5jdGlvbihwcm9wZXJ0eSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFbcHJvcGVydHkua2V5XSA9IHByb3BlcnR5LmVsZW1lbnQuZGVjb2RlUGFydGlhbChcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVZpZXcsIHNlcmlhbGl6ZXIsIG9yaWdpbmFsW3Byb3BlcnR5LmtleV0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZGF0YTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmdW5jdGlvbiBieXRlY291bnQobWFza3MpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBwcm9wZXJ0aWVzLnJlZHVjZShmdW5jdGlvbihhY2N1bSwgdikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhY2N1bSArIHYuZWxlbWVudC5ieXRlY291bnQobWFza3MpO1xyXG4gICAgICAgICAgICAgICAgfSwgMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaGFuZGxlciA9IG5ldyBIYW5kbGVyKFxyXG4gICAgICAgICAgICAgICAgYnl0ZWNvdW50LCBlbmNvZGUsIGRlY29kZSwgZW1wdHksIGVuY29kZVBhcnRpYWwsIGRlY29kZVBhcnRpYWwpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBoYW5kbGVyLmNoaWxkcmVuID0gcHJvcGVydGllcztcclxuICAgICAgICByZXR1cm4gaGFuZGxlcjtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBIYW5kbGVyKFxyXG4gICAgICAgIGJ5dGVjb3VudCwgZW5jb2RlLCBkZWNvZGUsIGVtcHR5LCBlbmNvZGVQYXJ0aWFsLCBkZWNvZGVQYXJ0aWFsKSB7XHJcbiAgICAgICAgZW5jb2RlUGFydGlhbCA9IGVuY29kZVBhcnRpYWwgfHwgZW5jb2RlO1xyXG4gICAgICAgIGRlY29kZVBhcnRpYWwgPSBkZWNvZGVQYXJ0aWFsIHx8IGRlY29kZTtcclxuICAgICAgICB0aGlzLmJ5dGVjb3VudCA9IGJ5dGVjb3VudDtcclxuICAgICAgICB0aGlzLmVuY29kZSA9IGVuY29kZTtcclxuICAgICAgICB0aGlzLmRlY29kZSA9IGRlY29kZTtcclxuICAgICAgICB0aGlzLmVuY29kZVBhcnRpYWwgPSBlbmNvZGVQYXJ0aWFsO1xyXG4gICAgICAgIHRoaXMuZGVjb2RlUGFydGlhbCA9IGRlY29kZVBhcnRpYWw7XHJcbiAgICAgICAgdGhpcy5lbXB0eSA9IGVtcHR5O1xyXG4gICAgfVxyXG59KCkpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ2ZseWJyaXhDb21tb24nKS5mYWN0b3J5KCdmaXJtd2FyZVZlcnNpb24nLCBmaXJtd2FyZVZlcnNpb24pO1xyXG5cclxuICAgIGZpcm13YXJlVmVyc2lvbi4kaW5qZWN0ID0gWydjb25maWdIYW5kbGVyJywgJ3NlcmlhbGl6YXRpb25IYW5kbGVyJ107XHJcblxyXG4gICAgZnVuY3Rpb24gZmlybXdhcmVWZXJzaW9uKGNvbmZpZ0hhbmRsZXIsIHNlcmlhbGl6YXRpb25IYW5kbGVyKSB7XHJcbiAgICAgICAgdmFyIHZlcnNpb24gPSBbMCwgMCwgMF07XHJcbiAgICAgICAgdmFyIGtleSA9ICcwLjAuMCc7XHJcbiAgICAgICAgdmFyIHN1cHBvcnRlZCA9IHtcclxuICAgICAgICAgICAgJzEuNC4wJzogdHJ1ZSxcclxuICAgICAgICAgICAgJzEuNS4wJzogdHJ1ZSxcclxuICAgICAgICAgICAgJzEuNi4wJzogdHJ1ZSxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgZGVzaXJlZCA9IFsxLCA2LCAwXTtcclxuICAgICAgICB2YXIgZGVzaXJlZEtleSA9ICcxLjYuMCc7XHJcblxyXG4gICAgICAgIHZhciBkZWZhdWx0Q29uZmlnSGFuZGxlciA9IGNvbmZpZ0hhbmRsZXJbZGVzaXJlZEtleV07XHJcbiAgICAgICAgdmFyIGN1cnJlbnRDb25maWdIYW5kbGVyID0gZGVmYXVsdENvbmZpZ0hhbmRsZXI7XHJcbiAgICAgICAgdmFyIGRlZmF1bHRTZXJpYWxpemF0aW9uSGFuZGxlciA9IHNlcmlhbGl6YXRpb25IYW5kbGVyLmdldEhhbmRsZXIoZGVzaXJlZEtleSk7XHJcbiAgICAgICAgdmFyIGN1cnJlbnRTZXJpYWxpemF0aW9uSGFuZGxlciA9IGRlZmF1bHRTZXJpYWxpemF0aW9uSGFuZGxlcjtcclxuXHJcbiAgICAgICAgdmFyIGZpZWxkVmVyc2lvbk1hc2tzID0ge1xyXG4gICAgICAgICAgICAnMS40LjAnOiAweDdGRkZGRkYsXHJcbiAgICAgICAgICAgICcxLjUuMCc6IDB4N0ZGRkZGRixcclxuICAgICAgICAgICAgJzEuNi4wJzogMHg3RkZGRkZGLFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdmFyIHN0YXRlTWFzayA9IDB4RkZGRkZGRkY7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24odmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIHZlcnNpb24gPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIGtleSA9IHZhbHVlLmpvaW4oJy4nKTtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRDb25maWdIYW5kbGVyID1cclxuICAgICAgICAgICAgICAgICAgICBjb25maWdIYW5kbGVyW2tleV0gfHwgZGVmYXVsdENvbmZpZ0hhbmRsZXI7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50U2VyaWFsaXphdGlvbkhhbmRsZXIgPVxyXG4gICAgICAgICAgICAgICAgICAgIHNlcmlhbGl6YXRpb25IYW5kbGVyLmdldEhhbmRsZXIoZGVzaXJlZEtleSkgfHwgZGVmYXVsdFNlcmlhbGl6YXRpb25IYW5kbGVyO1xyXG4gICAgICAgICAgICAgICAgc3RhdGVNYXNrID0gZmllbGRWZXJzaW9uTWFza3Nba2V5XSB8fCAweEZGRkZGRkZGO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZlcnNpb247XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGtleTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4ga2V5O1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzdXBwb3J0ZWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHN1cHBvcnRlZFtrZXldID09PSB0cnVlO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBkZXNpcmVkOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBkZXNpcmVkO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBkZXNpcmVkS2V5OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBkZXNpcmVkS2V5O1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBjb25maWdIYW5kbGVyOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBjdXJyZW50Q29uZmlnSGFuZGxlcjtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc2VyaWFsaXphdGlvbkhhbmRsZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnRTZXJpYWxpemF0aW9uSGFuZGxlcjtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc3RhdGVNYXNrOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBzdGF0ZU1hc2s7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxufSgpKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdmbHlicml4Q29tbW9uJykuZmFjdG9yeSgnbGVkJywgbGVkKTtcclxuXHJcbiAgICBsZWQuJGluamVjdCA9IFsnZGV2aWNlQ29uZmlnJ107XHJcblxyXG4gICAgZnVuY3Rpb24gbGVkKGRldmljZUNvbmZpZykge1xyXG4gICAgICAgIHZhciBMZWRQYXR0ZXJucyA9IHtcclxuICAgICAgICAgICAgTk9fT1ZFUlJJREU6IDAsXHJcbiAgICAgICAgICAgIEZMQVNIOiAxLFxyXG4gICAgICAgICAgICBCRUFDT046IDIsXHJcbiAgICAgICAgICAgIEJSRUFUSEU6IDMsXHJcbiAgICAgICAgICAgIEFMVEVSTkFURTogNCxcclxuICAgICAgICAgICAgU09MSUQ6IDUsXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdmFyIGtleXMgPSBbJ3JpZ2h0X2Zyb250JywgJ3JpZ2h0X2JhY2snLCAnbGVmdF9mcm9udCcsICdsZWZ0X2JhY2snXTtcclxuICAgICAgICB2YXIgY29sb3JzID0ge307XHJcblxyXG4gICAgICAgIGtleXMuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcclxuICAgICAgICAgICAgY29sb3JzW2tleV0gPSB7XHJcbiAgICAgICAgICAgICAgICByZWQ6IDAsXHJcbiAgICAgICAgICAgICAgICBncmVlbjogMCxcclxuICAgICAgICAgICAgICAgIGJsdWU6IDAsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdmFyIGxlZFN0YXRlID0ge1xyXG4gICAgICAgICAgICBzdGF0dXM6IDY1NTM1LFxyXG4gICAgICAgICAgICBwYXR0ZXJuOiBMZWRQYXR0ZXJucy5TT0xJRCxcclxuICAgICAgICAgICAgY29sb3JzOiBjb2xvcnMsXHJcbiAgICAgICAgICAgIGluZGljYXRvcl9yZWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICBpbmRpY2F0b3JfZ3JlZW46IGZhbHNlLFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIGNvbmZpZ1BhcnQgPSB7bGVkU3RhdGVzOiBbbGVkU3RhdGVdfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2V0KFxyXG4gICAgICAgICAgICBjb2xvcl9yZiwgY29sb3JfcmIsIGNvbG9yX2xmLCBjb2xvcl9sYiwgcGF0dGVybiwgcmVkLCBncmVlbikge1xyXG4gICAgICAgICAgICBpZiAocGF0dGVybiA+IDAgJiYgcGF0dGVybiA8IDYpIHtcclxuICAgICAgICAgICAgICAgIGxlZFN0YXRlLnBhdHRlcm4gPSBwYXR0ZXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFtjb2xvcl9yZiwgY29sb3JfcmIsIGNvbG9yX2xmLCBjb2xvcl9sYl0uZm9yRWFjaChmdW5jdGlvbihcclxuICAgICAgICAgICAgICAgIGNvbG9yLCBpZHgpIHtcclxuICAgICAgICAgICAgICAgIGlmICghY29sb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB2YXIgdiA9IGNvbG9yc1trZXlzW2lkeF1dO1xyXG4gICAgICAgICAgICAgICAgdi5yZWQgPSBjb2xvci5yZWQ7XHJcbiAgICAgICAgICAgICAgICB2LmdyZWVuID0gY29sb3IuZ3JlZW47XHJcbiAgICAgICAgICAgICAgICB2LmJsdWUgPSBjb2xvci5ibHVlO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgaWYgKHJlZCAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICBsZWRTdGF0ZS5pbmRpY2F0b3JfcmVkID0gcmVkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChncmVlbiAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICBsZWRTdGF0ZS5pbmRpY2F0b3JfZ3JlZW4gPSBncmVlbjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgYXBwbHkoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNldFNpbXBsZShyZWQsIGdyZWVuLCBibHVlKSB7XHJcbiAgICAgICAgICAgIHZhciBjb2xvciA9IHtyZWQ6IHJlZCB8fCAwLCBncmVlbjogZ3JlZW4gfHwgMCwgYmx1ZTogYmx1ZSB8fCAwfTtcclxuICAgICAgICAgICAgc2V0KGNvbG9yLCBjb2xvciwgY29sb3IsIGNvbG9yLCBMZWRQYXR0ZXJucy5TT0xJRCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBhcHBseSgpIHtcclxuICAgICAgICAgICAgZGV2aWNlQ29uZmlnLnNlbmRQYXJ0aWFsKFxyXG4gICAgICAgICAgICAgICAgZGV2aWNlQ29uZmlnLmZpZWxkLkxFRF9TVEFURVMsICAvLyBTZXQgTEVEIHN0YXRlIHBhcnRcclxuICAgICAgICAgICAgICAgIDEsICAgICAgICAgICAvLyBtb3JlIHNwZWNpZmljYWxseSwgdGhlIGZpcnN0IHN0YXRlIDJeMCA9IDFcclxuICAgICAgICAgICAgICAgIGNvbmZpZ1BhcnQsICAvLyB0byBvdXIgcGFydGlhbCBjb25maWd1cmF0aW9uXHJcbiAgICAgICAgICAgICAgICB0cnVlICAvLyBhbmQgc2V0IHRoZSBcInRlbXBvcmFyeVwiIGZsYWcsIG5vdCBjaGFuZ2luZyBFRVBST01cclxuICAgICAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBzZXQ6IHNldCxcclxuICAgICAgICAgICAgc2V0U2ltcGxlOiBzZXRTaW1wbGUsXHJcbiAgICAgICAgICAgIHBhdHRlcm5zOiBMZWRQYXR0ZXJucyxcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxufSgpKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdmbHlicml4Q29tbW9uJykuZmFjdG9yeSgncGFyc2VyJywgcGFyc2VyKTtcclxuXHJcbiAgICBwYXJzZXIuJGluamVjdCA9IFsnY29tbWFuZExvZycsICdlbmNvZGFibGUnLCAnZmlybXdhcmVWZXJzaW9uJ107XHJcblxyXG4gICAgZnVuY3Rpb24gcGFyc2VyKGNvbW1hbmRMb2csIGVuY29kYWJsZSwgZmlybXdhcmVWZXJzaW9uKSB7XHJcbiAgICAgICAgdmFyIE1lc3NhZ2VUeXBlID0ge1xyXG4gICAgICAgICAgICBTdGF0ZTogMCxcclxuICAgICAgICAgICAgQ29tbWFuZDogMSxcclxuICAgICAgICAgICAgRGVidWdTdHJpbmc6IDMsXHJcbiAgICAgICAgICAgIEhpc3RvcnlEYXRhOiA0LFxyXG4gICAgICAgICAgICBSZXNwb25zZTogMjU1LFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHZhciBDb21tYW5kRmllbGRzID0ge1xyXG4gICAgICAgICAgICBDT01fUkVRX1JFU1BPTlNFOiAxIDw8IDAsXHJcbiAgICAgICAgICAgIENPTV9TRVRfRUVQUk9NX0RBVEE6IDEgPDwgMSxcclxuICAgICAgICAgICAgQ09NX1JFSU5JVF9FRVBST01fREFUQTogMSA8PCAyLFxyXG4gICAgICAgICAgICBDT01fUkVRX0VFUFJPTV9EQVRBOiAxIDw8IDMsXHJcbiAgICAgICAgICAgIENPTV9SRVFfRU5BQkxFX0lURVJBVElPTjogMSA8PCA0LFxyXG4gICAgICAgICAgICBDT01fTU9UT1JfT1ZFUlJJREVfU1BFRURfMDogMSA8PCA1LFxyXG4gICAgICAgICAgICBDT01fTU9UT1JfT1ZFUlJJREVfU1BFRURfMTogMSA8PCA2LFxyXG4gICAgICAgICAgICBDT01fTU9UT1JfT1ZFUlJJREVfU1BFRURfMjogMSA8PCA3LFxyXG4gICAgICAgICAgICBDT01fTU9UT1JfT1ZFUlJJREVfU1BFRURfMzogMSA8PCA4LFxyXG4gICAgICAgICAgICBDT01fTU9UT1JfT1ZFUlJJREVfU1BFRURfNDogMSA8PCA5LFxyXG4gICAgICAgICAgICBDT01fTU9UT1JfT1ZFUlJJREVfU1BFRURfNTogMSA8PCAxMCxcclxuICAgICAgICAgICAgQ09NX01PVE9SX09WRVJSSURFX1NQRUVEXzY6IDEgPDwgMTEsXHJcbiAgICAgICAgICAgIENPTV9NT1RPUl9PVkVSUklERV9TUEVFRF83OiAxIDw8IDEyLFxyXG4gICAgICAgICAgICBDT01fTU9UT1JfT1ZFUlJJREVfU1BFRURfQUxMOiAoMSA8PCA1KSB8ICgxIDw8IDYpIHwgKDEgPDwgNykgfFxyXG4gICAgICAgICAgICAgICAgKDEgPDwgOCkgfCAoMSA8PCA5KSB8ICgxIDw8IDEwKSB8ICgxIDw8IDExKSB8ICgxIDw8IDEyKSxcclxuICAgICAgICAgICAgQ09NX1NFVF9DT01NQU5EX09WRVJSSURFOiAxIDw8IDEzLFxyXG4gICAgICAgICAgICBDT01fU0VUX1NUQVRFX01BU0s6IDEgPDwgMTQsXHJcbiAgICAgICAgICAgIENPTV9TRVRfU1RBVEVfREVMQVk6IDEgPDwgMTUsXHJcbiAgICAgICAgICAgIENPTV9TRVRfU0RfV1JJVEVfREVMQVk6IDEgPDwgMTYsXHJcbiAgICAgICAgICAgIENPTV9TRVRfTEVEOiAxIDw8IDE3LFxyXG4gICAgICAgICAgICBDT01fU0VUX1NFUklBTF9SQzogMSA8PCAxOCxcclxuICAgICAgICAgICAgQ09NX1NFVF9DQVJEX1JFQ09SRElORzogMSA8PCAxOSxcclxuICAgICAgICAgICAgQ09NX1NFVF9QQVJUSUFMX0VFUFJPTV9EQVRBOiAxIDw8IDIwLFxyXG4gICAgICAgICAgICBDT01fUkVJTklUX1BBUlRJQUxfRUVQUk9NX0RBVEE6IDEgPDwgMjEsXHJcbiAgICAgICAgICAgIENPTV9SRVFfUEFSVElBTF9FRVBST01fREFUQTogMSA8PCAyMixcclxuICAgICAgICAgICAgQ09NX1JFUV9DQVJEX1JFQ09SRElOR19TVEFURTogMSA8PCAyMyxcclxuICAgICAgICAgICAgQ09NX1NFVF9QQVJUSUFMX1RFTVBPUkFSWV9DT05GSUc6IDEgPDwgMjQsXHJcbiAgICAgICAgICAgIENPTV9TRVRfQ09NTUFORF9TT1VSQ0VTOiAxIDw8IDI1LFxyXG4gICAgICAgICAgICBDT01fU0VUX0NBTElCUkFUSU9OOiAxIDw8IDI2LFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHZhciBTdGF0ZUZpZWxkcyA9IHtcclxuICAgICAgICAgICAgU1RBVEVfQUxMOiAweEZGRkZGRkZGLFxyXG4gICAgICAgICAgICBTVEFURV9OT05FOiAwLFxyXG4gICAgICAgICAgICBTVEFURV9NSUNST1M6IDEgPDwgMCxcclxuICAgICAgICAgICAgU1RBVEVfU1RBVFVTOiAxIDw8IDEsXHJcbiAgICAgICAgICAgIFNUQVRFX1YwOiAxIDw8IDIsXHJcbiAgICAgICAgICAgIFNUQVRFX0kwOiAxIDw8IDMsXHJcbiAgICAgICAgICAgIFNUQVRFX0kxOiAxIDw8IDQsXHJcbiAgICAgICAgICAgIFNUQVRFX0FDQ0VMOiAxIDw8IDUsXHJcbiAgICAgICAgICAgIFNUQVRFX0dZUk86IDEgPDwgNixcclxuICAgICAgICAgICAgU1RBVEVfTUFHOiAxIDw8IDcsXHJcbiAgICAgICAgICAgIFNUQVRFX1RFTVBFUkFUVVJFOiAxIDw8IDgsXHJcbiAgICAgICAgICAgIFNUQVRFX1BSRVNTVVJFOiAxIDw8IDksXHJcbiAgICAgICAgICAgIFNUQVRFX1JYX1BQTTogMSA8PCAxMCxcclxuICAgICAgICAgICAgU1RBVEVfQVVYX0NIQU5fTUFTSzogMSA8PCAxMSxcclxuICAgICAgICAgICAgU1RBVEVfQ09NTUFORFM6IDEgPDwgMTIsXHJcbiAgICAgICAgICAgIFNUQVRFX0ZfQU5EX1Q6IDEgPDwgMTMsXHJcbiAgICAgICAgICAgIFNUQVRFX1BJRF9GWl9NQVNURVI6IDEgPDwgMTQsXHJcbiAgICAgICAgICAgIFNUQVRFX1BJRF9UWF9NQVNURVI6IDEgPDwgMTUsXHJcbiAgICAgICAgICAgIFNUQVRFX1BJRF9UWV9NQVNURVI6IDEgPDwgMTYsXHJcbiAgICAgICAgICAgIFNUQVRFX1BJRF9UWl9NQVNURVI6IDEgPDwgMTcsXHJcbiAgICAgICAgICAgIFNUQVRFX1BJRF9GWl9TTEFWRTogMSA8PCAxOCxcclxuICAgICAgICAgICAgU1RBVEVfUElEX1RYX1NMQVZFOiAxIDw8IDE5LFxyXG4gICAgICAgICAgICBTVEFURV9QSURfVFlfU0xBVkU6IDEgPDwgMjAsXHJcbiAgICAgICAgICAgIFNUQVRFX1BJRF9UWl9TTEFWRTogMSA8PCAyMSxcclxuICAgICAgICAgICAgU1RBVEVfTU9UT1JfT1VUOiAxIDw8IDIyLFxyXG4gICAgICAgICAgICBTVEFURV9LSU5FX0FOR0xFOiAxIDw8IDIzLFxyXG4gICAgICAgICAgICBTVEFURV9LSU5FX1JBVEU6IDEgPDwgMjQsXHJcbiAgICAgICAgICAgIFNUQVRFX0tJTkVfQUxUSVRVREU6IDEgPDwgMjUsXHJcbiAgICAgICAgICAgIFNUQVRFX0xPT1BfQ09VTlQ6IDEgPDwgMjYsXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdmFyIFN0YXR1c0NvZGVzID0ge1xyXG4gICAgICAgICAgICBTVEFUVVNfQk9PVDogMHgwMDAxLFxyXG4gICAgICAgICAgICBTVEFUVVNfTVBVX0ZBSUw6IDB4MDAwMixcclxuICAgICAgICAgICAgU1RBVFVTX0JNUF9GQUlMOiAweDAwMDQsXHJcbiAgICAgICAgICAgIFNUQVRVU19SWF9GQUlMOiAweDAwMDgsXHJcblxyXG4gICAgICAgICAgICBTVEFUVVNfSURMRTogMHgwMDEwLFxyXG5cclxuICAgICAgICAgICAgU1RBVFVTX0VOQUJMSU5HOiAweDAwMjAsXHJcbiAgICAgICAgICAgIFNUQVRVU19DTEVBUl9NUFVfQklBUzogMHgwMDQwLFxyXG4gICAgICAgICAgICBTVEFUVVNfU0VUX01QVV9CSUFTOiAweDAwODAsXHJcblxyXG4gICAgICAgICAgICBTVEFUVVNfRkFJTF9TVEFCSUxJVFk6IDB4MDEwMCxcclxuICAgICAgICAgICAgU1RBVFVTX0ZBSUxfQU5HTEU6IDB4MDIwMCxcclxuICAgICAgICAgICAgU1RBVFVTX0ZBSUxfT1RIRVI6IDB4NDAwMCxcclxuXHJcbiAgICAgICAgICAgIFNUQVRVU19FTkFCTEVEOiAweDA0MDAsXHJcbiAgICAgICAgICAgIFNUQVRVU19CQVRURVJZX0xPVzogMHgwODAwLFxyXG5cclxuICAgICAgICAgICAgU1RBVFVTX1RFTVBfV0FSTklORzogMHgxMDAwLFxyXG4gICAgICAgICAgICBTVEFUVVNfTE9HX0ZVTEw6IDB4MjAwMCxcclxuICAgICAgICAgICAgU1RBVFVTX09WRVJSSURFOiAweDgwMDAsXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdmFyIGxhc3RfdGltZXN0YW1wX3VzID0gMDtcclxuXHJcbiAgICAgICAgdmFyIHN0YXRlSGFuZGxlciA9IChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdmFyIGUgPSBlbmNvZGFibGU7XHJcbiAgICAgICAgICAgIHZhciBwaWRIYW5kbGVyID0gZS5wb2x5YXJyYXkoW1xyXG4gICAgICAgICAgICAgICAgZS5VaW50MzIsIGUuRmxvYXQzMiwgZS5GbG9hdDMyLCBlLkZsb2F0MzIsIGUuRmxvYXQzMiwgZS5GbG9hdDMyXHJcbiAgICAgICAgICAgIF0pO1xyXG4gICAgICAgICAgICByZXR1cm4gZS5tYXAoW1xyXG4gICAgICAgICAgICAgICAge2tleTogJ3RpbWVzdGFtcF91cycsIGVsZW1lbnQ6IGUuVWludDMyfSxcclxuICAgICAgICAgICAgICAgIHtrZXk6ICdzdGF0dXMnLCBlbGVtZW50OiBlLlVpbnQxNn0sXHJcbiAgICAgICAgICAgICAgICB7a2V5OiAnVjBfcmF3JywgZWxlbWVudDogZS5VaW50MTZ9LFxyXG4gICAgICAgICAgICAgICAge2tleTogJ0kwX3JhdycsIGVsZW1lbnQ6IGUuVWludDE2fSxcclxuICAgICAgICAgICAgICAgIHtrZXk6ICdJMV9yYXcnLCBlbGVtZW50OiBlLlVpbnQxNn0sXHJcbiAgICAgICAgICAgICAgICB7a2V5OiAnYWNjZWwnLCBlbGVtZW50OiBlLmFycmF5KDMsIGUuRmxvYXQzMil9LFxyXG4gICAgICAgICAgICAgICAge2tleTogJ2d5cm8nLCBlbGVtZW50OiBlLmFycmF5KDMsIGUuRmxvYXQzMil9LFxyXG4gICAgICAgICAgICAgICAge2tleTogJ21hZycsIGVsZW1lbnQ6IGUuYXJyYXkoMywgZS5GbG9hdDMyKX0sXHJcbiAgICAgICAgICAgICAgICB7a2V5OiAndGVtcGVyYXR1cmUnLCBlbGVtZW50OiBlLlVpbnQxNn0sXHJcbiAgICAgICAgICAgICAgICB7a2V5OiAncHJlc3N1cmUnLCBlbGVtZW50OiBlLlVpbnQzMn0sXHJcbiAgICAgICAgICAgICAgICB7a2V5OiAncHBtJywgZWxlbWVudDogZS5hcnJheSg2LCBlLkludDE2KX0sXHJcbiAgICAgICAgICAgICAgICB7a2V5OiAnQVVYX2NoYW5fbWFzaycsIGVsZW1lbnQ6IGUuVWludDh9LFxyXG4gICAgICAgICAgICAgICAgLy8gdGhyb3R0bGUsIHBpdGNoLCByb2xsLCB5YXdcclxuICAgICAgICAgICAgICAgIHtrZXk6ICdjb21tYW5kJywgZWxlbWVudDogZS5hcnJheSg0LCBlLkludDE2KX0sXHJcbiAgICAgICAgICAgICAgICAvLyBGeiwgVHgsIFR5LCBUelxyXG4gICAgICAgICAgICAgICAge2tleTogJ2NvbnRyb2wnLCBlbGVtZW50OiBlLmFycmF5KDQsIGUuRmxvYXQzMil9LFxyXG4gICAgICAgICAgICAgICAgLy8gdGltZSwgaW5wdXQsIHNldHBvaW50LCBwX3Rlcm0sIGlfdGVybSwgZF90ZXJtXHJcbiAgICAgICAgICAgICAgICB7a2V5OiAncGlkX21hc3Rlcl9GeicsIGVsZW1lbnQ6IHBpZEhhbmRsZXJ9LFxyXG4gICAgICAgICAgICAgICAge2tleTogJ3BpZF9tYXN0ZXJfVHgnLCBlbGVtZW50OiBwaWRIYW5kbGVyfSxcclxuICAgICAgICAgICAgICAgIHtrZXk6ICdwaWRfbWFzdGVyX1R5JywgZWxlbWVudDogcGlkSGFuZGxlcn0sXHJcbiAgICAgICAgICAgICAgICB7a2V5OiAncGlkX21hc3Rlcl9UeicsIGVsZW1lbnQ6IHBpZEhhbmRsZXJ9LFxyXG4gICAgICAgICAgICAgICAge2tleTogJ3BpZF9zbGF2ZV9GeicsIGVsZW1lbnQ6IHBpZEhhbmRsZXJ9LFxyXG4gICAgICAgICAgICAgICAge2tleTogJ3BpZF9zbGF2ZV9UeCcsIGVsZW1lbnQ6IHBpZEhhbmRsZXJ9LFxyXG4gICAgICAgICAgICAgICAge2tleTogJ3BpZF9zbGF2ZV9UeScsIGVsZW1lbnQ6IHBpZEhhbmRsZXJ9LFxyXG4gICAgICAgICAgICAgICAge2tleTogJ3BpZF9zbGF2ZV9UeicsIGVsZW1lbnQ6IHBpZEhhbmRsZXJ9LFxyXG4gICAgICAgICAgICAgICAge2tleTogJ01vdG9yT3V0JywgZWxlbWVudDogZS5hcnJheSg4LCBlLkludDE2KX0sXHJcbiAgICAgICAgICAgICAgICB7a2V5OiAna2luZW1hdGljc0FuZ2xlJywgZWxlbWVudDogZS5hcnJheSgzLCBlLkZsb2F0MzIpfSxcclxuICAgICAgICAgICAgICAgIHtrZXk6ICdraW5lbWF0aWNzUmF0ZScsIGVsZW1lbnQ6IGUuYXJyYXkoMywgZS5GbG9hdDMyKX0sXHJcbiAgICAgICAgICAgICAgICB7a2V5OiAna2luZW1hdGljc0FsdGl0dWRlJywgZWxlbWVudDogZS5GbG9hdDMyfSxcclxuICAgICAgICAgICAgICAgIHtrZXk6ICdsb29wQ291bnQnLCBlbGVtZW50OiBlLlVpbnQzMn0sXHJcbiAgICAgICAgICAgIF0pO1xyXG4gICAgICAgIH0oKSk7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHByb2Nlc3NCaW5hcnlEYXRhc3RyZWFtKFxyXG4gICAgICAgICAgICBjb21tYW5kLCBtYXNrLCBtZXNzYWdlX2J1ZmZlciwgY2Jfc3RhdGUsIGNiX2NvbW1hbmQsIGNiX2RlYnVnLCBjYl9oaXN0b3J5LCBjYl9hY2spIHtcclxuICAgICAgICAgICAgZGlzcGF0Y2goY29tbWFuZCwgbWFzaywgbWVzc2FnZV9idWZmZXIsIFxyXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24oKSB7Y2FsbGJhY2tTdGF0ZUhlbHBlcihtYXNrLCBtZXNzYWdlX2J1ZmZlciwgY2Jfc3RhdGUpfSxcclxuICAgICAgICAgICAgICAgIGNiX2NvbW1hbmQsIGNiX2RlYnVnLCBjYl9oaXN0b3J5LCBjYl9hY2spO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZGlzcGF0Y2goXHJcbiAgICAgICAgICAgIGNvbW1hbmQsIG1hc2ssIG1lc3NhZ2VfYnVmZmVyLCBjYl9zdGF0ZSwgY2JfY29tbWFuZCwgY2JfZGVidWcsIGNiX2hpc3RvcnksIGNiX2Fjaykge1xyXG4gICAgICAgICAgICBzd2l0Y2ggKGNvbW1hbmQpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgTWVzc2FnZVR5cGUuU3RhdGU6XHJcbiAgICAgICAgICAgICAgICAgICAgY2Jfc3RhdGUobWFzaywgbWVzc2FnZV9idWZmZXIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBNZXNzYWdlVHlwZS5Db21tYW5kOlxyXG4gICAgICAgICAgICAgICAgICAgIGNiX2NvbW1hbmQobWFzaywgbWVzc2FnZV9idWZmZXIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBNZXNzYWdlVHlwZS5EZWJ1Z1N0cmluZzpcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZGVidWdfc3RyaW5nID0gYXJyYXlidWZmZXIyc3RyaW5nKG1lc3NhZ2VfYnVmZmVyKTtcclxuICAgICAgICAgICAgICAgICAgICBjYl9kZWJ1ZyhkZWJ1Z19zdHJpbmcpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBNZXNzYWdlVHlwZS5IaXN0b3J5RGF0YTpcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZGVidWdfc3RyaW5nID0gYXJyYXlidWZmZXIyc3RyaW5nKG1lc3NhZ2VfYnVmZmVyKTtcclxuICAgICAgICAgICAgICAgICAgICBjYl9oaXN0b3J5KGRlYnVnX3N0cmluZyk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIE1lc3NhZ2VUeXBlLlJlc3BvbnNlOlxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBkYXRhID0gbmV3IERhdGFWaWV3KG1lc3NhZ2VfYnVmZmVyLCAwKTtcclxuICAgICAgICAgICAgICAgICAgICBjYl9hY2sobWFzaywgZGF0YS5nZXRJbnQzMigwLCAxKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBhcnJheWJ1ZmZlcjJzdHJpbmcoYnVmKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsIG5ldyBVaW50OEFycmF5KGJ1ZikpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gY2FsbGJhY2tTdGF0ZUhlbHBlcihtYXNrLCBtZXNzYWdlX2J1ZmZlciwgY2Jfc3RhdGUpIHtcclxuICAgICAgICAgICAgdmFyIHN0YXRlID0gc3RhdGVIYW5kbGVyLmVtcHR5KCk7XHJcbiAgICAgICAgICAgIHZhciBzdGF0ZV9kYXRhX21hc2sgPSBbXTsgIC8vIFRPRE86IGdldCByaWQgb2YgdGhpcyBpbiBnZW5lcmFsXHJcbiAgICAgICAgICAgIHZhciBkYXRhID0gbmV3IERhdGFWaWV3KG1lc3NhZ2VfYnVmZmVyLCAwKTtcclxuICAgICAgICAgICAgdmFyIGIgPSBuZXcgZW5jb2RhYmxlLlNlcmlhbGl6ZXIoKTtcclxuICAgICAgICAgICAgdmFyIHNlcmlhbF91cGRhdGVfcmF0ZV9IeiA9IDA7XHJcblxyXG4gICAgICAgICAgICBtYXNrICY9IGZpcm13YXJlVmVyc2lvbi5zdGF0ZU1hc2soKTtcclxuXHJcbiAgICAgICAgICAgIHN0YXRlSGFuZGxlci5jaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uKGNoaWxkLCBpZHgpIHtcclxuICAgICAgICAgICAgICAgIHZhciBzdWJtYXNrID0gKDEgPDwgaWR4KTtcclxuICAgICAgICAgICAgICAgIGlmICghKG1hc2sgJiBzdWJtYXNrKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHN0YXRlX2RhdGFfbWFza1tpZHhdID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHZhciBoYW5kbGVyID0gY2hpbGQuZWxlbWVudDtcclxuICAgICAgICAgICAgICAgIHZhciBrZXkgPSBjaGlsZC5rZXk7XHJcbiAgICAgICAgICAgICAgICBzdGF0ZVtrZXldID0gaGFuZGxlci5kZWNvZGUoZGF0YSwgYik7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgaWYgKG1hc2sgJiBTdGF0ZUZpZWxkcy5TVEFURV9NSUNST1MpIHtcclxuICAgICAgICAgICAgICAgIHNlcmlhbF91cGRhdGVfcmF0ZV9IeiA9XHJcbiAgICAgICAgICAgICAgICAgICAgMTAwMDAwMCAvIChzdGF0ZS50aW1lc3RhbXBfdXMgLSBsYXN0X3RpbWVzdGFtcF91cyk7XHJcbiAgICAgICAgICAgICAgICBsYXN0X3RpbWVzdGFtcF91cyA9IHN0YXRlLnRpbWVzdGFtcF91cztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAobWFzayAmIFN0YXRlRmllbGRzLlNUQVRFX1RFTVBFUkFUVVJFKSB7XHJcbiAgICAgICAgICAgICAgICBzdGF0ZS50ZW1wZXJhdHVyZSAvPSAxMDAuMDsgIC8vIHRlbXBlcmF0dXJlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG1hc2sgJiBTdGF0ZUZpZWxkcy5TVEFURV9QUkVTU1VSRSkge1xyXG4gICAgICAgICAgICAgICAgc3RhdGUucHJlc3N1cmUgLz0gMjU2LjA7ICAvLyBwcmVzc3VyZSAoUTI0LjgpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2Jfc3RhdGUoc3RhdGUsIHN0YXRlX2RhdGFfbWFzaywgc2VyaWFsX3VwZGF0ZV9yYXRlX0h6KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHByb2Nlc3NCaW5hcnlEYXRhc3RyZWFtOiBwcm9jZXNzQmluYXJ5RGF0YXN0cmVhbSxcclxuICAgICAgICAgICAgTWVzc2FnZVR5cGU6IE1lc3NhZ2VUeXBlLFxyXG4gICAgICAgICAgICBDb21tYW5kRmllbGRzOiBDb21tYW5kRmllbGRzLFxyXG4gICAgICAgICAgICBTdGF0dXNDb2RlczogU3RhdHVzQ29kZXMsXHJcbiAgICAgICAgICAgIFN0YXRlRmllbGRzOiBTdGF0ZUZpZWxkcyxcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59KCkpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ2ZseWJyaXhDb21tb24nKS5mYWN0b3J5KCdwcmVzZXRzJywgcHJlc2V0cyk7XHJcblxyXG4gICAgcHJlc2V0cy4kaW5qZWN0ID0gWydmaXJtd2FyZVZlcnNpb24nLCAncGFyc2VyJ107XHJcblxyXG4gICAgZnVuY3Rpb24gcHJlc2V0cyhmaXJtd2FyZVZlcnNpb24sIHBhcnNlcikge1xyXG4gICAgICAgIHZhciBMZWRQYXR0ZXJucyA9IHtcclxuICAgICAgICAgICAgTk9fT1ZFUlJJREU6IDAsXHJcbiAgICAgICAgICAgIEZMQVNIOiAxLFxyXG4gICAgICAgICAgICBCRUFDT046IDIsXHJcbiAgICAgICAgICAgIEJSRUFUSEU6IDMsXHJcbiAgICAgICAgICAgIEFMVEVSTkFURTogNCxcclxuICAgICAgICAgICAgU09MSUQ6IDUsXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdmFyIENvbG9yID0ge1xyXG4gICAgICAgICAgICBCbGFjazogMHgwMDAwMDAsXHJcbiAgICAgICAgICAgIFJlZDogMHhmZjAwMDAsXHJcbiAgICAgICAgICAgIEdyZWVuOiAweDAwODAwMCxcclxuICAgICAgICAgICAgT3JhbmdlOiAweGZmYTUwMCxcclxuICAgICAgICAgICAgQmx1ZTogMHgwMDAwZmYsXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gdG9SZ2IoY29sb3IpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHJlZDogKGNvbG9yID4+IDE2KSAmIDB4ZmYsXHJcbiAgICAgICAgICAgICAgICBncmVlbjogKGNvbG9yID4+IDgpICYgMHhmZixcclxuICAgICAgICAgICAgICAgIGJsdWU6IGNvbG9yICYgMHhmZixcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIG1ha2VMZWRDYXNlKG1hc2ssIHBhdHRlcm4sIGNvbG9yMSwgY29sb3IyLCByZWQsIGdyZWVuKSB7XHJcbiAgICAgICAgICAgIGlmIChjb2xvcjIgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgY29sb3IyID0gY29sb3IxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbG9yMSA9IHRvUmdiKGNvbG9yMSk7XHJcbiAgICAgICAgICAgIGNvbG9yMiA9IHRvUmdiKGNvbG9yMik7XHJcbiAgICAgICAgICAgIHJlZCA9IHJlZCB8fCBmYWxzZTtcclxuICAgICAgICAgICAgZ3JlZW4gPSBncmVlbiB8fCBmYWxzZTtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHN0YXR1czogbWFzayxcclxuICAgICAgICAgICAgICAgIHBhdHRlcm46IHBhdHRlcm4sXHJcbiAgICAgICAgICAgICAgICBjb2xvcnM6IHtcclxuICAgICAgICAgICAgICAgICAgICByaWdodF9mcm9udDogY29sb3IxLFxyXG4gICAgICAgICAgICAgICAgICAgIHJpZ2h0X2JhY2s6IGNvbG9yMSxcclxuICAgICAgICAgICAgICAgICAgICBsZWZ0X2Zyb250OiBjb2xvcjIsXHJcbiAgICAgICAgICAgICAgICAgICAgbGVmdF9iYWNrOiBjb2xvcjIsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgaW5kaWNhdG9yX3JlZDogcmVkLFxyXG4gICAgICAgICAgICAgICAgaW5kaWNhdG9yX2dyZWVuOiBncmVlbixcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGZhZGUoY29sb3IpIHtcclxuICAgICAgICAgICAgdmFyIHIgPSAoY29sb3IgPj4gMTYpICYgMHhmZjtcclxuICAgICAgICAgICAgdmFyIGcgPSAoY29sb3IgPj4gOCkgJiAweGZmO1xyXG4gICAgICAgICAgICB2YXIgYiA9IGNvbG9yICYgMHhmZjtcclxuICAgICAgICAgICAgciAqPSAwLjk7XHJcbiAgICAgICAgICAgIGcgKj0gMC45O1xyXG4gICAgICAgICAgICBiICo9IDAuOTtcclxuICAgICAgICAgICAgcmV0dXJuIChNYXRoLmZsb29yKHIpIDw8IDE2KSB8IChNYXRoLmZsb29yKGcpIDw8IDgpIHwgTWF0aC5mbG9vcihiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBsZWRTdGF0ZXMgPSBbXHJcbiAgICAgICAgICAgIG1ha2VMZWRDYXNlKFxyXG4gICAgICAgICAgICAgICAgcGFyc2VyLlN0YXR1c0NvZGVzLlNUQVRVU19NUFVfRkFJTCwgTGVkUGF0dGVybnMuU09MSUQsXHJcbiAgICAgICAgICAgICAgICBmYWRlKENvbG9yLkJsYWNrKSwgZmFkZShDb2xvci5SZWQpLCB0cnVlKSxcclxuICAgICAgICAgICAgbWFrZUxlZENhc2UoXHJcbiAgICAgICAgICAgICAgICBwYXJzZXIuU3RhdHVzQ29kZXMuU1RBVFVTX0JNUF9GQUlMLCBMZWRQYXR0ZXJucy5TT0xJRCxcclxuICAgICAgICAgICAgICAgIGZhZGUoQ29sb3IuUmVkKSwgZmFkZShDb2xvci5CbGFjayksIHRydWUpLFxyXG4gICAgICAgICAgICBtYWtlTGVkQ2FzZShcclxuICAgICAgICAgICAgICAgIHBhcnNlci5TdGF0dXNDb2Rlcy5TVEFUVVNfQk9PVCwgTGVkUGF0dGVybnMuU09MSUQsXHJcbiAgICAgICAgICAgICAgICBmYWRlKENvbG9yLkdyZWVuKSksXHJcbiAgICAgICAgICAgIG1ha2VMZWRDYXNlKFxyXG4gICAgICAgICAgICAgICAgcGFyc2VyLlN0YXR1c0NvZGVzLlNUQVRVU19SWF9GQUlMLCBMZWRQYXR0ZXJucy5GTEFTSCxcclxuICAgICAgICAgICAgICAgIGZhZGUoQ29sb3IuT3JhbmdlKSksXHJcbiAgICAgICAgICAgIG1ha2VMZWRDYXNlKFxyXG4gICAgICAgICAgICAgICAgcGFyc2VyLlN0YXR1c0NvZGVzLlNUQVRVU19GQUlMX09USEVSLCBMZWRQYXR0ZXJucy5BTFRFUk5BVEUsXHJcbiAgICAgICAgICAgICAgICBmYWRlKENvbG9yLkJsdWUpKSxcclxuICAgICAgICAgICAgbWFrZUxlZENhc2UoXHJcbiAgICAgICAgICAgICAgICBwYXJzZXIuU3RhdHVzQ29kZXMuU1RBVFVTX0ZBSUxfU1RBQklMSVRZLCBMZWRQYXR0ZXJucy5GTEFTSCxcclxuICAgICAgICAgICAgICAgIGZhZGUoQ29sb3IuQmxhY2spLCBmYWRlKENvbG9yLkJsdWUpKSxcclxuICAgICAgICAgICAgbWFrZUxlZENhc2UoXHJcbiAgICAgICAgICAgICAgICBwYXJzZXIuU3RhdHVzQ29kZXMuU1RBVFVTX0ZBSUxfQU5HTEUsIExlZFBhdHRlcm5zLkZMQVNILFxyXG4gICAgICAgICAgICAgICAgZmFkZShDb2xvci5CbHVlKSwgZmFkZShDb2xvci5CbGFjaykpLFxyXG4gICAgICAgICAgICBtYWtlTGVkQ2FzZShcclxuICAgICAgICAgICAgICAgIHBhcnNlci5TdGF0dXNDb2Rlcy5TVEFUVVNfT1ZFUlJJREUsIExlZFBhdHRlcm5zLkJFQUNPTixcclxuICAgICAgICAgICAgICAgIGZhZGUoQ29sb3IuUmVkKSksXHJcbiAgICAgICAgICAgIG1ha2VMZWRDYXNlKFxyXG4gICAgICAgICAgICAgICAgcGFyc2VyLlN0YXR1c0NvZGVzLlNUQVRVU19URU1QX1dBUk5JTkcsIExlZFBhdHRlcm5zLkZMQVNILFxyXG4gICAgICAgICAgICAgICAgZmFkZShDb2xvci5SZWQpKSxcclxuICAgICAgICAgICAgbWFrZUxlZENhc2UoXHJcbiAgICAgICAgICAgICAgICBwYXJzZXIuU3RhdHVzQ29kZXMuU1RBVFVTX0JBVFRFUllfTE9XLCBMZWRQYXR0ZXJucy5CRUFDT04sXHJcbiAgICAgICAgICAgICAgICBmYWRlKENvbG9yLk9yYW5nZSkpLFxyXG4gICAgICAgICAgICBtYWtlTGVkQ2FzZShcclxuICAgICAgICAgICAgICAgIHBhcnNlci5TdGF0dXNDb2Rlcy5TVEFUVVNfRU5BQkxJTkcsIExlZFBhdHRlcm5zLkZMQVNILFxyXG4gICAgICAgICAgICAgICAgZmFkZShDb2xvci5CbHVlKSksXHJcbiAgICAgICAgICAgIG1ha2VMZWRDYXNlKFxyXG4gICAgICAgICAgICAgICAgcGFyc2VyLlN0YXR1c0NvZGVzLlNUQVRVU19FTkFCTEVELCBMZWRQYXR0ZXJucy5CRUFDT04sXHJcbiAgICAgICAgICAgICAgICBmYWRlKENvbG9yLkJsdWUpKSxcclxuICAgICAgICAgICAgbWFrZUxlZENhc2UoXHJcbiAgICAgICAgICAgICAgICBwYXJzZXIuU3RhdHVzQ29kZXMuU1RBVFVTX0lETEUsIExlZFBhdHRlcm5zLkJFQUNPTixcclxuICAgICAgICAgICAgICAgIGZhZGUoQ29sb3IuR3JlZW4pKSxcclxuICAgICAgICAgICAgbWFrZUxlZENhc2UoMCwgMCwgMCksXHJcbiAgICAgICAgICAgIG1ha2VMZWRDYXNlKDAsIDAsIDApLFxyXG4gICAgICAgICAgICBtYWtlTGVkQ2FzZSgwLCAwLCAwKSxcclxuICAgICAgICBdO1xyXG5cclxuICAgICAgICB2YXIgdGVtcGxhdGUgPSB7XHJcbiAgICAgICAgICAgIHBjYk9yaWVudGF0aW9uOiBbMCwgMCwgMF0sXHJcbiAgICAgICAgICAgIHBjYlRyYW5zbGF0aW9uOiBbMCwgMCwgMF0sXHJcbiAgICAgICAgICAgIG1hZ0JpYXM6IFswLCAwLCAwXSxcclxuICAgICAgICAgICAgYXNzaWduZWRDaGFubmVsOiBbMiwgMSwgMCwgMywgNCwgNV0sXHJcbiAgICAgICAgICAgIGNvbW1hbmRJbnZlcnNpb246IDYsXHJcbiAgICAgICAgICAgIGNoYW5uZWxNaWRwb2ludDogWzE1MTUsIDE1MTUsIDE1MDAsIDE1MjAsIDE1MDAsIDE1MDBdLFxyXG4gICAgICAgICAgICBjaGFubmVsRGVhZHpvbmU6IFsyMCwgMjAsIDIwLCA0MCwgMjAsIDIwXSxcclxuICAgICAgICAgICAgdGhydXN0TWFzdGVyUElEUGFyYW1ldGVyczogWzEsIDAsIDAsIDAsIDAuMDA1LCAwLjAwNSwgMV0sXHJcbiAgICAgICAgICAgIHBpdGNoTWFzdGVyUElEUGFyYW1ldGVyczogWzEwLCAxLCAwLCAxMCwgMC4wMDUsIDAuMDA1LCAxMF0sXHJcbiAgICAgICAgICAgIHJvbGxNYXN0ZXJQSURQYXJhbWV0ZXJzOiBbMTAsIDEsIDAsIDEwLCAwLjAwNSwgMC4wMDUsIDEwXSxcclxuICAgICAgICAgICAgeWF3TWFzdGVyUElEUGFyYW1ldGVyczogWzUsIDEsIDAsIDEwLCAwLjAwNSwgMC4wMDUsIDE4MF0sXHJcbiAgICAgICAgICAgIHRocnVzdFNsYXZlUElEUGFyYW1ldGVyczogWzEsIDAsIDAsIDEwLCAwLjAwMSwgMC4wMDEsIDAuM10sXHJcbiAgICAgICAgICAgIHBpdGNoU2xhdmVQSURQYXJhbWV0ZXJzOiBbMTAsIDQsIDAsIDMwLCAwLjAwMSwgMC4wMDEsIDMwXSxcclxuICAgICAgICAgICAgcm9sbFNsYXZlUElEUGFyYW1ldGVyczogWzEwLCA0LCAwLCAzMCwgMC4wMDEsIDAuMDAxLCAzMF0sXHJcbiAgICAgICAgICAgIHlhd1NsYXZlUElEUGFyYW1ldGVyczogWzMwLCA1LCAwLCAyMCwgMC4wMDEsIDAuMDAxLCAyNDBdLFxyXG4gICAgICAgICAgICB0aHJ1c3RHYWluOiA0MDk1LFxyXG4gICAgICAgICAgICBwaXRjaEdhaW46IDIwNDcsXHJcbiAgICAgICAgICAgIHJvbGxHYWluOiAyMDQ3LFxyXG4gICAgICAgICAgICB5YXdHYWluOiAyMDQ3LFxyXG4gICAgICAgICAgICBwaWRCeXBhc3M6IDI1LFxyXG4gICAgICAgICAgICBzdGF0ZUVzdGltYXRpb25QYXJhbWV0ZXJzOiBbMSwgMC4wMV0sXHJcbiAgICAgICAgICAgIGVuYWJsZVBhcmFtZXRlcnM6IFswLjAwMSwgMzBdLFxyXG4gICAgICAgICAgICBsZWRTdGF0ZXM6IGxlZFN0YXRlcyxcclxuICAgICAgICAgICAgbmFtZTogJ0ZMWUJSSVgnLFxyXG4gICAgICAgICAgICBmb3J3YXJkTWFzdGVyUElEUGFyYW1ldGVyczogWzEwLCAxLCAwLCAxMCwgMC4wMDUsIDAuMDA1LCAxMF0sXHJcbiAgICAgICAgICAgIHJpZ2h0TWFzdGVyUElEUGFyYW1ldGVyczogWzEwLCAxLCAwLCAxMCwgMC4wMDUsIDAuMDA1LCAxMF0sXHJcbiAgICAgICAgICAgIHVwTWFzdGVyUElEUGFyYW1ldGVyczogWzEwLCAxLCAwLCAxMCwgMC4wMDUsIDAuMDA1LCAxMF0sXHJcbiAgICAgICAgICAgIGZvcndhcmRTbGF2ZVBJRFBhcmFtZXRlcnM6IFsxMCwgNCwgMCwgMzAsIDAuMDAxLCAwLjAwMSwgMzBdLFxyXG4gICAgICAgICAgICByaWdodFNsYXZlUElEUGFyYW1ldGVyczogWzEwLCA0LCAwLCAzMCwgMC4wMDEsIDAuMDAxLCAzMF0sXHJcbiAgICAgICAgICAgIHVwU2xhdmVQSURQYXJhbWV0ZXJzOiBbMTAsIDQsIDAsIDMwLCAwLjAwMSwgMC4wMDEsIDMwXSxcclxuICAgICAgICAgICAgdmVsb2NpdHlQaWRCeXBhc3M6IDExOSxcclxuICAgICAgICAgICAgaW5lcnRpYWxCaWFzQWNjZWw6IFswLCAwLCAwXSxcclxuICAgICAgICAgICAgaW5lcnRpYWxCaWFzR3lybzogWzAsIDAsIDBdLFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGdldDogZ2V0LFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0KGlkKSB7XHJcbiAgICAgICAgICAgIGlkID0gTWF0aC5mbG9vcihpZCk7XHJcbiAgICAgICAgICAgIGlmICghKGlkID49IDAgJiYgaWQgPCAzKSkge1xyXG4gICAgICAgICAgICAgICAgaWQgPSAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciBoYW5kbGVyID0gZmlybXdhcmVWZXJzaW9uLmNvbmZpZ0hhbmRsZXIoKTtcclxuICAgICAgICAgICAgdmFyIHZhbHVlID0ge307XHJcbiAgICAgICAgICAgIGFuZ3VsYXIuY29weSh0ZW1wbGF0ZSk7XHJcbiAgICAgICAgICAgIGhhbmRsZXIuY2hpbGRyZW4uZm9yRWFjaChmdW5jdGlvbihjaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGtleSA9IGNoaWxkLmtleTtcclxuICAgICAgICAgICAgICAgIHZhbHVlW2tleV0gPSBhbmd1bGFyLmNvcHkodGVtcGxhdGVba2V5XSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB2YWx1ZS5pZCA9IGlkO1xyXG4gICAgICAgICAgICB2YWx1ZS52ZXJzaW9uID0gZmlybXdhcmVWZXJzaW9uLmdldCgpLnNsaWNlKCk7XHJcbiAgICAgICAgICAgIHN3aXRjaCAoaWQpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgMDpcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZS5taXhUYWJsZUZ6ID0gWzEsIDEsIDAsIDAsIDAsIDAsIDEsIDFdO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlLm1peFRhYmxlVHggPSBbMSwgMSwgMCwgMCwgMCwgMCwgLTEsIC0xXTtcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZS5taXhUYWJsZVR5ID0gWy0xLCAxLCAwLCAwLCAwLCAwLCAtMSwgMV07XHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUubWl4VGFibGVUeiA9IFsxLCAtMSwgMCwgMCwgMCwgMCwgLTEsIDFdO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlLm1peFRhYmxlRnogPSBbMSwgMSwgMSwgMSwgMCwgMCwgMSwgMV07XHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUubWl4VGFibGVUeCA9IFsxLCAxLCAwLCAwLCAwLCAwLCAtMSwgLTFdO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlLm1peFRhYmxlVHkgPSBbLTEsIDEsIC0xLCAxLCAwLCAwLCAtMSwgMV07XHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUubWl4VGFibGVUeiA9IFsxLCAtMSwgLTEsIDEsIDAsIDAsIDEsIC0xXTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZS5taXhUYWJsZUZ6ID0gWzEsIDEsIDEsIDEsIDEsIDEsIDEsIDFdO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlLm1peFRhYmxlVHggPSBbMSwgMSwgMSwgMSwgLTEsIC0xLCAtMSwgLTFdO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlLm1peFRhYmxlVHkgPSBbLTEsIDEsIC0xLCAxLCAtMSwgMSwgLTEsIDFdO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlLm1peFRhYmxlVHogPSBbMSwgLTEsIC0xLCAxLCAxLCAtMSwgLTEsIDFdO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG59KCkpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ2ZseWJyaXhDb21tb24nKS5mYWN0b3J5KCdyY0RhdGEnLCByY0RhdGEpO1xyXG5cclxuICAgIHJjRGF0YS4kaW5qZWN0ID0gWydzZXJpYWwnXTtcclxuXHJcbiAgICBmdW5jdGlvbiByY0RhdGEoc2VyaWFsKSB7XHJcbiAgICAgICAgdmFyIEFVWCA9IHtcclxuICAgICAgICAgICAgTE9XOiAwLFxyXG4gICAgICAgICAgICBNSUQ6IDEsXHJcbiAgICAgICAgICAgIEhJR0g6IDIsXHJcbiAgICAgICAgfTtcclxuICAgICAgICB2YXIgYXV4TmFtZXMgPSBbJ2xvdycsICdtaWQnLCAnaGlnaCddO1xyXG5cclxuICAgICAgICB2YXIgdGhyb3R0bGUgPSAtMTtcclxuICAgICAgICB2YXIgcGl0Y2ggPSAwO1xyXG4gICAgICAgIHZhciByb2xsID0gMDtcclxuICAgICAgICB2YXIgeWF3ID0gMDtcclxuICAgICAgICAvLyBkZWZhdWx0cyB0byBoaWdoIC0tIGxvdyBpcyBlbmFibGluZzsgaGlnaCBpcyBkaXNhYmxpbmdcclxuICAgICAgICB2YXIgYXV4MSA9IEFVWC5ISUdIO1xyXG4gICAgICAgIC8vIGRlZmF1bHRzIHRvID8/IC0tIG5lZWQgdG8gY2hlY2sgdHJhbnNtaXR0ZXIgYmVoYXZpb3JcclxuICAgICAgICB2YXIgYXV4MiA9IEFVWC5ISUdIO1xyXG5cclxuICAgICAgICB2YXIgdXJnZW50ID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgc2V0VGhyb3R0bGU6IHNldFRocm90dGxlLFxyXG4gICAgICAgICAgICBzZXRQaXRjaDogc2V0UGl0Y2gsXHJcbiAgICAgICAgICAgIHNldFJvbGw6IHNldFJvbGwsXHJcbiAgICAgICAgICAgIHNldFlhdzogc2V0WWF3LFxyXG4gICAgICAgICAgICBzZXRBdXgxOiBzZXRBdXgxLFxyXG4gICAgICAgICAgICBzZXRBdXgyOiBzZXRBdXgyLFxyXG4gICAgICAgICAgICBnZXRUaHJvdHRsZTogZ2V0VGhyb3R0bGUsXHJcbiAgICAgICAgICAgIGdldFBpdGNoOiBnZXRQaXRjaCxcclxuICAgICAgICAgICAgZ2V0Um9sbDogZ2V0Um9sbCxcclxuICAgICAgICAgICAgZ2V0WWF3OiBnZXRZYXcsXHJcbiAgICAgICAgICAgIGdldEF1eDE6IGdldEF1eDEsXHJcbiAgICAgICAgICAgIGdldEF1eDI6IGdldEF1eDIsXHJcbiAgICAgICAgICAgIEFVWDogQVVYLFxyXG4gICAgICAgICAgICBzZW5kOiBzZW5kLFxyXG4gICAgICAgICAgICBmb3JjZU5leHRTZW5kOiBmb3JjZU5leHRTZW5kLFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNlbmQoKSB7XHJcbiAgICAgICAgICAgIGlmICghdXJnZW50ICYmIHNlcmlhbC5idXN5KCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB1cmdlbnQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgIHZhciBjb21tYW5kID0ge307XHJcblxyXG4gICAgICAgICAgICAvLyBpbnZlcnQgcGl0Y2ggYW5kIHJvbGxcclxuICAgICAgICAgICAgdmFyIHRocm90dGxlX3RocmVzaG9sZCA9XHJcbiAgICAgICAgICAgICAgICAtMC44OyAgLy8ga2VlcCBib3R0b20gMTAlIG9mIHRocm90dGxlIHN0aWNrIHRvIG1lYW4gJ29mZidcclxuICAgICAgICAgICAgY29tbWFuZC50aHJvdHRsZSA9IGNvbnN0cmFpbihcclxuICAgICAgICAgICAgICAgICh0aHJvdHRsZSAtIHRocm90dGxlX3RocmVzaG9sZCkgKiA0MDk1IC9cclxuICAgICAgICAgICAgICAgICAgICAoMSAtIHRocm90dGxlX3RocmVzaG9sZCksXHJcbiAgICAgICAgICAgICAgICAwLCA0MDk1KTtcclxuICAgICAgICAgICAgY29tbWFuZC5waXRjaCA9XHJcbiAgICAgICAgICAgICAgICBjb25zdHJhaW4oLShhcHBseURlYWR6b25lKHBpdGNoLCAwLjEpKSAqIDQwOTUgLyAyLCAtMjA0NywgMjA0Nyk7XHJcbiAgICAgICAgICAgIGNvbW1hbmQucm9sbCA9XHJcbiAgICAgICAgICAgICAgICBjb25zdHJhaW4oKGFwcGx5RGVhZHpvbmUocm9sbCwgMC4xKSkgKiA0MDk1IC8gMiwgLTIwNDcsIDIwNDcpO1xyXG4gICAgICAgICAgICBjb21tYW5kLnlhdyA9XHJcbiAgICAgICAgICAgICAgICBjb25zdHJhaW4oLShhcHBseURlYWR6b25lKHlhdywgMC4xKSkgKiA0MDk1IC8gMiwgLTIwNDcsIDIwNDcpO1xyXG5cclxuICAgICAgICAgICAgdmFyIGF1eF9tYXNrID0ge307XHJcbiAgICAgICAgICAgIC8vIGF1eDFfbG93LCBhdXgxX21pZCwgYXV4MV9oaWdoLCBhbmQgc2FtZSB3aXRoIGF1eDJcclxuICAgICAgICAgICAgYXV4X21hc2tbJ2F1eDFfJyArIGF1eE5hbWVzW2F1eDFdXSA9IHRydWU7XHJcbiAgICAgICAgICAgIGF1eF9tYXNrWydhdXgyXycgKyBhdXhOYW1lc1thdXgyXV0gPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHNlcmlhbC5zZW5kU3RydWN0dXJlKCdDb21tYW5kJywge1xyXG4gICAgICAgICAgICAgICAgcmVxdWVzdF9yZXNwb25zZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHNldF9zZXJpYWxfcmM6IHtcclxuICAgICAgICAgICAgICAgICAgICBlbmFibGVkOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbW1hbmQ6IGNvbW1hbmQsXHJcbiAgICAgICAgICAgICAgICAgICAgYXV4X21hc2s6IGF1eF9tYXNrLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSwgZmFsc2UpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2V0VGhyb3R0bGUodikge1xyXG4gICAgICAgICAgICB0aHJvdHRsZSA9IHY7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZXRQaXRjaCh2KSB7XHJcbiAgICAgICAgICAgIHBpdGNoID0gdjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNldFJvbGwodikge1xyXG4gICAgICAgICAgICByb2xsID0gdjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNldFlhdyh2KSB7XHJcbiAgICAgICAgICAgIHlhdyA9IHY7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZXRBdXgxKHYpIHtcclxuICAgICAgICAgICAgYXV4MSA9IE1hdGgubWF4KDAsIE1hdGgubWluKDIsIHYpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNldEF1eDIodikge1xyXG4gICAgICAgICAgICBhdXgyID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oMiwgdikpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0VGhyb3R0bGUoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aHJvdHRsZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdldFBpdGNoKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gcGl0Y2g7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRSb2xsKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gcm9sbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdldFlhdygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHlhdztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdldEF1eDEoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBhdXgxO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0QXV4MigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGF1eDI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBmb3JjZU5leHRTZW5kKCkge1xyXG4gICAgICAgICAgICB1cmdlbnQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gY29uc3RyYWluKHgsIHhtaW4sIHhtYXgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE1hdGgubWF4KHhtaW4sIE1hdGgubWluKHgsIHhtYXgpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFwcGx5RGVhZHpvbmUodmFsdWUsIGRlYWR6b25lKSB7XHJcbiAgICAgICAgICAgIGlmICh2YWx1ZSA+IGRlYWR6b25lKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUgLSBkZWFkem9uZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodmFsdWUgPCAtZGVhZHpvbmUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSArIGRlYWR6b25lO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSgpKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdmbHlicml4Q29tbW9uJykuZmFjdG9yeSgnc2VyaWFsJywgc2VyaWFsKTtcclxuXHJcbiAgICBzZXJpYWwuJGluamVjdCA9IFsnJHRpbWVvdXQnLCAnJHEnLCAnY29icycsICdjb21tYW5kTG9nJywgJ3BhcnNlcicsICdmaXJtd2FyZVZlcnNpb24nLCAnc2VyaWFsaXphdGlvbkhhbmRsZXInXTtcclxuXHJcbiAgICBmdW5jdGlvbiBzZXJpYWwoJHRpbWVvdXQsICRxLCBjb2JzLCBjb21tYW5kTG9nLCBwYXJzZXIsIGZpcm13YXJlVmVyc2lvbiwgc2VyaWFsaXphdGlvbkhhbmRsZXIpIHtcclxuICAgICAgICB2YXIgYWNrbm93bGVkZ2VzID0gW107XHJcbiAgICAgICAgdmFyIGJhY2tlbmQgPSBuZXcgQmFja2VuZCgpO1xyXG4gICAgICAgIHZhciBvblN0YXRlTGlzdGVuZXIgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgY29tbWFuZExvZygnTm8gc3RhdGUgbGlzdGVuZXIgZGVmaW5lZCBmb3Igc2VyaWFsJyk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICB2YXIgb25Db21tYW5kTGlzdGVuZXIgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgY29tbWFuZExvZygnTm8gY29tbWFuZCBsaXN0ZW5lciBkZWZpbmVkIGZvciBzZXJpYWwnKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIHZhciBvbkRlYnVnTGlzdGVuZXIgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgY29tbWFuZExvZygnTm8gZGVidWcgbGlzdGVuZXIgZGVmaW5lZCBmb3Igc2VyaWFsJyk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICB2YXIgb25IaXN0b3J5TGlzdGVuZXIgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgY29tbWFuZExvZygnTm8gaGlzdG9yeSBsaXN0ZW5lciBkZWZpbmVkIGZvciBzZXJpYWwnKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgY29ic1JlYWRlciA9IG5ldyBjb2JzLlJlYWRlcigyMDAwKTtcclxuICAgICAgICB2YXIgZGF0YUhhbmRsZXIgPSB1bmRlZmluZWQ7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIEJhY2tlbmQoKSB7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBCYWNrZW5kLnByb3RvdHlwZS5idXN5ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBCYWNrZW5kLnByb3RvdHlwZS5zZW5kID0gZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICBjb21tYW5kTG9nKCdObyBcInNlbmRcIiBkZWZpbmVkIGZvciBzZXJpYWwgYmFja2VuZCcpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIEJhY2tlbmQucHJvdG90eXBlLm9uUmVhZCA9IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgICAgY29tbWFuZExvZygnTm8gXCJvblJlYWRcIiBkZWZpbmVkIGZvciBzZXJpYWwgYmFja2VuZCcpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGJ1c3k6IGJ1c3ksXHJcbiAgICAgICAgICAgIGZpZWxkOiBwYXJzZXIuQ29tbWFuZEZpZWxkcyxcclxuICAgICAgICAgICAgc2VuZDogc2VuZCxcclxuICAgICAgICAgICAgc2VuZFN0cnVjdHVyZTogc2VuZFN0cnVjdHVyZSxcclxuICAgICAgICAgICAgc2V0QmFja2VuZDogc2V0QmFja2VuZCxcclxuICAgICAgICAgICAgc2V0U3RhdGVDYWxsYmFjazogc2V0U3RhdGVDYWxsYmFjayxcclxuICAgICAgICAgICAgc2V0Q29tbWFuZENhbGxiYWNrOiBzZXRDb21tYW5kQ2FsbGJhY2ssXHJcbiAgICAgICAgICAgIHNldERlYnVnQ2FsbGJhY2s6IHNldERlYnVnQ2FsbGJhY2ssXHJcbiAgICAgICAgICAgIHNldEhpc3RvcnlDYWxsYmFjazogc2V0SGlzdG9yeUNhbGxiYWNrLFxyXG4gICAgICAgICAgICBzZXREYXRhSGFuZGxlcjogc2V0RGF0YUhhbmRsZXIsXHJcbiAgICAgICAgICAgIGhhbmRsZVBvc3RDb25uZWN0OiBoYW5kbGVQb3N0Q29ubmVjdCxcclxuICAgICAgICAgICAgQmFja2VuZDogQmFja2VuZCxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZXRCYWNrZW5kKHYpIHtcclxuICAgICAgICAgICAgYmFja2VuZCA9IHY7XHJcbiAgICAgICAgICAgIGJhY2tlbmQub25SZWFkID0gcmVhZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGhhbmRsZVBvc3RDb25uZWN0KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gcmVxdWVzdEZpcm13YXJlVmVyc2lvbigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gcmVxdWVzdEZpcm13YXJlVmVyc2lvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHNlbmQoXHJcbiAgICAgICAgICAgICAgICBwYXJzZXIuQ29tbWFuZEZpZWxkcy5DT01fUkVRX1BBUlRJQUxfRUVQUk9NX0RBVEEsIFsxLCAwLCAwLCAwXSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZW5kU3RydWN0dXJlKG1lc3NhZ2VUeXBlLCBkYXRhLCBsb2dfc2VuZCkge1xyXG4gICAgICAgICAgICB2YXIgaGFuZGxlcnMgPSBmaXJtd2FyZVZlcnNpb24uc2VyaWFsaXphdGlvbkhhbmRsZXIoKTtcclxuXHJcbiAgICAgICAgICAgIHZhciByZXNwb25zZSA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgICAgIGlmICghKG1lc3NhZ2VUeXBlIGluIHBhcnNlci5NZXNzYWdlVHlwZSkpIHtcclxuICAgICAgICAgICAgICAgIHJlc3BvbnNlLnJlamVjdCgnTWVzc2FnZSB0eXBlIFwiJyArIG1lc3NhZ2VUeXBlICtcclxuICAgICAgICAgICAgICAgICAgICAnXCIgbm90IHN1cHBvcnRlZCBieSBhcHAsIHN1cHBvcnRlZCBtZXNzYWdlIHR5cGVzIGFyZTonICtcclxuICAgICAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyhwYXJzZXIuTWVzc2FnZVR5cGUpLmpvaW4oJywgJykpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLnByb21pc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCEobWVzc2FnZVR5cGUgaW4gaGFuZGxlcnMpKSB7XHJcbiAgICAgICAgICAgICAgICByZXNwb25zZS5yZWplY3QoJ01lc3NhZ2UgdHlwZSBcIicgKyBtZXNzYWdlVHlwZSArXHJcbiAgICAgICAgICAgICAgICAgICAgJ1wiIG5vdCBzdXBwb3J0ZWQgYnkgZmlybXdhcmUsIHN1cHBvcnRlZCBtZXNzYWdlIHR5cGVzIGFyZTonICtcclxuICAgICAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyhoYW5kbGVycykuam9pbignLCAnKSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UucHJvbWlzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgdHlwZUNvZGUgPSBwYXJzZXIuTWVzc2FnZVR5cGVbbWVzc2FnZVR5cGVdO1xyXG4gICAgICAgICAgICB2YXIgaGFuZGxlciA9IGhhbmRsZXJzW21lc3NhZ2VUeXBlXTtcclxuXHJcbiAgICAgICAgICAgIHZhciBidWZmZXIgPSBuZXcgVWludDhBcnJheShoYW5kbGVyLmJ5dGVDb3VudCk7XHJcblxyXG4gICAgICAgICAgICB2YXIgc2VyaWFsaXplciA9IG5ldyBzZXJpYWxpemF0aW9uSGFuZGxlci5TZXJpYWxpemVyKG5ldyBEYXRhVmlldyhidWZmZXIuYnVmZmVyKSk7XHJcbiAgICAgICAgICAgIGhhbmRsZXIuZW5jb2RlKHNlcmlhbGl6ZXIsIGRhdGEpO1xyXG4gICAgICAgICAgICB2YXIgbWFzayA9IGhhbmRsZXIubWFza0FycmF5KGRhdGEpO1xyXG4gICAgICAgICAgICBpZiAobWFzay5sZW5ndGggPCA1KSB7XHJcbiAgICAgICAgICAgICAgICBtYXNrID0gKG1hc2tbMF0gPDwgMCkgfCAobWFza1sxXSA8PCA4KSB8IChtYXNrWzJdIDw8IDE2KSB8IChtYXNrWzNdIDw8IDI0KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIGRhdGFMZW5ndGggPSBzZXJpYWxpemVyLmluZGV4O1xyXG5cclxuICAgICAgICAgICAgdmFyIG91dHB1dCA9IG5ldyBVaW50OEFycmF5KGRhdGFMZW5ndGggKyAzKTtcclxuICAgICAgICAgICAgb3V0cHV0WzBdID0gb3V0cHV0WzFdID0gdHlwZUNvZGU7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGlkeCA9IDA7IGlkeCA8IGRhdGFMZW5ndGg7ICsraWR4KSB7XHJcbiAgICAgICAgICAgICAgICBvdXRwdXRbMF0gXj0gb3V0cHV0W2lkeCArIDJdID0gYnVmZmVyW2lkeF07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgb3V0cHV0W2RhdGFMZW5ndGggKyAyXSA9IDA7XHJcblxyXG4gICAgICAgICAgICBhY2tub3dsZWRnZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBtYXNrOiBtYXNrLFxyXG4gICAgICAgICAgICAgICAgcmVzcG9uc2U6IHJlc3BvbnNlLFxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgYmFja2VuZC5zZW5kKG5ldyBVaW50OEFycmF5KGNvYnMuZW5jb2RlKG91dHB1dCkpKTtcclxuICAgICAgICAgICAgfSwgMCk7XHJcblxyXG4gICAgICAgICAgICBpZiAobG9nX3NlbmQpIHtcclxuICAgICAgICAgICAgICAgIGNvbW1hbmRMb2coJ1NlbmRpbmcgY29tbWFuZCAnICsgdHlwZUNvZGUpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UucHJvbWlzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNlbmQobWFzaywgZGF0YSwgbG9nX3NlbmQpIHtcclxuICAgICAgICAgICAgaWYgKGxvZ19zZW5kID09PSB1bmRlZmluZWQpXHJcbiAgICAgICAgICAgICAgICBsb2dfc2VuZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgdmFyIHJlc3BvbnNlID0gJHEuZGVmZXIoKTtcclxuXHJcbiAgICAgICAgICAgIG1hc2sgfD0gcGFyc2VyLkNvbW1hbmRGaWVsZHMuQ09NX1JFUV9SRVNQT05TRTsgIC8vIGZvcmNlIHJlc3BvbnNlc1xyXG5cclxuICAgICAgICAgICAgdmFyIGNoZWNrc3VtID0gMDtcclxuICAgICAgICAgICAgdmFyIGJ1ZmZlck91dCwgYnVmVmlldztcclxuXHJcbiAgICAgICAgICAgIC8vIGFsd2F5cyByZXNlcnZlIDEgYnl0ZSBmb3IgcHJvdG9jb2wgb3ZlcmhlYWQgIVxyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGRhdGEgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgc2l6ZSA9IDcgKyBkYXRhLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgIGJ1ZlZpZXcgPSBuZXcgVWludDhBcnJheShzaXplKTtcclxuICAgICAgICAgICAgICAgIGNoZWNrc3VtIF49IGJ1ZlZpZXdbMV0gPSBwYXJzZXIuTWVzc2FnZVR5cGUuQ29tbWFuZDtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNDsgKytpKVxyXG4gICAgICAgICAgICAgICAgICAgIGNoZWNrc3VtIF49IGJ1ZlZpZXdbaSArIDJdID0gYnl0ZU5pbk51bShtYXNrLCBpKTtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKylcclxuICAgICAgICAgICAgICAgICAgICBjaGVja3N1bSBePSBidWZWaWV3W2kgKyA2XSA9IGRhdGFbaV07XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBidWZmZXJPdXQgPSBuZXcgQXJyYXlCdWZmZXIoOCk7XHJcbiAgICAgICAgICAgICAgICBidWZWaWV3ID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyT3V0KTtcclxuICAgICAgICAgICAgICAgIGNoZWNrc3VtIF49IGJ1ZlZpZXdbMV0gPSBwYXJzZXIuTWVzc2FnZVR5cGUuQ29tbWFuZDtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNDsgKytpKVxyXG4gICAgICAgICAgICAgICAgICAgIGNoZWNrc3VtIF49IGJ1ZlZpZXdbaSArIDJdID0gYnl0ZU5pbk51bShtYXNrLCBpKTtcclxuICAgICAgICAgICAgICAgIGNoZWNrc3VtIF49IGJ1ZlZpZXdbNl0gPSBkYXRhOyAgLy8gcGF5bG9hZFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGJ1ZlZpZXdbMF0gPSBjaGVja3N1bTsgIC8vIGNyY1xyXG4gICAgICAgICAgICBidWZWaWV3W2J1ZlZpZXcubGVuZ3RoIC0gMV0gPSAwO1xyXG5cclxuICAgICAgICAgICAgYWNrbm93bGVkZ2VzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgbWFzazogbWFzayxcclxuICAgICAgICAgICAgICAgIHJlc3BvbnNlOiByZXNwb25zZSxcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGJhY2tlbmQuc2VuZChuZXcgVWludDhBcnJheShjb2JzLmVuY29kZShidWZWaWV3KSkpO1xyXG4gICAgICAgICAgICB9LCAwKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChsb2dfc2VuZCkge1xyXG4gICAgICAgICAgICAgICAgY29tbWFuZExvZyhcclxuICAgICAgICAgICAgICAgICAgICAnU2VuZGluZyBjb21tYW5kICcgKyBwYXJzZXIuTWVzc2FnZVR5cGUuQ29tbWFuZCApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UucHJvbWlzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGJ1c3koKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBiYWNrZW5kLmJ1c3koKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNldERhdGFIYW5kbGVyKGhhbmRsZXIpIHtcclxuICAgICAgICAgICAgZGF0YUhhbmRsZXIgPSBoYW5kbGVyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gcmVhZChkYXRhKSB7XHJcbiAgICAgICAgICAgIGlmIChkYXRhSGFuZGxlcilcclxuICAgICAgICAgICAgICAgIGRhdGFIYW5kbGVyKGRhdGEsIHByb2Nlc3NEYXRhKTtcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgY29ic1JlYWRlci5BcHBlbmRUb0J1ZmZlcihkYXRhLCBwcm9jZXNzRGF0YSwgcmVwb3J0SXNzdWVzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHJlcG9ydElzc3Vlcyhpc3N1ZSwgdGV4dCkge1xyXG4gICAgICAgICAgICBjb21tYW5kTG9nKCdDT0JTIGRlY29kaW5nIGZhaWxlZCAoJyArIGlzc3VlICsgJyk6ICcgKyB0ZXh0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNldFN0YXRlQ2FsbGJhY2soY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgb25TdGF0ZUxpc3RlbmVyID0gY2FsbGJhY2s7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZXRDb21tYW5kQ2FsbGJhY2soY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgb25Db21tYW5kTGlzdGVuZXIgPSBjYWxsYmFjaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNldEhpc3RvcnlDYWxsYmFjayhjYWxsYmFjaykge1xyXG4gICAgICAgICAgICBvbkhpc3RvcnlMaXN0ZW5lciA9IGNhbGxiYWNrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2V0RGVidWdDYWxsYmFjayhjYWxsYmFjaykge1xyXG4gICAgICAgICAgICBvbkRlYnVnTGlzdGVuZXIgPSBjYWxsYmFjaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFja25vd2xlZGdlKG1hc2ssIHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHdoaWxlIChhY2tub3dsZWRnZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHYgPSBhY2tub3dsZWRnZXMuc2hpZnQoKTtcclxuICAgICAgICAgICAgICAgIGlmICh2Lm1hc2sgIT09IG1hc2spIHtcclxuICAgICAgICAgICAgICAgICAgICB2LnJlc3BvbnNlLnJlamVjdCgnTWlzc2luZyBBQ0snKTtcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHZhciByZWxheGVkTWFzayA9IG1hc2s7XHJcbiAgICAgICAgICAgICAgICByZWxheGVkTWFzayAmPSB+cGFyc2VyLkNvbW1hbmRGaWVsZHMuQ09NX1JFUV9SRVNQT05TRTtcclxuICAgICAgICAgICAgICAgIGlmIChyZWxheGVkTWFzayAhPT0gdmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICB2LnJlc3BvbnNlLnJlamVjdCgnUmVxdWVzdCB3YXMgbm90IGZ1bGx5IHByb2Nlc3NlZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdi5yZXNwb25zZS5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gcHJvY2Vzc0RhdGEoY29tbWFuZCwgbWFzaywgbWVzc2FnZV9idWZmZXIpIHtcclxuICAgICAgICAgICAgcGFyc2VyLnByb2Nlc3NCaW5hcnlEYXRhc3RyZWFtKFxyXG4gICAgICAgICAgICAgICAgY29tbWFuZCwgbWFzaywgbWVzc2FnZV9idWZmZXIsIG9uU3RhdGVMaXN0ZW5lcixcclxuICAgICAgICAgICAgICAgIG9uQ29tbWFuZExpc3RlbmVyLCBvbkRlYnVnTGlzdGVuZXIsIG9uSGlzdG9yeUxpc3RlbmVyLCBhY2tub3dsZWRnZSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYnl0ZU5pbk51bShkYXRhLCBuKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAoZGF0YSA+PiAoOCAqIG4pKSAmIDB4RkY7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KCkpO1xyXG4iLCIoZnVuY3Rpb24gKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIHNlcmlhbGl6YXRpb25IYW5kbGVyLiRpbmplY3QgPSBbXTtcclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgnZmx5YnJpeENvbW1vbicpLmZhY3RvcnkoJ3NlcmlhbGl6YXRpb25IYW5kbGVyJywgc2VyaWFsaXphdGlvbkhhbmRsZXIpO1xyXG5cclxuICAgIGZ1bmN0aW9uIHNlcmlhbGl6YXRpb25IYW5kbGVyKCkge1xyXG4gICAgICAgIHZhciBoYW5kbGVyQ2FjaGUgPSB7fTtcclxuICAgICAgICB2YXIgdmVyc2lvbiA9ICdWZXJzaW9uID0geyBtYWpvcjogdTgsIG1pbm9yOiB1OCwgcGF0Y2g6IHU4IH07JztcclxuICAgICAgICB2YXIgY29uZmlnSWQgPSAnQ29uZmlnSUQgPSB7IGlkOiB1MzIgfTsnO1xyXG5cclxuICAgICAgICB2YXIgdmVjdG9yM2YgPSAnVmVjdG9yM2YgPSB7IHg6IGYzMiwgeTogZjMyLCB6OiBmMzIgfTsnO1xyXG5cclxuICAgICAgICB2YXIgcGNiVHJhbnNmb3JtID0gJ1BjYlRyYW5zZm9ybSA9IHsgb3JpZW50YXRpb246IFZlY3RvcjNmLCB0cmFuc2xhdGlvbjogVmVjdG9yM2YgfTsnO1xyXG4gICAgICAgIHZhciBtaXhUYWJsZSA9ICdNaXhUYWJsZSA9IHsgZno6IFtpODo4XSwgdHg6IFtpODo4XSwgdHk6IFtpODo4XSwgdHo6IFtpODo4XSB9Oyc7XHJcbiAgICAgICAgdmFyIG1hZ0JpYXMgPSAnTWFnQmlhcyA9IHsgb2Zmc2V0OiBWZWN0b3IzZiB9Oyc7XHJcbiAgICAgICAgdmFyIGNoYW5uZWxQcm9wZXJ0aWVzID0gJ0NoYW5uZWxQcm9wZXJ0aWVzID0geycgK1xyXG4gICAgICAgICAgICAnYXNzaWdubWVudDogW3U4OjZdLCcgK1xyXG4gICAgICAgICAgICAnaW52ZXJzaW9uOiB1OCwnICtcclxuICAgICAgICAgICAgJ21pZHBvaW50OiBbdTE2OjZdLCcgK1xyXG4gICAgICAgICAgICAnZGVhZHpvbmU6IFt1MTY6Nl0gfTsnO1xyXG5cclxuICAgICAgICB2YXIgcGlkU2V0dGluZ3MgPSAnUElEU2V0dGluZ3MgPSB7JyArXHJcbiAgICAgICAgICAgICdrcDogZjMyLCcgK1xyXG4gICAgICAgICAgICAna2k6IGYzMiwnICtcclxuICAgICAgICAgICAgJ2tkOiBmMzIsJyArXHJcbiAgICAgICAgICAgICdpbnRlZ3JhbF93aW5kdXBfZ3VhcmQ6IGYzMiwnICtcclxuICAgICAgICAgICAgJ2RfZmlsdGVyX3RpbWU6IGYzMiwnICtcclxuICAgICAgICAgICAgJ3NldHBvaW50X2ZpbHRlcl90aW1lOiBmMzIsJyArXHJcbiAgICAgICAgICAgICdjb21tYW5kX3RvX3ZhbHVlOiBmMzIgfTsnO1xyXG4gICAgICAgIHZhciBwaWRQYXJhbWV0ZXJzMTQgPSAnUElEUGFyYW1ldGVycyA9IHsnICtcclxuICAgICAgICAgICAgJ3RocnVzdF9tYXN0ZXI6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAncGl0Y2hfbWFzdGVyOiBQSURTZXR0aW5ncywnICtcclxuICAgICAgICAgICAgJ3JvbGxfbWFzdGVyOiBQSURTZXR0aW5ncywnICtcclxuICAgICAgICAgICAgJ3lhd19tYXN0ZXI6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAndGhydXN0X3NsYXZlOiBQSURTZXR0aW5ncywnICtcclxuICAgICAgICAgICAgJ3BpdGNoX3NsYXZlOiBQSURTZXR0aW5ncywnICtcclxuICAgICAgICAgICAgJ3JvbGxfc2xhdmU6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAneWF3X3NsYXZlOiBQSURTZXR0aW5ncywnICtcclxuICAgICAgICAgICAgJ3BpZF9ieXBhc3M6IHU4IH07JztcclxuICAgICAgICB2YXIgcGlkUGFyYW1ldGVycyA9ICdQSURQYXJhbWV0ZXJzID0geycgK1xyXG4gICAgICAgICAgICAndGhydXN0X21hc3RlcjogUElEU2V0dGluZ3MsJyArXHJcbiAgICAgICAgICAgICdwaXRjaF9tYXN0ZXI6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAncm9sbF9tYXN0ZXI6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAneWF3X21hc3RlcjogUElEU2V0dGluZ3MsJyArXHJcbiAgICAgICAgICAgICd0aHJ1c3Rfc2xhdmU6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAncGl0Y2hfc2xhdmU6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAncm9sbF9zbGF2ZTogUElEU2V0dGluZ3MsJyArXHJcbiAgICAgICAgICAgICd5YXdfc2xhdmU6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAndGhydXN0X2dhaW46IGYzMiwnICtcclxuICAgICAgICAgICAgJ3BpdGNoX2dhaW46IGYzMiwnICtcclxuICAgICAgICAgICAgJ3JvbGxfZ2FpbjogZjMyLCcgK1xyXG4gICAgICAgICAgICAneWF3X2dhaW46IGYzMiwnICtcclxuICAgICAgICAgICAgJ3BpZF9ieXBhc3M6IHU4IH07JztcclxuXHJcbiAgICAgICAgdmFyIHN0YXRlUGFyYW1ldGVycyA9ICdTdGF0ZVBhcmFtZXRlcnMgPSB7IHN0YXRlX2VzdGltYXRpb246IFtmMzI6Ml0sIGVuYWJsZTogW2YzMjoyXSB9Oyc7XHJcblxyXG4gICAgICAgIHZhciBjb2xvciA9ICdDb2xvciA9IHsgcmVkOiB1OCwgZ3JlZW46IHU4LCBibHVlOiB1OCB9Oyc7XHJcbiAgICAgICAgdmFyIGxlZFN0YXRlQ2FzZSA9ICdMRURTdGF0ZUNhc2UgPSB7JyArXHJcbiAgICAgICAgICAgICdzdGF0dXM6IHUxNiwnICtcclxuICAgICAgICAgICAgJ3BhdHRlcm46IHU4LCcgK1xyXG4gICAgICAgICAgICAnY29sb3JfcmlnaHRfZnJvbnQ6IENvbG9yLCcgK1xyXG4gICAgICAgICAgICAnY29sb3JfcmlnaHRfYmFjazogQ29sb3IsJyArXHJcbiAgICAgICAgICAgICdjb2xvcl9sZWZ0X2Zyb250OiBDb2xvciwnICtcclxuICAgICAgICAgICAgJ2NvbG9yX2xlZnRfYmFjazogQ29sb3IsJyArXHJcbiAgICAgICAgICAgICdpbmRpY2F0b3JfcmVkOiBib29sLCcgK1xyXG4gICAgICAgICAgICAnaW5kaWNhdG9yX2dyZWVuOiBib29sIH07JztcclxuICAgICAgICB2YXIgbGVkU3RhdGVzID0gJ0xFRFN0YXRlcyA9IHsgc3RhdGVzOiBbLzE2L0xFRFN0YXRlQ2FzZToxNl0gfTsnO1xyXG4gICAgICAgIHZhciBsZWRTdGF0ZXNGaXhlZCA9ICdMRURTdGF0ZXNGaXhlZCA9IHsgc3RhdGVzOiBbTEVEU3RhdGVDYXNlOjE2XSB9Oyc7XHJcblxyXG4gICAgICAgIHZhciBkZXZpY2VOYW1lID0gJ0RldmljZU5hbWUgPSB7IHZhbHVlOiBzOSB9Oyc7XHJcblxyXG4gICAgICAgIHZhciB2ZWxvY2l0eVBpZFBhcmFtZXRlcnMgPSAnVmVsb2NpdHlQSURQYXJhbWV0ZXJzID0geycgK1xyXG4gICAgICAgICAgICAnZm9yd2FyZF9tYXN0ZXI6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAncmlnaHRfbWFzdGVyOiBQSURTZXR0aW5ncywnICtcclxuICAgICAgICAgICAgJ3VwX21hc3RlcjogUElEU2V0dGluZ3MsJyArXHJcbiAgICAgICAgICAgICdmb3J3YXJkX3NsYXZlOiBQSURTZXR0aW5ncywnICtcclxuICAgICAgICAgICAgJ3JpZ2h0X3NsYXZlOiBQSURTZXR0aW5ncywnICtcclxuICAgICAgICAgICAgJ3VwX3NsYXZlOiBQSURTZXR0aW5ncywnICtcclxuICAgICAgICAgICAgJ3BpZF9ieXBhc3M6IHU4IH07JztcclxuXHJcbiAgICAgICAgdmFyIGluZXJ0aWFsQmlhcyA9ICdJbmVydGlhbEJpYXMgPSB7IGFjY2VsOiBWZWN0b3IzZiwgZ3lybzogVmVjdG9yM2YgfTsnO1xyXG5cclxuICAgICAgICB2YXIgY29uZmlnMTQxNSA9ICdDb25maWd1cmF0aW9uID0gey8xNi8nICtcclxuICAgICAgICAgICAgJ3ZlcnNpb246IFZlcnNpb24sJyArXHJcbiAgICAgICAgICAgICdjb25maWdfaWQ6IENvbmZpZ0lELCcgK1xyXG4gICAgICAgICAgICAncGNiX3RyYW5zZm9ybTogUGNiVHJhbnNmb3JtLCcgK1xyXG4gICAgICAgICAgICAnbWl4X3RhYmxlOiBNaXhUYWJsZSwnICtcclxuICAgICAgICAgICAgJ21hZ19iaWFzOiBNYWdCaWFzLCcgK1xyXG4gICAgICAgICAgICAnY2hhbm5lbDogQ2hhbm5lbFByb3BlcnRpZXMsJyArXHJcbiAgICAgICAgICAgICdwaWRfcGFyYW1ldGVyczogUElEUGFyYW1ldGVycywnICtcclxuICAgICAgICAgICAgJ3N0YXRlX3BhcmFtZXRlcnM6IFN0YXRlUGFyYW1ldGVycywnICtcclxuICAgICAgICAgICAgJ2xlZF9zdGF0ZXM6IExFRFN0YXRlcywnICtcclxuICAgICAgICAgICAgJ2RldmljZV9uYW1lOiBEZXZpY2VOYW1lIH07JztcclxuXHJcbiAgICAgICAgdmFyIGNvbmZpZ0ZpeGVkMTQxNSA9ICdDb25maWd1cmF0aW9uRml4ZWQgPSB7JyArXHJcbiAgICAgICAgICAgICd2ZXJzaW9uOiBWZXJzaW9uLCcgK1xyXG4gICAgICAgICAgICAnY29uZmlnX2lkOiBDb25maWdJRCwnICtcclxuICAgICAgICAgICAgJ3BjYl90cmFuc2Zvcm06IFBjYlRyYW5zZm9ybSwnICtcclxuICAgICAgICAgICAgJ21peF90YWJsZTogTWl4VGFibGUsJyArXHJcbiAgICAgICAgICAgICdtYWdfYmlhczogTWFnQmlhcywnICtcclxuICAgICAgICAgICAgJ2NoYW5uZWw6IENoYW5uZWxQcm9wZXJ0aWVzLCcgK1xyXG4gICAgICAgICAgICAncGlkX3BhcmFtZXRlcnM6IFBJRFBhcmFtZXRlcnMsJyArXHJcbiAgICAgICAgICAgICdzdGF0ZV9wYXJhbWV0ZXJzOiBTdGF0ZVBhcmFtZXRlcnMsJyArXHJcbiAgICAgICAgICAgICdsZWRfc3RhdGVzOiBMRURTdGF0ZXNGaXhlZCwnICtcclxuICAgICAgICAgICAgJ2RldmljZV9uYW1lOiBEZXZpY2VOYW1lIH07JztcclxuXHJcbiAgICAgICAgdmFyIGNvbmZpZyA9ICdDb25maWd1cmF0aW9uID0gey8xNi8nICtcclxuICAgICAgICAgICAgJ3ZlcnNpb246IFZlcnNpb24sJyArXHJcbiAgICAgICAgICAgICdjb25maWdfaWQ6IENvbmZpZ0lELCcgK1xyXG4gICAgICAgICAgICAncGNiX3RyYW5zZm9ybTogUGNiVHJhbnNmb3JtLCcgK1xyXG4gICAgICAgICAgICAnbWl4X3RhYmxlOiBNaXhUYWJsZSwnICtcclxuICAgICAgICAgICAgJ21hZ19iaWFzOiBNYWdCaWFzLCcgK1xyXG4gICAgICAgICAgICAnY2hhbm5lbDogQ2hhbm5lbFByb3BlcnRpZXMsJyArXHJcbiAgICAgICAgICAgICdwaWRfcGFyYW1ldGVyczogUElEUGFyYW1ldGVycywnICtcclxuICAgICAgICAgICAgJ3N0YXRlX3BhcmFtZXRlcnM6IFN0YXRlUGFyYW1ldGVycywnICtcclxuICAgICAgICAgICAgJ2xlZF9zdGF0ZXM6IExFRFN0YXRlcywnICtcclxuICAgICAgICAgICAgJ2RldmljZV9uYW1lOiBEZXZpY2VOYW1lLCcgK1xyXG4gICAgICAgICAgICAndmVsb2NpdHlfcGlkX3BhcmFtZXRlcnM6IFZlbG9jaXR5UElEUGFyYW1ldGVycywnICtcclxuICAgICAgICAgICAgJ2luZXJ0aWFsX2JpYXM6IEluZXJ0aWFsQmlhcyB9Oyc7XHJcblxyXG4gICAgICAgIHZhciBjb25maWdGaXhlZCA9ICdDb25maWd1cmF0aW9uRml4ZWQgPSB7JyArXHJcbiAgICAgICAgICAgICd2ZXJzaW9uOiBWZXJzaW9uLCcgK1xyXG4gICAgICAgICAgICAnY29uZmlnX2lkOiBDb25maWdJRCwnICtcclxuICAgICAgICAgICAgJ3BjYl90cmFuc2Zvcm06IFBjYlRyYW5zZm9ybSwnICtcclxuICAgICAgICAgICAgJ21peF90YWJsZTogTWl4VGFibGUsJyArXHJcbiAgICAgICAgICAgICdtYWdfYmlhczogTWFnQmlhcywnICtcclxuICAgICAgICAgICAgJ2NoYW5uZWw6IENoYW5uZWxQcm9wZXJ0aWVzLCcgK1xyXG4gICAgICAgICAgICAncGlkX3BhcmFtZXRlcnM6IFBJRFBhcmFtZXRlcnMsJyArXHJcbiAgICAgICAgICAgICdzdGF0ZV9wYXJhbWV0ZXJzOiBTdGF0ZVBhcmFtZXRlcnMsJyArXHJcbiAgICAgICAgICAgICdsZWRfc3RhdGVzOiBMRURTdGF0ZXNGaXhlZCwnICtcclxuICAgICAgICAgICAgJ2RldmljZV9uYW1lOiBEZXZpY2VOYW1lLCcgK1xyXG4gICAgICAgICAgICAndmVsb2NpdHlfcGlkX3BhcmFtZXRlcnM6IFZlbG9jaXR5UElEUGFyYW1ldGVycywnICtcclxuICAgICAgICAgICAgJ2luZXJ0aWFsX2JpYXM6IEluZXJ0aWFsQmlhcyB9Oyc7XHJcblxyXG4gICAgICAgIHZhciBjb25maWdGbGFnMTQgPSAnQ29uZmlndXJhdGlvbkZsYWcgPSB7LzE2LycgK1xyXG4gICAgICAgICAgICAndmVyc2lvbjogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2NvbmZpZ19pZDogdm9pZCwnICtcclxuICAgICAgICAgICAgJ3BjYl90cmFuc2Zvcm06IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdtaXhfdGFibGU6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdtYWdfYmlhczogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2NoYW5uZWw6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdwaWRfcGFyYW1ldGVyczogdm9pZCwnICtcclxuICAgICAgICAgICAgJ3N0YXRlX3BhcmFtZXRlcnM6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdsZWRfc3RhdGVzOiBbLy8gdm9pZDoxNl0sJyArXHJcbiAgICAgICAgICAgICdkZXZpY2VfbmFtZTogdm9pZH07JztcclxuXHJcbiAgICAgICAgdmFyIGNvbmZpZ0ZsYWcgPSAnQ29uZmlndXJhdGlvbkZsYWcgPSB7LzE2LycgK1xyXG4gICAgICAgICAgICAndmVyc2lvbjogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2NvbmZpZ19pZDogdm9pZCwnICtcclxuICAgICAgICAgICAgJ3BjYl90cmFuc2Zvcm06IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdtaXhfdGFibGU6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdtYWdfYmlhczogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2NoYW5uZWw6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdwaWRfcGFyYW1ldGVyczogdm9pZCwnICtcclxuICAgICAgICAgICAgJ3N0YXRlX3BhcmFtZXRlcnM6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdsZWRfc3RhdGVzOiBbLy8gdm9pZDoxNl0sJyArXHJcbiAgICAgICAgICAgICdkZXZpY2VfbmFtZTogdm9pZCwnICtcclxuICAgICAgICAgICAgJ3ZlbG9jaXR5X3BpZF9wYXJhbWV0ZXJzOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnaW5lcnRpYWxfYmlhczogdm9pZCB9Oyc7XHJcblxyXG4gICAgICAgIHZhciBjb25maWdGdWxsMTQgPSB2ZWN0b3IzZiArIHBpZFNldHRpbmdzICsgdmVyc2lvbiArIGNvbmZpZ0lkICsgcGNiVHJhbnNmb3JtICtcclxuICAgICAgICAgICAgbWl4VGFibGUgKyBtYWdCaWFzICsgY2hhbm5lbFByb3BlcnRpZXMgKyBwaWRQYXJhbWV0ZXJzMTQgKyBzdGF0ZVBhcmFtZXRlcnMgK1xyXG4gICAgICAgICAgICBjb2xvciArIGxlZFN0YXRlQ2FzZSArIGxlZFN0YXRlcyArIGxlZFN0YXRlc0ZpeGVkICsgZGV2aWNlTmFtZSArXHJcbiAgICAgICAgICAgIGNvbmZpZzE0MTUgKyBjb25maWdGaXhlZDE0MTUgKyBjb25maWdGbGFnMTQ7XHJcbiAgICAgICAgdmFyIGNvbmZpZ0Z1bGwxNSA9IHZlY3RvcjNmICsgcGlkU2V0dGluZ3MgKyB2ZXJzaW9uICsgY29uZmlnSWQgKyBwY2JUcmFuc2Zvcm0gKyBtaXhUYWJsZSArXHJcbiAgICAgICAgICAgIG1hZ0JpYXMgKyBjaGFubmVsUHJvcGVydGllcyArIHBpZFBhcmFtZXRlcnMgKyBzdGF0ZVBhcmFtZXRlcnMgK1xyXG4gICAgICAgICAgICBjb2xvciArIGxlZFN0YXRlQ2FzZSArIGxlZFN0YXRlcyArIGxlZFN0YXRlc0ZpeGVkICsgZGV2aWNlTmFtZSArXHJcbiAgICAgICAgICAgIGNvbmZpZzE0MTUgKyBjb25maWdGaXhlZDE0MTUgKyBjb25maWdGbGFnO1xyXG4gICAgICAgIHZhciBjb25maWdGdWxsMTYgPSB2ZWN0b3IzZiArIHBpZFNldHRpbmdzICsgdmVyc2lvbiArIGNvbmZpZ0lkICsgcGNiVHJhbnNmb3JtICsgbWl4VGFibGUgK1xyXG4gICAgICAgICAgICBtYWdCaWFzICsgY2hhbm5lbFByb3BlcnRpZXMgKyBwaWRQYXJhbWV0ZXJzICsgc3RhdGVQYXJhbWV0ZXJzICtcclxuICAgICAgICAgICAgY29sb3IgKyBsZWRTdGF0ZUNhc2UgKyBsZWRTdGF0ZXMgKyBsZWRTdGF0ZXNGaXhlZCArIGRldmljZU5hbWUgK1xyXG4gICAgICAgICAgICBpbmVydGlhbEJpYXMgKyB2ZWxvY2l0eVBpZFBhcmFtZXRlcnMgK1xyXG4gICAgICAgICAgICBjb25maWcgKyBjb25maWdGaXhlZCArIGNvbmZpZ0ZsYWc7XHJcblxyXG4gICAgICAgIHZhciBzdGF0ZSA9ICdSb3RhdGlvbiA9IHsgcm9sbDogZjMyLCBwaXRjaDogZjMyLCB5YXc6IGYzMiB9OycgK1xyXG4gICAgICAgICAgICAnUElEU3RhdGUgPSB7JyArXHJcbiAgICAgICAgICAgICd0aW1lc3RhbXBfdXM6IHUzMiwnICtcclxuICAgICAgICAgICAgJ2lucHV0OiBmMzIsJyArXHJcbiAgICAgICAgICAgICdzZXRwb2ludDogZjMyLCcgK1xyXG4gICAgICAgICAgICAncF90ZXJtOiBmMzIsJyArXHJcbiAgICAgICAgICAgICdpX3Rlcm06IGYzMiwnICtcclxuICAgICAgICAgICAgJ2RfdGVybTogZjMyIH07JyArXHJcbiAgICAgICAgICAgICdSY0NvbW1hbmQgPSB7IHRocm90dGxlOiBpMTYsIHBpdGNoOiBpMTYsIHJvbGw6IGkxNiwgeWF3OiBpMTYgfTsnICtcclxuICAgICAgICAgICAgJ1N0YXRlID0gey8zMi8nICtcclxuICAgICAgICAgICAgJ3RpbWVzdGFtcF91czogdTMyLCcgK1xyXG4gICAgICAgICAgICAnc3RhdHVzOiB1MTYsJyArXHJcbiAgICAgICAgICAgICd2MF9yYXc6IHUxNiwnICtcclxuICAgICAgICAgICAgJ2kwX3JhdzogdTE2LCcgK1xyXG4gICAgICAgICAgICAnaTFfcmF3OiB1MTYsJyArXHJcbiAgICAgICAgICAgICdhY2NlbDogVmVjdG9yM2YsJyArXHJcbiAgICAgICAgICAgICdneXJvOiBWZWN0b3IzZiwnICtcclxuICAgICAgICAgICAgJ21hZzogVmVjdG9yM2YsJyArXHJcbiAgICAgICAgICAgICd0ZW1wZXJhdHVyZTogdTE2LCcgK1xyXG4gICAgICAgICAgICAncHJlc3N1cmU6IHUzMiwnICtcclxuICAgICAgICAgICAgJ3BwbTogW2kxNjo2XSwnICtcclxuICAgICAgICAgICAgJ2F1eF9jaGFuX21hc2s6IHU4LCcgK1xyXG4gICAgICAgICAgICAnY29tbWFuZDogUmNDb21tYW5kLCcgK1xyXG4gICAgICAgICAgICAnY29udHJvbDogeyBmejogZjMyLCB0eDogZjMyLCB0eTogZjMyLCB0ejogZjMyIH0sJyArXHJcbiAgICAgICAgICAgICdwaWRfbWFzdGVyX2Z6OiBQSURTdGF0ZSwnICtcclxuICAgICAgICAgICAgJ3BpZF9tYXN0ZXJfdHg6IFBJRFN0YXRlLCcgK1xyXG4gICAgICAgICAgICAncGlkX21hc3Rlcl90eTogUElEU3RhdGUsJyArXHJcbiAgICAgICAgICAgICdwaWRfbWFzdGVyX3R6OiBQSURTdGF0ZSwnICtcclxuICAgICAgICAgICAgJ3BpZF9zbGF2ZV9mejogUElEU3RhdGUsJyArXHJcbiAgICAgICAgICAgICdwaWRfc2xhdmVfdHg6IFBJRFN0YXRlLCcgK1xyXG4gICAgICAgICAgICAncGlkX3NsYXZlX3R5OiBQSURTdGF0ZSwnICtcclxuICAgICAgICAgICAgJ3BpZF9zbGF2ZV90ejogUElEU3RhdGUsJyArXHJcbiAgICAgICAgICAgICdtb3Rvcl9vdXQ6IFtpMTY6OF0sJyArXHJcbiAgICAgICAgICAgICdraW5lbWF0aWNzX2FuZ2xlOiBSb3RhdGlvbiwnICtcclxuICAgICAgICAgICAgJ2tpbmVtYXRpY3NfcmF0ZTogUm90YXRpb24sJyArXHJcbiAgICAgICAgICAgICdraW5lbWF0aWNzX2FsdGl0dWRlOiBmMzIsJyArXHJcbiAgICAgICAgICAgICdsb29wX2NvdW50OiB1MzIgfTsnO1xyXG5cclxuICAgICAgICB2YXIgYXV4TWFzayA9ICdBdXhNYXNrID0gey8vJyArXHJcbiAgICAgICAgICAgICdhdXgxX2xvdzogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2F1eDFfbWlkOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnYXV4MV9oaWdoOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnYXV4Ml9sb3c6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdhdXgyX21pZDogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2F1eDJfaGlnaDogdm9pZCB9Oyc7XHJcblxyXG4gICAgICAgIHZhciBjb21tYW5kcyA9IGF1eE1hc2sgKyAnQ29tbWFuZCA9IHsvMzIvJyArXHJcbiAgICAgICAgICAgICdyZXF1ZXN0X3Jlc3BvbnNlOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnc2V0X2VlcHJvbV9kYXRhOiBDb25maWd1cmF0aW9uRml4ZWQsJyArXHJcbiAgICAgICAgICAgICdyZWluaXRfZWVwcm9tX2RhdGE6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdyZXF1ZXN0X2VlcHJvbV9kYXRhOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAncmVxdWVzdF9lbmFibGVfaXRlcmF0aW9uOiB1OCwnICtcclxuICAgICAgICAgICAgJ21vdG9yX292ZXJyaWRlX3NwZWVkXzA6IHUxNiwnICtcclxuICAgICAgICAgICAgJ21vdG9yX292ZXJyaWRlX3NwZWVkXzE6IHUxNiwnICtcclxuICAgICAgICAgICAgJ21vdG9yX292ZXJyaWRlX3NwZWVkXzI6IHUxNiwnICtcclxuICAgICAgICAgICAgJ21vdG9yX292ZXJyaWRlX3NwZWVkXzM6IHUxNiwnICtcclxuICAgICAgICAgICAgJ21vdG9yX292ZXJyaWRlX3NwZWVkXzQ6IHUxNiwnICtcclxuICAgICAgICAgICAgJ21vdG9yX292ZXJyaWRlX3NwZWVkXzU6IHUxNiwnICtcclxuICAgICAgICAgICAgJ21vdG9yX292ZXJyaWRlX3NwZWVkXzY6IHUxNiwnICtcclxuICAgICAgICAgICAgJ21vdG9yX292ZXJyaWRlX3NwZWVkXzc6IHUxNiwnICtcclxuICAgICAgICAgICAgJ3NldF9jb21tYW5kX292ZXJyaWRlOiBib29sLCcgK1xyXG4gICAgICAgICAgICAnc2V0X3N0YXRlX21hc2s6IHUzMiwnICtcclxuICAgICAgICAgICAgJ3NldF9zdGF0ZV9kZWxheTogdTE2LCcgK1xyXG4gICAgICAgICAgICAnc2V0X3NkX3dyaXRlX2RlbGF5OiB1MTYsJyArXHJcbiAgICAgICAgICAgICdzZXRfbGVkOiB7JyArXHJcbiAgICAgICAgICAgICcgIHBhdHRlcm46IHU4LCcgK1xyXG4gICAgICAgICAgICAnICBjb2xvcl9yaWdodDogQ29sb3IsJyArXHJcbiAgICAgICAgICAgICcgIGNvbG9yX2xlZnQ6IENvbG9yLCcgK1xyXG4gICAgICAgICAgICAnICBpbmRpY2F0b3JfcmVkOiBib29sLCcgK1xyXG4gICAgICAgICAgICAnICBpbmRpY2F0b3JfZ3JlZW46IGJvb2wgfSwnICtcclxuICAgICAgICAgICAgJ3NldF9zZXJpYWxfcmM6IHsgZW5hYmxlZDogYm9vbCwgY29tbWFuZDogUmNDb21tYW5kLCBhdXhfbWFzazogQXV4TWFzayB9LCcgK1xyXG4gICAgICAgICAgICAnc2V0X2NhcmRfcmVjb3JkaW5nX3N0YXRlOiB7LzgvIHJlY29yZF90b19jYXJkOiB2b2lkLCBsb2NrX3JlY29yZGluZ19zdGF0ZTogdm9pZCB9LCcgK1xyXG4gICAgICAgICAgICAnc2V0X3BhcnRpYWxfZWVwcm9tX2RhdGE6IENvbmZpZ3VyYXRpb24sJyArXHJcbiAgICAgICAgICAgICdyZWluaXRfcGFydGlhbF9lZXByb21fZGF0YTogQ29uZmlndXJhdGlvbkZsYWcsJyArXHJcbiAgICAgICAgICAgICdyZXFfcGFydGlhbF9lZXByb21fZGF0YTogQ29uZmlndXJhdGlvbkZsYWcsJyArXHJcbiAgICAgICAgICAgICdyZXFfY2FyZF9yZWNvcmRpbmdfc3RhdGU6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdzZXRfcGFydGlhbF90ZW1wb3JhcnlfY29uZmlnOiBDb25maWd1cmF0aW9uLCcgK1xyXG4gICAgICAgICAgICAnc2V0X2NvbW1hbmRfc291cmNlczogey84LyBzZXJpYWw6IHZvaWQsIHJhZGlvOiB2b2lkIH0sJyArXHJcbiAgICAgICAgICAgICdzZXRfY2FsaWJyYXRpb246IHsgZW5hYmxlZDogYm9vbCwgbW9kZTogdTggfSwnICtcclxuICAgICAgICAgICAgJ3NldF9hdXRvcGlsb3RfZW5hYmxlZDogYm9vbCwnICtcclxuICAgICAgICAgICAgJ3NldF91c2JfbW9kZTogdTh9Oyc7XHJcblxyXG4gICAgICAgIHZhciBkZWJ1Z1N0cmluZyA9IFwiRGVidWdTdHJpbmcgPSB7IGRlcHJpY2F0ZWRfbWFzazogdTMyLCBtZXNzYWdlOiBzIH07XCI7XHJcbiAgICAgICAgdmFyIGhpc3RvcnlEYXRhID0gXCJIaXN0b3J5RGF0YSA9IERlYnVnU3RyaW5nO1wiO1xyXG4gICAgICAgIHZhciByZXNwb25zZSA9IFwiUmVzcG9uc2UgPSB7IG1hc2s6IHUzMiwgYWNrOiB1MzIgfTtcIjtcclxuXHJcbiAgICAgICAgdmFyIGhhbmRsZXIxNCA9IGNvbmZpZ0Z1bGwxNCArIHN0YXRlICsgY29tbWFuZHMgKyBkZWJ1Z1N0cmluZyArIGhpc3RvcnlEYXRhICsgcmVzcG9uc2U7XHJcbiAgICAgICAgdmFyIGhhbmRsZXIxNSA9IGNvbmZpZ0Z1bGwxNSArIHN0YXRlICsgY29tbWFuZHMgKyBkZWJ1Z1N0cmluZyArIGhpc3RvcnlEYXRhICsgcmVzcG9uc2U7XHJcbiAgICAgICAgdmFyIGhhbmRsZXIxNiA9IGNvbmZpZ0Z1bGwxNiArIHN0YXRlICsgY29tbWFuZHMgKyBkZWJ1Z1N0cmluZyArIGhpc3RvcnlEYXRhICsgcmVzcG9uc2U7XHJcblxyXG4gICAgICAgIGhhbmRsZXJDYWNoZVsnMS40LjAnXSA9IEZseWJyaXhTZXJpYWxpemF0aW9uLnBhcnNlKGhhbmRsZXIxNCk7XHJcbiAgICAgICAgaGFuZGxlckNhY2hlWycxLjUuMCddID0gaGFuZGxlckNhY2hlWycxLjUuMSddID0gRmx5YnJpeFNlcmlhbGl6YXRpb24ucGFyc2UoaGFuZGxlcjE1KTtcclxuICAgICAgICBoYW5kbGVyQ2FjaGVbJzEuNi4wJ10gPSBGbHlicml4U2VyaWFsaXphdGlvbi5wYXJzZShoYW5kbGVyMTYpO1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBTZXJpYWxpemVyOiBGbHlicml4U2VyaWFsaXphdGlvbi5TZXJpYWxpemVyLFxyXG4gICAgICAgICAgICBnZXRIYW5kbGVyOiBmdW5jdGlvbiAoZmlybXdhcmUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBoYW5kbGVyQ2FjaGVbZmlybXdhcmVdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbn0oKSk7XHJcbiJdfQ==
