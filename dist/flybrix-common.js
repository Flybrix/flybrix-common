(function() {
    'use strict';

    angular.module('flybrixCommon', []);
}());

(function() {
    'use strict';

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

    angular.module('flybrixCommon').factory('firmwareVersion', firmwareVersion);

    firmwareVersion.$inject = ['configHandler'];

    function firmwareVersion(configHandler) {
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
            stateMask: function() {
                return stateMask;
            }
        };
    }

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

    angular.module('flybrixCommon').factory('rcData', rcData);

    rcData.$inject = ['serial', 'encodable'];

    function rcData(serial, encodable) {
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

        var commandHandler = encodable.map([
            {key: 'throttle', element: encodable.Int16},
            {key: 'pitch', element: encodable.Int16},
            {key: 'roll', element: encodable.Int16},
            {key: 'yaw', element: encodable.Int16},
        ]);

        var rcHandler = encodable.map([
            {key: 'enabled', element: encodable.bool},
            {key: 'command', element: commandHandler},
            {key: 'auxcode', element: encodable.Uint8},
        ]);

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

            var data = new Uint8Array(10);
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
