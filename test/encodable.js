describe('Encodable service', function() {
    var encodable;

    beforeEach(angular.mock.module('flybrixCommon'));

    beforeEach(inject(function(_encodable_) {
        encodable = _encodable_;
    }));

    it('exists', function() {
        expect(encodable).toBeDefined();
    });

    describe('Serializer', function() {
        it('exists', function() {
            expect(encodable.Serializer).toBeDefined();
        });

        it('is constructor', function() {
            expect(new encodable.Serializer()).toBeDefined();
        });

        describe('.index', function() {
            it('exists', function() {
                expect(new encodable.Serializer().index).toBeDefined();
            });

            it('starts at zero', function() {
                expect(new encodable.Serializer().index).toEqual(0);
            });

        });

        describe('.add()', function() {
            it('exists', function() {
                expect(new encodable.Serializer().add).toBeDefined();
            });

            it('increments index', function() {
                var ser = new encodable.Serializer();
                expect(ser.index).toEqual(0);
                ser.add(7);
                expect(ser.index).toEqual(7);
            });

            it('accumulates index increments', function() {
                var ser = new encodable.Serializer();
                expect(ser.index).toEqual(0);
                ser.add(7);
                expect(ser.index).toEqual(7);
                ser.add(2);
                expect(ser.index).toEqual(9);
                ser.add(12);
                expect(ser.index).toEqual(21);
                ser.add(4);
                expect(ser.index).toEqual(25);
            });
        });
    });

    describe('empty value', function() {
        it('is false for bool', function() {
            expect(encodable.bool.empty()).toEqual(false);
        });

        it('is zero for number', function() {
            expect(encodable.Float64.empty()).toEqual(0);
        });

        it('is empty string for string', function() {
            expect(encodable.string(5).empty()).toEqual('');
        });

        it('is array of empties for array', function() {
            expect(encodable.array(3, encodable.bool).empty()).toEqual([
                false, false, false
            ]);
        });

        it('is map of empties for map', function() {
            expect(encodable
                       .map([
                           {key: 'name', element: encodable.string(9)},
                           {key: 'price', element: encodable.Uint32},
                       ])
                       .empty())
                .toEqual({
                    name: '',
                    price: 0,
                });
        });
    });

    describe('boolean', function() {
        it('encodes true', function() {
            var data = new Uint8Array(1);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder = encodable.bool;
            encoder.encode(view, b, true);
            expect(data).toEqual(new Uint8Array([1]));
        });

        it('encodes false', function() {
            var data = new Uint8Array(1);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder = encodable.bool;
            encoder.encode(view, b, false);
            expect(data).toEqual(new Uint8Array([0]));
        });

        it('partial encodes true', function() {
            var data = new Uint8Array(1);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder = encodable.bool;
            encoder.encodePartial(view, b, true);
            expect(data).toEqual(new Uint8Array([1]));
        });

        it('partial encodes false', function() {
            var data = new Uint8Array(1);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder = encodable.bool;
            encoder.encodePartial(view, b, false);
            expect(data).toEqual(new Uint8Array([0]));
        });

        it('has right amount of bytes', function() {
            var encoder = encodable.bool;
            expect(encoder.bytecount()).toBe(1);
            expect(encoder.bytecount([])).toBe(1);
        });

        it('decodes true', function() {
            var data = new Uint8Array([5]);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder = encodable.bool;
            expect(encoder.decode(view, b)).toEqual(true);
        });

        it('decodes false', function() {
            var data = new Uint8Array([0]);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder = encodable.bool;
            expect(encoder.decode(view, b)).toEqual(false);
        });

        it('decodes partial true', function() {
            var data = new Uint8Array([5]);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder = encodable.bool;
            expect(encoder.decodePartial(view, b)).toEqual(true);
        });

        it('decodes partial false', function() {
            var data = new Uint8Array([0]);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder = encodable.bool;
            expect(encoder.decodePartial(view, b)).toEqual(false);
        });
    });

    describe('number', function() {
        it('encodes Uint8', function() {
            var data = new Uint8Array(1);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder = encodable.Uint8;
            encoder.encode(view, b, 180);
            expect(data).toEqual(new Uint8Array([180]));
        });

        it('encodes Uint16', function() {
            var data = new Uint8Array(2);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder = encodable.Uint16;
            encoder.encode(view, b, 0xF00D);
            expect(data).toEqual(new Uint8Array([0x0D, 0xF0]));
        });

        it('encodes Uint32', function() {
            var data = new Uint8Array(4);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder = encodable.Uint32;
            encoder.encode(view, b, 0xF00DD33D);
            expect(data).toEqual(new Uint8Array([0x3D, 0xD3, 0x0D, 0xF0]));
        });

        it('encodes Int8', function() {
            var data = new Uint8Array(1);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder = encodable.Int8;
            encoder.encode(view, b, -100);
            expect(data).toEqual(new Uint8Array([156]));
        });

        it('encodes Int16', function() {
            var data = new Uint8Array(2);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder = encodable.Int16;
            encoder.encode(view, b, -10000);
            expect(data).toEqual(new Uint8Array([240, 216]));
        });

        it('encodes Int32', function() {
            var data = new Uint8Array(4);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder = encodable.Int32;
            encoder.encode(view, b, -1000000000);
            expect(data).toEqual(new Uint8Array([0x00, 0x36, 0x65, 0xC4]));
        });

        it('encodes Float32', function() {
            var data = new Uint8Array(4);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder = encodable.Float32;
            encoder.encode(view, b, 1005.75);
            expect(data).toEqual(new Uint8Array([0x00, 0x70, 0x7b, 0x44]));
        });

        it('encodes Float64', function() {
            var data = new Uint8Array(8);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder = encodable.Float64;
            encoder.encode(view, b, 1005.75);
            expect(data).toEqual(new Uint8Array(
                [0x00, 0x00, 0x00, 0x00, 0x00, 0x6e, 0x8f, 0x40]));
        });

        it('encodes partial Uint8', function() {
            var data = new Uint8Array(1);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder = encodable.Uint8;
            encoder.encodePartial(view, b, 180);
            expect(data).toEqual(new Uint8Array([180]));
        });

        it('encodes partial Uint16', function() {
            var data = new Uint8Array(2);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder = encodable.Uint16;
            encoder.encodePartial(view, b, 0xF00D);
            expect(data).toEqual(new Uint8Array([0x0D, 0xF0]));
        });

        it('encodes partial Uint32', function() {
            var data = new Uint8Array(4);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder = encodable.Uint32;
            encoder.encodePartial(view, b, 0xF00DD33D);
            expect(data).toEqual(new Uint8Array([0x3D, 0xD3, 0x0D, 0xF0]));
        });

        it('encodes partial Int8', function() {
            var data = new Uint8Array(1);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder = encodable.Int8;
            encoder.encodePartial(view, b, -100);
            expect(data).toEqual(new Uint8Array([156]));
        });

        it('encodes partial Int16', function() {
            var data = new Uint8Array(2);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder = encodable.Int16;
            encoder.encodePartial(view, b, -10000);
            expect(data).toEqual(new Uint8Array([240, 216]));
        });

        it('encodes partial Int32', function() {
            var data = new Uint8Array(4);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder = encodable.Int32;
            encoder.encodePartial(view, b, -1000000000);
            expect(data).toEqual(new Uint8Array([0x00, 0x36, 0x65, 0xC4]));
        });

        it('encodes partial Float32', function() {
            var data = new Uint8Array(4);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder = encodable.Float32;
            encoder.encodePartial(view, b, 1005.75);
            expect(data).toEqual(new Uint8Array([0x00, 0x70, 0x7b, 0x44]));
        });

        it('encodes partial Float64', function() {
            var data = new Uint8Array(8);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder = encodable.Float64;
            encoder.encodePartial(view, b, 1005.75);
            expect(data).toEqual(new Uint8Array(
                [0x00, 0x00, 0x00, 0x00, 0x00, 0x6e, 0x8f, 0x40]));
        });

        it('has right amount of bytes', function() {
            expect(encodable.Uint8.bytecount()).toBe(1);
            expect(encodable.Uint16.bytecount()).toBe(2);
            expect(encodable.Uint32.bytecount()).toBe(4);
            expect(encodable.Int8.bytecount()).toBe(1);
            expect(encodable.Int16.bytecount()).toBe(2);
            expect(encodable.Int32.bytecount()).toBe(4);
            expect(encodable.Float32.bytecount()).toBe(4);
            expect(encodable.Float64.bytecount()).toBe(8);
            expect(encodable.Uint8.bytecount([])).toBe(1);
            expect(encodable.Uint16.bytecount([])).toBe(2);
            expect(encodable.Uint32.bytecount([])).toBe(4);
            expect(encodable.Int8.bytecount([])).toBe(1);
            expect(encodable.Int16.bytecount([])).toBe(2);
            expect(encodable.Int32.bytecount([])).toBe(4);
            expect(encodable.Float32.bytecount([])).toBe(4);
            expect(encodable.Float64.bytecount([])).toBe(8);
        });

        it('decodes Uint8', function() {
            var data = new Uint8Array([180]);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder = encodable.Uint8;
            expect(encoder.decode(view, b)).toEqual(180);
        });

        it('decodes Uint16', function() {
            var data = new Uint8Array([0x0D, 0xF0]);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder = encodable.Uint16;
            expect(encoder.decode(view, b)).toEqual(0xF00D);
        });

        it('decodes Uint32', function() {
            var data = new Uint8Array([0x3D, 0xD3, 0x0D, 0xF0]);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder = encodable.Uint32;
            expect(encoder.decode(view, b)).toEqual(0xF00DD33D);
        });

        it('decodes Int8', function() {
            var data = new Uint8Array([156]);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder = encodable.Int8;
            expect(encoder.decode(view, b)).toEqual(-100);
        });

        it('decodes Int16', function() {
            var data = new Uint8Array([240, 216]);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder = encodable.Int16;
            expect(encoder.decode(view, b)).toEqual(-10000);
        });

        it('decodes Int32', function() {
            var data = new Uint8Array([0x00, 0x36, 0x65, 0xC4]);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder = encodable.Int32;
            expect(encoder.decode(view, b)).toEqual(-1000000000);
        });

        it('decodes Float32', function() {
            var data = new Uint8Array([0x00, 0x70, 0x7b, 0x44]);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder = encodable.Float32;
            expect(encoder.decode(view, b)).toEqual(1005.75);
        });

        it('decodes Float64', function() {
            var data = new Uint8Array(
                [0x00, 0x00, 0x00, 0x00, 0x00, 0x6e, 0x8f, 0x40]);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder = encodable.Float64;
            expect(encoder.decode(view, b)).toEqual(1005.75);
        });

        it('decodes partial Uint8', function() {
            var data = new Uint8Array([180]);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder = encodable.Uint8;
            expect(encoder.decodePartial(view, b)).toEqual(180);
        });

        it('decodes partial Uint16', function() {
            var data = new Uint8Array([0x0D, 0xF0]);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder = encodable.Uint16;
            expect(encoder.decodePartial(view, b)).toEqual(0xF00D);
        });

        it('decodes partial Uint32', function() {
            var data = new Uint8Array([0x3D, 0xD3, 0x0D, 0xF0]);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder = encodable.Uint32;
            expect(encoder.decodePartial(view, b)).toEqual(0xF00DD33D);
        });

        it('decodes partial Int8', function() {
            var data = new Uint8Array([156]);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder = encodable.Int8;
            expect(encoder.decodePartial(view, b)).toEqual(-100);
        });

        it('decodes partial Int16', function() {
            var data = new Uint8Array([240, 216]);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder = encodable.Int16;
            expect(encoder.decodePartial(view, b)).toEqual(-10000);
        });

        it('decodes partial Int32', function() {
            var data = new Uint8Array([0x00, 0x36, 0x65, 0xC4]);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder = encodable.Int32;
            expect(encoder.decodePartial(view, b)).toEqual(-1000000000);
        });

        it('decodes partial Float32', function() {
            var data = new Uint8Array([0x00, 0x70, 0x7b, 0x44]);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder = encodable.Float32;
            expect(encoder.decodePartial(view, b)).toEqual(1005.75);
        });

        it('decodes partial Float64', function() {
            var data = new Uint8Array(
                [0x00, 0x00, 0x00, 0x00, 0x00, 0x6e, 0x8f, 0x40]);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder = encodable.Float64;
            expect(encoder.decodePartial(view, b)).toEqual(1005.75);
        });
    });

    describe('string', function() {
        it('encodes short string', function() {
            var data = new Uint8Array(9);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder = encodable.string(9);
            encoder.encode(view, b, 'Abcd');
            expect(data).toEqual(
                new Uint8Array([65, 98, 99, 100, 0, 0, 0, 0, 0]));
        });

        it('encodes overflowed string with null terminator', function() {
            var data = new Uint8Array(6);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder = encodable.string(6);
            encoder.encode(view, b, 'Abc0123456');
            expect(data).toEqual(new Uint8Array([65, 98, 99, 48, 49, 0]));
        });

        it('encodes partial string', function() {
            var data = new Uint8Array(9);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder = encodable.string(9);
            encoder.encodePartial(view, b, 'Abcd');
            expect(data).toEqual(
                new Uint8Array([65, 98, 99, 100, 0, 0, 0, 0, 0]));
        });

        it('has right amount of bytes', function() {
            var encoder = encodable.string(9);
            expect(encoder.bytecount()).toBe(9);
            expect(encoder.bytecount([])).toBe(9);
        });

        it('decodes short string', function() {
            var data = new Uint8Array([65, 98, 99, 100, 0, 0, 0, 48, 49]);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder = encodable.string(9);
            expect(encoder.decode(view, b)).toEqual('Abcd');
        });

        it('decodes unterminated string by trimming the end', function() {
            var data = new Uint8Array([65, 98, 99, 48, 49, 50]);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder = encodable.string(6);
            expect(encoder.decode(view, b)).toEqual('Abc01');
        });

        it('decodes partial string', function() {
            var data = new Uint8Array([65, 98, 99, 100, 0, 0, 0, 48, 49]);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder = encodable.string(9);
            expect(encoder.decodePartial(view, b)).toEqual('Abcd');
        });
    });

    describe('array', function() {
        it('requires count property', function() {
            expect(function() {
                encodable.array();
            }).toThrow();
            expect(function() {
                encodable.array(undefined, encodable.string(9));
            }).toThrow();
        });

        it('requires encodable element type', function() {
            expect(function() {
                encodable.array();
            }).toThrow();
            expect(function() {
                encodable.array(5);
            }).toThrow();
            expect(function() {
                encodable.array(5, 77);
            }).toThrow();
        });

        it('encodes string array', function() {
            var data = new Uint8Array(45);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder = encodable.array(5, encodable.string(9));
            encoder.encode(
                view, b, ['Abcd', '123', '0Aa1', '00', 'abcdabcdabcd']);
            expect(data).toEqual(new Uint8Array([
                65, 98, 99, 100, 0,  0,  0,  0,  0,  49,  50, 51, 0,  0,   0,
                0,  0,  0,  48,  65, 97, 49, 0,  0,  0,   0,  0,  48, 48,  0,
                0,  0,  0,  0,   0,  0,  97, 98, 99, 100, 97, 98, 99, 100, 0,
            ]));
        });

        it('encodes partial string array - no split bits', function() {
            var data = new Uint8Array(45);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder = encodable.array(5, encodable.string(9));
            encoder.encodePartial(
                view, b, ['Abcd', '123', '0Aa1', '00', 'abcdabcdabcd']);
            expect(data).toEqual(new Uint8Array([
                65, 98, 99, 100, 0,  0,  0,  0,  0,  49,  50, 51, 0,  0,   0,
                0,  0,  0,  48,  65, 97, 49, 0,  0,  0,   0,  0,  48, 48,  0,
                0,  0,  0,  0,   0,  0,  97, 98, 99, 100, 97, 98, 99, 100, 0,
            ]));
        });

        it('encodes partial string array - with split bits', function() {
            var data = new Uint8Array(20);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder = encodable.array(5, encodable.string(9), 16);
            encoder.encodePartial(
                view, b, ['Abcd', '123', '0Aa1', '00', 'abcdabcdabcd'], [6]);
            expect(data).toEqual(new Uint8Array([
                6, 0,  49, 50, 51, 0, 0, 0, 0, 0,
                0, 48, 65, 97, 49, 0, 0, 0, 0, 0,
            ]));
        });

        it('encodes partial array array - no split bits', function() {
            var data = new Uint8Array(10);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder =
                encodable.array(5, encodable.array(4, encodable.Uint8, 8));
            encoder.encodePartial(
                view, b,
                [
                  [0, 1, 2, 3],
                  [5, 6, 7, 8],
                  [10, 11, 12, 13],
                  [15, 16, 17, 18],
                  [20, 21, 22, 23],
                ],
                [0, 1, 2, 3, 4]);
            expect(data).toEqual(
                new Uint8Array([4, 2, 3, 5, 6, 2, 11, 1, 15, 0]));
        });

        it('encodes partial array array - with split bits', function() {
            var data = new Uint8Array(9);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder =
                encodable.array(5, encodable.array(4, encodable.Uint8, 8), 16);
            encoder.encodePartial(
                view, b,
                [
                  [0, 1, 2, 3],
                  [5, 6, 7, 8],
                  [10, 11, 12, 13],
                  [15, 16, 17, 18],
                  [20, 21, 22, 23],
                ],
                [2, 3, 4, 26]);
            expect(data).toEqual(
                new Uint8Array([26, 0, 4, 7, 3, 15, 16, 2, 21]));
        });

        it('has right amount of bytes', function() {
            var encoder = encodable.array(4, encodable.string(8));
            expect(encoder.bytecount()).toBe(32);
        });

        it('has right amount of bytes when masked', function() {
            var encoder = encodable.array(4, encodable.string(8), 16);
            expect(encoder.bytecount()).toBe(32);
            expect(encoder.bytecount([0])).toBe(2);
            expect(encoder.bytecount([1])).toBe(10);
            expect(encoder.bytecount([13])).toBe(26);
            expect(encoder.bytecount([255])).toBe(34);
        });

        it('decodes string array', function() {
            var data = new Uint8Array([
                65, 98, 99, 100, 0, 0, 0, 22, 49, 50, 51, 0,   11, 0,  0,  0,
                48, 65, 97, 49,  0, 0, 0, 33, 97, 98, 99, 100, 97, 98, 99, 100,
            ]);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder = encodable.array(4, encodable.string(8));
            expect(encoder.decode(view, b)).toEqual([
                'Abcd', '123', '0Aa1', 'abcdabc'
            ]);
        });

        it('decodes partial string array - no split bits', function() {
            var data = new Uint8Array([
                65, 98, 99, 100, 0,  0,  0,  0,  0,  49,  50, 51, 0,  0,   0,
                0,  0,  0,  48,  65, 97, 49, 0,  0,  0,   0,  0,  48, 48,  0,
                0,  0,  0,  0,   0,  0,  97, 98, 99, 100, 97, 98, 99, 100, 0,
            ]);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder = encodable.array(5, encodable.string(9));
            data = encoder.decodePartial(view, b, []);
            expect(data).toEqual(['Abcd', '123', '0Aa1', '00', 'abcdabcd']);
        });

        it('decodes partial string array - with split bits', function() {
            var data = new Uint8Array([
                6, 0,  49, 50, 51, 0, 0, 0, 0, 0,
                0, 48, 65, 97, 49, 0, 0, 0, 0, 0,
            ]);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder = encodable.array(5, encodable.string(9), 16);
            data = encoder.decodePartial(view, b, ['1', '2', '3', '4', '5']);
            expect(data).toEqual(['1', '123', '0Aa1', '4', '5']);
        });

        it('decodes partial array array - no split bits', function() {
            var data = new Uint8Array([4, 2, 3, 5, 6, 2, 11, 1, 15, 0]);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder =
                encodable.array(5, encodable.array(4, encodable.Uint8, 8));
            data = encoder.decodePartial(view, b, [
                [90, 91, 92, 93],
                [95, 96, 97, 98],
                [910, 911, 912, 913],
                [915, 916, 917, 918],
                [920, 921, 922, 923],
            ]);
            expect(data).toEqual([
                [90, 91, 2, 93],
                [5, 6, 97, 98],
                [910, 11, 912, 913],
                [15, 916, 917, 918],
                [920, 921, 922, 923],
            ]);
        });

        it('decodes partial array array - with split bits', function() {
            var data = new Uint8Array([26, 0, 4, 7, 3, 15, 16, 2, 21]);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder =
                encodable.array(5, encodable.array(4, encodable.Uint8, 8), 16);
            data = encoder.decodePartial(view, b, [
                [90, 91, 92, 93],
                [95, 96, 97, 98],
                [910, 911, 912, 913],
                [915, 916, 917, 918],
                [920, 921, 922, 923],
            ]);
            expect(data).toEqual([
                [90, 91, 92, 93],
                [95, 96, 7, 98],
                [910, 911, 912, 913],
                [15, 16, 917, 918],
                [920, 21, 922, 923],
            ]);
        });
    });

    describe('map', function() {
        it('requires array as properties', function() {
            expect(function() {
                encodable.map();
            }).toThrow();
            expect(function() {
                encodable.map({});
            }).toThrow();
            expect(function() {
                encodable.map([]);
            }).not.toThrow();
        });

        it('requires array elements to be {key, element} maps', function() {
            expect(function() {
                encodable.map();
            }).toThrow();
            expect(function() {
                encodable.map([{key: 'asdf'}]);
            }).toThrow();
            expect(function() {
                encodable.map([{key: 'asdf', element: 5}]);
            }).toThrow();
            expect(function() {
                encodable.map([{element: encodable.string(9)}]);
            }).toThrow();
            expect(function() {
                encodable.map([{key: 'asdf', element: encodable.string(9)}]);
            }).not.toThrow();
        });

        it('requires part field in elements for split bits', function() {
            expect(function() {
                encodable.map([{key: 'asdf', element: encodable.string(9)}]);
            }).not.toThrow();
            expect(function() {
                encodable.map(
                    [{key: 'asdf', element: encodable.string(9)}], 16);
            }).toThrow();
            expect(function() {
                encodable.map(
                    [{part: 0, key: 'asdf', element: encodable.string(9)}], 16);
            }).not.toThrow();
        });

        it('encodes any data', function() {
            var data = new Uint8Array(13);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder = encodable.map([
                {key: 'name', element: encodable.string(9)},
                {key: 'price', element: encodable.Uint32},
            ]);
            encoder.encode(view, b, {
                name: 'Abcd',
                price: 0xEEAABBCC,
            });
            expect(data).toEqual(new Uint8Array(
                [65, 98, 99, 100, 0, 0, 0, 0, 0, 0xCC, 0xBB, 0xAA, 0xEE]));
        });

        it('encodes partial - no split bits', function() {
            var data = new Uint8Array(12);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder = encodable.map([
                {
                  key: 'a',
                  part: 0,
                  element: encodable.array(4, encodable.Uint8, 8)
                },
                {key: 'b', part: 2, element: encodable.string(5)},
                {
                  key: 'c',
                  part: 3,
                  element: encodable.array(4, encodable.Uint8)
                },
            ]);
            encoder.encodePartial(
                view, b, {
                    a: [0, 1, 2, 3],
                    b: 'abcdef',
                    c: [4, 5, 6, 7],
                },
                [19]);
            expect(data).toEqual(
                new Uint8Array([19, 0, 1, 97, 98, 99, 100, 0, 4, 5, 6, 7]));
        });

        it('encodes partial - with split bits', function() {
            var data = new Uint8Array(8);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder = encodable.map(
                [
                  {
                    key: 'a',
                    part: 0,
                    element: encodable.array(4, encodable.Uint8, 8),
                  },
                  {
                    key: 'b',
                    part: 2,
                    element: encodable.string(5),
                  },
                  {
                    key: 'c',
                    part: 3,
                    element: encodable.array(4, encodable.Uint8),
                  },
                ],
                8);
            encoder.encodePartial(
                view, b, {
                    a: [0, 1, 2, 3],
                    b: 'abcdef',
                    c: [4, 5, 6, 7],
                },
                [2, 7]);
            expect(data).toEqual(new Uint8Array([7, 2, 1, 97, 98, 99, 100, 0]));
        });

        it('has right amount of bytes', function() {
            var encoder = encodable.map([
                {key: 'name', element: encodable.string(9)},
                {key: 'price', element: encodable.Uint32},
            ]);
            expect(encoder.bytecount()).toBe(13);
        });

        it('has right amount of bytes when masked', function() {
            var encoder = encodable.map(
                [
                  {part: 2, key: 'name', element: encodable.string(9)},
                  {part: 4, key: 'price', element: encodable.Uint32},
                  {part: 4, key: 'pricealt', element: encodable.Uint32},
                ],
                32);
            expect(encoder.bytecount()).toBe(17);
            expect(encoder.bytecount([0])).toBe(4);
            expect(encoder.bytecount([1])).toBe(4);
            expect(encoder.bytecount([4])).toBe(13);
            expect(encoder.bytecount([16])).toBe(12);
            expect(encoder.bytecount([255])).toBe(21);
        });

        it('decodes any data', function() {
            var data = new Uint8Array(
                [65, 98, 99, 100, 0, 0, 0, 0, 0, 0xCC, 0xBB, 0xAA, 0xEE]);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder = encodable.map([
                {key: 'name', element: encodable.string(9)},
                {key: 'price', element: encodable.Uint32},
            ]);
            expect(encoder.decode(view, b)).toEqual({
                name: 'Abcd',
                price: 0xEEAABBCC,
            });
        });

        it('decodes partial - no split bits', function() {
            var data =
                new Uint8Array([3, 0, 1, 97, 98, 99, 100, 0, 4, 5, 6, 7]);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder = encodable.map([
                {key: 'a', element: encodable.array(4, encodable.Uint8, 8)},
                {key: 'b', element: encodable.string(5)},
                {key: 'c', element: encodable.array(4, encodable.Uint8)},
            ]);
            data = encoder.decodePartial(view, b, {
                a: [90, 91, 92, 93],
                b: 'xxx',
                c: [94, 95, 96, 97],
            });
            expect(data).toEqual({
                a: [0, 1, 92, 93],
                b: 'abcd',
                c: [4, 5, 6, 7],
            });
        });

        it('decodes partial - with split bits', function() {
            var data = new Uint8Array([7, 2, 1, 97, 98, 99, 100, 0]);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder = encodable.map(
                [
                  {
                    key: 'a',
                    part: 0,
                    element: encodable.array(4, encodable.Uint8, 8),
                  },
                  {
                    key: 'b',
                    part: 2,
                    element: encodable.string(5),
                  },
                  {
                    key: 'c',
                    part: 3,
                    element: encodable.array(4, encodable.Uint8),
                  },
                ],
                8);
            data = encoder.decodePartial(view, b, {
                a: [90, 91, 92, 93],
                b: 'xxx',
                c: [94, 95, 96, 97],
            });
            expect(data).toEqual({
                a: [90, 1, 92, 93],
                b: 'abcd',
                c: [94, 95, 96, 97],
            });
        });
    });

    describe('polyarray', function() {
        it('requires array as properties', function() {
            expect(function() {
                encodable.polyarray();
            }).toThrow();
            expect(function() {
                encodable.polyarray({});
            }).toThrow();
            expect(function() {
                encodable.polyarray([]);
            }).not.toThrow();
        });

        it('requires array elements to be Handler objects', function() {
            expect(function() {
                encodable.polyarray();
            }).toThrow();
            expect(function() {
                encodable.polyarray(['asdf']);
            }).toThrow();
            expect(function() {
                encodable.polyarray([5]);
            }).toThrow();
            expect(function() {
                encodable.polyarray([{element: encodable.string(9)}]);
            }).toThrow();
            expect(function() {
                encodable.polyarray([encodable.string(9)]);
            }).not.toThrow();
        });

        it('encodes any data', function() {
            var data = new Uint8Array(18);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder = encodable.polyarray([
                encodable.string(9),
                encodable.Uint32,
                encodable.Uint32,
                encodable.Uint8,
            ]);
            encoder.encode(view, b, ['Abcd', 0xEEAABBCC, 0x78563412, 0xF1]);
            expect(data).toEqual(new Uint8Array([
                65, 98, 99, 100, 0, 0, 0, 0, 0, 0xCC, 0xBB, 0xAA, 0xEE, 0x12,
                0x34, 0x56, 0x78, 0xF1
            ]));
        });

        it('encodes partial - no split bits', function() {
            var data = new Uint8Array(12);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder = encodable.polyarray([
                encodable.array(4, encodable.Uint8, 8),
                encodable.string(5),
                encodable.array(4, encodable.Uint8),
            ]);
            encoder.encodePartial(
                view, b,
                [
                  [0, 1, 2, 3],
                  'abcdef',
                  [4, 5, 6, 7],
                ],
                [3]);
            expect(data).toEqual(
                new Uint8Array([3, 0, 1, 97, 98, 99, 100, 0, 4, 5, 6, 7]));
        });

        it('encodes partial - with split bits', function() {
            var data = new Uint8Array(8);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder = encodable.polyarray(
                [
                  encodable.array(4, encodable.Uint8, 8),
                  encodable.string(5),
                  encodable.array(4, encodable.Uint8),
                ],
                8);
            encoder.encodePartial(
                view, b,
                [
                  [0, 1, 2, 3],
                  'abcdef',
                  [4, 5, 6, 7],
                ],
                [2, 3]);
            expect(data).toEqual(new Uint8Array([3, 2, 1, 97, 98, 99, 100, 0]));
        });

        it('has right amount of bytes', function() {
            var encoder = encodable.polyarray([
                encodable.string(9),
                encodable.Uint32,
                encodable.Uint32,
                encodable.Uint8,
            ]);
            expect(encoder.bytecount()).toBe(18);
        });

        it('has right amount of bytes when masked', function() {
            var encoder = encodable.polyarray(
                [
                  encodable.string(9),
                  encodable.Uint32,
                  encodable.Uint32,
                  encodable.Uint8,
                ],
                32);
            expect(encoder.bytecount()).toBe(18);
            expect(encoder.bytecount([0])).toBe(4);
            expect(encoder.bytecount([1])).toBe(13);
            expect(encoder.bytecount([13])).toBe(18);
            expect(encoder.bytecount([255])).toBe(22);
        });

        it('decodes any data', function() {
            var data = new Uint8Array([
                65, 98, 99, 100, 0, 0, 0, 0, 0, 0xCC, 0xBB, 0xAA, 0xEE, 0x12,
                0x34, 0x56, 0x78, 0xF1
            ]);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder = encodable.polyarray([
                encodable.string(9),
                encodable.Uint32,
                encodable.Uint32,
                encodable.Uint8,
            ]);
            expect(encoder.decode(view, b)).toEqual([
                'Abcd', 0xEEAABBCC, 0x78563412, 0xF1
            ]);
        });

        it('decodes partial - no split bits', function() {
            var data =
                new Uint8Array([3, 0, 1, 97, 98, 99, 100, 0, 4, 5, 6, 7]);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder = encodable.polyarray([
                encodable.array(4, encodable.Uint8, 8),
                encodable.string(5),
                encodable.array(4, encodable.Uint8),
            ]);
            data = encoder.decodePartial(view, b, [
                [90, 91, 92, 93],
                'xxx',
                [94, 95, 96, 97],
            ]);
            expect(data).toEqual([
                [0, 1, 92, 93],
                'abcd',
                [4, 5, 6, 7],
            ]);
        });

        it('decodes partial - with split bits', function() {
            var data = new Uint8Array([3, 2, 1, 97, 98, 99, 100, 0]);
            var view = new DataView(data.buffer, 0);
            var b = new encodable.Serializer();
            var encoder = encodable.polyarray(
                [
                  encodable.array(4, encodable.Uint8, 8),
                  encodable.string(5),
                  encodable.array(4, encodable.Uint8),
                ],
                8);
            data = encoder.decodePartial(view, b, [
                [90, 91, 92, 93],
                'xxx',
                [94, 95, 96, 97],
            ]);
            expect(data).toEqual([
                [90, 1, 92, 93],
                'abcd',
                [94, 95, 96, 97],
            ]);
        });
    });

    it('refuses bad split bit counts', function() {
        expect(function() {
            encodable.map([], 8);
        }).not.toThrow();
        expect(function() {
            encodable.map([], 16);
        }).not.toThrow();
        expect(function() {
            encodable.map([], 32);
        }).not.toThrow();
        expect(function() {
            encodable.map([], 0);
        }).toThrow();
        expect(function() {
            encodable.map([], 13);
        }).toThrow();
        expect(function() {
            encodable.map([], 64);
        }).toThrow();
    });
});
