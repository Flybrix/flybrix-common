(function() {
    'use strict';

    angular.module('flybrixCommon').factory('encodable', function() {
        return encodable;
    });

    var compiler = {
        'number': compileNumber,
        'string': compileString,
        'map': compileMap,
        'array': compileArray,
        'bool': compileBoolean,
    };

    function encodable(type, properties, splitBits) {
        var comp = compiler[type];
        if (comp === undefined) {
            throw new Error(
                'Unsupported type: "' + type +
                '". Allowed types: number, string, map, array.');
        }
        return comp(properties, splitBits);
    }

    // Handling numbers

    var numberHandlers = {};
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
            numberHandlers[key] = new Handler(encode, decode, numberZero);
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
        numberHandlers[key] = new Handler(encode, decode, numberZero);
    });

    function compileNumber(type) {
        var handler = numberHandlers[type];
        if (handler === undefined) {
            throw new Error(
                'Unsupported number type: "' + type +
                '". Allowed number types: (Uint|Int)(8|16|32|64), eg. Uint16.');
        }
        return handler;
    }

    // Handling bools

    var boolHandler = new Handler(
        function(dataView, serializer, data) {
            numberHandlers.Uint8.encode(dataView, serializer, data ? 1 : 0)
        },
        function(dataView, serializer) {
            return numberHandlers.Uint8.decode(dataView, serializer) !== 0;
        },
        function() {
            return false;
        });

    function compileBoolean() {
        return boolHandler;
    }

    // Handling strings

    function compileString(length) {
        var handler = compileArray({
            count: length,
            element: numberHandlers.Uint8,
        });
        function encode(dataView, serializer, data) {
            handler.encode(dataView, serializer, asciiEncode(data, length));
        }
        function decode(dataView, serializer) {
            return asciiDecode(handler.decode(dataView, serializer), length);
        }
        function empty() {
            return '';
        }
        return new Handler(encode, decode, empty);
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

    function compileArray(properties, splitBits) {
        var length = properties.count;
        var element = properties.element;
        if (length === undefined) {
            throw new Error(
                'Array type requires "count" in its property object');
        }
        if (!(element instanceof Handler)) {
            throw new Error(
                'Array type requires Handler type as "element" in its property object');
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
        if (splitBits !== undefined) {
            var numberEncoder = encodable('number', 'Uint' + splitBits);
            function encodePartial(dataView, serializer, data, masks) {
                var mask = masks.pop();
                numberEncoder.encode(dataView, serializer, mask);
                for (var i = 0; i < length; ++i) {
                    if (mask & (1 << i)) {
                        element.encodePartial(
                            dataView, serializer, data[i], masks);
                    }
                }
            }
            function decodePartial(dataView, serializer, original) {
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
            return new Handler(
                encode, decode, empty, encodePartial, decodePartial);
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
            return new Handler(
                encode, decode, empty, encodePartial, decodePartial);
        }
    }

    // Handling maps

    function compileMap(properties, splitBits) {
        var length = properties.length;
        if (length === undefined) {
            throw new Error(
                'Map type requires an array of {key: String, element: Handler} maps');
        }
        properties.forEach(function(property) {
            if (property.key === undefined ||
                !(property.element instanceof Handler)) {
                throw new Error(
                    'Map type requires an array of {key: String, element: Handler} maps');
            }
        });
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
        if (splitBits !== undefined) {
            var numberEncoder = encodable('number', 'Uint' + splitBits);
            function encodePartial(dataView, serializer, data, masks) {
                var mask = masks.pop();
                numberEncoder.encode(dataView, serializer, mask);
                properties.forEach(function(property) {
                    if (mask & (1 << property.part)) {
                        property.element.encodePartial(
                            dataView, serializer, data[property.key], masks);
                    }
                });
            }
            function decodePartial(dataView, serializer, original) {
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
            return new Handler(
                encode, decode, empty, encodePartial, decodePartial);
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
            return new Handler(
                encode, decode, empty, encodePartial, decodePartial);
        }
    }

    function Handler(encode, decode, empty, encodePartial, decodePartial) {
        encodePartial = encodePartial || encode;
        decodePartial = decodePartial || decode;
        this.encode = encode;
        this.decode = decode;
        this.encodePartial = encodePartial;
        this.decodePartial = decodePartial;
        this.empty = empty;
    }
}());
