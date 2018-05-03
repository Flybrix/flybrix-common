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
