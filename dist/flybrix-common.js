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
            return serial.send(serial.field.COM_SET_CALIBRATION, [1, 0], false);
        }

        function calibrateAccelerometer(poseDescription, poseId) {
            commandLog("Calibrating gravity for pose: " + poseDescription);
            return serial.send(serial.field.COM_SET_CALIBRATION,
                [1, poseId + 1], false);
        }

        function finish() {
            commandLog("Finishing calibration");
            return serial.send(serial.field.COM_SET_CALIBRATION, [0, 0], false);
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
            commandLog('Requesting current configuration data...');
            return serial.send(serial.field.COM_REQ_PARTIAL_EEPROM_DATA, [255, 255, 255, 255], false);
        }

        function reinit() {
            commandLog('Setting factory default configuration data...');
            return serial.send(serial.field.COM_REINIT_EEPROM_DATA, [], false)
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

        var defaultConfigHandler = serializationHandler[desiredKey];
        var currentConfigHandler = defaultConfigHandler;
        var defaultSerializationHandler = serializationHandler[desiredKey];
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
                    serializationHandler[key] || defaultSerializationHandler;
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

    rcData.$inject = ['serial', 'encodable', 'firmwareVersion'];

    function rcData(serial, encodable, firmwareVersion) {
        var AUX = {
            LOW: 0,
            MID: 1,
            HIGH: 2,
        };

        var throttle = -1;
        var pitch = 0;
        var roll = 0;
        var yaw = 0;
        // defaults to high -- low is enabling; high is disabling
        var aux1 = AUX.HIGH;
        // defaults to ?? -- need to check transmitter behavior
        var aux2 = AUX.HIGH;

        var urgent = true;

        var commandHandler = firmwareVersion.RcCommand;

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

            // Set RC to enabled
            var response = {enabled: true};
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

            response.command = command;

            // aux format is
            // {AUX1_low, AUX1_mid, AUX1_high,
            //  AUX2_low, AUX2_mid, AUX2_high,
            //  x, x} (LSB-->MSB)
            response.auxcode = (1 << aux1) + (1 << (aux2 + 3));

            var handler = firmwareVersion.serializationHandler();

            var data = new Uint8Array(handler.Commands.byteCount);
            rcHandler.encode(
                new DataView(data.buffer), new encodable.Serializer(),
                response);
            return serial.send(serial.field.COM_SET_SERIAL_RC, data, false);
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
            aux1 = v;
        }

        function setAux2(v) {
            aux2 = v;
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

        var commands = 'Commands = {/32/' +
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
            'set_serial_rc: { enabled: bool, command: RcCommand, aux_mask: u8 },' +
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
            getHandler: function (firmware) {
                return handlerCache[firmware];
            }
        };
    }

}());

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZS5qcyIsImNhbGlicmF0aW9uLmpzIiwiY29icy5qcyIsImNvbW1hbmRMb2cuanMiLCJjb25maWdIYW5kbGVyLmpzIiwiZGV2aWNlQ29uZmlnLmpzIiwiZW5jb2RhYmxlLmpzIiwiZmlybXdhcmVWZXJzaW9uLmpzIiwibGVkLmpzIiwicGFyc2VyLmpzIiwicHJlc2V0cy5qcyIsInJjRGF0YS5qcyIsInNlcmlhbC5qcyIsInNlcmlhbGl6YXRpb25IYW5kbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25kQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDak9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZmx5YnJpeC1jb21tb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ2ZseWJyaXhDb21tb24nLCBbXSk7XHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgnZmx5YnJpeENvbW1vbicpLmZhY3RvcnkoJ2NhbGlicmF0aW9uJywgY2FsaWJyYXRpb24pO1xyXG5cclxuICAgIGNhbGlicmF0aW9uLiRpbmplY3QgPSBbJ2NvbW1hbmRMb2cnLCAnc2VyaWFsJ107XHJcblxyXG4gICAgZnVuY3Rpb24gY2FsaWJyYXRpb24oY29tbWFuZExvZywgc2VyaWFsKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgbWFnbmV0b21ldGVyOiBtYWduZXRvbWV0ZXIsXHJcbiAgICAgICAgICAgIGFjY2VsZXJvbWV0ZXI6IHtcclxuICAgICAgICAgICAgICAgIGZsYXQ6IGNhbGlicmF0ZUFjY2VsZXJvbWV0ZXIuYmluZChudWxsLCAnZmxhdCcsIDApLFxyXG4gICAgICAgICAgICAgICAgZm9yd2FyZDogY2FsaWJyYXRlQWNjZWxlcm9tZXRlci5iaW5kKG51bGwsICdsZWFuIGZvcndhcmQnLCAxKSxcclxuICAgICAgICAgICAgICAgIGJhY2s6IGNhbGlicmF0ZUFjY2VsZXJvbWV0ZXIuYmluZChudWxsLCAnbGVhbiBiYWNrJywgMiksXHJcbiAgICAgICAgICAgICAgICByaWdodDogY2FsaWJyYXRlQWNjZWxlcm9tZXRlci5iaW5kKG51bGwsICdsZWFuIHJpZ2h0JywgMyksXHJcbiAgICAgICAgICAgICAgICBsZWZ0OiBjYWxpYnJhdGVBY2NlbGVyb21ldGVyLmJpbmQobnVsbCwgJ2xlYW4gbGVmdCcsIDQpLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBmaW5pc2g6IGZpbmlzaCxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBtYWduZXRvbWV0ZXIoKSB7XHJcbiAgICAgICAgICAgIGNvbW1hbmRMb2coXCJDYWxpYnJhdGluZyBtYWduZXRvbWV0ZXIgYmlhc1wiKTtcclxuICAgICAgICAgICAgcmV0dXJuIHNlcmlhbC5zZW5kKHNlcmlhbC5maWVsZC5DT01fU0VUX0NBTElCUkFUSU9OLCBbMSwgMF0sIGZhbHNlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGNhbGlicmF0ZUFjY2VsZXJvbWV0ZXIocG9zZURlc2NyaXB0aW9uLCBwb3NlSWQpIHtcclxuICAgICAgICAgICAgY29tbWFuZExvZyhcIkNhbGlicmF0aW5nIGdyYXZpdHkgZm9yIHBvc2U6IFwiICsgcG9zZURlc2NyaXB0aW9uKTtcclxuICAgICAgICAgICAgcmV0dXJuIHNlcmlhbC5zZW5kKHNlcmlhbC5maWVsZC5DT01fU0VUX0NBTElCUkFUSU9OLFxyXG4gICAgICAgICAgICAgICAgWzEsIHBvc2VJZCArIDFdLCBmYWxzZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBmaW5pc2goKSB7XHJcbiAgICAgICAgICAgIGNvbW1hbmRMb2coXCJGaW5pc2hpbmcgY2FsaWJyYXRpb25cIik7XHJcbiAgICAgICAgICAgIHJldHVybiBzZXJpYWwuc2VuZChzZXJpYWwuZmllbGQuQ09NX1NFVF9DQUxJQlJBVElPTiwgWzAsIDBdLCBmYWxzZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KCkpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ2ZseWJyaXhDb21tb24nKS5mYWN0b3J5KCdjb2JzJywgY29icyk7XHJcblxyXG4gICAgZnVuY3Rpb24gY29icygpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBSZWFkZXI6IFJlYWRlcixcclxuICAgICAgICAgICAgZW5jb2RlOiBlbmNvZGUsXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgZnVuY3Rpb24gUmVhZGVyKGNhcGFjaXR5KSB7XHJcbiAgICAgICAgaWYgKGNhcGFjaXR5ID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgY2FwYWNpdHkgPSAyMDAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLk4gPSBjYXBhY2l0eTtcclxuICAgICAgICB0aGlzLmJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KGNhcGFjaXR5KTtcclxuICAgICAgICB0aGlzLnJlYWR5X2Zvcl9uZXdfbWVzc2FnZSA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5idWZmZXJfbGVuZ3RoID0gMDtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBjb2JzRGVjb2RlKHJlYWRlcikge1xyXG4gICAgICAgIHZhciBzcmNfcHRyID0gMDtcclxuICAgICAgICB2YXIgZHN0X3B0ciA9IDA7XHJcbiAgICAgICAgdmFyIGxlZnRvdmVyX2xlbmd0aCA9IDA7XHJcbiAgICAgICAgdmFyIGFwcGVuZF96ZXJvID0gZmFsc2U7XHJcbiAgICAgICAgd2hpbGUgKHJlYWRlci5idWZmZXJbc3JjX3B0cl0pIHtcclxuICAgICAgICAgICAgaWYgKCFsZWZ0b3Zlcl9sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIGlmIChhcHBlbmRfemVybylcclxuICAgICAgICAgICAgICAgICAgICByZWFkZXIuYnVmZmVyW2RzdF9wdHIrK10gPSAwO1xyXG4gICAgICAgICAgICAgICAgbGVmdG92ZXJfbGVuZ3RoID0gcmVhZGVyLmJ1ZmZlcltzcmNfcHRyKytdIC0gMTtcclxuICAgICAgICAgICAgICAgIGFwcGVuZF96ZXJvID0gbGVmdG92ZXJfbGVuZ3RoIDwgMHhGRTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC0tbGVmdG92ZXJfbGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgcmVhZGVyLmJ1ZmZlcltkc3RfcHRyKytdID0gcmVhZGVyLmJ1ZmZlcltzcmNfcHRyKytdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gbGVmdG92ZXJfbGVuZ3RoID8gMCA6IGRzdF9wdHI7XHJcbiAgICB9XHJcblxyXG4gICAgUmVhZGVyLnByb3RvdHlwZS5BcHBlbmRUb0J1ZmZlciA9IGZ1bmN0aW9uKGRhdGEsIGNhbGxiYWNrLCBvbkVycm9yKSB7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciBjID0gZGF0YVtpXTtcclxuICAgICAgICAgICAgaWYgKHRoaXMucmVhZHlfZm9yX25ld19tZXNzYWdlKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBmaXJzdCBieXRlIG9mIGEgbmV3IG1lc3NhZ2VcclxuICAgICAgICAgICAgICAgIHRoaXMucmVhZHlfZm9yX25ld19tZXNzYWdlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJ1ZmZlcl9sZW5ndGggPSAwO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLmJ1ZmZlclt0aGlzLmJ1ZmZlcl9sZW5ndGgrK10gPSBjO1xyXG5cclxuICAgICAgICAgICAgaWYgKGMgJiYgdGhpcy5idWZmZXJfbGVuZ3RoID09IHRoaXMuTikge1xyXG4gICAgICAgICAgICAgICAgLy8gYnVmZmVyIG92ZXJmbG93LCBwcm9iYWJseSBkdWUgdG8gZXJyb3JzIGluIGRhdGFcclxuICAgICAgICAgICAgICAgIG9uRXJyb3IoJ292ZXJmbG93JywgJ2J1ZmZlciBvdmVyZmxvdyBpbiBDT0JTIGRlY29kaW5nJyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlYWR5X2Zvcl9uZXdfbWVzc2FnZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCFjKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJ1ZmZlcl9sZW5ndGggPSBjb2JzRGVjb2RlKHRoaXMpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGZhaWxlZF9kZWNvZGUgPSAodGhpcy5idWZmZXJfbGVuZ3RoID09PSAwKTtcclxuICAgICAgICAgICAgICAgIGlmIChmYWlsZWRfZGVjb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5idWZmZXJbMF0gPSAxO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaiA9IDE7IGogPCB0aGlzLmJ1ZmZlcl9sZW5ndGg7ICsraikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYnVmZmVyWzBdIF49IHRoaXMuYnVmZmVyW2pdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYnVmZmVyWzBdID09PSAwKSB7ICAvLyBjaGVjayBzdW0gaXMgY29ycmVjdFxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVhZHlfZm9yX25ld19tZXNzYWdlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5idWZmZXJfbGVuZ3RoID4gNSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY29tbWFuZCA9IHRoaXMuYnVmZmVyWzFdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbWFzayA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGsgPSAwOyBrIDwgNDsgKytrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXNrIHw9IHRoaXMuYnVmZmVyW2sgKyAyXSA8PCAoayAqIDgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGNvbW1hbmQsIG1hc2ssXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYnVmZmVyLnN1YmFycmF5KDYsIHRoaXMuYnVmZmVyX2xlbmd0aClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zbGljZSgpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYnVmZmVyKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkVycm9yKCdzaG9ydCcsICdUb28gc2hvcnQgcGFja2V0Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHsgIC8vIGJhZCBjaGVja3N1bVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVhZHlfZm9yX25ld19tZXNzYWdlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgYnl0ZXMgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBtZXNzYWdlID0gXCJcIjtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHRoaXMuYnVmZmVyX2xlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ5dGVzICs9IHRoaXMuYnVmZmVyW2pdICsgXCIsXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UgKz0gU3RyaW5nLmZyb21DaGFyQ29kZSh0aGlzLmJ1ZmZlcltqXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChmYWlsZWRfZGVjb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uRXJyb3IoJ2ZyYW1lJywgJ1VuZXhwZWN0ZWQgZW5kaW5nIG9mIHBhY2tldCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtc2cgPSAnQkFEIENIRUNLU1VNICgnICsgdGhpcy5idWZmZXJfbGVuZ3RoICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcgYnl0ZXMpJyArIGJ5dGVzICsgbWVzc2FnZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgb25FcnJvcignY2hlY2tzdW0nLCBtc2cpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgZnVuY3Rpb24gZW5jb2RlKGJ1Zikge1xyXG4gICAgICAgIHZhciByZXR2YWwgPVxyXG4gICAgICAgICAgICBuZXcgVWludDhBcnJheShNYXRoLmZsb29yKChidWYuYnl0ZUxlbmd0aCAqIDI1NSArIDc2MSkgLyAyNTQpKTtcclxuICAgICAgICB2YXIgbGVuID0gMTtcclxuICAgICAgICB2YXIgcG9zX2N0ciA9IDA7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBidWYubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICAgICAgaWYgKHJldHZhbFtwb3NfY3RyXSA9PSAweEZFKSB7XHJcbiAgICAgICAgICAgICAgICByZXR2YWxbcG9zX2N0cl0gPSAweEZGO1xyXG4gICAgICAgICAgICAgICAgcG9zX2N0ciA9IGxlbisrO1xyXG4gICAgICAgICAgICAgICAgcmV0dmFsW3Bvc19jdHJdID0gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgdmFsID0gYnVmW2ldO1xyXG4gICAgICAgICAgICArK3JldHZhbFtwb3NfY3RyXTtcclxuICAgICAgICAgICAgaWYgKHZhbCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dmFsW2xlbisrXSA9IHZhbDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHBvc19jdHIgPSBsZW4rKztcclxuICAgICAgICAgICAgICAgIHJldHZhbFtwb3NfY3RyXSA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJldHZhbC5zdWJhcnJheSgwLCBsZW4pLnNsaWNlKCkuYnVmZmVyO1xyXG4gICAgfTtcclxufSgpKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdmbHlicml4Q29tbW9uJykuZmFjdG9yeSgnY29tbWFuZExvZycsIGNvbW1hbmRMb2cpO1xyXG5cclxuICAgIGNvbW1hbmRMb2cuJGluamVjdCA9IFsnJHEnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBjb21tYW5kTG9nKCRxKSB7XHJcbiAgICAgICAgdmFyIG1lc3NhZ2VzID0gW107XHJcbiAgICAgICAgdmFyIHJlc3BvbmRlciA9ICRxLmRlZmVyKCk7XHJcblxyXG4gICAgICAgIHZhciBzZXJ2aWNlID0gbG9nO1xyXG4gICAgICAgIHNlcnZpY2UubG9nID0gbG9nO1xyXG4gICAgICAgIHNlcnZpY2UuY2xlYXJTdWJzY3JpYmVycyA9IGNsZWFyU3Vic2NyaWJlcnM7XHJcbiAgICAgICAgc2VydmljZS5vbk1lc3NhZ2UgPSBvbk1lc3NhZ2U7XHJcbiAgICAgICAgc2VydmljZS5yZWFkID0gcmVhZDtcclxuXHJcbiAgICAgICAgcmV0dXJuIHNlcnZpY2U7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGxvZyhtZXNzYWdlKSB7XHJcbiAgICAgICAgICAgIGlmIChtZXNzYWdlICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIG1lc3NhZ2VzLnB1c2gobWVzc2FnZSk7XHJcbiAgICAgICAgICAgICAgICByZXNwb25kZXIubm90aWZ5KHJlYWQoKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHJlYWQoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBtZXNzYWdlcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGNsZWFyU3Vic2NyaWJlcnMoKSB7XHJcbiAgICAgICAgICAgIHJlc3BvbmRlciA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBvbk1lc3NhZ2UoY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbmRlci5wcm9taXNlLnRoZW4odW5kZWZpbmVkLCB1bmRlZmluZWQsIGNhbGxiYWNrKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgnZmx5YnJpeENvbW1vbicpLmZhY3RvcnkoJ2NvbmZpZ0hhbmRsZXInLCBjb25maWdIYW5kbGVyKTtcclxuXHJcbiAgICBjb25maWdIYW5kbGVyLiRpbmplY3QgPSBbJ2VuY29kYWJsZSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGNvbmZpZ0hhbmRsZXIoZW5jb2RhYmxlKSB7XHJcbiAgICAgICAgdmFyIGhhbmRsZXJzID0ge307XHJcblxyXG4gICAgICAgIHZhciBlID0gZW5jb2RhYmxlO1xyXG4gICAgICAgIHZhciBsZWRDb2xvciA9IGUubWFwKFtcclxuICAgICAgICAgICAge2tleTogJ3JlZCcsIGVsZW1lbnQ6IGUuVWludDh9LFxyXG4gICAgICAgICAgICB7a2V5OiAnZ3JlZW4nLCBlbGVtZW50OiBlLlVpbnQ4fSxcclxuICAgICAgICAgICAge2tleTogJ2JsdWUnLCBlbGVtZW50OiBlLlVpbnQ4fSxcclxuICAgICAgICBdKTtcclxuXHJcbiAgICAgICAgdmFyIGxlZFN0YXRlID0gZS5tYXAoW1xyXG4gICAgICAgICAgICB7a2V5OiAnc3RhdHVzJywgZWxlbWVudDogZS5VaW50MTZ9LFxyXG4gICAgICAgICAgICB7a2V5OiAncGF0dGVybicsIGVsZW1lbnQ6IGUuVWludDh9LFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAga2V5OiAnY29sb3JzJyxcclxuICAgICAgICAgICAgICBlbGVtZW50OiBlLm1hcChbXHJcbiAgICAgICAgICAgICAgICAgIHtrZXk6ICdyaWdodF9mcm9udCcsIGVsZW1lbnQ6IGxlZENvbG9yfSxcclxuICAgICAgICAgICAgICAgICAge2tleTogJ3JpZ2h0X2JhY2snLCBlbGVtZW50OiBsZWRDb2xvcn0sXHJcbiAgICAgICAgICAgICAgICAgIHtrZXk6ICdsZWZ0X2Zyb250JywgZWxlbWVudDogbGVkQ29sb3J9LFxyXG4gICAgICAgICAgICAgICAgICB7a2V5OiAnbGVmdF9iYWNrJywgZWxlbWVudDogbGVkQ29sb3J9LFxyXG4gICAgICAgICAgICAgIF0pXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHtrZXk6ICdpbmRpY2F0b3JfcmVkJywgZWxlbWVudDogZS5ib29sfSxcclxuICAgICAgICAgICAge2tleTogJ2luZGljYXRvcl9ncmVlbicsIGVsZW1lbnQ6IGUuYm9vbH0sXHJcbiAgICAgICAgXSk7XHJcblxyXG4gICAgICAgIHZhciBjb29yZDNkID0gZS5hcnJheSgzLCBlLkZsb2F0MzIpO1xyXG5cclxuICAgICAgICB2YXIgdmVyc2lvbiA9IGUuYXJyYXkoMywgZS5VaW50OCk7XHJcbiAgICAgICAgdmFyIGNoYW5uZWxNYXBwaW5nID0gZS5hcnJheSg2LCBlLlVpbnQ4KTtcclxuICAgICAgICB2YXIgY2hhbm5lbE1hcmsgPSBlLmFycmF5KDYsIGUuVWludDE2KTtcclxuICAgICAgICB2YXIgcGlkID0gZS5hcnJheSg3LCBlLkZsb2F0MzIpO1xyXG4gICAgICAgIHZhciBzdFBhcmFtID0gZS5hcnJheSgyLCBlLkZsb2F0MzIpO1xyXG5cclxuICAgICAgICB2YXIgbGVkU3RhdGVzID0gZS5hcnJheSgxNiwgbGVkU3RhdGUsIDE2KTtcclxuXHJcbiAgICAgICAgdmFyIG5hbWUgPSBlLnN0cmluZyg5KTtcclxuXHJcbiAgICAgICAgdmFyIGhhbmRsZXJBcnJheSA9IFtcclxuICAgICAgICAgICAge3BhcnQ6IDAsIGtleTogJ3ZlcnNpb24nLCBlbGVtZW50OiBlLmFycmF5KDMsIGUuVWludDgpfSxcclxuICAgICAgICAgICAge3BhcnQ6IDEsIGtleTogJ2lkJywgZWxlbWVudDogZS5VaW50MzJ9LFxyXG4gICAgICAgICAgICB7cGFydDogMiwga2V5OiAncGNiT3JpZW50YXRpb24nLCBlbGVtZW50OiBjb29yZDNkfSxcclxuICAgICAgICAgICAge3BhcnQ6IDIsIGtleTogJ3BjYlRyYW5zbGF0aW9uJywgZWxlbWVudDogY29vcmQzZH0sXHJcbiAgICAgICAgICAgIHtwYXJ0OiAzLCBrZXk6ICdtaXhUYWJsZUZ6JywgZWxlbWVudDogZS5hcnJheSg4LCBlLkludDgpfSxcclxuICAgICAgICAgICAge3BhcnQ6IDMsIGtleTogJ21peFRhYmxlVHgnLCBlbGVtZW50OiBlLmFycmF5KDgsIGUuSW50OCl9LFxyXG4gICAgICAgICAgICB7cGFydDogMywga2V5OiAnbWl4VGFibGVUeScsIGVsZW1lbnQ6IGUuYXJyYXkoOCwgZS5JbnQ4KX0sXHJcbiAgICAgICAgICAgIHtwYXJ0OiAzLCBrZXk6ICdtaXhUYWJsZVR6JywgZWxlbWVudDogZS5hcnJheSg4LCBlLkludDgpfSxcclxuICAgICAgICAgICAge3BhcnQ6IDQsIGtleTogJ21hZ0JpYXMnLCBlbGVtZW50OiBjb29yZDNkfSxcclxuICAgICAgICAgICAge3BhcnQ6IDUsIGtleTogJ2Fzc2lnbmVkQ2hhbm5lbCcsIGVsZW1lbnQ6IGNoYW5uZWxNYXBwaW5nfSxcclxuICAgICAgICAgICAge3BhcnQ6IDUsIGtleTogJ2NvbW1hbmRJbnZlcnNpb24nLCBlbGVtZW50OiBlLlVpbnQ4fSxcclxuICAgICAgICAgICAge3BhcnQ6IDUsIGtleTogJ2NoYW5uZWxNaWRwb2ludCcsIGVsZW1lbnQ6IGNoYW5uZWxNYXJrfSxcclxuICAgICAgICAgICAge3BhcnQ6IDUsIGtleTogJ2NoYW5uZWxEZWFkem9uZScsIGVsZW1lbnQ6IGNoYW5uZWxNYXJrfSxcclxuICAgICAgICAgICAge3BhcnQ6IDYsIGtleTogJ3RocnVzdE1hc3RlclBJRFBhcmFtZXRlcnMnLCBlbGVtZW50OiBwaWR9LFxyXG4gICAgICAgICAgICB7cGFydDogNiwga2V5OiAncGl0Y2hNYXN0ZXJQSURQYXJhbWV0ZXJzJywgZWxlbWVudDogcGlkfSxcclxuICAgICAgICAgICAge3BhcnQ6IDYsIGtleTogJ3JvbGxNYXN0ZXJQSURQYXJhbWV0ZXJzJywgZWxlbWVudDogcGlkfSxcclxuICAgICAgICAgICAge3BhcnQ6IDYsIGtleTogJ3lhd01hc3RlclBJRFBhcmFtZXRlcnMnLCBlbGVtZW50OiBwaWR9LFxyXG4gICAgICAgICAgICB7cGFydDogNiwga2V5OiAndGhydXN0U2xhdmVQSURQYXJhbWV0ZXJzJywgZWxlbWVudDogcGlkfSxcclxuICAgICAgICAgICAge3BhcnQ6IDYsIGtleTogJ3BpdGNoU2xhdmVQSURQYXJhbWV0ZXJzJywgZWxlbWVudDogcGlkfSxcclxuICAgICAgICAgICAge3BhcnQ6IDYsIGtleTogJ3JvbGxTbGF2ZVBJRFBhcmFtZXRlcnMnLCBlbGVtZW50OiBwaWR9LFxyXG4gICAgICAgICAgICB7cGFydDogNiwga2V5OiAneWF3U2xhdmVQSURQYXJhbWV0ZXJzJywgZWxlbWVudDogcGlkfSxcclxuICAgICAgICAgICAge3BhcnQ6IDYsIGtleTogJ3BpZEJ5cGFzcycsIGVsZW1lbnQ6IGUuVWludDh9LFxyXG4gICAgICAgICAgICB7cGFydDogNywga2V5OiAnc3RhdGVFc3RpbWF0aW9uUGFyYW1ldGVycycsIGVsZW1lbnQ6IHN0UGFyYW19LFxyXG4gICAgICAgICAgICB7cGFydDogNywga2V5OiAnZW5hYmxlUGFyYW1ldGVycycsIGVsZW1lbnQ6IHN0UGFyYW19LFxyXG4gICAgICAgICAgICB7cGFydDogOCwga2V5OiAnbGVkU3RhdGVzJywgZWxlbWVudDogbGVkU3RhdGVzfSxcclxuICAgICAgICAgICAge3BhcnQ6IDksIGtleTogJ25hbWUnLCBlbGVtZW50OiBlLnN0cmluZyg5KX0sXHJcbiAgICAgICAgXTtcclxuXHJcbiAgICAgICAgaGFuZGxlcnNbJzEuNC4wJ10gPSBlLm1hcChoYW5kbGVyQXJyYXkuc2xpY2UoKSwgMTYpO1xyXG5cclxuICAgICAgICB2YXIgZ2FpbkhhbmRsZXJzID0gW1xyXG4gICAgICAgICAgICB7cGFydDogNiwga2V5OiAndGhydXN0R2FpbicsIGVsZW1lbnQ6IGUuRmxvYXQzMn0sXHJcbiAgICAgICAgICAgIHtwYXJ0OiA2LCBrZXk6ICdwaXRjaEdhaW4nLCBlbGVtZW50OiBlLkZsb2F0MzJ9LFxyXG4gICAgICAgICAgICB7cGFydDogNiwga2V5OiAncm9sbEdhaW4nLCBlbGVtZW50OiBlLkZsb2F0MzJ9LFxyXG4gICAgICAgICAgICB7cGFydDogNiwga2V5OiAneWF3R2FpbicsIGVsZW1lbnQ6IGUuRmxvYXQzMn0sXHJcbiAgICAgICAgXTtcclxuXHJcbiAgICAgICAgaGFuZGxlckFycmF5ID0gaGFuZGxlckFycmF5LnNsaWNlKDAsIDIxKS5jb25jYXQoXHJcbiAgICAgICAgICAgIGdhaW5IYW5kbGVycywgaGFuZGxlckFycmF5LnNsaWNlKDIxKSk7XHJcblxyXG4gICAgICAgIGhhbmRsZXJzWycxLjUuMCddID0gZS5tYXAoaGFuZGxlckFycmF5LnNsaWNlKCksIDE2KTtcclxuXHJcbiAgICAgICAgdmFyIHZlbG9jaXR5UGlkSGFuZGxlcnMgPSBbXHJcbiAgICAgICAgICAgIHtwYXJ0OiAxMCwga2V5OiAnZm9yd2FyZE1hc3RlclBJRFBhcmFtZXRlcnMnLCBlbGVtZW50OiBwaWR9LFxyXG4gICAgICAgICAgICB7cGFydDogMTAsIGtleTogJ3JpZ2h0TWFzdGVyUElEUGFyYW1ldGVycycsIGVsZW1lbnQ6IHBpZH0sXHJcbiAgICAgICAgICAgIHtwYXJ0OiAxMCwga2V5OiAndXBNYXN0ZXJQSURQYXJhbWV0ZXJzJywgZWxlbWVudDogcGlkfSxcclxuICAgICAgICAgICAge3BhcnQ6IDEwLCBrZXk6ICdmb3J3YXJkU2xhdmVQSURQYXJhbWV0ZXJzJywgZWxlbWVudDogcGlkfSxcclxuICAgICAgICAgICAge3BhcnQ6IDEwLCBrZXk6ICdyaWdodFNsYXZlUElEUGFyYW1ldGVycycsIGVsZW1lbnQ6IHBpZH0sXHJcbiAgICAgICAgICAgIHtwYXJ0OiAxMCwga2V5OiAndXBTbGF2ZVBJRFBhcmFtZXRlcnMnLCBlbGVtZW50OiBwaWR9LFxyXG4gICAgICAgICAgICB7cGFydDogMTAsIGtleTogJ3ZlbG9jaXR5UGlkQnlwYXNzJywgZWxlbWVudDogZS5VaW50OH0sXHJcbiAgICAgICAgICAgIHtwYXJ0OiAxMSwga2V5OiAnaW5lcnRpYWxCaWFzQWNjZWwnLCBlbGVtZW50OiBjb29yZDNkfSxcclxuICAgICAgICAgICAge3BhcnQ6IDExLCBrZXk6ICdpbmVydGlhbEJpYXNHeXJvJywgZWxlbWVudDogY29vcmQzZH0sXHJcbiAgICAgICAgXTtcclxuXHJcbiAgICAgICAgaGFuZGxlckFycmF5ID0gaGFuZGxlckFycmF5LmNvbmNhdCh2ZWxvY2l0eVBpZEhhbmRsZXJzKTtcclxuXHJcbiAgICAgICAgaGFuZGxlcnNbJzEuNi4wJ10gPSBlLm1hcChoYW5kbGVyQXJyYXkuc2xpY2UoKSwgMTYpO1xyXG5cclxuICAgICAgICByZXR1cm4gaGFuZGxlcnM7XHJcbiAgICB9XHJcblxyXG59KCkpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ2ZseWJyaXhDb21tb24nKS5mYWN0b3J5KCdkZXZpY2VDb25maWcnLCBkZXZpY2VDb25maWcpO1xyXG5cclxuICAgIGRldmljZUNvbmZpZy4kaW5qZWN0ID1cclxuICAgICAgICBbJ3NlcmlhbCcsICdjb21tYW5kTG9nJywgJ2VuY29kYWJsZScsICdmaXJtd2FyZVZlcnNpb24nXTtcclxuXHJcbiAgICBmdW5jdGlvbiBkZXZpY2VDb25maWcoc2VyaWFsLCBjb21tYW5kTG9nLCBlbmNvZGFibGUsIGZpcm13YXJlVmVyc2lvbikge1xyXG4gICAgICAgIHZhciBjb25maWc7XHJcblxyXG4gICAgICAgIHZhciBjb25maWdDYWxsYmFjayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBjb21tYW5kTG9nKCdObyBjYWxsYmFjayBkZWZpbmVkIGZvciByZWNlaXZpbmcgY29uZmlndXJhdGlvbnMhJyk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdmFyIGxvZ2dpbmdDYWxsYmFjayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBjb21tYW5kTG9nKFxyXG4gICAgICAgICAgICAgICAgJ05vIGNhbGxiYWNrIGRlZmluZWQgZm9yIHJlY2VpdmluZyBsb2dnaW5nIHN0YXRlIScgK1xyXG4gICAgICAgICAgICAgICAgJyBDYWxsYmFjayBhcmd1bWVudHM6IChpc0xvZ2dpbmcsIGlzTG9ja2VkLCBkZWxheSknKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgY29uZmlnRmllbGRzID0ge1xyXG4gICAgICAgICAgICBWRVJTSU9OOiAxIDw8IDAsXHJcbiAgICAgICAgICAgIElEOiAxIDw8IDEsXHJcbiAgICAgICAgICAgIFBDQjogMSA8PCAyLFxyXG4gICAgICAgICAgICBNSVhfVEFCTEU6IDEgPDwgMyxcclxuICAgICAgICAgICAgTUFHX0JJQVM6IDEgPDwgNCxcclxuICAgICAgICAgICAgQ0hBTk5FTDogMSA8PCA1LFxyXG4gICAgICAgICAgICBQSURfUEFSQU1FVEVSUzogMSA8PCA2LFxyXG4gICAgICAgICAgICBTVEFURV9QQVJBTUVURVJTOiAxIDw8IDcsXHJcbiAgICAgICAgICAgIExFRF9TVEFURVM6IDEgPDwgOCxcclxuICAgICAgICAgICAgREVWSUNFX05BTUU6IDEgPDwgOSxcclxuICAgICAgICAgICAgVkVMT0NJVFlfUElEX1BBUkFNRVRFUlM6IDEgPDwgMTAsXHJcbiAgICAgICAgICAgIElORVJUSUFMX0JJQVM6IDEgPDwgMTEsXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgc2VyaWFsLnNldENvbW1hbmRDYWxsYmFjayhmdW5jdGlvbihtYXNrLCBtZXNzYWdlX2J1ZmZlcikge1xyXG4gICAgICAgICAgICBpZiAobWFzayAmIHNlcmlhbC5maWVsZC5DT01fU0VUX0VFUFJPTV9EQVRBKSB7XHJcbiAgICAgICAgICAgICAgICBjb21TZXRFZXByb21EYXRhKG1lc3NhZ2VfYnVmZmVyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAobWFzayAmIHNlcmlhbC5maWVsZC5DT01fU0VUX1BBUlRJQUxfRUVQUk9NX0RBVEEpIHtcclxuICAgICAgICAgICAgICAgIGNvbVNldFBhcnRpYWxFZXByb21EYXRhKG1lc3NhZ2VfYnVmZmVyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAobWFzayAmIChzZXJpYWwuZmllbGQuQ09NX1NFVF9DQVJEX1JFQ09SRElORyB8XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlcmlhbC5maWVsZC5DT01fU0VUX1NEX1dSSVRFX0RFTEFZKSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGRhdGFCdWZmZXIgPSBuZXcgVWludDhBcnJheShtZXNzYWdlX2J1ZmZlcik7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0YUJ1ZmZlci5sZW5ndGggPj0gMykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBkZWxheSA9IGRhdGFCdWZmZXJbMF0gfCAoZGF0YUJ1ZmZlclsxXSA8PCA4KTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IGRhdGFCdWZmZXJbMl07XHJcbiAgICAgICAgICAgICAgICAgICAgbG9nZ2luZ0NhbGxiYWNrKChkYXRhICYgMSkgIT09IDAsIChkYXRhICYgMikgIT09IDAsIGRlbGF5KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29tbWFuZExvZygnQmFkIGRhdGEgZ2l2ZW4gZm9yIGxvZ2dpbmcgaW5mbycpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdldERlc2lyZWRWZXJzaW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmlybXdhcmVWZXJzaW9uLmRlc2lyZWQoKTtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICBmdW5jdGlvbiByZXF1ZXN0KCkge1xyXG4gICAgICAgICAgICBjb21tYW5kTG9nKCdSZXF1ZXN0aW5nIGN1cnJlbnQgY29uZmlndXJhdGlvbiBkYXRhLi4uJyk7XHJcbiAgICAgICAgICAgIHJldHVybiBzZXJpYWwuc2VuZChzZXJpYWwuZmllbGQuQ09NX1JFUV9QQVJUSUFMX0VFUFJPTV9EQVRBLCBbMjU1LCAyNTUsIDI1NSwgMjU1XSwgZmFsc2UpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gcmVpbml0KCkge1xyXG4gICAgICAgICAgICBjb21tYW5kTG9nKCdTZXR0aW5nIGZhY3RvcnkgZGVmYXVsdCBjb25maWd1cmF0aW9uIGRhdGEuLi4nKTtcclxuICAgICAgICAgICAgcmV0dXJuIHNlcmlhbC5zZW5kKHNlcmlhbC5maWVsZC5DT01fUkVJTklUX0VFUFJPTV9EQVRBLCBbXSwgZmFsc2UpXHJcbiAgICAgICAgICAgICAgICAudGhlbihcclxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlcXVlc3QoKTtcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKHJlYXNvbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21tYW5kTG9nKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1JlcXVlc3QgZm9yIGZhY3RvcnkgcmVzZXQgZmFpbGVkOiAnICsgcmVhc29uKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNlbmQobmV3Q29uZmlnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzZW5kUGFydGlhbCgweGZmZmYsIDB4ZmZmZiwgbmV3Q29uZmlnLCBmYWxzZSwgdHJ1ZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZW5kUGFydGlhbChcclxuICAgICAgICAgICAgbWFzaywgbGVkX21hc2ssIG5ld0NvbmZpZywgdGVtcG9yYXJ5LCByZXF1ZXN0X3VwZGF0ZSkge1xyXG4gICAgICAgICAgICBpZiAobWFzayA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICBtYXNrID0gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAobGVkX21hc2sgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgbGVkX21hc2sgPSAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChuZXdDb25maWcgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgbmV3Q29uZmlnID0gY29uZmlnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciB0YXJnZXQgPSB0ZW1wb3JhcnkgP1xyXG4gICAgICAgICAgICAgICAgc2VyaWFsLmZpZWxkLkNPTV9TRVRfUEFSVElBTF9URU1QT1JBUllfQ09ORklHIDpcclxuICAgICAgICAgICAgICAgIHNlcmlhbC5maWVsZC5DT01fU0VUX1BBUlRJQUxfRUVQUk9NX0RBVEE7XHJcblxyXG4gICAgICAgICAgICB2YXIgZGF0YSA9IHNldENvbmZpZ1BhcnRpYWwobmV3Q29uZmlnLCBtYXNrLCBsZWRfbWFzayk7XHJcbiAgICAgICAgICAgIHJldHVybiBzZXJpYWwuc2VuZCh0YXJnZXQsIGRhdGEsIGZhbHNlKS50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlcXVlc3RfdXBkYXRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVxdWVzdCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYXBwbHlQcm9wZXJ0aWVzVG8oc291cmNlLCBkZXN0aW5hdGlvbikge1xyXG4gICAgICAgICAgICBPYmplY3Qua2V5cyhzb3VyY2UpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XHJcbiAgICAgICAgICAgICAgICBkZXN0aW5hdGlvbltrZXldID0gc291cmNlW2tleV07XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2V0Q29uZmlnKHN0cnVjdHVyZSkge1xyXG4gICAgICAgICAgICB2YXIgaGFuZGxlciA9IGZpcm13YXJlVmVyc2lvbi5jb25maWdIYW5kbGVyKCk7XHJcbiAgICAgICAgICAgIHZhciBkYXRhID0gbmV3IFVpbnQ4QXJyYXkoaGFuZGxlci5ieXRlY291bnQoKSk7XHJcbiAgICAgICAgICAgIHZhciBkYXRhVmlldyA9IG5ldyBEYXRhVmlldyhkYXRhLmJ1ZmZlciwgMCk7XHJcbiAgICAgICAgICAgIGhhbmRsZXIuZW5jb2RlKGRhdGFWaWV3LCBuZXcgZW5jb2RhYmxlLlNlcmlhbGl6ZXIoKSwgc3RydWN0dXJlKTtcclxuICAgICAgICAgICAgcmV0dXJuIGRhdGE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZXRDb25maWdQYXJ0aWFsKHN0cnVjdHVyZSwgbWFzaywgbGVkX21hc2spIHtcclxuICAgICAgICAgICAgdmFyIGhhbmRsZXIgPSBmaXJtd2FyZVZlcnNpb24uY29uZmlnSGFuZGxlcigpO1xyXG4gICAgICAgICAgICB2YXIgZGF0YSA9IG5ldyBVaW50OEFycmF5KGhhbmRsZXIuYnl0ZWNvdW50KFtsZWRfbWFzaywgbWFza10pKVxyXG4gICAgICAgICAgICAgICAgdmFyIGRhdGFWaWV3ID0gbmV3IERhdGFWaWV3KGRhdGEuYnVmZmVyLCAwKTtcclxuICAgICAgICAgICAgdmFyIGIgPSBuZXcgZW5jb2RhYmxlLlNlcmlhbGl6ZXIoKTtcclxuICAgICAgICAgICAgaGFuZGxlci5lbmNvZGVQYXJ0aWFsKGRhdGFWaWV3LCBiLCBzdHJ1Y3R1cmUsIFtsZWRfbWFzaywgbWFza10pO1xyXG4gICAgICAgICAgICByZXR1cm4gZGF0YTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGNvbVNldEVlcHJvbURhdGEobWVzc2FnZV9idWZmZXIpIHtcclxuICAgICAgICAgICAgLy9jb21tYW5kTG9nKCdSZWNlaXZlZCBjb25maWchJyk7XHJcbiAgICAgICAgICAgIGNvbmZpZyA9IGZpcm13YXJlVmVyc2lvbi5jb25maWdIYW5kbGVyKCkuZGVjb2RlKFxyXG4gICAgICAgICAgICAgICAgbmV3IERhdGFWaWV3KG1lc3NhZ2VfYnVmZmVyLCAwKSwgbmV3IGVuY29kYWJsZS5TZXJpYWxpemVyKCkpO1xyXG4gICAgICAgICAgICByZXNwb25kVG9TZXRFZXByb20oKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGNvbVNldFBhcnRpYWxFZXByb21EYXRhKG1lc3NhZ2VfYnVmZmVyKSB7XHJcbiAgICAgICAgICAgIC8vY29tbWFuZExvZygnUmVjZWl2ZWQgcGFydGlhbCBjb25maWchJyk7XHJcbiAgICAgICAgICAgIGNvbmZpZyA9IGZpcm13YXJlVmVyc2lvbi5jb25maWdIYW5kbGVyKCkuZGVjb2RlUGFydGlhbChcclxuICAgICAgICAgICAgICAgIG5ldyBEYXRhVmlldyhtZXNzYWdlX2J1ZmZlciwgMCksIG5ldyBlbmNvZGFibGUuU2VyaWFsaXplcigpLFxyXG4gICAgICAgICAgICAgICAgYW5ndWxhci5jb3B5KGNvbmZpZykpLFxyXG4gICAgICAgICAgICByZXNwb25kVG9TZXRFZXByb20oKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHJlc3BvbmRUb1NldEVlcHJvbSgpIHtcclxuICAgICAgICAgICAgZmlybXdhcmVWZXJzaW9uLnNldChjb25maWcudmVyc2lvbik7XHJcbiAgICAgICAgICAgIGlmICghZmlybXdhcmVWZXJzaW9uLnN1cHBvcnRlZCgpKSB7XHJcbiAgICAgICAgICAgICAgICBjb21tYW5kTG9nKCdSZWNlaXZlZCBhbiB1bnN1cHBvcnRlZCBjb25maWd1cmF0aW9uIScpO1xyXG4gICAgICAgICAgICAgICAgY29tbWFuZExvZyhcclxuICAgICAgICAgICAgICAgICAgICAnRm91bmQgdmVyc2lvbjogJyArIGNvbmZpZy52ZXJzaW9uWzBdICsgJy4nICtcclxuICAgICAgICAgICAgICAgICAgICBjb25maWcudmVyc2lvblsxXSArICcuJyArIGNvbmZpZy52ZXJzaW9uWzJdICArXHJcbiAgICAgICAgICAgICAgICAgICAgJyAtLS0gTmV3ZXN0IHZlcnNpb246ICcgK1xyXG4gICAgICAgICAgICAgICAgICAgIGZpcm13YXJlVmVyc2lvbi5kZXNpcmVkS2V5KCkgKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbW1hbmRMb2coXHJcbiAgICAgICAgICAgICAgICAgICAgJ1JlY2VpdmVkIGNvbmZpZ3VyYXRpb24gZGF0YSAodicgK1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZy52ZXJzaW9uWzBdICsgJy4nICsgY29uZmlnLnZlcnNpb25bMV0gKyAnLicgK1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZy52ZXJzaW9uWzJdICsnKScpO1xyXG4gICAgICAgICAgICAgICAgY29uZmlnQ2FsbGJhY2soKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2V0Q29uZmlnQ2FsbGJhY2soY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgY29uZmlnQ2FsbGJhY2sgPSBjYWxsYmFjaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNldExvZ2dpbmdDYWxsYmFjayhjYWxsYmFjaykge1xyXG4gICAgICAgICAgICBsb2dnaW5nQ2FsbGJhY2sgPSBjYWxsYmFjaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdldENvbmZpZygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGNvbmZpZztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbmZpZyA9IGZpcm13YXJlVmVyc2lvbi5jb25maWdIYW5kbGVyKCkuZW1wdHkoKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVxdWVzdDogcmVxdWVzdCxcclxuICAgICAgICAgICAgcmVpbml0OiByZWluaXQsXHJcbiAgICAgICAgICAgIHNlbmQ6IHNlbmQsXHJcbiAgICAgICAgICAgIHNlbmRQYXJ0aWFsOiBzZW5kUGFydGlhbCxcclxuICAgICAgICAgICAgZ2V0Q29uZmlnOiBnZXRDb25maWcsXHJcbiAgICAgICAgICAgIHNldENvbmZpZ0NhbGxiYWNrOiBzZXRDb25maWdDYWxsYmFjayxcclxuICAgICAgICAgICAgc2V0TG9nZ2luZ0NhbGxiYWNrOiBzZXRMb2dnaW5nQ2FsbGJhY2ssXHJcbiAgICAgICAgICAgIGdldERlc2lyZWRWZXJzaW9uOiBnZXREZXNpcmVkVmVyc2lvbixcclxuICAgICAgICAgICAgZmllbGQ6IGNvbmZpZ0ZpZWxkcyxcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59KCkpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgICBhbmd1bGFyLm1vZHVsZSgnZmx5YnJpeENvbW1vbicpLmZhY3RvcnkoJ2VuY29kYWJsZScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBlbmNvZGFibGU7XHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgZW5jb2RhYmxlID0ge1xyXG4gICAgICAgIHN0cmluZzogY29tcGlsZVN0cmluZyxcclxuICAgICAgICBtYXA6IGNvbXBpbGVNYXAsXHJcbiAgICAgICAgYXJyYXk6IGNvbXBpbGVBcnJheSxcclxuICAgICAgICBwb2x5YXJyYXk6IGNvbXBpbGVQb2x5YXJyYXksXHJcbiAgICAgICAgU2VyaWFsaXplcjogU2VyaWFsaXplcixcclxuICAgIH07XHJcblxyXG4gICAgZnVuY3Rpb24gU2VyaWFsaXplcigpIHtcclxuICAgICAgICB0aGlzLmluZGV4ID0gMDtcclxuICAgIH1cclxuXHJcbiAgICBTZXJpYWxpemVyLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbihpbmNyZW1lbnQpIHtcclxuICAgICAgICB0aGlzLmluZGV4ICs9IGluY3JlbWVudDtcclxuICAgIH07XHJcblxyXG4gICAgLy8gSGFuZGxpbmcgbnVtYmVyc1xyXG5cclxuICAgIGZ1bmN0aW9uIG51bWJlclplcm8oKSB7XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9XHJcblxyXG4gICAgWydVaW50JywgJ0ludCddLmZvckVhY2goZnVuY3Rpb24oa2V5UHJlZml4KSB7XHJcbiAgICAgICAgWzEsIDIsIDRdLmZvckVhY2goZnVuY3Rpb24oYnl0ZUNvdW50KSB7XHJcbiAgICAgICAgICAgIHZhciBrZXkgPSBrZXlQcmVmaXggKyAoYnl0ZUNvdW50ICogOCk7XHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGVuY29kZShkYXRhVmlldywgc2VyaWFsaXplciwgZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgZGF0YVZpZXdbJ3NldCcgKyBrZXldKHNlcmlhbGl6ZXIuaW5kZXgsIGRhdGEsIDEpO1xyXG4gICAgICAgICAgICAgICAgc2VyaWFsaXplci5hZGQoYnl0ZUNvdW50KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmdW5jdGlvbiBkZWNvZGUoZGF0YVZpZXcsIHNlcmlhbGl6ZXIpIHtcclxuICAgICAgICAgICAgICAgIHZhciBkYXRhID0gZGF0YVZpZXdbJ2dldCcgKyBrZXldKHNlcmlhbGl6ZXIuaW5kZXgsIDEpO1xyXG4gICAgICAgICAgICAgICAgc2VyaWFsaXplci5hZGQoYnl0ZUNvdW50KTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBkYXRhO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGJ5dGVjb3VudCgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBieXRlQ291bnQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZW5jb2RhYmxlW2tleV0gPSBuZXcgSGFuZGxlcihieXRlY291bnQsIGVuY29kZSwgZGVjb2RlLCBudW1iZXJaZXJvKTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG4gICAgWzQsIDhdLmZvckVhY2goZnVuY3Rpb24oYnl0ZUNvdW50KSB7XHJcbiAgICAgICAgdmFyIGtleSA9ICdGbG9hdCcgKyAoYnl0ZUNvdW50ICogOCk7XHJcbiAgICAgICAgZnVuY3Rpb24gZW5jb2RlKGRhdGFWaWV3LCBzZXJpYWxpemVyLCBkYXRhKSB7XHJcbiAgICAgICAgICAgIGRhdGFWaWV3WydzZXQnICsga2V5XShzZXJpYWxpemVyLmluZGV4LCBkYXRhLCAxKTtcclxuICAgICAgICAgICAgc2VyaWFsaXplci5hZGQoYnl0ZUNvdW50KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZnVuY3Rpb24gZGVjb2RlKGRhdGFWaWV3LCBzZXJpYWxpemVyKSB7XHJcbiAgICAgICAgICAgIHZhciBkYXRhID0gZGF0YVZpZXdbJ2dldCcgKyBrZXldKHNlcmlhbGl6ZXIuaW5kZXgsIDEpO1xyXG4gICAgICAgICAgICBzZXJpYWxpemVyLmFkZChieXRlQ291bnQpO1xyXG4gICAgICAgICAgICByZXR1cm4gZGF0YTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZnVuY3Rpb24gYnl0ZWNvdW50KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gYnl0ZUNvdW50O1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbmNvZGFibGVba2V5XSA9IG5ldyBIYW5kbGVyKGJ5dGVjb3VudCwgZW5jb2RlLCBkZWNvZGUsIG51bWJlclplcm8pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZnVuY3Rpb24gY29tcGlsZU51bWJlcih0eXBlKSB7XHJcbiAgICAgICAgdmFyIGhhbmRsZXIgPSBlbmNvZGFibGVbJ1VpbnQnICsgdHlwZV07XHJcbiAgICAgICAgaWYgKGhhbmRsZXIgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXHJcbiAgICAgICAgICAgICAgICAnVW5zdXBwb3J0ZWQgc3BsaXQgYml0IGNvdW50OiAnICsgdHlwZSArXHJcbiAgICAgICAgICAgICAgICAnLiBBbGxvd2VkIGNvdW50czogOCwgMTYsIDMyLCA2NCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gaGFuZGxlcjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBIYW5kbGluZyBib29sc1xyXG5cclxuICAgIGVuY29kYWJsZS5ib29sID0gbmV3IEhhbmRsZXIoXHJcbiAgICAgICAgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAxO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZnVuY3Rpb24oZGF0YVZpZXcsIHNlcmlhbGl6ZXIsIGRhdGEpIHtcclxuICAgICAgICAgICAgZW5jb2RhYmxlLlVpbnQ4LmVuY29kZShkYXRhVmlldywgc2VyaWFsaXplciwgZGF0YSA/IDEgOiAwKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZnVuY3Rpb24oZGF0YVZpZXcsIHNlcmlhbGl6ZXIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGVuY29kYWJsZS5VaW50OC5kZWNvZGUoZGF0YVZpZXcsIHNlcmlhbGl6ZXIpICE9PSAwO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAvLyBIYW5kbGluZyBzdHJpbmdzXHJcblxyXG4gICAgZnVuY3Rpb24gY29tcGlsZVN0cmluZyhsZW5ndGgpIHtcclxuICAgICAgICB2YXIgaGFuZGxlciA9IGNvbXBpbGVBcnJheShsZW5ndGgsIGVuY29kYWJsZS5VaW50OCk7XHJcbiAgICAgICAgZnVuY3Rpb24gZW5jb2RlKGRhdGFWaWV3LCBzZXJpYWxpemVyLCBkYXRhKSB7XHJcbiAgICAgICAgICAgIGhhbmRsZXIuZW5jb2RlKGRhdGFWaWV3LCBzZXJpYWxpemVyLCBhc2NpaUVuY29kZShkYXRhLCBsZW5ndGgpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZnVuY3Rpb24gZGVjb2RlKGRhdGFWaWV3LCBzZXJpYWxpemVyKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBhc2NpaURlY29kZShoYW5kbGVyLmRlY29kZShkYXRhVmlldywgc2VyaWFsaXplciksIGxlbmd0aCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZ1bmN0aW9uIGVtcHR5KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gJyc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZ1bmN0aW9uIGJ5dGVjb3VudCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGxlbmd0aDtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5ldyBIYW5kbGVyKGJ5dGVjb3VudCwgZW5jb2RlLCBkZWNvZGUsIGVtcHR5KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBhc2NpaUVuY29kZShuYW1lLCBsZW5ndGgpIHtcclxuICAgICAgICB2YXIgcmVzcG9uc2UgPSBuZXcgVWludDhBcnJheShsZW5ndGgpO1xyXG4gICAgICAgIG5hbWUuc3BsaXQoJycpLmZvckVhY2goZnVuY3Rpb24oYywgaWR4KSB7XHJcbiAgICAgICAgICAgIHJlc3BvbnNlW2lkeF0gPSBjLmNoYXJDb2RlQXQoMCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmVzcG9uc2VbbGVuZ3RoIC0gMV0gPSAwO1xyXG4gICAgICAgIHJldHVybiByZXNwb25zZTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBhc2NpaURlY29kZShuYW1lLCBsZW5ndGgpIHtcclxuICAgICAgICB2YXIgcmVzcG9uc2UgPSAnJztcclxuICAgICAgICB2YXIgbCA9IE1hdGgubWluKG5hbWUubGVuZ3RoLCBsZW5ndGggLSAxKTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGw7ICsraSkge1xyXG4gICAgICAgICAgICBpZiAobmFtZVtpXSA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJlc3BvbnNlICs9IFN0cmluZy5mcm9tQ2hhckNvZGUobmFtZVtpXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXNwb25zZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBIYW5kbGluZyBhcnJheXNcclxuXHJcbiAgICBmdW5jdGlvbiBjb21waWxlQXJyYXkobGVuZ3RoLCBlbGVtZW50LCBzcGxpdEJpdHMpIHtcclxuICAgICAgICBpZiAobGVuZ3RoID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBcnJheSB0eXBlIHJlcXVpcmVzIGxlbmd0aCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIShlbGVtZW50IGluc3RhbmNlb2YgSGFuZGxlcikpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdBcnJheSB0eXBlIHJlcXVpcmVzIEhhbmRsZXIgdHlwZSBhcyBlbGVtZW50Jyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZ1bmN0aW9uIGVuY29kZShkYXRhVmlldywgc2VyaWFsaXplciwgZGF0YSkge1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LmVuY29kZShkYXRhVmlldywgc2VyaWFsaXplciwgZGF0YVtpXSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZnVuY3Rpb24gZGVjb2RlKGRhdGFWaWV3LCBzZXJpYWxpemVyKSB7XHJcbiAgICAgICAgICAgIHZhciBkYXRhID0gW107XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyArK2kpIHtcclxuICAgICAgICAgICAgICAgIGRhdGEucHVzaChlbGVtZW50LmRlY29kZShkYXRhVmlldywgc2VyaWFsaXplcikpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBkYXRhO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmdW5jdGlvbiBlbXB0eSgpIHtcclxuICAgICAgICAgICAgdmFyIGRhdGEgPSBbXTtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICAgICAgZGF0YS5wdXNoKGVsZW1lbnQuZW1wdHkoKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGRhdGE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBoYW5kbGVyO1xyXG4gICAgICAgIGlmIChzcGxpdEJpdHMgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICB2YXIgbnVtYmVyRW5jb2RlciA9IGNvbXBpbGVOdW1iZXIoc3BsaXRCaXRzKTtcclxuICAgICAgICAgICAgZnVuY3Rpb24gZW5jb2RlUGFydGlhbFNwbGl0KGRhdGFWaWV3LCBzZXJpYWxpemVyLCBkYXRhLCBtYXNrcykge1xyXG4gICAgICAgICAgICAgICAgdmFyIG1hc2sgPSBtYXNrcy5wb3AoKTtcclxuICAgICAgICAgICAgICAgIG51bWJlckVuY29kZXIuZW5jb2RlKGRhdGFWaWV3LCBzZXJpYWxpemVyLCBtYXNrKTtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyArK2kpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobWFzayAmICgxIDw8IGkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuZW5jb2RlUGFydGlhbChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFWaWV3LCBzZXJpYWxpemVyLCBkYXRhW2ldLCBtYXNrcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGRlY29kZVBhcnRpYWxTcGxpdChkYXRhVmlldywgc2VyaWFsaXplciwgb3JpZ2luYWwpIHtcclxuICAgICAgICAgICAgICAgIHZhciBtYXNrID0gbnVtYmVyRW5jb2Rlci5kZWNvZGUoZGF0YVZpZXcsIHNlcmlhbGl6ZXIpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGRhdGEgPSBbXTtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyArK2kpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobWFzayAmICgxIDw8IGkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGEucHVzaChlbGVtZW50LmRlY29kZVBhcnRpYWwoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhVmlldywgc2VyaWFsaXplciwgb3JpZ2luYWxbaV0pKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnB1c2gob3JpZ2luYWxbaV0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBkYXRhO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGJ5dGVjb3VudFNwbGl0KG1hc2tzKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbWFzaztcclxuICAgICAgICAgICAgICAgIHZhciBub21hc2sgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgaWYgKG1hc2tzICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBtYXNrID0gbWFza3MucG9wKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbm9tYXNrID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB2YXIgYWNjdW0gPSBub21hc2sgPyAwIDogc3BsaXRCaXRzIC8gODtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyArK2kpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobm9tYXNrIHx8IChtYXNrICYgKDEgPDwgaSkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjY3VtICs9IGVsZW1lbnQuYnl0ZWNvdW50KG1hc2tzKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYWNjdW07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaGFuZGxlciA9IG5ldyBIYW5kbGVyKFxyXG4gICAgICAgICAgICAgICAgYnl0ZWNvdW50U3BsaXQsIGVuY29kZSwgZGVjb2RlLCBlbXB0eSwgZW5jb2RlUGFydGlhbFNwbGl0LFxyXG4gICAgICAgICAgICAgICAgZGVjb2RlUGFydGlhbFNwbGl0KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBmdW5jdGlvbiBlbmNvZGVQYXJ0aWFsKGRhdGFWaWV3LCBzZXJpYWxpemVyLCBkYXRhLCBtYXNrcykge1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuZW5jb2RlUGFydGlhbChkYXRhVmlldywgc2VyaWFsaXplciwgZGF0YVtpXSwgbWFza3MpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGRlY29kZVBhcnRpYWwoZGF0YVZpZXcsIHNlcmlhbGl6ZXIsIG9yaWdpbmFsKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGEucHVzaChlbGVtZW50LmRlY29kZVBhcnRpYWwoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFWaWV3LCBzZXJpYWxpemVyLCBvcmlnaW5hbFtpXSkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRhdGE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZnVuY3Rpb24gYnl0ZWNvdW50KG1hc2tzKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgYWNjdW0gPSAwO1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGFjY3VtICs9IGVsZW1lbnQuYnl0ZWNvdW50KG1hc2tzKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBhY2N1bTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBoYW5kbGVyID0gbmV3IEhhbmRsZXIoXHJcbiAgICAgICAgICAgICAgICBieXRlY291bnQsIGVuY29kZSwgZGVjb2RlLCBlbXB0eSwgZW5jb2RlUGFydGlhbCwgZGVjb2RlUGFydGlhbCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGhhbmRsZXIuY2hpbGRyZW4gPSB7XHJcbiAgICAgICAgICAgIGVsZW1lbnQ6IGVsZW1lbnQsXHJcbiAgICAgICAgICAgIGNvdW50OiBsZW5ndGgsXHJcbiAgICAgICAgfTtcclxuICAgICAgICByZXR1cm4gaGFuZGxlcjtcclxuICAgIH1cclxuXHJcbiAgICAvLyBIYW5kbGluZyBwb2x5YXJyYXlzXHJcblxyXG4gICAgZnVuY3Rpb24gY29tcGlsZVBvbHlhcnJheShwcm9wZXJ0aWVzLCBzcGxpdEJpdHMpIHtcclxuICAgICAgICB2YXIgbGVuZ3RoID0gcHJvcGVydGllcy5sZW5ndGg7XHJcbiAgICAgICAgaWYgKGxlbmd0aCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcclxuICAgICAgICAgICAgICAgICdQb2x5YXJyYXkgdHlwZSByZXF1aXJlcyBhbiBhcnJheSBvZiBIYW5kbGVyIG9iamVjdHMnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcHJvcGVydGllcy5mb3JFYWNoKGZ1bmN0aW9uKHByb3BlcnR5KSB7XHJcbiAgICAgICAgICAgIGlmICghKHByb3BlcnR5IGluc3RhbmNlb2YgSGFuZGxlcikpIHtcclxuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcclxuICAgICAgICAgICAgICAgICAgICAnUG9seWFycmF5IHR5cGUgcmVxdWlyZXMgYW4gYXJyYXkgb2YgSGFuZGxlciBvYmplY3RzJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBmdW5jdGlvbiBlbmNvZGUoZGF0YVZpZXcsIHNlcmlhbGl6ZXIsIGRhdGEpIHtcclxuICAgICAgICAgICAgcHJvcGVydGllcy5mb3JFYWNoKGZ1bmN0aW9uKHByb3BlcnR5LCBpZHgpIHtcclxuICAgICAgICAgICAgICAgIHByb3BlcnR5LmVuY29kZShkYXRhVmlldywgc2VyaWFsaXplciwgZGF0YVtpZHhdKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZ1bmN0aW9uIGRlY29kZShkYXRhVmlldywgc2VyaWFsaXplcikge1xyXG4gICAgICAgICAgICB2YXIgZGF0YSA9IFtdO1xyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzLmZvckVhY2goZnVuY3Rpb24ocHJvcGVydHksIGlkeCkge1xyXG4gICAgICAgICAgICAgICAgZGF0YS5wdXNoKHByb3BlcnR5LmRlY29kZShkYXRhVmlldywgc2VyaWFsaXplcikpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIGRhdGE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZ1bmN0aW9uIGVtcHR5KCkge1xyXG4gICAgICAgICAgICB2YXIgZGF0YSA9IFtdO1xyXG4gICAgICAgICAgICBwcm9wZXJ0aWVzLmZvckVhY2goZnVuY3Rpb24ocHJvcGVydHkpIHtcclxuICAgICAgICAgICAgICAgIGRhdGEucHVzaChwcm9wZXJ0eS5lbXB0eSgpKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiBkYXRhO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgaGFuZGxlcjtcclxuICAgICAgICB2YXIgYnl0ZUNvdW50ID0gcHJvcGVydGllcy5yZWR1Y2UoZnVuY3Rpb24oYWNjdW0sIHYpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGFjY3VtICsgdi5ieXRlY291bnQ7XHJcbiAgICAgICAgfSwgMCk7XHJcbiAgICAgICAgaWYgKHNwbGl0Qml0cyAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHZhciBudW1iZXJFbmNvZGVyID0gY29tcGlsZU51bWJlcihzcGxpdEJpdHMpO1xyXG4gICAgICAgICAgICBmdW5jdGlvbiBlbmNvZGVQYXJ0aWFsU3BsaXQoZGF0YVZpZXcsIHNlcmlhbGl6ZXIsIGRhdGEsIG1hc2tzKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbWFzayA9IG1hc2tzLnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgbnVtYmVyRW5jb2Rlci5lbmNvZGUoZGF0YVZpZXcsIHNlcmlhbGl6ZXIsIG1hc2spO1xyXG4gICAgICAgICAgICAgICAgcHJvcGVydGllcy5mb3JFYWNoKGZ1bmN0aW9uKHByb3BlcnR5LCBpZHgpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAobWFzayAmICgxIDw8IGlkeCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHkuZW5jb2RlUGFydGlhbChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFWaWV3LCBzZXJpYWxpemVyLCBkYXRhW2lkeF0sIG1hc2tzKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmdW5jdGlvbiBkZWNvZGVQYXJ0aWFsU3BsaXQoZGF0YVZpZXcsIHNlcmlhbGl6ZXIsIG9yaWdpbmFsKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbWFzayA9IG51bWJlckVuY29kZXIuZGVjb2RlKGRhdGFWaWV3LCBzZXJpYWxpemVyKTtcclxuICAgICAgICAgICAgICAgIHZhciBkYXRhID0gW107XHJcbiAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzLmZvckVhY2goZnVuY3Rpb24ocHJvcGVydHksIGlkeCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChtYXNrICYgKDEgPDwgaWR4KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLnB1c2gocHJvcGVydHkuZGVjb2RlUGFydGlhbChcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFWaWV3LCBzZXJpYWxpemVyLCBvcmlnaW5hbFtpZHhdKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5wdXNoKG9yaWdpbmFsW2lkeF0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRhdGE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZnVuY3Rpb24gYnl0ZWNvdW50U3BsaXQobWFza3MpIHtcclxuICAgICAgICAgICAgICAgIHZhciBtYXNrO1xyXG4gICAgICAgICAgICAgICAgdmFyIG5vbWFzayA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBpZiAobWFza3MgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG1hc2sgPSBtYXNrcy5wb3AoKTtcclxuICAgICAgICAgICAgICAgICAgICBub21hc2sgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBwcm9wZXJ0aWVzLnJlZHVjZShmdW5jdGlvbihhY2N1bSwgdiwgaWR4KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFub21hc2sgJiYgKCEobWFzayAmICgxIDw8IGlkeCkpKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYWNjdW07XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhY2N1bSArIHYuYnl0ZWNvdW50KG1hc2tzKTtcclxuICAgICAgICAgICAgICAgIH0sIG5vbWFzayA/IDAgOiBzcGxpdEJpdHMgLyA4KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBoYW5kbGVyID0gbmV3IEhhbmRsZXIoXHJcbiAgICAgICAgICAgICAgICBieXRlY291bnRTcGxpdCwgZW5jb2RlLCBkZWNvZGUsIGVtcHR5LCBlbmNvZGVQYXJ0aWFsU3BsaXQsXHJcbiAgICAgICAgICAgICAgICBkZWNvZGVQYXJ0aWFsU3BsaXQpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGVuY29kZVBhcnRpYWwoZGF0YVZpZXcsIHNlcmlhbGl6ZXIsIGRhdGEsIG1hc2tzKSB7XHJcbiAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzLmZvckVhY2goZnVuY3Rpb24ocHJvcGVydHksIGlkeCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnR5LmVuY29kZVBhcnRpYWwoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFWaWV3LCBzZXJpYWxpemVyLCBkYXRhW2lkeF0sIG1hc2tzKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGRlY29kZVBhcnRpYWwoZGF0YVZpZXcsIHNlcmlhbGl6ZXIsIG9yaWdpbmFsKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IFtdO1xyXG4gICAgICAgICAgICAgICAgcHJvcGVydGllcy5mb3JFYWNoKGZ1bmN0aW9uKHByb3BlcnR5LCBpZHgpIHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRhLnB1c2gocHJvcGVydHkuZGVjb2RlUGFydGlhbChcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVZpZXcsIHNlcmlhbGl6ZXIsIG9yaWdpbmFsW2lkeF0pKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRhdGE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZnVuY3Rpb24gYnl0ZWNvdW50KG1hc2tzKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvcGVydGllcy5yZWR1Y2UoZnVuY3Rpb24oYWNjdW0sIHYpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYWNjdW0gKyB2LmJ5dGVjb3VudChtYXNrcyk7XHJcbiAgICAgICAgICAgICAgICB9LCAwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBoYW5kbGVyID0gbmV3IEhhbmRsZXIoXHJcbiAgICAgICAgICAgICAgICBieXRlY291bnQsIGVuY29kZSwgZGVjb2RlLCBlbXB0eSwgZW5jb2RlUGFydGlhbCwgZGVjb2RlUGFydGlhbCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGhhbmRsZXIuY2hpbGRyZW4gPSBwcm9wZXJ0aWVzO1xyXG4gICAgICAgIHJldHVybiBoYW5kbGVyO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIEhhbmRsaW5nIG1hcHNcclxuXHJcbiAgICBmdW5jdGlvbiBjb21waWxlTWFwKHByb3BlcnRpZXMsIHNwbGl0Qml0cykge1xyXG4gICAgICAgIHZhciBsZW5ndGggPSBwcm9wZXJ0aWVzLmxlbmd0aDtcclxuICAgICAgICBpZiAobGVuZ3RoID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxyXG4gICAgICAgICAgICAgICAgJ01hcCB0eXBlIHJlcXVpcmVzIGFuIGFycmF5IG9mICcgK1xyXG4gICAgICAgICAgICAgICAgJ3trZXk6IFN0cmluZywgZWxlbWVudDogSGFuZGxlcn0gbWFwcycpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBwcm9wZXJ0aWVzLmZvckVhY2goZnVuY3Rpb24ocHJvcGVydHkpIHtcclxuICAgICAgICAgICAgaWYgKHByb3BlcnR5LmtleSA9PT0gdW5kZWZpbmVkIHx8XHJcbiAgICAgICAgICAgICAgICAhKHByb3BlcnR5LmVsZW1lbnQgaW5zdGFuY2VvZiBIYW5kbGVyKSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxyXG4gICAgICAgICAgICAgICAgICAgICdNYXAgdHlwZSByZXF1aXJlcyBhbiBhcnJheSBvZiAnICtcclxuICAgICAgICAgICAgICAgICAgICAne2tleTogU3RyaW5nLCBlbGVtZW50OiBIYW5kbGVyfSBtYXBzJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBpZiAoc3BsaXRCaXRzICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgcHJvcGVydGllcy5mb3JFYWNoKGZ1bmN0aW9uKHByb3BlcnR5KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAocHJvcGVydHkucGFydCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAnTWFwIHR5cGUgcmVxdWlyZXMgYW4gYXJyYXkgb2YgJyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICd7a2V5OiBTdHJpbmcsIGVsZW1lbnQ6IEhhbmRsZXIsIHBhcnQ6IE51bWJlcn0nICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJyBtYXBzIHdoZW4gc3BsaXQgYml0cyBhcmUgZGVmaW5lZCcpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZnVuY3Rpb24gZW5jb2RlKGRhdGFWaWV3LCBzZXJpYWxpemVyLCBkYXRhKSB7XHJcbiAgICAgICAgICAgIHByb3BlcnRpZXMuZm9yRWFjaChmdW5jdGlvbihwcm9wZXJ0eSkge1xyXG4gICAgICAgICAgICAgICAgcHJvcGVydHkuZWxlbWVudC5lbmNvZGUoXHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YVZpZXcsIHNlcmlhbGl6ZXIsIGRhdGFbcHJvcGVydHkua2V5XSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmdW5jdGlvbiBkZWNvZGUoZGF0YVZpZXcsIHNlcmlhbGl6ZXIpIHtcclxuICAgICAgICAgICAgdmFyIGRhdGEgPSB7fTtcclxuICAgICAgICAgICAgcHJvcGVydGllcy5mb3JFYWNoKGZ1bmN0aW9uKHByb3BlcnR5KSB7XHJcbiAgICAgICAgICAgICAgICBkYXRhW3Byb3BlcnR5LmtleV0gPVxyXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnR5LmVsZW1lbnQuZGVjb2RlKGRhdGFWaWV3LCBzZXJpYWxpemVyKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiBkYXRhO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmdW5jdGlvbiBlbXB0eSgpIHtcclxuICAgICAgICAgICAgdmFyIGRhdGEgPSB7fTtcclxuICAgICAgICAgICAgcHJvcGVydGllcy5mb3JFYWNoKGZ1bmN0aW9uKHByb3BlcnR5KSB7XHJcbiAgICAgICAgICAgICAgICBkYXRhW3Byb3BlcnR5LmtleV0gPSBwcm9wZXJ0eS5lbGVtZW50LmVtcHR5KCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gZGF0YTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGhhbmRsZXI7XHJcbiAgICAgICAgaWYgKHNwbGl0Qml0cyAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIHZhciBudW1iZXJFbmNvZGVyID0gY29tcGlsZU51bWJlcihzcGxpdEJpdHMpO1xyXG4gICAgICAgICAgICBmdW5jdGlvbiBlbmNvZGVQYXJ0aWFsU3BsaXQoZGF0YVZpZXcsIHNlcmlhbGl6ZXIsIGRhdGEsIG1hc2tzKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbWFzayA9IG1hc2tzLnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgbnVtYmVyRW5jb2Rlci5lbmNvZGUoZGF0YVZpZXcsIHNlcmlhbGl6ZXIsIG1hc2spO1xyXG4gICAgICAgICAgICAgICAgcHJvcGVydGllcy5mb3JFYWNoKGZ1bmN0aW9uKHByb3BlcnR5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1hc2sgJiAoMSA8PCBwcm9wZXJ0eS5wYXJ0KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eS5lbGVtZW50LmVuY29kZVBhcnRpYWwoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhVmlldywgc2VyaWFsaXplciwgZGF0YVtwcm9wZXJ0eS5rZXldLCBtYXNrcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZnVuY3Rpb24gZGVjb2RlUGFydGlhbFNwbGl0KGRhdGFWaWV3LCBzZXJpYWxpemVyLCBvcmlnaW5hbCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIG1hc2sgPSBudW1iZXJFbmNvZGVyLmRlY29kZShkYXRhVmlldywgc2VyaWFsaXplcik7XHJcbiAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IHt9O1xyXG4gICAgICAgICAgICAgICAgcHJvcGVydGllcy5mb3JFYWNoKGZ1bmN0aW9uKHByb3BlcnR5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1hc2sgJiAoMSA8PCBwcm9wZXJ0eS5wYXJ0KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhW3Byb3BlcnR5LmtleV0gPSBwcm9wZXJ0eS5lbGVtZW50LmRlY29kZVBhcnRpYWwoXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhVmlldywgc2VyaWFsaXplciwgb3JpZ2luYWxbcHJvcGVydHkua2V5XSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVtwcm9wZXJ0eS5rZXldID0gb3JpZ2luYWxbcHJvcGVydHkua2V5XTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBkYXRhO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGJ5dGVjb3VudFNwbGl0KG1hc2tzKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbWFzaztcclxuICAgICAgICAgICAgICAgIHZhciBub21hc2sgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgaWYgKG1hc2tzICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBtYXNrID0gbWFza3MucG9wKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgbm9tYXNrID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvcGVydGllcy5yZWR1Y2UoZnVuY3Rpb24oYWNjdW0sIHYpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIW5vbWFzayAmJiAoIShtYXNrICYgKDEgPDwgdi5wYXJ0KSkpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhY2N1bTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFjY3VtICsgdi5lbGVtZW50LmJ5dGVjb3VudChtYXNrcyk7XHJcbiAgICAgICAgICAgICAgICB9LCBub21hc2sgPyAwIDogc3BsaXRCaXRzIC8gOCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaGFuZGxlciA9IG5ldyBIYW5kbGVyKFxyXG4gICAgICAgICAgICAgICAgYnl0ZWNvdW50U3BsaXQsIGVuY29kZSwgZGVjb2RlLCBlbXB0eSwgZW5jb2RlUGFydGlhbFNwbGl0LFxyXG4gICAgICAgICAgICAgICAgZGVjb2RlUGFydGlhbFNwbGl0KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBmdW5jdGlvbiBlbmNvZGVQYXJ0aWFsKGRhdGFWaWV3LCBzZXJpYWxpemVyLCBkYXRhLCBtYXNrcykge1xyXG4gICAgICAgICAgICAgICAgcHJvcGVydGllcy5mb3JFYWNoKGZ1bmN0aW9uKHByb3BlcnR5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydHkuZWxlbWVudC5lbmNvZGVQYXJ0aWFsKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhVmlldywgc2VyaWFsaXplciwgZGF0YVtwcm9wZXJ0eS5rZXldLCBtYXNrcyk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmdW5jdGlvbiBkZWNvZGVQYXJ0aWFsKGRhdGFWaWV3LCBzZXJpYWxpemVyLCBvcmlnaW5hbCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGRhdGEgPSB7fTtcclxuICAgICAgICAgICAgICAgIHByb3BlcnRpZXMuZm9yRWFjaChmdW5jdGlvbihwcm9wZXJ0eSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGRhdGFbcHJvcGVydHkua2V5XSA9IHByb3BlcnR5LmVsZW1lbnQuZGVjb2RlUGFydGlhbChcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVZpZXcsIHNlcmlhbGl6ZXIsIG9yaWdpbmFsW3Byb3BlcnR5LmtleV0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZGF0YTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmdW5jdGlvbiBieXRlY291bnQobWFza3MpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBwcm9wZXJ0aWVzLnJlZHVjZShmdW5jdGlvbihhY2N1bSwgdikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhY2N1bSArIHYuZWxlbWVudC5ieXRlY291bnQobWFza3MpO1xyXG4gICAgICAgICAgICAgICAgfSwgMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaGFuZGxlciA9IG5ldyBIYW5kbGVyKFxyXG4gICAgICAgICAgICAgICAgYnl0ZWNvdW50LCBlbmNvZGUsIGRlY29kZSwgZW1wdHksIGVuY29kZVBhcnRpYWwsIGRlY29kZVBhcnRpYWwpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBoYW5kbGVyLmNoaWxkcmVuID0gcHJvcGVydGllcztcclxuICAgICAgICByZXR1cm4gaGFuZGxlcjtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBIYW5kbGVyKFxyXG4gICAgICAgIGJ5dGVjb3VudCwgZW5jb2RlLCBkZWNvZGUsIGVtcHR5LCBlbmNvZGVQYXJ0aWFsLCBkZWNvZGVQYXJ0aWFsKSB7XHJcbiAgICAgICAgZW5jb2RlUGFydGlhbCA9IGVuY29kZVBhcnRpYWwgfHwgZW5jb2RlO1xyXG4gICAgICAgIGRlY29kZVBhcnRpYWwgPSBkZWNvZGVQYXJ0aWFsIHx8IGRlY29kZTtcclxuICAgICAgICB0aGlzLmJ5dGVjb3VudCA9IGJ5dGVjb3VudDtcclxuICAgICAgICB0aGlzLmVuY29kZSA9IGVuY29kZTtcclxuICAgICAgICB0aGlzLmRlY29kZSA9IGRlY29kZTtcclxuICAgICAgICB0aGlzLmVuY29kZVBhcnRpYWwgPSBlbmNvZGVQYXJ0aWFsO1xyXG4gICAgICAgIHRoaXMuZGVjb2RlUGFydGlhbCA9IGRlY29kZVBhcnRpYWw7XHJcbiAgICAgICAgdGhpcy5lbXB0eSA9IGVtcHR5O1xyXG4gICAgfVxyXG59KCkpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ2ZseWJyaXhDb21tb24nKS5mYWN0b3J5KCdmaXJtd2FyZVZlcnNpb24nLCBmaXJtd2FyZVZlcnNpb24pO1xyXG5cclxuICAgIGZpcm13YXJlVmVyc2lvbi4kaW5qZWN0ID0gWydjb25maWdIYW5kbGVyJywgJ3NlcmlhbGl6YXRpb25IYW5kbGVyJ107XHJcblxyXG4gICAgZnVuY3Rpb24gZmlybXdhcmVWZXJzaW9uKGNvbmZpZ0hhbmRsZXIsIHNlcmlhbGl6YXRpb25IYW5kbGVyKSB7XHJcbiAgICAgICAgdmFyIHZlcnNpb24gPSBbMCwgMCwgMF07XHJcbiAgICAgICAgdmFyIGtleSA9ICcwLjAuMCc7XHJcbiAgICAgICAgdmFyIHN1cHBvcnRlZCA9IHtcclxuICAgICAgICAgICAgJzEuNC4wJzogdHJ1ZSxcclxuICAgICAgICAgICAgJzEuNS4wJzogdHJ1ZSxcclxuICAgICAgICAgICAgJzEuNi4wJzogdHJ1ZSxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgZGVzaXJlZCA9IFsxLCA2LCAwXTtcclxuICAgICAgICB2YXIgZGVzaXJlZEtleSA9ICcxLjYuMCc7XHJcblxyXG4gICAgICAgIHZhciBkZWZhdWx0Q29uZmlnSGFuZGxlciA9IHNlcmlhbGl6YXRpb25IYW5kbGVyW2Rlc2lyZWRLZXldO1xyXG4gICAgICAgIHZhciBjdXJyZW50Q29uZmlnSGFuZGxlciA9IGRlZmF1bHRDb25maWdIYW5kbGVyO1xyXG4gICAgICAgIHZhciBkZWZhdWx0U2VyaWFsaXphdGlvbkhhbmRsZXIgPSBzZXJpYWxpemF0aW9uSGFuZGxlcltkZXNpcmVkS2V5XTtcclxuICAgICAgICB2YXIgY3VycmVudFNlcmlhbGl6YXRpb25IYW5kbGVyID0gZGVmYXVsdFNlcmlhbGl6YXRpb25IYW5kbGVyO1xyXG5cclxuICAgICAgICB2YXIgZmllbGRWZXJzaW9uTWFza3MgPSB7XHJcbiAgICAgICAgICAgICcxLjQuMCc6IDB4N0ZGRkZGRixcclxuICAgICAgICAgICAgJzEuNS4wJzogMHg3RkZGRkZGLFxyXG4gICAgICAgICAgICAnMS42LjAnOiAweDdGRkZGRkYsXHJcbiAgICAgICAgfTtcclxuICAgICAgICB2YXIgc3RhdGVNYXNrID0gMHhGRkZGRkZGRjtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgdmVyc2lvbiA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAga2V5ID0gdmFsdWUuam9pbignLicpO1xyXG4gICAgICAgICAgICAgICAgY3VycmVudENvbmZpZ0hhbmRsZXIgPVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ0hhbmRsZXJba2V5XSB8fCBkZWZhdWx0Q29uZmlnSGFuZGxlcjtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRTZXJpYWxpemF0aW9uSGFuZGxlciA9XHJcbiAgICAgICAgICAgICAgICAgICAgc2VyaWFsaXphdGlvbkhhbmRsZXJba2V5XSB8fCBkZWZhdWx0U2VyaWFsaXphdGlvbkhhbmRsZXI7XHJcbiAgICAgICAgICAgICAgICBzdGF0ZU1hc2sgPSBmaWVsZFZlcnNpb25NYXNrc1trZXldIHx8IDB4RkZGRkZGRkY7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmVyc2lvbjtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAga2V5OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBrZXk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHN1cHBvcnRlZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc3VwcG9ydGVkW2tleV0gPT09IHRydWU7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGRlc2lyZWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlc2lyZWQ7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGRlc2lyZWRLZXk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlc2lyZWRLZXk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGNvbmZpZ0hhbmRsZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnRDb25maWdIYW5kbGVyO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzZXJpYWxpemF0aW9uSGFuZGxlcjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY3VycmVudFNlcmlhbGl6YXRpb25IYW5kbGVyO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzdGF0ZU1hc2s6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0YXRlTWFzaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG59KCkpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ2ZseWJyaXhDb21tb24nKS5mYWN0b3J5KCdsZWQnLCBsZWQpO1xyXG5cclxuICAgIGxlZC4kaW5qZWN0ID0gWydkZXZpY2VDb25maWcnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBsZWQoZGV2aWNlQ29uZmlnKSB7XHJcbiAgICAgICAgdmFyIExlZFBhdHRlcm5zID0ge1xyXG4gICAgICAgICAgICBOT19PVkVSUklERTogMCxcclxuICAgICAgICAgICAgRkxBU0g6IDEsXHJcbiAgICAgICAgICAgIEJFQUNPTjogMixcclxuICAgICAgICAgICAgQlJFQVRIRTogMyxcclxuICAgICAgICAgICAgQUxURVJOQVRFOiA0LFxyXG4gICAgICAgICAgICBTT0xJRDogNSxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIga2V5cyA9IFsncmlnaHRfZnJvbnQnLCAncmlnaHRfYmFjaycsICdsZWZ0X2Zyb250JywgJ2xlZnRfYmFjayddO1xyXG4gICAgICAgIHZhciBjb2xvcnMgPSB7fTtcclxuXHJcbiAgICAgICAga2V5cy5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xyXG4gICAgICAgICAgICBjb2xvcnNba2V5XSA9IHtcclxuICAgICAgICAgICAgICAgIHJlZDogMCxcclxuICAgICAgICAgICAgICAgIGdyZWVuOiAwLFxyXG4gICAgICAgICAgICAgICAgYmx1ZTogMCxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB2YXIgbGVkU3RhdGUgPSB7XHJcbiAgICAgICAgICAgIHN0YXR1czogNjU1MzUsXHJcbiAgICAgICAgICAgIHBhdHRlcm46IExlZFBhdHRlcm5zLlNPTElELFxyXG4gICAgICAgICAgICBjb2xvcnM6IGNvbG9ycyxcclxuICAgICAgICAgICAgaW5kaWNhdG9yX3JlZDogZmFsc2UsXHJcbiAgICAgICAgICAgIGluZGljYXRvcl9ncmVlbjogZmFsc2UsXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgY29uZmlnUGFydCA9IHtsZWRTdGF0ZXM6IFtsZWRTdGF0ZV19O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZXQoXHJcbiAgICAgICAgICAgIGNvbG9yX3JmLCBjb2xvcl9yYiwgY29sb3JfbGYsIGNvbG9yX2xiLCBwYXR0ZXJuLCByZWQsIGdyZWVuKSB7XHJcbiAgICAgICAgICAgIGlmIChwYXR0ZXJuID4gMCAmJiBwYXR0ZXJuIDwgNikge1xyXG4gICAgICAgICAgICAgICAgbGVkU3RhdGUucGF0dGVybiA9IHBhdHRlcm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgW2NvbG9yX3JmLCBjb2xvcl9yYiwgY29sb3JfbGYsIGNvbG9yX2xiXS5mb3JFYWNoKGZ1bmN0aW9uKFxyXG4gICAgICAgICAgICAgICAgY29sb3IsIGlkeCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFjb2xvcikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHZhciB2ID0gY29sb3JzW2tleXNbaWR4XV07XHJcbiAgICAgICAgICAgICAgICB2LnJlZCA9IGNvbG9yLnJlZDtcclxuICAgICAgICAgICAgICAgIHYuZ3JlZW4gPSBjb2xvci5ncmVlbjtcclxuICAgICAgICAgICAgICAgIHYuYmx1ZSA9IGNvbG9yLmJsdWU7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBpZiAocmVkICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIGxlZFN0YXRlLmluZGljYXRvcl9yZWQgPSByZWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGdyZWVuICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIGxlZFN0YXRlLmluZGljYXRvcl9ncmVlbiA9IGdyZWVuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBhcHBseSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2V0U2ltcGxlKHJlZCwgZ3JlZW4sIGJsdWUpIHtcclxuICAgICAgICAgICAgdmFyIGNvbG9yID0ge3JlZDogcmVkIHx8IDAsIGdyZWVuOiBncmVlbiB8fCAwLCBibHVlOiBibHVlIHx8IDB9O1xyXG4gICAgICAgICAgICBzZXQoY29sb3IsIGNvbG9yLCBjb2xvciwgY29sb3IsIExlZFBhdHRlcm5zLlNPTElEKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFwcGx5KCkge1xyXG4gICAgICAgICAgICBkZXZpY2VDb25maWcuc2VuZFBhcnRpYWwoXHJcbiAgICAgICAgICAgICAgICBkZXZpY2VDb25maWcuZmllbGQuTEVEX1NUQVRFUywgIC8vIFNldCBMRUQgc3RhdGUgcGFydFxyXG4gICAgICAgICAgICAgICAgMSwgICAgICAgICAgIC8vIG1vcmUgc3BlY2lmaWNhbGx5LCB0aGUgZmlyc3Qgc3RhdGUgMl4wID0gMVxyXG4gICAgICAgICAgICAgICAgY29uZmlnUGFydCwgIC8vIHRvIG91ciBwYXJ0aWFsIGNvbmZpZ3VyYXRpb25cclxuICAgICAgICAgICAgICAgIHRydWUgIC8vIGFuZCBzZXQgdGhlIFwidGVtcG9yYXJ5XCIgZmxhZywgbm90IGNoYW5naW5nIEVFUFJPTVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHNldDogc2V0LFxyXG4gICAgICAgICAgICBzZXRTaW1wbGU6IHNldFNpbXBsZSxcclxuICAgICAgICAgICAgcGF0dGVybnM6IExlZFBhdHRlcm5zLFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG59KCkpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ2ZseWJyaXhDb21tb24nKS5mYWN0b3J5KCdwYXJzZXInLCBwYXJzZXIpO1xyXG5cclxuICAgIHBhcnNlci4kaW5qZWN0ID0gWydjb21tYW5kTG9nJywgJ2VuY29kYWJsZScsICdmaXJtd2FyZVZlcnNpb24nXTtcclxuXHJcbiAgICBmdW5jdGlvbiBwYXJzZXIoY29tbWFuZExvZywgZW5jb2RhYmxlLCBmaXJtd2FyZVZlcnNpb24pIHtcclxuICAgICAgICB2YXIgTWVzc2FnZVR5cGUgPSB7XHJcbiAgICAgICAgICAgIFN0YXRlOiAwLFxyXG4gICAgICAgICAgICBDb21tYW5kOiAxLFxyXG4gICAgICAgICAgICBEZWJ1Z1N0cmluZzogMyxcclxuICAgICAgICAgICAgSGlzdG9yeURhdGE6IDQsXHJcbiAgICAgICAgICAgIFJlc3BvbnNlOiAyNTUsXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdmFyIENvbW1hbmRGaWVsZHMgPSB7XHJcbiAgICAgICAgICAgIENPTV9SRVFfUkVTUE9OU0U6IDEgPDwgMCxcclxuICAgICAgICAgICAgQ09NX1NFVF9FRVBST01fREFUQTogMSA8PCAxLFxyXG4gICAgICAgICAgICBDT01fUkVJTklUX0VFUFJPTV9EQVRBOiAxIDw8IDIsXHJcbiAgICAgICAgICAgIENPTV9SRVFfRUVQUk9NX0RBVEE6IDEgPDwgMyxcclxuICAgICAgICAgICAgQ09NX1JFUV9FTkFCTEVfSVRFUkFUSU9OOiAxIDw8IDQsXHJcbiAgICAgICAgICAgIENPTV9NT1RPUl9PVkVSUklERV9TUEVFRF8wOiAxIDw8IDUsXHJcbiAgICAgICAgICAgIENPTV9NT1RPUl9PVkVSUklERV9TUEVFRF8xOiAxIDw8IDYsXHJcbiAgICAgICAgICAgIENPTV9NT1RPUl9PVkVSUklERV9TUEVFRF8yOiAxIDw8IDcsXHJcbiAgICAgICAgICAgIENPTV9NT1RPUl9PVkVSUklERV9TUEVFRF8zOiAxIDw8IDgsXHJcbiAgICAgICAgICAgIENPTV9NT1RPUl9PVkVSUklERV9TUEVFRF80OiAxIDw8IDksXHJcbiAgICAgICAgICAgIENPTV9NT1RPUl9PVkVSUklERV9TUEVFRF81OiAxIDw8IDEwLFxyXG4gICAgICAgICAgICBDT01fTU9UT1JfT1ZFUlJJREVfU1BFRURfNjogMSA8PCAxMSxcclxuICAgICAgICAgICAgQ09NX01PVE9SX09WRVJSSURFX1NQRUVEXzc6IDEgPDwgMTIsXHJcbiAgICAgICAgICAgIENPTV9NT1RPUl9PVkVSUklERV9TUEVFRF9BTEw6ICgxIDw8IDUpIHwgKDEgPDwgNikgfCAoMSA8PCA3KSB8XHJcbiAgICAgICAgICAgICAgICAoMSA8PCA4KSB8ICgxIDw8IDkpIHwgKDEgPDwgMTApIHwgKDEgPDwgMTEpIHwgKDEgPDwgMTIpLFxyXG4gICAgICAgICAgICBDT01fU0VUX0NPTU1BTkRfT1ZFUlJJREU6IDEgPDwgMTMsXHJcbiAgICAgICAgICAgIENPTV9TRVRfU1RBVEVfTUFTSzogMSA8PCAxNCxcclxuICAgICAgICAgICAgQ09NX1NFVF9TVEFURV9ERUxBWTogMSA8PCAxNSxcclxuICAgICAgICAgICAgQ09NX1NFVF9TRF9XUklURV9ERUxBWTogMSA8PCAxNixcclxuICAgICAgICAgICAgQ09NX1NFVF9MRUQ6IDEgPDwgMTcsXHJcbiAgICAgICAgICAgIENPTV9TRVRfU0VSSUFMX1JDOiAxIDw8IDE4LFxyXG4gICAgICAgICAgICBDT01fU0VUX0NBUkRfUkVDT1JESU5HOiAxIDw8IDE5LFxyXG4gICAgICAgICAgICBDT01fU0VUX1BBUlRJQUxfRUVQUk9NX0RBVEE6IDEgPDwgMjAsXHJcbiAgICAgICAgICAgIENPTV9SRUlOSVRfUEFSVElBTF9FRVBST01fREFUQTogMSA8PCAyMSxcclxuICAgICAgICAgICAgQ09NX1JFUV9QQVJUSUFMX0VFUFJPTV9EQVRBOiAxIDw8IDIyLFxyXG4gICAgICAgICAgICBDT01fUkVRX0NBUkRfUkVDT1JESU5HX1NUQVRFOiAxIDw8IDIzLFxyXG4gICAgICAgICAgICBDT01fU0VUX1BBUlRJQUxfVEVNUE9SQVJZX0NPTkZJRzogMSA8PCAyNCxcclxuICAgICAgICAgICAgQ09NX1NFVF9DT01NQU5EX1NPVVJDRVM6IDEgPDwgMjUsXHJcbiAgICAgICAgICAgIENPTV9TRVRfQ0FMSUJSQVRJT046IDEgPDwgMjYsXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdmFyIFN0YXRlRmllbGRzID0ge1xyXG4gICAgICAgICAgICBTVEFURV9BTEw6IDB4RkZGRkZGRkYsXHJcbiAgICAgICAgICAgIFNUQVRFX05PTkU6IDAsXHJcbiAgICAgICAgICAgIFNUQVRFX01JQ1JPUzogMSA8PCAwLFxyXG4gICAgICAgICAgICBTVEFURV9TVEFUVVM6IDEgPDwgMSxcclxuICAgICAgICAgICAgU1RBVEVfVjA6IDEgPDwgMixcclxuICAgICAgICAgICAgU1RBVEVfSTA6IDEgPDwgMyxcclxuICAgICAgICAgICAgU1RBVEVfSTE6IDEgPDwgNCxcclxuICAgICAgICAgICAgU1RBVEVfQUNDRUw6IDEgPDwgNSxcclxuICAgICAgICAgICAgU1RBVEVfR1lSTzogMSA8PCA2LFxyXG4gICAgICAgICAgICBTVEFURV9NQUc6IDEgPDwgNyxcclxuICAgICAgICAgICAgU1RBVEVfVEVNUEVSQVRVUkU6IDEgPDwgOCxcclxuICAgICAgICAgICAgU1RBVEVfUFJFU1NVUkU6IDEgPDwgOSxcclxuICAgICAgICAgICAgU1RBVEVfUlhfUFBNOiAxIDw8IDEwLFxyXG4gICAgICAgICAgICBTVEFURV9BVVhfQ0hBTl9NQVNLOiAxIDw8IDExLFxyXG4gICAgICAgICAgICBTVEFURV9DT01NQU5EUzogMSA8PCAxMixcclxuICAgICAgICAgICAgU1RBVEVfRl9BTkRfVDogMSA8PCAxMyxcclxuICAgICAgICAgICAgU1RBVEVfUElEX0ZaX01BU1RFUjogMSA8PCAxNCxcclxuICAgICAgICAgICAgU1RBVEVfUElEX1RYX01BU1RFUjogMSA8PCAxNSxcclxuICAgICAgICAgICAgU1RBVEVfUElEX1RZX01BU1RFUjogMSA8PCAxNixcclxuICAgICAgICAgICAgU1RBVEVfUElEX1RaX01BU1RFUjogMSA8PCAxNyxcclxuICAgICAgICAgICAgU1RBVEVfUElEX0ZaX1NMQVZFOiAxIDw8IDE4LFxyXG4gICAgICAgICAgICBTVEFURV9QSURfVFhfU0xBVkU6IDEgPDwgMTksXHJcbiAgICAgICAgICAgIFNUQVRFX1BJRF9UWV9TTEFWRTogMSA8PCAyMCxcclxuICAgICAgICAgICAgU1RBVEVfUElEX1RaX1NMQVZFOiAxIDw8IDIxLFxyXG4gICAgICAgICAgICBTVEFURV9NT1RPUl9PVVQ6IDEgPDwgMjIsXHJcbiAgICAgICAgICAgIFNUQVRFX0tJTkVfQU5HTEU6IDEgPDwgMjMsXHJcbiAgICAgICAgICAgIFNUQVRFX0tJTkVfUkFURTogMSA8PCAyNCxcclxuICAgICAgICAgICAgU1RBVEVfS0lORV9BTFRJVFVERTogMSA8PCAyNSxcclxuICAgICAgICAgICAgU1RBVEVfTE9PUF9DT1VOVDogMSA8PCAyNixcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgU3RhdHVzQ29kZXMgPSB7XHJcbiAgICAgICAgICAgIFNUQVRVU19CT09UOiAweDAwMDEsXHJcbiAgICAgICAgICAgIFNUQVRVU19NUFVfRkFJTDogMHgwMDAyLFxyXG4gICAgICAgICAgICBTVEFUVVNfQk1QX0ZBSUw6IDB4MDAwNCxcclxuICAgICAgICAgICAgU1RBVFVTX1JYX0ZBSUw6IDB4MDAwOCxcclxuXHJcbiAgICAgICAgICAgIFNUQVRVU19JRExFOiAweDAwMTAsXHJcblxyXG4gICAgICAgICAgICBTVEFUVVNfRU5BQkxJTkc6IDB4MDAyMCxcclxuICAgICAgICAgICAgU1RBVFVTX0NMRUFSX01QVV9CSUFTOiAweDAwNDAsXHJcbiAgICAgICAgICAgIFNUQVRVU19TRVRfTVBVX0JJQVM6IDB4MDA4MCxcclxuXHJcbiAgICAgICAgICAgIFNUQVRVU19GQUlMX1NUQUJJTElUWTogMHgwMTAwLFxyXG4gICAgICAgICAgICBTVEFUVVNfRkFJTF9BTkdMRTogMHgwMjAwLFxyXG4gICAgICAgICAgICBTVEFUVVNfRkFJTF9PVEhFUjogMHg0MDAwLFxyXG5cclxuICAgICAgICAgICAgU1RBVFVTX0VOQUJMRUQ6IDB4MDQwMCxcclxuICAgICAgICAgICAgU1RBVFVTX0JBVFRFUllfTE9XOiAweDA4MDAsXHJcblxyXG4gICAgICAgICAgICBTVEFUVVNfVEVNUF9XQVJOSU5HOiAweDEwMDAsXHJcbiAgICAgICAgICAgIFNUQVRVU19MT0dfRlVMTDogMHgyMDAwLFxyXG4gICAgICAgICAgICBTVEFUVVNfT1ZFUlJJREU6IDB4ODAwMCxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgbGFzdF90aW1lc3RhbXBfdXMgPSAwO1xyXG5cclxuICAgICAgICB2YXIgc3RhdGVIYW5kbGVyID0gKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB2YXIgZSA9IGVuY29kYWJsZTtcclxuICAgICAgICAgICAgdmFyIHBpZEhhbmRsZXIgPSBlLnBvbHlhcnJheShbXHJcbiAgICAgICAgICAgICAgICBlLlVpbnQzMiwgZS5GbG9hdDMyLCBlLkZsb2F0MzIsIGUuRmxvYXQzMiwgZS5GbG9hdDMyLCBlLkZsb2F0MzJcclxuICAgICAgICAgICAgXSk7XHJcbiAgICAgICAgICAgIHJldHVybiBlLm1hcChbXHJcbiAgICAgICAgICAgICAgICB7a2V5OiAndGltZXN0YW1wX3VzJywgZWxlbWVudDogZS5VaW50MzJ9LFxyXG4gICAgICAgICAgICAgICAge2tleTogJ3N0YXR1cycsIGVsZW1lbnQ6IGUuVWludDE2fSxcclxuICAgICAgICAgICAgICAgIHtrZXk6ICdWMF9yYXcnLCBlbGVtZW50OiBlLlVpbnQxNn0sXHJcbiAgICAgICAgICAgICAgICB7a2V5OiAnSTBfcmF3JywgZWxlbWVudDogZS5VaW50MTZ9LFxyXG4gICAgICAgICAgICAgICAge2tleTogJ0kxX3JhdycsIGVsZW1lbnQ6IGUuVWludDE2fSxcclxuICAgICAgICAgICAgICAgIHtrZXk6ICdhY2NlbCcsIGVsZW1lbnQ6IGUuYXJyYXkoMywgZS5GbG9hdDMyKX0sXHJcbiAgICAgICAgICAgICAgICB7a2V5OiAnZ3lybycsIGVsZW1lbnQ6IGUuYXJyYXkoMywgZS5GbG9hdDMyKX0sXHJcbiAgICAgICAgICAgICAgICB7a2V5OiAnbWFnJywgZWxlbWVudDogZS5hcnJheSgzLCBlLkZsb2F0MzIpfSxcclxuICAgICAgICAgICAgICAgIHtrZXk6ICd0ZW1wZXJhdHVyZScsIGVsZW1lbnQ6IGUuVWludDE2fSxcclxuICAgICAgICAgICAgICAgIHtrZXk6ICdwcmVzc3VyZScsIGVsZW1lbnQ6IGUuVWludDMyfSxcclxuICAgICAgICAgICAgICAgIHtrZXk6ICdwcG0nLCBlbGVtZW50OiBlLmFycmF5KDYsIGUuSW50MTYpfSxcclxuICAgICAgICAgICAgICAgIHtrZXk6ICdBVVhfY2hhbl9tYXNrJywgZWxlbWVudDogZS5VaW50OH0sXHJcbiAgICAgICAgICAgICAgICAvLyB0aHJvdHRsZSwgcGl0Y2gsIHJvbGwsIHlhd1xyXG4gICAgICAgICAgICAgICAge2tleTogJ2NvbW1hbmQnLCBlbGVtZW50OiBlLmFycmF5KDQsIGUuSW50MTYpfSxcclxuICAgICAgICAgICAgICAgIC8vIEZ6LCBUeCwgVHksIFR6XHJcbiAgICAgICAgICAgICAgICB7a2V5OiAnY29udHJvbCcsIGVsZW1lbnQ6IGUuYXJyYXkoNCwgZS5GbG9hdDMyKX0sXHJcbiAgICAgICAgICAgICAgICAvLyB0aW1lLCBpbnB1dCwgc2V0cG9pbnQsIHBfdGVybSwgaV90ZXJtLCBkX3Rlcm1cclxuICAgICAgICAgICAgICAgIHtrZXk6ICdwaWRfbWFzdGVyX0Z6JywgZWxlbWVudDogcGlkSGFuZGxlcn0sXHJcbiAgICAgICAgICAgICAgICB7a2V5OiAncGlkX21hc3Rlcl9UeCcsIGVsZW1lbnQ6IHBpZEhhbmRsZXJ9LFxyXG4gICAgICAgICAgICAgICAge2tleTogJ3BpZF9tYXN0ZXJfVHknLCBlbGVtZW50OiBwaWRIYW5kbGVyfSxcclxuICAgICAgICAgICAgICAgIHtrZXk6ICdwaWRfbWFzdGVyX1R6JywgZWxlbWVudDogcGlkSGFuZGxlcn0sXHJcbiAgICAgICAgICAgICAgICB7a2V5OiAncGlkX3NsYXZlX0Z6JywgZWxlbWVudDogcGlkSGFuZGxlcn0sXHJcbiAgICAgICAgICAgICAgICB7a2V5OiAncGlkX3NsYXZlX1R4JywgZWxlbWVudDogcGlkSGFuZGxlcn0sXHJcbiAgICAgICAgICAgICAgICB7a2V5OiAncGlkX3NsYXZlX1R5JywgZWxlbWVudDogcGlkSGFuZGxlcn0sXHJcbiAgICAgICAgICAgICAgICB7a2V5OiAncGlkX3NsYXZlX1R6JywgZWxlbWVudDogcGlkSGFuZGxlcn0sXHJcbiAgICAgICAgICAgICAgICB7a2V5OiAnTW90b3JPdXQnLCBlbGVtZW50OiBlLmFycmF5KDgsIGUuSW50MTYpfSxcclxuICAgICAgICAgICAgICAgIHtrZXk6ICdraW5lbWF0aWNzQW5nbGUnLCBlbGVtZW50OiBlLmFycmF5KDMsIGUuRmxvYXQzMil9LFxyXG4gICAgICAgICAgICAgICAge2tleTogJ2tpbmVtYXRpY3NSYXRlJywgZWxlbWVudDogZS5hcnJheSgzLCBlLkZsb2F0MzIpfSxcclxuICAgICAgICAgICAgICAgIHtrZXk6ICdraW5lbWF0aWNzQWx0aXR1ZGUnLCBlbGVtZW50OiBlLkZsb2F0MzJ9LFxyXG4gICAgICAgICAgICAgICAge2tleTogJ2xvb3BDb3VudCcsIGVsZW1lbnQ6IGUuVWludDMyfSxcclxuICAgICAgICAgICAgXSk7XHJcbiAgICAgICAgfSgpKTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gcHJvY2Vzc0JpbmFyeURhdGFzdHJlYW0oXHJcbiAgICAgICAgICAgIGNvbW1hbmQsIG1hc2ssIG1lc3NhZ2VfYnVmZmVyLCBjYl9zdGF0ZSwgY2JfY29tbWFuZCwgY2JfZGVidWcsIGNiX2hpc3RvcnksIGNiX2Fjaykge1xyXG4gICAgICAgICAgICBkaXNwYXRjaChjb21tYW5kLCBtYXNrLCBtZXNzYWdlX2J1ZmZlciwgXHJcbiAgICAgICAgICAgICAgICBmdW5jdGlvbigpIHtjYWxsYmFja1N0YXRlSGVscGVyKG1hc2ssIG1lc3NhZ2VfYnVmZmVyLCBjYl9zdGF0ZSl9LFxyXG4gICAgICAgICAgICAgICAgY2JfY29tbWFuZCwgY2JfZGVidWcsIGNiX2hpc3RvcnksIGNiX2Fjayk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBkaXNwYXRjaChcclxuICAgICAgICAgICAgY29tbWFuZCwgbWFzaywgbWVzc2FnZV9idWZmZXIsIGNiX3N0YXRlLCBjYl9jb21tYW5kLCBjYl9kZWJ1ZywgY2JfaGlzdG9yeSwgY2JfYWNrKSB7XHJcbiAgICAgICAgICAgIHN3aXRjaCAoY29tbWFuZCkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSBNZXNzYWdlVHlwZS5TdGF0ZTpcclxuICAgICAgICAgICAgICAgICAgICBjYl9zdGF0ZShtYXNrLCBtZXNzYWdlX2J1ZmZlcik7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIE1lc3NhZ2VUeXBlLkNvbW1hbmQ6XHJcbiAgICAgICAgICAgICAgICAgICAgY2JfY29tbWFuZChtYXNrLCBtZXNzYWdlX2J1ZmZlcik7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIE1lc3NhZ2VUeXBlLkRlYnVnU3RyaW5nOlxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBkZWJ1Z19zdHJpbmcgPSBhcnJheWJ1ZmZlcjJzdHJpbmcobWVzc2FnZV9idWZmZXIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNiX2RlYnVnKGRlYnVnX3N0cmluZyk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIE1lc3NhZ2VUeXBlLkhpc3RvcnlEYXRhOlxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBkZWJ1Z19zdHJpbmcgPSBhcnJheWJ1ZmZlcjJzdHJpbmcobWVzc2FnZV9idWZmZXIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNiX2hpc3RvcnkoZGVidWdfc3RyaW5nKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgTWVzc2FnZVR5cGUuUmVzcG9uc2U6XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRhdGEgPSBuZXcgRGF0YVZpZXcobWVzc2FnZV9idWZmZXIsIDApO1xyXG4gICAgICAgICAgICAgICAgICAgIGNiX2FjayhtYXNrLCBkYXRhLmdldEludDMyKDAsIDEpKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFycmF5YnVmZmVyMnN0cmluZyhidWYpIHtcclxuICAgICAgICAgICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgbmV3IFVpbnQ4QXJyYXkoYnVmKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBjYWxsYmFja1N0YXRlSGVscGVyKG1hc2ssIG1lc3NhZ2VfYnVmZmVyLCBjYl9zdGF0ZSkge1xyXG4gICAgICAgICAgICB2YXIgc3RhdGUgPSBzdGF0ZUhhbmRsZXIuZW1wdHkoKTtcclxuICAgICAgICAgICAgdmFyIHN0YXRlX2RhdGFfbWFzayA9IFtdOyAgLy8gVE9ETzogZ2V0IHJpZCBvZiB0aGlzIGluIGdlbmVyYWxcclxuICAgICAgICAgICAgdmFyIGRhdGEgPSBuZXcgRGF0YVZpZXcobWVzc2FnZV9idWZmZXIsIDApO1xyXG4gICAgICAgICAgICB2YXIgYiA9IG5ldyBlbmNvZGFibGUuU2VyaWFsaXplcigpO1xyXG4gICAgICAgICAgICB2YXIgc2VyaWFsX3VwZGF0ZV9yYXRlX0h6ID0gMDtcclxuXHJcbiAgICAgICAgICAgIG1hc2sgJj0gZmlybXdhcmVWZXJzaW9uLnN0YXRlTWFzaygpO1xyXG5cclxuICAgICAgICAgICAgc3RhdGVIYW5kbGVyLmNoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24oY2hpbGQsIGlkeCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHN1Ym1hc2sgPSAoMSA8PCBpZHgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCEobWFzayAmIHN1Ym1hc2spKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgc3RhdGVfZGF0YV9tYXNrW2lkeF0gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgdmFyIGhhbmRsZXIgPSBjaGlsZC5lbGVtZW50O1xyXG4gICAgICAgICAgICAgICAgdmFyIGtleSA9IGNoaWxkLmtleTtcclxuICAgICAgICAgICAgICAgIHN0YXRlW2tleV0gPSBoYW5kbGVyLmRlY29kZShkYXRhLCBiKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBpZiAobWFzayAmIFN0YXRlRmllbGRzLlNUQVRFX01JQ1JPUykge1xyXG4gICAgICAgICAgICAgICAgc2VyaWFsX3VwZGF0ZV9yYXRlX0h6ID1cclxuICAgICAgICAgICAgICAgICAgICAxMDAwMDAwIC8gKHN0YXRlLnRpbWVzdGFtcF91cyAtIGxhc3RfdGltZXN0YW1wX3VzKTtcclxuICAgICAgICAgICAgICAgIGxhc3RfdGltZXN0YW1wX3VzID0gc3RhdGUudGltZXN0YW1wX3VzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChtYXNrICYgU3RhdGVGaWVsZHMuU1RBVEVfVEVNUEVSQVRVUkUpIHtcclxuICAgICAgICAgICAgICAgIHN0YXRlLnRlbXBlcmF0dXJlIC89IDEwMC4wOyAgLy8gdGVtcGVyYXR1cmVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAobWFzayAmIFN0YXRlRmllbGRzLlNUQVRFX1BSRVNTVVJFKSB7XHJcbiAgICAgICAgICAgICAgICBzdGF0ZS5wcmVzc3VyZSAvPSAyNTYuMDsgIC8vIHByZXNzdXJlIChRMjQuOClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjYl9zdGF0ZShzdGF0ZSwgc3RhdGVfZGF0YV9tYXNrLCBzZXJpYWxfdXBkYXRlX3JhdGVfSHopO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcHJvY2Vzc0JpbmFyeURhdGFzdHJlYW06IHByb2Nlc3NCaW5hcnlEYXRhc3RyZWFtLFxyXG4gICAgICAgICAgICBNZXNzYWdlVHlwZTogTWVzc2FnZVR5cGUsXHJcbiAgICAgICAgICAgIENvbW1hbmRGaWVsZHM6IENvbW1hbmRGaWVsZHMsXHJcbiAgICAgICAgICAgIFN0YXR1c0NvZGVzOiBTdGF0dXNDb2RlcyxcclxuICAgICAgICAgICAgU3RhdGVGaWVsZHM6IFN0YXRlRmllbGRzLFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgnZmx5YnJpeENvbW1vbicpLmZhY3RvcnkoJ3ByZXNldHMnLCBwcmVzZXRzKTtcclxuXHJcbiAgICBwcmVzZXRzLiRpbmplY3QgPSBbJ2Zpcm13YXJlVmVyc2lvbicsICdwYXJzZXInXTtcclxuXHJcbiAgICBmdW5jdGlvbiBwcmVzZXRzKGZpcm13YXJlVmVyc2lvbiwgcGFyc2VyKSB7XHJcbiAgICAgICAgdmFyIExlZFBhdHRlcm5zID0ge1xyXG4gICAgICAgICAgICBOT19PVkVSUklERTogMCxcclxuICAgICAgICAgICAgRkxBU0g6IDEsXHJcbiAgICAgICAgICAgIEJFQUNPTjogMixcclxuICAgICAgICAgICAgQlJFQVRIRTogMyxcclxuICAgICAgICAgICAgQUxURVJOQVRFOiA0LFxyXG4gICAgICAgICAgICBTT0xJRDogNSxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgQ29sb3IgPSB7XHJcbiAgICAgICAgICAgIEJsYWNrOiAweDAwMDAwMCxcclxuICAgICAgICAgICAgUmVkOiAweGZmMDAwMCxcclxuICAgICAgICAgICAgR3JlZW46IDB4MDA4MDAwLFxyXG4gICAgICAgICAgICBPcmFuZ2U6IDB4ZmZhNTAwLFxyXG4gICAgICAgICAgICBCbHVlOiAweDAwMDBmZixcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiB0b1JnYihjb2xvcikge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgcmVkOiAoY29sb3IgPj4gMTYpICYgMHhmZixcclxuICAgICAgICAgICAgICAgIGdyZWVuOiAoY29sb3IgPj4gOCkgJiAweGZmLFxyXG4gICAgICAgICAgICAgICAgYmx1ZTogY29sb3IgJiAweGZmLFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gbWFrZUxlZENhc2UobWFzaywgcGF0dGVybiwgY29sb3IxLCBjb2xvcjIsIHJlZCwgZ3JlZW4pIHtcclxuICAgICAgICAgICAgaWYgKGNvbG9yMiA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICBjb2xvcjIgPSBjb2xvcjE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29sb3IxID0gdG9SZ2IoY29sb3IxKTtcclxuICAgICAgICAgICAgY29sb3IyID0gdG9SZ2IoY29sb3IyKTtcclxuICAgICAgICAgICAgcmVkID0gcmVkIHx8IGZhbHNlO1xyXG4gICAgICAgICAgICBncmVlbiA9IGdyZWVuIHx8IGZhbHNlO1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgc3RhdHVzOiBtYXNrLFxyXG4gICAgICAgICAgICAgICAgcGF0dGVybjogcGF0dGVybixcclxuICAgICAgICAgICAgICAgIGNvbG9yczoge1xyXG4gICAgICAgICAgICAgICAgICAgIHJpZ2h0X2Zyb250OiBjb2xvcjEsXHJcbiAgICAgICAgICAgICAgICAgICAgcmlnaHRfYmFjazogY29sb3IxLFxyXG4gICAgICAgICAgICAgICAgICAgIGxlZnRfZnJvbnQ6IGNvbG9yMixcclxuICAgICAgICAgICAgICAgICAgICBsZWZ0X2JhY2s6IGNvbG9yMixcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBpbmRpY2F0b3JfcmVkOiByZWQsXHJcbiAgICAgICAgICAgICAgICBpbmRpY2F0b3JfZ3JlZW46IGdyZWVuLFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZmFkZShjb2xvcikge1xyXG4gICAgICAgICAgICB2YXIgciA9IChjb2xvciA+PiAxNikgJiAweGZmO1xyXG4gICAgICAgICAgICB2YXIgZyA9IChjb2xvciA+PiA4KSAmIDB4ZmY7XHJcbiAgICAgICAgICAgIHZhciBiID0gY29sb3IgJiAweGZmO1xyXG4gICAgICAgICAgICByICo9IDAuOTtcclxuICAgICAgICAgICAgZyAqPSAwLjk7XHJcbiAgICAgICAgICAgIGIgKj0gMC45O1xyXG4gICAgICAgICAgICByZXR1cm4gKE1hdGguZmxvb3IocikgPDwgMTYpIHwgKE1hdGguZmxvb3IoZykgPDwgOCkgfCBNYXRoLmZsb29yKGIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIGxlZFN0YXRlcyA9IFtcclxuICAgICAgICAgICAgbWFrZUxlZENhc2UoXHJcbiAgICAgICAgICAgICAgICBwYXJzZXIuU3RhdHVzQ29kZXMuU1RBVFVTX01QVV9GQUlMLCBMZWRQYXR0ZXJucy5TT0xJRCxcclxuICAgICAgICAgICAgICAgIGZhZGUoQ29sb3IuQmxhY2spLCBmYWRlKENvbG9yLlJlZCksIHRydWUpLFxyXG4gICAgICAgICAgICBtYWtlTGVkQ2FzZShcclxuICAgICAgICAgICAgICAgIHBhcnNlci5TdGF0dXNDb2Rlcy5TVEFUVVNfQk1QX0ZBSUwsIExlZFBhdHRlcm5zLlNPTElELFxyXG4gICAgICAgICAgICAgICAgZmFkZShDb2xvci5SZWQpLCBmYWRlKENvbG9yLkJsYWNrKSwgdHJ1ZSksXHJcbiAgICAgICAgICAgIG1ha2VMZWRDYXNlKFxyXG4gICAgICAgICAgICAgICAgcGFyc2VyLlN0YXR1c0NvZGVzLlNUQVRVU19CT09ULCBMZWRQYXR0ZXJucy5TT0xJRCxcclxuICAgICAgICAgICAgICAgIGZhZGUoQ29sb3IuR3JlZW4pKSxcclxuICAgICAgICAgICAgbWFrZUxlZENhc2UoXHJcbiAgICAgICAgICAgICAgICBwYXJzZXIuU3RhdHVzQ29kZXMuU1RBVFVTX1JYX0ZBSUwsIExlZFBhdHRlcm5zLkZMQVNILFxyXG4gICAgICAgICAgICAgICAgZmFkZShDb2xvci5PcmFuZ2UpKSxcclxuICAgICAgICAgICAgbWFrZUxlZENhc2UoXHJcbiAgICAgICAgICAgICAgICBwYXJzZXIuU3RhdHVzQ29kZXMuU1RBVFVTX0ZBSUxfT1RIRVIsIExlZFBhdHRlcm5zLkFMVEVSTkFURSxcclxuICAgICAgICAgICAgICAgIGZhZGUoQ29sb3IuQmx1ZSkpLFxyXG4gICAgICAgICAgICBtYWtlTGVkQ2FzZShcclxuICAgICAgICAgICAgICAgIHBhcnNlci5TdGF0dXNDb2Rlcy5TVEFUVVNfRkFJTF9TVEFCSUxJVFksIExlZFBhdHRlcm5zLkZMQVNILFxyXG4gICAgICAgICAgICAgICAgZmFkZShDb2xvci5CbGFjayksIGZhZGUoQ29sb3IuQmx1ZSkpLFxyXG4gICAgICAgICAgICBtYWtlTGVkQ2FzZShcclxuICAgICAgICAgICAgICAgIHBhcnNlci5TdGF0dXNDb2Rlcy5TVEFUVVNfRkFJTF9BTkdMRSwgTGVkUGF0dGVybnMuRkxBU0gsXHJcbiAgICAgICAgICAgICAgICBmYWRlKENvbG9yLkJsdWUpLCBmYWRlKENvbG9yLkJsYWNrKSksXHJcbiAgICAgICAgICAgIG1ha2VMZWRDYXNlKFxyXG4gICAgICAgICAgICAgICAgcGFyc2VyLlN0YXR1c0NvZGVzLlNUQVRVU19PVkVSUklERSwgTGVkUGF0dGVybnMuQkVBQ09OLFxyXG4gICAgICAgICAgICAgICAgZmFkZShDb2xvci5SZWQpKSxcclxuICAgICAgICAgICAgbWFrZUxlZENhc2UoXHJcbiAgICAgICAgICAgICAgICBwYXJzZXIuU3RhdHVzQ29kZXMuU1RBVFVTX1RFTVBfV0FSTklORywgTGVkUGF0dGVybnMuRkxBU0gsXHJcbiAgICAgICAgICAgICAgICBmYWRlKENvbG9yLlJlZCkpLFxyXG4gICAgICAgICAgICBtYWtlTGVkQ2FzZShcclxuICAgICAgICAgICAgICAgIHBhcnNlci5TdGF0dXNDb2Rlcy5TVEFUVVNfQkFUVEVSWV9MT1csIExlZFBhdHRlcm5zLkJFQUNPTixcclxuICAgICAgICAgICAgICAgIGZhZGUoQ29sb3IuT3JhbmdlKSksXHJcbiAgICAgICAgICAgIG1ha2VMZWRDYXNlKFxyXG4gICAgICAgICAgICAgICAgcGFyc2VyLlN0YXR1c0NvZGVzLlNUQVRVU19FTkFCTElORywgTGVkUGF0dGVybnMuRkxBU0gsXHJcbiAgICAgICAgICAgICAgICBmYWRlKENvbG9yLkJsdWUpKSxcclxuICAgICAgICAgICAgbWFrZUxlZENhc2UoXHJcbiAgICAgICAgICAgICAgICBwYXJzZXIuU3RhdHVzQ29kZXMuU1RBVFVTX0VOQUJMRUQsIExlZFBhdHRlcm5zLkJFQUNPTixcclxuICAgICAgICAgICAgICAgIGZhZGUoQ29sb3IuQmx1ZSkpLFxyXG4gICAgICAgICAgICBtYWtlTGVkQ2FzZShcclxuICAgICAgICAgICAgICAgIHBhcnNlci5TdGF0dXNDb2Rlcy5TVEFUVVNfSURMRSwgTGVkUGF0dGVybnMuQkVBQ09OLFxyXG4gICAgICAgICAgICAgICAgZmFkZShDb2xvci5HcmVlbikpLFxyXG4gICAgICAgICAgICBtYWtlTGVkQ2FzZSgwLCAwLCAwKSxcclxuICAgICAgICAgICAgbWFrZUxlZENhc2UoMCwgMCwgMCksXHJcbiAgICAgICAgICAgIG1ha2VMZWRDYXNlKDAsIDAsIDApLFxyXG4gICAgICAgIF07XHJcblxyXG4gICAgICAgIHZhciB0ZW1wbGF0ZSA9IHtcclxuICAgICAgICAgICAgcGNiT3JpZW50YXRpb246IFswLCAwLCAwXSxcclxuICAgICAgICAgICAgcGNiVHJhbnNsYXRpb246IFswLCAwLCAwXSxcclxuICAgICAgICAgICAgbWFnQmlhczogWzAsIDAsIDBdLFxyXG4gICAgICAgICAgICBhc3NpZ25lZENoYW5uZWw6IFsyLCAxLCAwLCAzLCA0LCA1XSxcclxuICAgICAgICAgICAgY29tbWFuZEludmVyc2lvbjogNixcclxuICAgICAgICAgICAgY2hhbm5lbE1pZHBvaW50OiBbMTUxNSwgMTUxNSwgMTUwMCwgMTUyMCwgMTUwMCwgMTUwMF0sXHJcbiAgICAgICAgICAgIGNoYW5uZWxEZWFkem9uZTogWzIwLCAyMCwgMjAsIDQwLCAyMCwgMjBdLFxyXG4gICAgICAgICAgICB0aHJ1c3RNYXN0ZXJQSURQYXJhbWV0ZXJzOiBbMSwgMCwgMCwgMCwgMC4wMDUsIDAuMDA1LCAxXSxcclxuICAgICAgICAgICAgcGl0Y2hNYXN0ZXJQSURQYXJhbWV0ZXJzOiBbMTAsIDEsIDAsIDEwLCAwLjAwNSwgMC4wMDUsIDEwXSxcclxuICAgICAgICAgICAgcm9sbE1hc3RlclBJRFBhcmFtZXRlcnM6IFsxMCwgMSwgMCwgMTAsIDAuMDA1LCAwLjAwNSwgMTBdLFxyXG4gICAgICAgICAgICB5YXdNYXN0ZXJQSURQYXJhbWV0ZXJzOiBbNSwgMSwgMCwgMTAsIDAuMDA1LCAwLjAwNSwgMTgwXSxcclxuICAgICAgICAgICAgdGhydXN0U2xhdmVQSURQYXJhbWV0ZXJzOiBbMSwgMCwgMCwgMTAsIDAuMDAxLCAwLjAwMSwgMC4zXSxcclxuICAgICAgICAgICAgcGl0Y2hTbGF2ZVBJRFBhcmFtZXRlcnM6IFsxMCwgNCwgMCwgMzAsIDAuMDAxLCAwLjAwMSwgMzBdLFxyXG4gICAgICAgICAgICByb2xsU2xhdmVQSURQYXJhbWV0ZXJzOiBbMTAsIDQsIDAsIDMwLCAwLjAwMSwgMC4wMDEsIDMwXSxcclxuICAgICAgICAgICAgeWF3U2xhdmVQSURQYXJhbWV0ZXJzOiBbMzAsIDUsIDAsIDIwLCAwLjAwMSwgMC4wMDEsIDI0MF0sXHJcbiAgICAgICAgICAgIHRocnVzdEdhaW46IDQwOTUsXHJcbiAgICAgICAgICAgIHBpdGNoR2FpbjogMjA0NyxcclxuICAgICAgICAgICAgcm9sbEdhaW46IDIwNDcsXHJcbiAgICAgICAgICAgIHlhd0dhaW46IDIwNDcsXHJcbiAgICAgICAgICAgIHBpZEJ5cGFzczogMjUsXHJcbiAgICAgICAgICAgIHN0YXRlRXN0aW1hdGlvblBhcmFtZXRlcnM6IFsxLCAwLjAxXSxcclxuICAgICAgICAgICAgZW5hYmxlUGFyYW1ldGVyczogWzAuMDAxLCAzMF0sXHJcbiAgICAgICAgICAgIGxlZFN0YXRlczogbGVkU3RhdGVzLFxyXG4gICAgICAgICAgICBuYW1lOiAnRkxZQlJJWCcsXHJcbiAgICAgICAgICAgIGZvcndhcmRNYXN0ZXJQSURQYXJhbWV0ZXJzOiBbMTAsIDEsIDAsIDEwLCAwLjAwNSwgMC4wMDUsIDEwXSxcclxuICAgICAgICAgICAgcmlnaHRNYXN0ZXJQSURQYXJhbWV0ZXJzOiBbMTAsIDEsIDAsIDEwLCAwLjAwNSwgMC4wMDUsIDEwXSxcclxuICAgICAgICAgICAgdXBNYXN0ZXJQSURQYXJhbWV0ZXJzOiBbMTAsIDEsIDAsIDEwLCAwLjAwNSwgMC4wMDUsIDEwXSxcclxuICAgICAgICAgICAgZm9yd2FyZFNsYXZlUElEUGFyYW1ldGVyczogWzEwLCA0LCAwLCAzMCwgMC4wMDEsIDAuMDAxLCAzMF0sXHJcbiAgICAgICAgICAgIHJpZ2h0U2xhdmVQSURQYXJhbWV0ZXJzOiBbMTAsIDQsIDAsIDMwLCAwLjAwMSwgMC4wMDEsIDMwXSxcclxuICAgICAgICAgICAgdXBTbGF2ZVBJRFBhcmFtZXRlcnM6IFsxMCwgNCwgMCwgMzAsIDAuMDAxLCAwLjAwMSwgMzBdLFxyXG4gICAgICAgICAgICB2ZWxvY2l0eVBpZEJ5cGFzczogMTE5LFxyXG4gICAgICAgICAgICBpbmVydGlhbEJpYXNBY2NlbDogWzAsIDAsIDBdLFxyXG4gICAgICAgICAgICBpbmVydGlhbEJpYXNHeXJvOiBbMCwgMCwgMF0sXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgZ2V0OiBnZXQsXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXQoaWQpIHtcclxuICAgICAgICAgICAgaWQgPSBNYXRoLmZsb29yKGlkKTtcclxuICAgICAgICAgICAgaWYgKCEoaWQgPj0gMCAmJiBpZCA8IDMpKSB7XHJcbiAgICAgICAgICAgICAgICBpZCA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIGhhbmRsZXIgPSBmaXJtd2FyZVZlcnNpb24uY29uZmlnSGFuZGxlcigpO1xyXG4gICAgICAgICAgICB2YXIgdmFsdWUgPSB7fTtcclxuICAgICAgICAgICAgYW5ndWxhci5jb3B5KHRlbXBsYXRlKTtcclxuICAgICAgICAgICAgaGFuZGxlci5jaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uKGNoaWxkKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIga2V5ID0gY2hpbGQua2V5O1xyXG4gICAgICAgICAgICAgICAgdmFsdWVba2V5XSA9IGFuZ3VsYXIuY29weSh0ZW1wbGF0ZVtrZXldKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHZhbHVlLmlkID0gaWQ7XHJcbiAgICAgICAgICAgIHZhbHVlLnZlcnNpb24gPSBmaXJtd2FyZVZlcnNpb24uZ2V0KCkuc2xpY2UoKTtcclxuICAgICAgICAgICAgc3dpdGNoIChpZCkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAwOlxyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlLm1peFRhYmxlRnogPSBbMSwgMSwgMCwgMCwgMCwgMCwgMSwgMV07XHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUubWl4VGFibGVUeCA9IFsxLCAxLCAwLCAwLCAwLCAwLCAtMSwgLTFdO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlLm1peFRhYmxlVHkgPSBbLTEsIDEsIDAsIDAsIDAsIDAsIC0xLCAxXTtcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZS5taXhUYWJsZVR6ID0gWzEsIC0xLCAwLCAwLCAwLCAwLCAtMSwgMV07XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUubWl4VGFibGVGeiA9IFsxLCAxLCAxLCAxLCAwLCAwLCAxLCAxXTtcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZS5taXhUYWJsZVR4ID0gWzEsIDEsIDAsIDAsIDAsIDAsIC0xLCAtMV07XHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUubWl4VGFibGVUeSA9IFstMSwgMSwgLTEsIDEsIDAsIDAsIC0xLCAxXTtcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZS5taXhUYWJsZVR6ID0gWzEsIC0xLCAtMSwgMSwgMCwgMCwgMSwgLTFdO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSAyOlxyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlLm1peFRhYmxlRnogPSBbMSwgMSwgMSwgMSwgMSwgMSwgMSwgMV07XHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUubWl4VGFibGVUeCA9IFsxLCAxLCAxLCAxLCAtMSwgLTEsIC0xLCAtMV07XHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUubWl4VGFibGVUeSA9IFstMSwgMSwgLTEsIDEsIC0xLCAxLCAtMSwgMV07XHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUubWl4VGFibGVUeiA9IFsxLCAtMSwgLTEsIDEsIDEsIC0xLCAtMSwgMV07XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgnZmx5YnJpeENvbW1vbicpLmZhY3RvcnkoJ3JjRGF0YScsIHJjRGF0YSk7XHJcblxyXG4gICAgcmNEYXRhLiRpbmplY3QgPSBbJ3NlcmlhbCcsICdlbmNvZGFibGUnLCAnZmlybXdhcmVWZXJzaW9uJ107XHJcblxyXG4gICAgZnVuY3Rpb24gcmNEYXRhKHNlcmlhbCwgZW5jb2RhYmxlLCBmaXJtd2FyZVZlcnNpb24pIHtcclxuICAgICAgICB2YXIgQVVYID0ge1xyXG4gICAgICAgICAgICBMT1c6IDAsXHJcbiAgICAgICAgICAgIE1JRDogMSxcclxuICAgICAgICAgICAgSElHSDogMixcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgdGhyb3R0bGUgPSAtMTtcclxuICAgICAgICB2YXIgcGl0Y2ggPSAwO1xyXG4gICAgICAgIHZhciByb2xsID0gMDtcclxuICAgICAgICB2YXIgeWF3ID0gMDtcclxuICAgICAgICAvLyBkZWZhdWx0cyB0byBoaWdoIC0tIGxvdyBpcyBlbmFibGluZzsgaGlnaCBpcyBkaXNhYmxpbmdcclxuICAgICAgICB2YXIgYXV4MSA9IEFVWC5ISUdIO1xyXG4gICAgICAgIC8vIGRlZmF1bHRzIHRvID8/IC0tIG5lZWQgdG8gY2hlY2sgdHJhbnNtaXR0ZXIgYmVoYXZpb3JcclxuICAgICAgICB2YXIgYXV4MiA9IEFVWC5ISUdIO1xyXG5cclxuICAgICAgICB2YXIgdXJnZW50ID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgdmFyIGNvbW1hbmRIYW5kbGVyID0gZmlybXdhcmVWZXJzaW9uLlJjQ29tbWFuZDtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgc2V0VGhyb3R0bGU6IHNldFRocm90dGxlLFxyXG4gICAgICAgICAgICBzZXRQaXRjaDogc2V0UGl0Y2gsXHJcbiAgICAgICAgICAgIHNldFJvbGw6IHNldFJvbGwsXHJcbiAgICAgICAgICAgIHNldFlhdzogc2V0WWF3LFxyXG4gICAgICAgICAgICBzZXRBdXgxOiBzZXRBdXgxLFxyXG4gICAgICAgICAgICBzZXRBdXgyOiBzZXRBdXgyLFxyXG4gICAgICAgICAgICBnZXRUaHJvdHRsZTogZ2V0VGhyb3R0bGUsXHJcbiAgICAgICAgICAgIGdldFBpdGNoOiBnZXRQaXRjaCxcclxuICAgICAgICAgICAgZ2V0Um9sbDogZ2V0Um9sbCxcclxuICAgICAgICAgICAgZ2V0WWF3OiBnZXRZYXcsXHJcbiAgICAgICAgICAgIGdldEF1eDE6IGdldEF1eDEsXHJcbiAgICAgICAgICAgIGdldEF1eDI6IGdldEF1eDIsXHJcbiAgICAgICAgICAgIEFVWDogQVVYLFxyXG4gICAgICAgICAgICBzZW5kOiBzZW5kLFxyXG4gICAgICAgICAgICBmb3JjZU5leHRTZW5kOiBmb3JjZU5leHRTZW5kLFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNlbmQoKSB7XHJcbiAgICAgICAgICAgIGlmICghdXJnZW50ICYmIHNlcmlhbC5idXN5KCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB1cmdlbnQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgIC8vIFNldCBSQyB0byBlbmFibGVkXHJcbiAgICAgICAgICAgIHZhciByZXNwb25zZSA9IHtlbmFibGVkOiB0cnVlfTtcclxuICAgICAgICAgICAgdmFyIGNvbW1hbmQgPSB7fTtcclxuXHJcbiAgICAgICAgICAgIC8vIGludmVydCBwaXRjaCBhbmQgcm9sbFxyXG4gICAgICAgICAgICB2YXIgdGhyb3R0bGVfdGhyZXNob2xkID1cclxuICAgICAgICAgICAgICAgIC0wLjg7ICAvLyBrZWVwIGJvdHRvbSAxMCUgb2YgdGhyb3R0bGUgc3RpY2sgdG8gbWVhbiAnb2ZmJ1xyXG4gICAgICAgICAgICBjb21tYW5kLnRocm90dGxlID0gY29uc3RyYWluKFxyXG4gICAgICAgICAgICAgICAgKHRocm90dGxlIC0gdGhyb3R0bGVfdGhyZXNob2xkKSAqIDQwOTUgL1xyXG4gICAgICAgICAgICAgICAgICAgICgxIC0gdGhyb3R0bGVfdGhyZXNob2xkKSxcclxuICAgICAgICAgICAgICAgIDAsIDQwOTUpO1xyXG4gICAgICAgICAgICBjb21tYW5kLnBpdGNoID1cclxuICAgICAgICAgICAgICAgIGNvbnN0cmFpbigtKGFwcGx5RGVhZHpvbmUocGl0Y2gsIDAuMSkpICogNDA5NSAvIDIsIC0yMDQ3LCAyMDQ3KTtcclxuICAgICAgICAgICAgY29tbWFuZC5yb2xsID1cclxuICAgICAgICAgICAgICAgIGNvbnN0cmFpbigoYXBwbHlEZWFkem9uZShyb2xsLCAwLjEpKSAqIDQwOTUgLyAyLCAtMjA0NywgMjA0Nyk7XHJcbiAgICAgICAgICAgIGNvbW1hbmQueWF3ID1cclxuICAgICAgICAgICAgICAgIGNvbnN0cmFpbigtKGFwcGx5RGVhZHpvbmUoeWF3LCAwLjEpKSAqIDQwOTUgLyAyLCAtMjA0NywgMjA0Nyk7XHJcblxyXG4gICAgICAgICAgICByZXNwb25zZS5jb21tYW5kID0gY29tbWFuZDtcclxuXHJcbiAgICAgICAgICAgIC8vIGF1eCBmb3JtYXQgaXNcclxuICAgICAgICAgICAgLy8ge0FVWDFfbG93LCBBVVgxX21pZCwgQVVYMV9oaWdoLFxyXG4gICAgICAgICAgICAvLyAgQVVYMl9sb3csIEFVWDJfbWlkLCBBVVgyX2hpZ2gsXHJcbiAgICAgICAgICAgIC8vICB4LCB4fSAoTFNCLS0+TVNCKVxyXG4gICAgICAgICAgICByZXNwb25zZS5hdXhjb2RlID0gKDEgPDwgYXV4MSkgKyAoMSA8PCAoYXV4MiArIDMpKTtcclxuXHJcbiAgICAgICAgICAgIHZhciBoYW5kbGVyID0gZmlybXdhcmVWZXJzaW9uLnNlcmlhbGl6YXRpb25IYW5kbGVyKCk7XHJcblxyXG4gICAgICAgICAgICB2YXIgZGF0YSA9IG5ldyBVaW50OEFycmF5KGhhbmRsZXIuQ29tbWFuZHMuYnl0ZUNvdW50KTtcclxuICAgICAgICAgICAgcmNIYW5kbGVyLmVuY29kZShcclxuICAgICAgICAgICAgICAgIG5ldyBEYXRhVmlldyhkYXRhLmJ1ZmZlciksIG5ldyBlbmNvZGFibGUuU2VyaWFsaXplcigpLFxyXG4gICAgICAgICAgICAgICAgcmVzcG9uc2UpO1xyXG4gICAgICAgICAgICByZXR1cm4gc2VyaWFsLnNlbmQoc2VyaWFsLmZpZWxkLkNPTV9TRVRfU0VSSUFMX1JDLCBkYXRhLCBmYWxzZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZXRUaHJvdHRsZSh2KSB7XHJcbiAgICAgICAgICAgIHRocm90dGxlID0gdjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNldFBpdGNoKHYpIHtcclxuICAgICAgICAgICAgcGl0Y2ggPSB2O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2V0Um9sbCh2KSB7XHJcbiAgICAgICAgICAgIHJvbGwgPSB2O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2V0WWF3KHYpIHtcclxuICAgICAgICAgICAgeWF3ID0gdjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNldEF1eDEodikge1xyXG4gICAgICAgICAgICBhdXgxID0gdjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNldEF1eDIodikge1xyXG4gICAgICAgICAgICBhdXgyID0gdjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdldFRocm90dGxlKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhyb3R0bGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRQaXRjaCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHBpdGNoO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0Um9sbCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJvbGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRZYXcoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB5YXc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRBdXgxKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gYXV4MTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdldEF1eDIoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBhdXgyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZm9yY2VOZXh0U2VuZCgpIHtcclxuICAgICAgICAgICAgdXJnZW50ID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGNvbnN0cmFpbih4LCB4bWluLCB4bWF4KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBNYXRoLm1heCh4bWluLCBNYXRoLm1pbih4LCB4bWF4KSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBhcHBseURlYWR6b25lKHZhbHVlLCBkZWFkem9uZSkge1xyXG4gICAgICAgICAgICBpZiAodmFsdWUgPiBkZWFkem9uZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlIC0gZGVhZHpvbmU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHZhbHVlIDwgLWRlYWR6b25lKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUgKyBkZWFkem9uZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgnZmx5YnJpeENvbW1vbicpLmZhY3RvcnkoJ3NlcmlhbCcsIHNlcmlhbCk7XHJcblxyXG4gICAgc2VyaWFsLiRpbmplY3QgPSBbJyR0aW1lb3V0JywgJyRxJywgJ2NvYnMnLCAnY29tbWFuZExvZycsICdwYXJzZXInXTtcclxuXHJcbiAgICBmdW5jdGlvbiBzZXJpYWwoJHRpbWVvdXQsICRxLCBjb2JzLCBjb21tYW5kTG9nLCBwYXJzZXIpIHtcclxuICAgICAgICB2YXIgYWNrbm93bGVkZ2VzID0gW107XHJcbiAgICAgICAgdmFyIGJhY2tlbmQgPSBuZXcgQmFja2VuZCgpO1xyXG4gICAgICAgIHZhciBvblN0YXRlTGlzdGVuZXIgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgY29tbWFuZExvZygnTm8gc3RhdGUgbGlzdGVuZXIgZGVmaW5lZCBmb3Igc2VyaWFsJyk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICB2YXIgb25Db21tYW5kTGlzdGVuZXIgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgY29tbWFuZExvZygnTm8gY29tbWFuZCBsaXN0ZW5lciBkZWZpbmVkIGZvciBzZXJpYWwnKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIHZhciBvbkRlYnVnTGlzdGVuZXIgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgY29tbWFuZExvZygnTm8gZGVidWcgbGlzdGVuZXIgZGVmaW5lZCBmb3Igc2VyaWFsJyk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICB2YXIgb25IaXN0b3J5TGlzdGVuZXIgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgY29tbWFuZExvZygnTm8gaGlzdG9yeSBsaXN0ZW5lciBkZWZpbmVkIGZvciBzZXJpYWwnKTtcclxuICAgICAgICB9O1xyXG4gICAgICAgIFxyXG4gICAgICAgIHZhciBjb2JzUmVhZGVyID0gbmV3IGNvYnMuUmVhZGVyKDIwMDApO1xyXG4gICAgICAgIHZhciBkYXRhSGFuZGxlciA9IHVuZGVmaW5lZDtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gQmFja2VuZCgpIHtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIEJhY2tlbmQucHJvdG90eXBlLmJ1c3kgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIEJhY2tlbmQucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICAgIGNvbW1hbmRMb2coJ05vIFwic2VuZFwiIGRlZmluZWQgZm9yIHNlcmlhbCBiYWNrZW5kJyk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgQmFja2VuZC5wcm90b3R5cGUub25SZWFkID0gZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICBjb21tYW5kTG9nKCdObyBcIm9uUmVhZFwiIGRlZmluZWQgZm9yIHNlcmlhbCBiYWNrZW5kJyk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgYnVzeTogYnVzeSxcclxuICAgICAgICAgICAgZmllbGQ6IHBhcnNlci5Db21tYW5kRmllbGRzLFxyXG4gICAgICAgICAgICBzZW5kOiBzZW5kLFxyXG4gICAgICAgICAgICBzZXRCYWNrZW5kOiBzZXRCYWNrZW5kLFxyXG4gICAgICAgICAgICBzZXRTdGF0ZUNhbGxiYWNrOiBzZXRTdGF0ZUNhbGxiYWNrLFxyXG4gICAgICAgICAgICBzZXRDb21tYW5kQ2FsbGJhY2s6IHNldENvbW1hbmRDYWxsYmFjayxcclxuICAgICAgICAgICAgc2V0RGVidWdDYWxsYmFjazogc2V0RGVidWdDYWxsYmFjayxcclxuICAgICAgICAgICAgc2V0SGlzdG9yeUNhbGxiYWNrOiBzZXRIaXN0b3J5Q2FsbGJhY2ssXHJcbiAgICAgICAgICAgIHNldERhdGFIYW5kbGVyOiBzZXREYXRhSGFuZGxlcixcclxuICAgICAgICAgICAgaGFuZGxlUG9zdENvbm5lY3Q6IGhhbmRsZVBvc3RDb25uZWN0LFxyXG4gICAgICAgICAgICBCYWNrZW5kOiBCYWNrZW5kLFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNldEJhY2tlbmQodikge1xyXG4gICAgICAgICAgICBiYWNrZW5kID0gdjtcclxuICAgICAgICAgICAgYmFja2VuZC5vblJlYWQgPSByZWFkO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gaGFuZGxlUG9zdENvbm5lY3QoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXF1ZXN0RmlybXdhcmVWZXJzaW9uKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiByZXF1ZXN0RmlybXdhcmVWZXJzaW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gc2VuZChcclxuICAgICAgICAgICAgICAgIHBhcnNlci5Db21tYW5kRmllbGRzLkNPTV9SRVFfUEFSVElBTF9FRVBST01fREFUQSwgWzEsIDAsIDAsIDBdKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNlbmQobWFzaywgZGF0YSwgbG9nX3NlbmQpIHtcclxuICAgICAgICAgICAgaWYgKGxvZ19zZW5kID09PSB1bmRlZmluZWQpXHJcbiAgICAgICAgICAgICAgICBsb2dfc2VuZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgdmFyIHJlc3BvbnNlID0gJHEuZGVmZXIoKTtcclxuXHJcbiAgICAgICAgICAgIG1hc2sgfD0gcGFyc2VyLkNvbW1hbmRGaWVsZHMuQ09NX1JFUV9SRVNQT05TRTsgIC8vIGZvcmNlIHJlc3BvbnNlc1xyXG5cclxuICAgICAgICAgICAgdmFyIGNoZWNrc3VtID0gMDtcclxuICAgICAgICAgICAgdmFyIGJ1ZmZlck91dCwgYnVmVmlldztcclxuXHJcbiAgICAgICAgICAgIC8vIGFsd2F5cyByZXNlcnZlIDEgYnl0ZSBmb3IgcHJvdG9jb2wgb3ZlcmhlYWQgIVxyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGRhdGEgPT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgc2l6ZSA9IDcgKyBkYXRhLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgIGJ1ZlZpZXcgPSBuZXcgVWludDhBcnJheShzaXplKTtcclxuICAgICAgICAgICAgICAgIGNoZWNrc3VtIF49IGJ1ZlZpZXdbMV0gPSBwYXJzZXIuTWVzc2FnZVR5cGUuQ29tbWFuZDtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNDsgKytpKVxyXG4gICAgICAgICAgICAgICAgICAgIGNoZWNrc3VtIF49IGJ1ZlZpZXdbaSArIDJdID0gYnl0ZU5pbk51bShtYXNrLCBpKTtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKylcclxuICAgICAgICAgICAgICAgICAgICBjaGVja3N1bSBePSBidWZWaWV3W2kgKyA2XSA9IGRhdGFbaV07XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBidWZmZXJPdXQgPSBuZXcgQXJyYXlCdWZmZXIoOCk7XHJcbiAgICAgICAgICAgICAgICBidWZWaWV3ID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyT3V0KTtcclxuICAgICAgICAgICAgICAgIGNoZWNrc3VtIF49IGJ1ZlZpZXdbMV0gPSBwYXJzZXIuTWVzc2FnZVR5cGUuQ29tbWFuZDtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNDsgKytpKVxyXG4gICAgICAgICAgICAgICAgICAgIGNoZWNrc3VtIF49IGJ1ZlZpZXdbaSArIDJdID0gYnl0ZU5pbk51bShtYXNrLCBpKTtcclxuICAgICAgICAgICAgICAgIGNoZWNrc3VtIF49IGJ1ZlZpZXdbNl0gPSBkYXRhOyAgLy8gcGF5bG9hZFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGJ1ZlZpZXdbMF0gPSBjaGVja3N1bTsgIC8vIGNyY1xyXG4gICAgICAgICAgICBidWZWaWV3W2J1ZlZpZXcubGVuZ3RoIC0gMV0gPSAwO1xyXG5cclxuICAgICAgICAgICAgYWNrbm93bGVkZ2VzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgbWFzazogbWFzayxcclxuICAgICAgICAgICAgICAgIHJlc3BvbnNlOiByZXNwb25zZSxcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGJhY2tlbmQuc2VuZChuZXcgVWludDhBcnJheShjb2JzLmVuY29kZShidWZWaWV3KSkpO1xyXG4gICAgICAgICAgICB9LCAwKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChsb2dfc2VuZCkge1xyXG4gICAgICAgICAgICAgICAgY29tbWFuZExvZyhcclxuICAgICAgICAgICAgICAgICAgICAnU2VuZGluZyBjb21tYW5kICcgKyBwYXJzZXIuTWVzc2FnZVR5cGUuQ29tbWFuZCApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UucHJvbWlzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGJ1c3koKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBiYWNrZW5kLmJ1c3koKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNldERhdGFIYW5kbGVyKGhhbmRsZXIpIHtcclxuICAgICAgICAgICAgZGF0YUhhbmRsZXIgPSBoYW5kbGVyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gcmVhZChkYXRhKSB7XHJcbiAgICAgICAgICAgIGlmIChkYXRhSGFuZGxlcilcclxuICAgICAgICAgICAgICAgIGRhdGFIYW5kbGVyKGRhdGEsIHByb2Nlc3NEYXRhKTtcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgY29ic1JlYWRlci5BcHBlbmRUb0J1ZmZlcihkYXRhLCBwcm9jZXNzRGF0YSwgcmVwb3J0SXNzdWVzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHJlcG9ydElzc3Vlcyhpc3N1ZSwgdGV4dCkge1xyXG4gICAgICAgICAgICBjb21tYW5kTG9nKCdDT0JTIGRlY29kaW5nIGZhaWxlZCAoJyArIGlzc3VlICsgJyk6ICcgKyB0ZXh0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNldFN0YXRlQ2FsbGJhY2soY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgb25TdGF0ZUxpc3RlbmVyID0gY2FsbGJhY2s7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZXRDb21tYW5kQ2FsbGJhY2soY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgb25Db21tYW5kTGlzdGVuZXIgPSBjYWxsYmFjaztcclxuICAgICAgICB9XHJcbiAgICAgICAgXHJcbiAgICAgICAgZnVuY3Rpb24gc2V0SGlzdG9yeUNhbGxiYWNrKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIG9uSGlzdG9yeUxpc3RlbmVyID0gY2FsbGJhY2s7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZXREZWJ1Z0NhbGxiYWNrKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIG9uRGVidWdMaXN0ZW5lciA9IGNhbGxiYWNrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYWNrbm93bGVkZ2UobWFzaywgdmFsdWUpIHtcclxuICAgICAgICAgICAgd2hpbGUgKGFja25vd2xlZGdlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdiA9IGFja25vd2xlZGdlcy5zaGlmdCgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHYubWFzayAhPT0gbWFzaykge1xyXG4gICAgICAgICAgICAgICAgICAgIHYucmVzcG9uc2UucmVqZWN0KCdNaXNzaW5nIEFDSycpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdmFyIHJlbGF4ZWRNYXNrID0gbWFzaztcclxuICAgICAgICAgICAgICAgIHJlbGF4ZWRNYXNrICY9IH5wYXJzZXIuQ29tbWFuZEZpZWxkcy5DT01fUkVRX1JFU1BPTlNFO1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlbGF4ZWRNYXNrICE9PSB2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHYucmVzcG9uc2UucmVqZWN0KCdSZXF1ZXN0IHdhcyBub3QgZnVsbHkgcHJvY2Vzc2VkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB2LnJlc3BvbnNlLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBwcm9jZXNzRGF0YShjb21tYW5kLCBtYXNrLCBtZXNzYWdlX2J1ZmZlcikge1xyXG4gICAgICAgICAgICBwYXJzZXIucHJvY2Vzc0JpbmFyeURhdGFzdHJlYW0oXHJcbiAgICAgICAgICAgICAgICBjb21tYW5kLCBtYXNrLCBtZXNzYWdlX2J1ZmZlciwgb25TdGF0ZUxpc3RlbmVyLFxyXG4gICAgICAgICAgICAgICAgb25Db21tYW5kTGlzdGVuZXIsIG9uRGVidWdMaXN0ZW5lciwgb25IaXN0b3J5TGlzdGVuZXIsIGFja25vd2xlZGdlKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBieXRlTmluTnVtKGRhdGEsIG4pIHtcclxuICAgICAgICAgICAgcmV0dXJuIChkYXRhID4+ICg4ICogbikpICYgMHhGRjtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbiAoKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgc2VyaWFsaXphdGlvbkhhbmRsZXIuJGluamVjdCA9IFtdO1xyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdmbHlicml4Q29tbW9uJykuZmFjdG9yeSgnc2VyaWFsaXphdGlvbkhhbmRsZXInLCBzZXJpYWxpemF0aW9uSGFuZGxlcik7XHJcblxyXG4gICAgZnVuY3Rpb24gc2VyaWFsaXphdGlvbkhhbmRsZXIoKSB7XHJcbiAgICAgICAgdmFyIGhhbmRsZXJDYWNoZSA9IHt9O1xyXG4gICAgICAgIHZhciB2ZXJzaW9uID0gJ1ZlcnNpb24gPSB7IG1ham9yOiB1OCwgbWlub3I6IHU4LCBwYXRjaDogdTggfTsnO1xyXG4gICAgICAgIHZhciBjb25maWdJZCA9ICdDb25maWdJRCA9IHsgaWQ6IHUzMiB9Oyc7XHJcblxyXG4gICAgICAgIHZhciB2ZWN0b3IzZiA9ICdWZWN0b3IzZiA9IHsgeDogZjMyLCB5OiBmMzIsIHo6IGYzMiB9Oyc7XHJcblxyXG4gICAgICAgIHZhciBwY2JUcmFuc2Zvcm0gPSAnUGNiVHJhbnNmb3JtID0geyBvcmllbnRhdGlvbjogVmVjdG9yM2YsIHRyYW5zbGF0aW9uOiBWZWN0b3IzZiB9Oyc7XHJcbiAgICAgICAgdmFyIG1peFRhYmxlID0gJ01peFRhYmxlID0geyBmejogW2k4OjhdLCB0eDogW2k4OjhdLCB0eTogW2k4OjhdLCB0ejogW2k4OjhdIH07JztcclxuICAgICAgICB2YXIgbWFnQmlhcyA9ICdNYWdCaWFzID0geyBvZmZzZXQ6IFZlY3RvcjNmIH07JztcclxuICAgICAgICB2YXIgY2hhbm5lbFByb3BlcnRpZXMgPSAnQ2hhbm5lbFByb3BlcnRpZXMgPSB7JyArXHJcbiAgICAgICAgICAgICdhc3NpZ25tZW50OiBbdTg6Nl0sJyArXHJcbiAgICAgICAgICAgICdpbnZlcnNpb246IHU4LCcgK1xyXG4gICAgICAgICAgICAnbWlkcG9pbnQ6IFt1MTY6Nl0sJyArXHJcbiAgICAgICAgICAgICdkZWFkem9uZTogW3UxNjo2XSB9Oyc7XHJcblxyXG4gICAgICAgIHZhciBwaWRTZXR0aW5ncyA9ICdQSURTZXR0aW5ncyA9IHsnICtcclxuICAgICAgICAgICAgJ2twOiBmMzIsJyArXHJcbiAgICAgICAgICAgICdraTogZjMyLCcgK1xyXG4gICAgICAgICAgICAna2Q6IGYzMiwnICtcclxuICAgICAgICAgICAgJ2ludGVncmFsX3dpbmR1cF9ndWFyZDogZjMyLCcgK1xyXG4gICAgICAgICAgICAnZF9maWx0ZXJfdGltZTogZjMyLCcgK1xyXG4gICAgICAgICAgICAnc2V0cG9pbnRfZmlsdGVyX3RpbWU6IGYzMiwnICtcclxuICAgICAgICAgICAgJ2NvbW1hbmRfdG9fdmFsdWU6IGYzMiB9Oyc7XHJcbiAgICAgICAgdmFyIHBpZFBhcmFtZXRlcnMxNCA9ICdQSURQYXJhbWV0ZXJzID0geycgK1xyXG4gICAgICAgICAgICAndGhydXN0X21hc3RlcjogUElEU2V0dGluZ3MsJyArXHJcbiAgICAgICAgICAgICdwaXRjaF9tYXN0ZXI6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAncm9sbF9tYXN0ZXI6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAneWF3X21hc3RlcjogUElEU2V0dGluZ3MsJyArXHJcbiAgICAgICAgICAgICd0aHJ1c3Rfc2xhdmU6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAncGl0Y2hfc2xhdmU6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAncm9sbF9zbGF2ZTogUElEU2V0dGluZ3MsJyArXHJcbiAgICAgICAgICAgICd5YXdfc2xhdmU6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAncGlkX2J5cGFzczogdTggfTsnO1xyXG4gICAgICAgIHZhciBwaWRQYXJhbWV0ZXJzID0gJ1BJRFBhcmFtZXRlcnMgPSB7JyArXHJcbiAgICAgICAgICAgICd0aHJ1c3RfbWFzdGVyOiBQSURTZXR0aW5ncywnICtcclxuICAgICAgICAgICAgJ3BpdGNoX21hc3RlcjogUElEU2V0dGluZ3MsJyArXHJcbiAgICAgICAgICAgICdyb2xsX21hc3RlcjogUElEU2V0dGluZ3MsJyArXHJcbiAgICAgICAgICAgICd5YXdfbWFzdGVyOiBQSURTZXR0aW5ncywnICtcclxuICAgICAgICAgICAgJ3RocnVzdF9zbGF2ZTogUElEU2V0dGluZ3MsJyArXHJcbiAgICAgICAgICAgICdwaXRjaF9zbGF2ZTogUElEU2V0dGluZ3MsJyArXHJcbiAgICAgICAgICAgICdyb2xsX3NsYXZlOiBQSURTZXR0aW5ncywnICtcclxuICAgICAgICAgICAgJ3lhd19zbGF2ZTogUElEU2V0dGluZ3MsJyArXHJcbiAgICAgICAgICAgICd0aHJ1c3RfZ2FpbjogZjMyLCcgK1xyXG4gICAgICAgICAgICAncGl0Y2hfZ2FpbjogZjMyLCcgK1xyXG4gICAgICAgICAgICAncm9sbF9nYWluOiBmMzIsJyArXHJcbiAgICAgICAgICAgICd5YXdfZ2FpbjogZjMyLCcgK1xyXG4gICAgICAgICAgICAncGlkX2J5cGFzczogdTggfTsnO1xyXG5cclxuICAgICAgICB2YXIgc3RhdGVQYXJhbWV0ZXJzID0gJ1N0YXRlUGFyYW1ldGVycyA9IHsgc3RhdGVfZXN0aW1hdGlvbjogW2YzMjoyXSwgZW5hYmxlOiBbZjMyOjJdIH07JztcclxuXHJcbiAgICAgICAgdmFyIGNvbG9yID0gJ0NvbG9yID0geyByZWQ6IHU4LCBncmVlbjogdTgsIGJsdWU6IHU4IH07JztcclxuICAgICAgICB2YXIgbGVkU3RhdGVDYXNlID0gJ0xFRFN0YXRlQ2FzZSA9IHsnICtcclxuICAgICAgICAgICAgJ3N0YXR1czogdTE2LCcgK1xyXG4gICAgICAgICAgICAncGF0dGVybjogdTgsJyArXHJcbiAgICAgICAgICAgICdjb2xvcl9yaWdodF9mcm9udDogQ29sb3IsJyArXHJcbiAgICAgICAgICAgICdjb2xvcl9yaWdodF9iYWNrOiBDb2xvciwnICtcclxuICAgICAgICAgICAgJ2NvbG9yX2xlZnRfZnJvbnQ6IENvbG9yLCcgK1xyXG4gICAgICAgICAgICAnY29sb3JfbGVmdF9iYWNrOiBDb2xvciwnICtcclxuICAgICAgICAgICAgJ2luZGljYXRvcl9yZWQ6IGJvb2wsJyArXHJcbiAgICAgICAgICAgICdpbmRpY2F0b3JfZ3JlZW46IGJvb2wgfTsnO1xyXG4gICAgICAgIHZhciBsZWRTdGF0ZXMgPSAnTEVEU3RhdGVzID0geyBzdGF0ZXM6IFsvMTYvTEVEU3RhdGVDYXNlOjE2XSB9Oyc7XHJcbiAgICAgICAgdmFyIGxlZFN0YXRlc0ZpeGVkID0gJ0xFRFN0YXRlc0ZpeGVkID0geyBzdGF0ZXM6IFtMRURTdGF0ZUNhc2U6MTZdIH07JztcclxuXHJcbiAgICAgICAgdmFyIGRldmljZU5hbWUgPSAnRGV2aWNlTmFtZSA9IHsgdmFsdWU6IHM5IH07JztcclxuXHJcbiAgICAgICAgdmFyIHZlbG9jaXR5UGlkUGFyYW1ldGVycyA9ICdWZWxvY2l0eVBJRFBhcmFtZXRlcnMgPSB7JyArXHJcbiAgICAgICAgICAgICdmb3J3YXJkX21hc3RlcjogUElEU2V0dGluZ3MsJyArXHJcbiAgICAgICAgICAgICdyaWdodF9tYXN0ZXI6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAndXBfbWFzdGVyOiBQSURTZXR0aW5ncywnICtcclxuICAgICAgICAgICAgJ2ZvcndhcmRfc2xhdmU6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAncmlnaHRfc2xhdmU6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAndXBfc2xhdmU6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAncGlkX2J5cGFzczogdTggfTsnO1xyXG5cclxuICAgICAgICB2YXIgaW5lcnRpYWxCaWFzID0gJ0luZXJ0aWFsQmlhcyA9IHsgYWNjZWw6IFZlY3RvcjNmLCBneXJvOiBWZWN0b3IzZiB9Oyc7XHJcblxyXG4gICAgICAgIHZhciBjb25maWcxNDE1ID0gJ0NvbmZpZ3VyYXRpb24gPSB7LzE2LycgK1xyXG4gICAgICAgICAgICAndmVyc2lvbjogVmVyc2lvbiwnICtcclxuICAgICAgICAgICAgJ2NvbmZpZ19pZDogQ29uZmlnSUQsJyArXHJcbiAgICAgICAgICAgICdwY2JfdHJhbnNmb3JtOiBQY2JUcmFuc2Zvcm0sJyArXHJcbiAgICAgICAgICAgICdtaXhfdGFibGU6IE1peFRhYmxlLCcgK1xyXG4gICAgICAgICAgICAnbWFnX2JpYXM6IE1hZ0JpYXMsJyArXHJcbiAgICAgICAgICAgICdjaGFubmVsOiBDaGFubmVsUHJvcGVydGllcywnICtcclxuICAgICAgICAgICAgJ3BpZF9wYXJhbWV0ZXJzOiBQSURQYXJhbWV0ZXJzLCcgK1xyXG4gICAgICAgICAgICAnc3RhdGVfcGFyYW1ldGVyczogU3RhdGVQYXJhbWV0ZXJzLCcgK1xyXG4gICAgICAgICAgICAnbGVkX3N0YXRlczogTEVEU3RhdGVzLCcgK1xyXG4gICAgICAgICAgICAnZGV2aWNlX25hbWU6IERldmljZU5hbWUgfTsnO1xyXG5cclxuICAgICAgICB2YXIgY29uZmlnRml4ZWQxNDE1ID0gJ0NvbmZpZ3VyYXRpb25GaXhlZCA9IHsnICtcclxuICAgICAgICAgICAgJ3ZlcnNpb246IFZlcnNpb24sJyArXHJcbiAgICAgICAgICAgICdjb25maWdfaWQ6IENvbmZpZ0lELCcgK1xyXG4gICAgICAgICAgICAncGNiX3RyYW5zZm9ybTogUGNiVHJhbnNmb3JtLCcgK1xyXG4gICAgICAgICAgICAnbWl4X3RhYmxlOiBNaXhUYWJsZSwnICtcclxuICAgICAgICAgICAgJ21hZ19iaWFzOiBNYWdCaWFzLCcgK1xyXG4gICAgICAgICAgICAnY2hhbm5lbDogQ2hhbm5lbFByb3BlcnRpZXMsJyArXHJcbiAgICAgICAgICAgICdwaWRfcGFyYW1ldGVyczogUElEUGFyYW1ldGVycywnICtcclxuICAgICAgICAgICAgJ3N0YXRlX3BhcmFtZXRlcnM6IFN0YXRlUGFyYW1ldGVycywnICtcclxuICAgICAgICAgICAgJ2xlZF9zdGF0ZXM6IExFRFN0YXRlc0ZpeGVkLCcgK1xyXG4gICAgICAgICAgICAnZGV2aWNlX25hbWU6IERldmljZU5hbWUgfTsnO1xyXG5cclxuICAgICAgICB2YXIgY29uZmlnID0gJ0NvbmZpZ3VyYXRpb24gPSB7LzE2LycgK1xyXG4gICAgICAgICAgICAndmVyc2lvbjogVmVyc2lvbiwnICtcclxuICAgICAgICAgICAgJ2NvbmZpZ19pZDogQ29uZmlnSUQsJyArXHJcbiAgICAgICAgICAgICdwY2JfdHJhbnNmb3JtOiBQY2JUcmFuc2Zvcm0sJyArXHJcbiAgICAgICAgICAgICdtaXhfdGFibGU6IE1peFRhYmxlLCcgK1xyXG4gICAgICAgICAgICAnbWFnX2JpYXM6IE1hZ0JpYXMsJyArXHJcbiAgICAgICAgICAgICdjaGFubmVsOiBDaGFubmVsUHJvcGVydGllcywnICtcclxuICAgICAgICAgICAgJ3BpZF9wYXJhbWV0ZXJzOiBQSURQYXJhbWV0ZXJzLCcgK1xyXG4gICAgICAgICAgICAnc3RhdGVfcGFyYW1ldGVyczogU3RhdGVQYXJhbWV0ZXJzLCcgK1xyXG4gICAgICAgICAgICAnbGVkX3N0YXRlczogTEVEU3RhdGVzLCcgK1xyXG4gICAgICAgICAgICAnZGV2aWNlX25hbWU6IERldmljZU5hbWUsJyArXHJcbiAgICAgICAgICAgICd2ZWxvY2l0eV9waWRfcGFyYW1ldGVyczogVmVsb2NpdHlQSURQYXJhbWV0ZXJzLCcgK1xyXG4gICAgICAgICAgICAnaW5lcnRpYWxfYmlhczogSW5lcnRpYWxCaWFzIH07JztcclxuXHJcbiAgICAgICAgdmFyIGNvbmZpZ0ZpeGVkID0gJ0NvbmZpZ3VyYXRpb25GaXhlZCA9IHsnICtcclxuICAgICAgICAgICAgJ3ZlcnNpb246IFZlcnNpb24sJyArXHJcbiAgICAgICAgICAgICdjb25maWdfaWQ6IENvbmZpZ0lELCcgK1xyXG4gICAgICAgICAgICAncGNiX3RyYW5zZm9ybTogUGNiVHJhbnNmb3JtLCcgK1xyXG4gICAgICAgICAgICAnbWl4X3RhYmxlOiBNaXhUYWJsZSwnICtcclxuICAgICAgICAgICAgJ21hZ19iaWFzOiBNYWdCaWFzLCcgK1xyXG4gICAgICAgICAgICAnY2hhbm5lbDogQ2hhbm5lbFByb3BlcnRpZXMsJyArXHJcbiAgICAgICAgICAgICdwaWRfcGFyYW1ldGVyczogUElEUGFyYW1ldGVycywnICtcclxuICAgICAgICAgICAgJ3N0YXRlX3BhcmFtZXRlcnM6IFN0YXRlUGFyYW1ldGVycywnICtcclxuICAgICAgICAgICAgJ2xlZF9zdGF0ZXM6IExFRFN0YXRlc0ZpeGVkLCcgK1xyXG4gICAgICAgICAgICAnZGV2aWNlX25hbWU6IERldmljZU5hbWUsJyArXHJcbiAgICAgICAgICAgICd2ZWxvY2l0eV9waWRfcGFyYW1ldGVyczogVmVsb2NpdHlQSURQYXJhbWV0ZXJzLCcgK1xyXG4gICAgICAgICAgICAnaW5lcnRpYWxfYmlhczogSW5lcnRpYWxCaWFzIH07JztcclxuXHJcbiAgICAgICAgdmFyIGNvbmZpZ0ZsYWcxNCA9ICdDb25maWd1cmF0aW9uRmxhZyA9IHsvMTYvJyArXHJcbiAgICAgICAgICAgICd2ZXJzaW9uOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnY29uZmlnX2lkOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAncGNiX3RyYW5zZm9ybTogdm9pZCwnICtcclxuICAgICAgICAgICAgJ21peF90YWJsZTogdm9pZCwnICtcclxuICAgICAgICAgICAgJ21hZ19iaWFzOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnY2hhbm5lbDogdm9pZCwnICtcclxuICAgICAgICAgICAgJ3BpZF9wYXJhbWV0ZXJzOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnc3RhdGVfcGFyYW1ldGVyczogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2xlZF9zdGF0ZXM6IFsvLyB2b2lkOjE2XSwnICtcclxuICAgICAgICAgICAgJ2RldmljZV9uYW1lOiB2b2lkfTsnO1xyXG5cclxuICAgICAgICB2YXIgY29uZmlnRmxhZyA9ICdDb25maWd1cmF0aW9uRmxhZyA9IHsvMTYvJyArXHJcbiAgICAgICAgICAgICd2ZXJzaW9uOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnY29uZmlnX2lkOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAncGNiX3RyYW5zZm9ybTogdm9pZCwnICtcclxuICAgICAgICAgICAgJ21peF90YWJsZTogdm9pZCwnICtcclxuICAgICAgICAgICAgJ21hZ19iaWFzOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnY2hhbm5lbDogdm9pZCwnICtcclxuICAgICAgICAgICAgJ3BpZF9wYXJhbWV0ZXJzOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnc3RhdGVfcGFyYW1ldGVyczogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2xlZF9zdGF0ZXM6IFsvLyB2b2lkOjE2XSwnICtcclxuICAgICAgICAgICAgJ2RldmljZV9uYW1lOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAndmVsb2NpdHlfcGlkX3BhcmFtZXRlcnM6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdpbmVydGlhbF9iaWFzOiB2b2lkIH07JztcclxuXHJcbiAgICAgICAgdmFyIGNvbmZpZ0Z1bGwxNCA9IHZlY3RvcjNmICsgcGlkU2V0dGluZ3MgKyB2ZXJzaW9uICsgY29uZmlnSWQgKyBwY2JUcmFuc2Zvcm0gK1xyXG4gICAgICAgICAgICBtaXhUYWJsZSArIG1hZ0JpYXMgKyBjaGFubmVsUHJvcGVydGllcyArIHBpZFBhcmFtZXRlcnMxNCArIHN0YXRlUGFyYW1ldGVycyArXHJcbiAgICAgICAgICAgIGNvbG9yICsgbGVkU3RhdGVDYXNlICsgbGVkU3RhdGVzICsgbGVkU3RhdGVzRml4ZWQgKyBkZXZpY2VOYW1lICtcclxuICAgICAgICAgICAgY29uZmlnMTQxNSArIGNvbmZpZ0ZpeGVkMTQxNSArIGNvbmZpZ0ZsYWcxNDtcclxuICAgICAgICB2YXIgY29uZmlnRnVsbDE1ID0gdmVjdG9yM2YgKyBwaWRTZXR0aW5ncyArIHZlcnNpb24gKyBjb25maWdJZCArIHBjYlRyYW5zZm9ybSArIG1peFRhYmxlICtcclxuICAgICAgICAgICAgbWFnQmlhcyArIGNoYW5uZWxQcm9wZXJ0aWVzICsgcGlkUGFyYW1ldGVycyArIHN0YXRlUGFyYW1ldGVycyArXHJcbiAgICAgICAgICAgIGNvbG9yICsgbGVkU3RhdGVDYXNlICsgbGVkU3RhdGVzICsgbGVkU3RhdGVzRml4ZWQgKyBkZXZpY2VOYW1lICtcclxuICAgICAgICAgICAgY29uZmlnMTQxNSArIGNvbmZpZ0ZpeGVkMTQxNSArIGNvbmZpZ0ZsYWc7XHJcbiAgICAgICAgdmFyIGNvbmZpZ0Z1bGwxNiA9IHZlY3RvcjNmICsgcGlkU2V0dGluZ3MgKyB2ZXJzaW9uICsgY29uZmlnSWQgKyBwY2JUcmFuc2Zvcm0gKyBtaXhUYWJsZSArXHJcbiAgICAgICAgICAgIG1hZ0JpYXMgKyBjaGFubmVsUHJvcGVydGllcyArIHBpZFBhcmFtZXRlcnMgKyBzdGF0ZVBhcmFtZXRlcnMgK1xyXG4gICAgICAgICAgICBjb2xvciArIGxlZFN0YXRlQ2FzZSArIGxlZFN0YXRlcyArIGxlZFN0YXRlc0ZpeGVkICsgZGV2aWNlTmFtZSArXHJcbiAgICAgICAgICAgIGluZXJ0aWFsQmlhcyArIHZlbG9jaXR5UGlkUGFyYW1ldGVycyArXHJcbiAgICAgICAgICAgIGNvbmZpZyArIGNvbmZpZ0ZpeGVkICsgY29uZmlnRmxhZztcclxuXHJcbiAgICAgICAgdmFyIHN0YXRlID0gJ1JvdGF0aW9uID0geyByb2xsOiBmMzIsIHBpdGNoOiBmMzIsIHlhdzogZjMyIH07JyArXHJcbiAgICAgICAgICAgICdQSURTdGF0ZSA9IHsnICtcclxuICAgICAgICAgICAgJ3RpbWVzdGFtcF91czogdTMyLCcgK1xyXG4gICAgICAgICAgICAnaW5wdXQ6IGYzMiwnICtcclxuICAgICAgICAgICAgJ3NldHBvaW50OiBmMzIsJyArXHJcbiAgICAgICAgICAgICdwX3Rlcm06IGYzMiwnICtcclxuICAgICAgICAgICAgJ2lfdGVybTogZjMyLCcgK1xyXG4gICAgICAgICAgICAnZF90ZXJtOiBmMzIgfTsnICtcclxuICAgICAgICAgICAgJ1JjQ29tbWFuZCA9IHsgdGhyb3R0bGU6IGkxNiwgcGl0Y2g6IGkxNiwgcm9sbDogaTE2LCB5YXc6IGkxNiB9OycgK1xyXG4gICAgICAgICAgICAnU3RhdGUgPSB7LzMyLycgK1xyXG4gICAgICAgICAgICAndGltZXN0YW1wX3VzOiB1MzIsJyArXHJcbiAgICAgICAgICAgICdzdGF0dXM6IHUxNiwnICtcclxuICAgICAgICAgICAgJ3YwX3JhdzogdTE2LCcgK1xyXG4gICAgICAgICAgICAnaTBfcmF3OiB1MTYsJyArXHJcbiAgICAgICAgICAgICdpMV9yYXc6IHUxNiwnICtcclxuICAgICAgICAgICAgJ2FjY2VsOiBWZWN0b3IzZiwnICtcclxuICAgICAgICAgICAgJ2d5cm86IFZlY3RvcjNmLCcgK1xyXG4gICAgICAgICAgICAnbWFnOiBWZWN0b3IzZiwnICtcclxuICAgICAgICAgICAgJ3RlbXBlcmF0dXJlOiB1MTYsJyArXHJcbiAgICAgICAgICAgICdwcmVzc3VyZTogdTMyLCcgK1xyXG4gICAgICAgICAgICAncHBtOiBbaTE2OjZdLCcgK1xyXG4gICAgICAgICAgICAnYXV4X2NoYW5fbWFzazogdTgsJyArXHJcbiAgICAgICAgICAgICdjb21tYW5kOiBSY0NvbW1hbmQsJyArXHJcbiAgICAgICAgICAgICdjb250cm9sOiB7IGZ6OiBmMzIsIHR4OiBmMzIsIHR5OiBmMzIsIHR6OiBmMzIgfSwnICtcclxuICAgICAgICAgICAgJ3BpZF9tYXN0ZXJfZno6IFBJRFN0YXRlLCcgK1xyXG4gICAgICAgICAgICAncGlkX21hc3Rlcl90eDogUElEU3RhdGUsJyArXHJcbiAgICAgICAgICAgICdwaWRfbWFzdGVyX3R5OiBQSURTdGF0ZSwnICtcclxuICAgICAgICAgICAgJ3BpZF9tYXN0ZXJfdHo6IFBJRFN0YXRlLCcgK1xyXG4gICAgICAgICAgICAncGlkX3NsYXZlX2Z6OiBQSURTdGF0ZSwnICtcclxuICAgICAgICAgICAgJ3BpZF9zbGF2ZV90eDogUElEU3RhdGUsJyArXHJcbiAgICAgICAgICAgICdwaWRfc2xhdmVfdHk6IFBJRFN0YXRlLCcgK1xyXG4gICAgICAgICAgICAncGlkX3NsYXZlX3R6OiBQSURTdGF0ZSwnICtcclxuICAgICAgICAgICAgJ21vdG9yX291dDogW2kxNjo4XSwnICtcclxuICAgICAgICAgICAgJ2tpbmVtYXRpY3NfYW5nbGU6IFJvdGF0aW9uLCcgK1xyXG4gICAgICAgICAgICAna2luZW1hdGljc19yYXRlOiBSb3RhdGlvbiwnICtcclxuICAgICAgICAgICAgJ2tpbmVtYXRpY3NfYWx0aXR1ZGU6IGYzMiwnICtcclxuICAgICAgICAgICAgJ2xvb3BfY291bnQ6IHUzMiB9Oyc7XHJcblxyXG4gICAgICAgIHZhciBjb21tYW5kcyA9ICdDb21tYW5kcyA9IHsvMzIvJyArXHJcbiAgICAgICAgICAgICdyZXF1ZXN0X3Jlc3BvbnNlOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnc2V0X2VlcHJvbV9kYXRhOiBDb25maWd1cmF0aW9uRml4ZWQsJyArXHJcbiAgICAgICAgICAgICdyZWluaXRfZWVwcm9tX2RhdGE6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdyZXF1ZXN0X2VlcHJvbV9kYXRhOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAncmVxdWVzdF9lbmFibGVfaXRlcmF0aW9uOiB1OCwnICtcclxuICAgICAgICAgICAgJ21vdG9yX292ZXJyaWRlX3NwZWVkXzA6IHUxNiwnICtcclxuICAgICAgICAgICAgJ21vdG9yX292ZXJyaWRlX3NwZWVkXzE6IHUxNiwnICtcclxuICAgICAgICAgICAgJ21vdG9yX292ZXJyaWRlX3NwZWVkXzI6IHUxNiwnICtcclxuICAgICAgICAgICAgJ21vdG9yX292ZXJyaWRlX3NwZWVkXzM6IHUxNiwnICtcclxuICAgICAgICAgICAgJ21vdG9yX292ZXJyaWRlX3NwZWVkXzQ6IHUxNiwnICtcclxuICAgICAgICAgICAgJ21vdG9yX292ZXJyaWRlX3NwZWVkXzU6IHUxNiwnICtcclxuICAgICAgICAgICAgJ21vdG9yX292ZXJyaWRlX3NwZWVkXzY6IHUxNiwnICtcclxuICAgICAgICAgICAgJ21vdG9yX292ZXJyaWRlX3NwZWVkXzc6IHUxNiwnICtcclxuICAgICAgICAgICAgJ3NldF9jb21tYW5kX292ZXJyaWRlOiBib29sLCcgK1xyXG4gICAgICAgICAgICAnc2V0X3N0YXRlX21hc2s6IHUzMiwnICtcclxuICAgICAgICAgICAgJ3NldF9zdGF0ZV9kZWxheTogdTE2LCcgK1xyXG4gICAgICAgICAgICAnc2V0X3NkX3dyaXRlX2RlbGF5OiB1MTYsJyArXHJcbiAgICAgICAgICAgICdzZXRfbGVkOiB7JyArXHJcbiAgICAgICAgICAgICcgIHBhdHRlcm46IHU4LCcgK1xyXG4gICAgICAgICAgICAnICBjb2xvcl9yaWdodDogQ29sb3IsJyArXHJcbiAgICAgICAgICAgICcgIGNvbG9yX2xlZnQ6IENvbG9yLCcgK1xyXG4gICAgICAgICAgICAnICBpbmRpY2F0b3JfcmVkOiBib29sLCcgK1xyXG4gICAgICAgICAgICAnICBpbmRpY2F0b3JfZ3JlZW46IGJvb2wgfSwnICtcclxuICAgICAgICAgICAgJ3NldF9zZXJpYWxfcmM6IHsgZW5hYmxlZDogYm9vbCwgY29tbWFuZDogUmNDb21tYW5kLCBhdXhfbWFzazogdTggfSwnICtcclxuICAgICAgICAgICAgJ3NldF9jYXJkX3JlY29yZGluZ19zdGF0ZTogey84LyByZWNvcmRfdG9fY2FyZDogdm9pZCwgbG9ja19yZWNvcmRpbmdfc3RhdGU6IHZvaWQgfSwnICtcclxuICAgICAgICAgICAgJ3NldF9wYXJ0aWFsX2VlcHJvbV9kYXRhOiBDb25maWd1cmF0aW9uLCcgK1xyXG4gICAgICAgICAgICAncmVpbml0X3BhcnRpYWxfZWVwcm9tX2RhdGE6IENvbmZpZ3VyYXRpb25GbGFnLCcgK1xyXG4gICAgICAgICAgICAncmVxX3BhcnRpYWxfZWVwcm9tX2RhdGE6IENvbmZpZ3VyYXRpb25GbGFnLCcgK1xyXG4gICAgICAgICAgICAncmVxX2NhcmRfcmVjb3JkaW5nX3N0YXRlOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnc2V0X3BhcnRpYWxfdGVtcG9yYXJ5X2NvbmZpZzogQ29uZmlndXJhdGlvbiwnICtcclxuICAgICAgICAgICAgJ3NldF9jb21tYW5kX3NvdXJjZXM6IHsvOC8gc2VyaWFsOiB2b2lkLCByYWRpbzogdm9pZCB9LCcgK1xyXG4gICAgICAgICAgICAnc2V0X2NhbGlicmF0aW9uOiB7IGVuYWJsZWQ6IGJvb2wsIG1vZGU6IHU4IH0sJyArXHJcbiAgICAgICAgICAgICdzZXRfYXV0b3BpbG90X2VuYWJsZWQ6IGJvb2wsJyArXHJcbiAgICAgICAgICAgICdzZXRfdXNiX21vZGU6IHU4fTsnO1xyXG5cclxuICAgICAgICB2YXIgZGVidWdTdHJpbmcgPSBcIkRlYnVnU3RyaW5nID0geyBkZXByaWNhdGVkX21hc2s6IHUzMiwgbWVzc2FnZTogcyB9O1wiO1xyXG4gICAgICAgIHZhciBoaXN0b3J5RGF0YSA9IFwiSGlzdG9yeURhdGEgPSBEZWJ1Z1N0cmluZztcIjtcclxuICAgICAgICB2YXIgcmVzcG9uc2UgPSBcIlJlc3BvbnNlID0geyBtYXNrOiB1MzIsIGFjazogdTMyIH07XCI7XHJcblxyXG4gICAgICAgIHZhciBoYW5kbGVyMTQgPSBjb25maWdGdWxsMTQgKyBzdGF0ZSArIGNvbW1hbmRzICsgZGVidWdTdHJpbmcgKyBoaXN0b3J5RGF0YSArIHJlc3BvbnNlO1xyXG4gICAgICAgIHZhciBoYW5kbGVyMTUgPSBjb25maWdGdWxsMTUgKyBzdGF0ZSArIGNvbW1hbmRzICsgZGVidWdTdHJpbmcgKyBoaXN0b3J5RGF0YSArIHJlc3BvbnNlO1xyXG4gICAgICAgIHZhciBoYW5kbGVyMTYgPSBjb25maWdGdWxsMTYgKyBzdGF0ZSArIGNvbW1hbmRzICsgZGVidWdTdHJpbmcgKyBoaXN0b3J5RGF0YSArIHJlc3BvbnNlO1xyXG5cclxuICAgICAgICBoYW5kbGVyQ2FjaGVbJzEuNC4wJ10gPSBGbHlicml4U2VyaWFsaXphdGlvbi5wYXJzZShoYW5kbGVyMTQpO1xyXG4gICAgICAgIGhhbmRsZXJDYWNoZVsnMS41LjAnXSA9IGhhbmRsZXJDYWNoZVsnMS41LjEnXSA9IEZseWJyaXhTZXJpYWxpemF0aW9uLnBhcnNlKGhhbmRsZXIxNSk7XHJcbiAgICAgICAgaGFuZGxlckNhY2hlWycxLjYuMCddID0gRmx5YnJpeFNlcmlhbGl6YXRpb24ucGFyc2UoaGFuZGxlcjE2KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgZ2V0SGFuZGxlcjogZnVuY3Rpb24gKGZpcm13YXJlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlckNhY2hlW2Zpcm13YXJlXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG59KCkpO1xyXG4iXX0=
