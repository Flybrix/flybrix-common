describe('Encodable service', function() {
    var encodable;
    var serializer;

    beforeEach(angular.mock.module('flybrixCommon'));

    beforeEach(inject(function(_encodable_, _serializer_) {
        encodable = _encodable_;
        serializer = _serializer_;
    }));

    it('exists', function() {
        expect(encodable).toBeDefined();
    });

    it('refuses bad keys', function() {
        expect(function() {
            new encodable();
        }).toThrow();
        expect(function() {
            new encodable('meh');
        }).toThrow();
    });

    describe('number encoder', function() {
        it('refuses bad number types', function() {
            expect(function() {
                new encodable('number');
            }).toThrow();
            expect(function() {
                new encodable('number', 'Uint33');
            }).toThrow();
        });

        it('encodes Uint8', function() {
            var data = new Uint8Array(1);
            var view = new DataView(data.buffer, 0);
            var b = new serializer();
            var encoder = new encodable('number', 'Uint8');
            encoder.encode(view, b, 180);
            expect(data).toEqual(new Uint8Array([180]));
        });

        it('encodes Uint16', function() {
            var data = new Uint8Array(2);
            var view = new DataView(data.buffer, 0);
            var b = new serializer();
            var encoder = new encodable('number', 'Uint16');
            encoder.encode(view, b, 0xF00D);
            expect(data).toEqual(new Uint8Array([0x0D, 0xF0]));
        });

        it('encodes Uint32', function() {
            var data = new Uint8Array(4);
            var view = new DataView(data.buffer, 0);
            var b = new serializer();
            var encoder = new encodable('number', 'Uint32');
            encoder.encode(view, b, 0xF00DD33D);
            expect(data).toEqual(new Uint8Array([0x3D, 0xD3, 0x0D, 0xF0]));
        });

        it('encodes Int8', function() {
            var data = new Uint8Array(1);
            var view = new DataView(data.buffer, 0);
            var b = new serializer();
            var encoder = new encodable('number', 'Int8');
            encoder.encode(view, b, -100);
            expect(data).toEqual(new Uint8Array([156]));
        });

        it('encodes Int16', function() {
            var data = new Uint8Array(2);
            var view = new DataView(data.buffer, 0);
            var b = new serializer();
            var encoder = new encodable('number', 'Int16');
            encoder.encode(view, b, -10000);
            expect(data).toEqual(new Uint8Array([240, 216]));
        });

        it('encodes Int32', function() {
            var data = new Uint8Array(4);
            var view = new DataView(data.buffer, 0);
            var b = new serializer();
            var encoder = new encodable('number', 'Int32');
            encoder.encode(view, b, -1000000000);
            expect(data).toEqual(new Uint8Array([0x00, 0x36, 0x65, 0xC4]));
        });

        it('encodes Float32', function() {
            var data = new Uint8Array(4);
            var view = new DataView(data.buffer, 0);
            var b = new serializer();
            var encoder = new encodable('number', 'Float32');
            encoder.encode(view, b, 1005.75);
            expect(data).toEqual(new Uint8Array([0x00, 0x70, 0x7b, 0x44]));
        });

        it('encodes Float64', function() {
            var data = new Uint8Array(8);
            var view = new DataView(data.buffer, 0);
            var b = new serializer();
            var encoder = new encodable('number', 'Float64');
            encoder.encode(view, b, 1005.75);
            expect(data).toEqual(new Uint8Array(
                [0x00, 0x00, 0x00, 0x00, 0x00, 0x6e, 0x8f, 0x40]));
        });
    });

    describe('number decoder', function() {
        it('decodes Uint8', function() {
            var data = new Uint8Array([180]);
            var view = new DataView(data.buffer, 0);
            var b = new serializer();
            var encoder = new encodable('number', 'Uint8');
            expect(encoder.decode(view, b)).toEqual(180);
        });

        it('decodes Uint16', function() {
            var data = new Uint8Array([0x0D, 0xF0]);
            var view = new DataView(data.buffer, 0);
            var b = new serializer();
            var encoder = new encodable('number', 'Uint16');
            expect(encoder.decode(view, b)).toEqual(0xF00D);
        });

        it('decodes Uint32', function() {
            var data = new Uint8Array([0x3D, 0xD3, 0x0D, 0xF0]);
            var view = new DataView(data.buffer, 0);
            var b = new serializer();
            var encoder = new encodable('number', 'Uint32');
            expect(encoder.decode(view, b)).toEqual(0xF00DD33D);
        });

        it('decodes Int8', function() {
            var data = new Uint8Array([156]);
            var view = new DataView(data.buffer, 0);
            var b = new serializer();
            var encoder = new encodable('number', 'Int8');
            expect(encoder.decode(view, b)).toEqual(-100);
        });

        it('decodes Int16', function() {
            var data = new Uint8Array([240, 216]);
            var view = new DataView(data.buffer, 0);
            var b = new serializer();
            var encoder = new encodable('number', 'Int16');
            expect(encoder.decode(view, b)).toEqual(-10000);
        });

        it('decodes Int32', function() {
            var data = new Uint8Array([0x00, 0x36, 0x65, 0xC4]);
            var view = new DataView(data.buffer, 0);
            var b = new serializer();
            var encoder = new encodable('number', 'Int32');
            expect(encoder.decode(view, b)).toEqual(-1000000000);
        });

        it('decodes Float32', function() {
            var data = new Uint8Array([0x00, 0x70, 0x7b, 0x44]);
            var view = new DataView(data.buffer, 0);
            var b = new serializer();
            var encoder = new encodable('number', 'Float32');
            expect(encoder.decode(view, b)).toEqual(1005.75);
        });

        it('decodes Float64', function() {
            var data = new Uint8Array(
                [0x00, 0x00, 0x00, 0x00, 0x00, 0x6e, 0x8f, 0x40]);
            var view = new DataView(data.buffer, 0);
            var b = new serializer();
            var encoder = new encodable('number', 'Float64');
            expect(encoder.decode(view, b)).toEqual(1005.75);
        });
    });

    describe('string encoder', function() {
        it('encodes short string', function() {
            var data = new Uint8Array(9);
            var view = new DataView(data.buffer, 0);
            var b = new serializer();
            var encoder = new encodable('string', 9);
            encoder.encode(view, b, 'Abcd');
            expect(data).toEqual(
                new Uint8Array([65, 98, 99, 100, 0, 0, 0, 0, 0]));
        });

        it('encodes overflowed string with null terminator', function() {
            var data = new Uint8Array(6);
            var view = new DataView(data.buffer, 0);
            var b = new serializer();
            var encoder = new encodable('string', 6);
            encoder.encode(view, b, 'Abc0123456');
            expect(data).toEqual(new Uint8Array([65, 98, 99, 48, 49, 0]));
        });
    });

    describe('string decoder', function() {
        it('decodes short string', function() {
            var data = new Uint8Array([65, 98, 99, 100, 0, 0, 0, 48, 49]);
            var view = new DataView(data.buffer, 0);
            var b = new serializer();
            var encoder = new encodable('string', 9);
            expect(encoder.decode(view, b)).toEqual('Abcd');
        });

        it('decodes unterminated string by trimming the end', function() {
            var data = new Uint8Array([65, 98, 99, 48, 49, 50]);
            var view = new DataView(data.buffer, 0);
            var b = new serializer();
            var encoder = new encodable('string', 6);
            expect(encoder.decode(view, b)).toEqual('Abc01');
        });
    });

    describe('array encoder', function() {
        it('requires count property', function() {
            expect(function() {
                new encodable('array');
            }).toThrow();
            expect(function() {
                new encodable('array', new encodable('array', {
                                  element: new encodable('string', 9),
                              }));
            }).toThrow();
        });

        it('requires encodable element type', function() {
            expect(function() {
                new encodable('array');
            }).toThrow();
            expect(function() {
                new encodable('array', new encodable('array', {
                                  count: 5,
                              }));
            }).toThrow();
            expect(function() {
                new encodable('array', new encodable('array', {
                                  count: 5,
                                  element: 77,
                              }));
            }).toThrow();
        });

        it('encodes string array', function() {
            var data = new Uint8Array(45);
            var view = new DataView(data.buffer, 0);
            var b = new serializer();
            var encoder = new encodable('array', {
                count: 5,
                element: new encodable('string', 9),
            });
            encoder.encode(
                view, b, ['Abcd', '123', '0Aa1', '00', 'abcdabcdabcd']);
            expect(data).toEqual(new Uint8Array([
                65, 98, 99, 100, 0,  0,  0,  0,  0,  49,  50, 51, 0,  0,   0,
                0,  0,  0,  48,  65, 97, 49, 0,  0,  0,   0,  0,  48, 48,  0,
                0,  0,  0,  0,   0,  0,  97, 98, 99, 100, 97, 98, 99, 100, 0,
            ]));
        });
    });

    describe('array decoder', function() {
        it('decodes string array', function() {
            var data = new Uint8Array([
                65, 98, 99, 100, 0, 0, 0, 22, 49, 50, 51, 0,   11, 0,  0,  0,
                48, 65, 97, 49,  0, 0, 0, 33, 97, 98, 99, 100, 97, 98, 99, 100,
            ]);
            var view = new DataView(data.buffer, 0);
            var b = new serializer();
            var encoder = new encodable('array', {
                count: 4,
                element: new encodable('string', 8),
            });
            expect(encoder.decode(view, b)).toEqual([
                'Abcd', '123', '0Aa1', 'abcdabc'
            ]);
        });
    });

    describe('map encoder', function() {
        it('requires array as properties', function() {
            expect(function() {
                new encodable('map');
            }).toThrow();
            expect(function() {
                new encodable('map', {});
            }).toThrow();
            expect(function() {
                new encodable('map', []);
            }).not.toThrow();
        });

        it('requires array elements to be {key, element} maps', function() {
            expect(function() {
                new encodable('map');
            }).toThrow();
            expect(function() {
                new encodable('map', [{key: 'asdf'}]);
            }).toThrow();
            expect(function() {
                new encodable('map', [{key: 'asdf', element: 5}]);
            }).toThrow();
            expect(function() {
                new encodable('map', [{element: new encodable('string', 9)}]);
            }).toThrow();
            expect(function() {
                new encodable(
                    'map',
                    [{key: 'asdf', element: new encodable('string', 9)}]);
            }).not.toThrow();
        });

        it('encodes any data', function() {
            var data = new Uint8Array(13);
            var view = new DataView(data.buffer, 0);
            var b = new serializer();
            var encoder = new encodable('map', [
                {key: 'name', element: new encodable('string', 9)},
                {key: 'price', element: new encodable('number', 'Uint32')},
            ]);
            encoder.encode(view, b, {
                name: 'Abcd',
                price: 0xEEAABBCC,
            });
            expect(data).toEqual(new Uint8Array(
                [65, 98, 99, 100, 0, 0, 0, 0, 0, 0xCC, 0xBB, 0xAA, 0xEE]));
        });
    });

    describe('map decoder', function() {
        it('decodes any data', function() {
            var data = new Uint8Array(
                [65, 98, 99, 100, 0, 0, 0, 0, 0, 0xCC, 0xBB, 0xAA, 0xEE]);
            var view = new DataView(data.buffer, 0);
            var b = new serializer();
            var encoder = new encodable('map', [
                {key: 'name', element: new encodable('string', 9)},
                {key: 'price', element: new encodable('number', 'Uint32')},
            ]);
            expect(encoder.decode(view, b)).toEqual({
                name: 'Abcd',
                price: 0xEEAABBCC,
            });
        });
    });
});
