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

    function encodable(type, properties) {
        var comp = compiler[type];
        if (comp === undefined) {
            throw new Error(
                'Unsupported type: "' + type +
                '". Allowed types: number, string, map, array.');
        }
        return comp(properties);
    }

    // Handling numbers

    var numberHandlers = {};
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
            numberHandlers[key] = new Handler(encode, decode);
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
        numberHandlers[key] = new Handler(encode, decode);
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
        return new Handler(encode, decode);
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

    function compileArray(properties) {
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
        return new Handler(encode, decode);
    }

    // Handling maps

    function compileMap(properties) {
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
        return new Handler(encode, decode);
    }

    function Handler(encode, decode) {
        this.encode = encode;
        this.decode = decode;
    }
}());
