describe('Serializer factory', function() {
    var serializer;
    var ser_instance;

    beforeEach(angular.mock.module('flybrixCommon'));

    beforeEach(inject(function(_serializer_) {
        serializer = _serializer_;
        ser_instance = new serializer();
    }));

    it('exists', function() {
        expect(serializer).toBeDefined();
    });

    it('is constructor', function() {
        expect(ser_instance).toBeDefined();
    });

    describe('.index', function() {
        it('exists', function() {
            expect(ser_instance.index).toBeDefined();
        });

        it('starts at zero', function() {
            expect(ser_instance.index).toEqual(0);
        });

    });

    describe('.add()', function() {
        it('exists', function() {
            expect(ser_instance.add).toBeDefined();
        });

        it('increments index', function() {
            expect(ser_instance.index).toEqual(0);
            ser_instance.add(7);
            expect(ser_instance.index).toEqual(7);
        });

        it('accumulates index increments', function() {
            expect(ser_instance.index).toEqual(0);
            ser_instance.add(7);
            expect(ser_instance.index).toEqual(7);
            ser_instance.add(2);
            expect(ser_instance.index).toEqual(9);
            ser_instance.add(12);
            expect(ser_instance.index).toEqual(21);
            ser_instance.add(4);
            expect(ser_instance.index).toEqual(25);
        });
    });

    describe('.parseFloat32Array()', function() {
        var input = new DataView(new Uint8Array([
                                     0,
                                     0,
                                     0x80,
                                     0x40,
                                     0x14,
                                     0x12,
                                     0x27,
                                     0x33,
                                     0,
                                     0x90,
                                     0x9E,
                                     0x43,
                                     0,
                                     0x80,
                                     9,
                                     0x45,
                                     0,
                                     0xEC,
                                     0xF1,
                                     0x45,
                                     0,
                                     0,
                                     0x5C,
                                     0x41,
                                 ]).buffer);
        var destination1 = [0, 0, 0, 0];
        var destination2 = [0, 0];

        it('exists', function() {
            expect(ser_instance.parseFloat32Array).toBeDefined();
        });

        it('increments index by expected data size', function() {
            expect(ser_instance.index).toEqual(0);

            ser_instance.parseFloat32Array(input, destination1);
            expect(ser_instance.index).toEqual(16);

            ser_instance.parseFloat32Array(input, destination2);
            expect(ser_instance.index).toEqual(24);
        });

        it('reads data properly', function() {
            ser_instance.parseFloat32Array(input, destination1);
            expect(destination1)
                .toEqual(
                    [4, 3.88991594491017167456448078156E-8, 317.125, 2200]);

            ser_instance.parseFloat32Array(input, destination2);
            expect(destination2).toEqual([7741.5, 13.75]);
        });
    });

    describe('.parseInt16Array()', function() {
        var input = new DataView(
            new Uint8Array([2, 77, 13, 18, 4, 2, 61, 3, 2, 1, 1, 200]).buffer);
        var destination1 = [0, 0, 0, 0];
        var destination2 = [0, 0];

        it('exists', function() {
            expect(ser_instance.parseInt16Array).toBeDefined();
        });

        it('increments index by expected data size', function() {
            expect(ser_instance.index).toEqual(0);

            ser_instance.parseInt16Array(input, destination1);
            expect(ser_instance.index).toEqual(8);

            ser_instance.parseInt16Array(input, destination2);
            expect(ser_instance.index).toEqual(12);
        });

        it('reads data properly', function() {
            ser_instance.parseInt16Array(input, destination1);
            expect(destination1).toEqual([19714, 4621, 516, 829]);

            ser_instance.parseInt16Array(input, destination2);
            expect(destination2).toEqual([258, -14335]);
        });
    });

    describe('.parseInt8Array()', function() {
        var input =
            new DataView(new Uint8Array([5, 80, 120, 230, 7, 200]).buffer);
        var destination1 = [0, 0, 0, 0];
        var destination2 = [0, 0];

        it('exists', function() {
            expect(ser_instance.parseInt8Array).toBeDefined();
        });

        it('increments index by expected data size', function() {
            expect(ser_instance.index).toEqual(0);

            ser_instance.parseInt8Array(input, destination1);
            expect(ser_instance.index).toEqual(4);

            ser_instance.parseInt8Array(input, destination2);
            expect(ser_instance.index).toEqual(6);
        });

        it('reads data properly', function() {
            ser_instance.parseInt8Array(input, destination1);
            expect(destination1).toEqual([5, 80, 120, -26]);

            ser_instance.parseInt8Array(input, destination2);
            expect(destination2).toEqual([7, -56]);
        });
    });

    describe('.parseUint16Array()', function() {
        var input = new DataView(
            new Uint8Array([2, 77, 13, 18, 4, 2, 61, 3, 2, 1, 1, 200]).buffer);
        var destination1 = [0, 0, 0, 0];
        var destination2 = [0, 0];

        it('exists', function() {
            expect(ser_instance.parseUint16Array).toBeDefined();
        });

        it('increments index by expected data size', function() {
            expect(ser_instance.index).toEqual(0);

            ser_instance.parseUint16Array(input, destination1);
            expect(ser_instance.index).toEqual(8);

            ser_instance.parseUint16Array(input, destination2);
            expect(ser_instance.index).toEqual(12);
        });

        it('reads data properly', function() {
            ser_instance.parseUint16Array(input, destination1);
            expect(destination1).toEqual([19714, 4621, 516, 829]);

            ser_instance.parseUint16Array(input, destination2);
            expect(destination2).toEqual([258, 51201]);
        });
    });

    describe('.parseUint8Array()', function() {
        var input =
            new DataView(new Uint8Array([5, 80, 120, 230, 7, 200]).buffer);
        var destination1 = [0, 0, 0, 0];
        var destination2 = [0, 0];

        it('exists', function() {
            expect(ser_instance.parseUint8Array).toBeDefined();
        });

        it('increments index by expected data size', function() {
            expect(ser_instance.index).toEqual(0);

            ser_instance.parseUint8Array(input, destination1);
            expect(ser_instance.index).toEqual(4);

            ser_instance.parseUint8Array(input, destination2);
            expect(ser_instance.index).toEqual(6);
        });

        it('reads data properly', function() {
            ser_instance.parseUint8Array(input, destination1);
            expect(destination1).toEqual([5, 80, 120, 230]);

            ser_instance.parseUint8Array(input, destination2);
            expect(destination2).toEqual([7, 200]);
        });
    });

    describe('.setFloat32Array()', function() {
        var buffer;
        var output;
        var destination;
        var input1 = [4, 3.88991594491017167456448078156E-8, 317.125, 2200];
        var input2 = [7741.5, 13.75];

        beforeEach(function() {
            buffer = new ArrayBuffer(24);
            output = new DataView(buffer);
            destination = new Uint8Array(buffer);
        });

        it('exists', function() {
            expect(ser_instance.setFloat32Array).toBeDefined();
        });

        it('increments index by expected data size', function() {
            expect(ser_instance.index).toEqual(0);

            ser_instance.setFloat32Array(output, input1);
            expect(ser_instance.index).toEqual(16);

            ser_instance.setFloat32Array(output, input2);
            expect(ser_instance.index).toEqual(24);
        });

        it('reads data properly', function() {
            expect(destination)
                .toEqual(new Uint8Array([
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                ]));

            ser_instance.setFloat32Array(output, input1);
            expect(destination)
                .toEqual(new Uint8Array([
                    0,
                    0,
                    0x80,
                    0x40,
                    0x14,
                    0x12,
                    0x27,
                    0x33,
                    0,
                    0x90,
                    0x9E,
                    0x43,
                    0,
                    0x80,
                    9,
                    0x45,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                ]));

            ser_instance.setFloat32Array(output, input2);
            expect(destination)
                .toEqual(new Uint8Array([
                    0,
                    0,
                    0x80,
                    0x40,
                    0x14,
                    0x12,
                    0x27,
                    0x33,
                    0,
                    0x90,
                    0x9E,
                    0x43,
                    0,
                    0x80,
                    9,
                    0x45,
                    0,
                    0xEC,
                    0xF1,
                    0x45,
                    0,
                    0,
                    0x5C,
                    0x41,
                ]));
        });
    });

    describe('.setInt16Array()', function() {
        var buffer;
        var output;
        var destination;
        var input1 = [19714, 4621, 516, 829];
        var input2 = [258, -14335];

        beforeEach(function() {
            buffer = new ArrayBuffer(12);
            output = new DataView(buffer);
            destination = new Uint8Array(buffer);
        });

        it('exists', function() {
            expect(ser_instance.setUint16Array).toBeDefined();
        });

        it('increments index by expected data size', function() {
            expect(ser_instance.index).toEqual(0);

            ser_instance.setUint16Array(output, input1);
            expect(ser_instance.index).toEqual(8);

            ser_instance.setUint16Array(output, input2);
            expect(ser_instance.index).toEqual(12);
        });

        it('reads data properly', function() {
            expect(destination)
                .toEqual(new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]));

            ser_instance.setUint16Array(output, input1);
            expect(destination)
                .toEqual(
                    new Uint8Array([2, 77, 13, 18, 4, 2, 61, 3, 0, 0, 0, 0]));

            ser_instance.setUint16Array(output, input2);
            expect(destination)
                .toEqual(
                    new Uint8Array([2, 77, 13, 18, 4, 2, 61, 3, 2, 1, 1, 200]));
        });
    });

    describe('.setInt8Array()', function() {
        var buffer;
        var output;
        var destination;
        var input1 = [5, 80, 120, -26];
        var input2 = [7, -56];

        beforeEach(function() {
            buffer = new ArrayBuffer(6);
            output = new DataView(buffer);
            destination = new Uint8Array(buffer);
        });

        it('exists', function() {
            expect(ser_instance.setInt8Array).toBeDefined();
        });

        it('increments index by expected data size', function() {
            expect(ser_instance.index).toEqual(0);

            ser_instance.setInt8Array(output, input1);
            expect(ser_instance.index).toEqual(4);

            ser_instance.setInt8Array(output, input2);
            expect(ser_instance.index).toEqual(6);
        });

        it('reads data properly', function() {
            expect(destination).toEqual(new Uint8Array([0, 0, 0, 0, 0, 0]));

            ser_instance.setInt8Array(output, input1);
            expect(destination)
                .toEqual(new Uint8Array([5, 80, 120, 230, 0, 0]));

            ser_instance.setInt8Array(output, input2);
            expect(destination)
                .toEqual(new Uint8Array([5, 80, 120, 230, 7, 200]));
        });
    });

    describe('.setUint16Array()', function() {
        var buffer;
        var output;
        var destination;
        var input1 = [19714, 4621, 516, 829];
        var input2 = [258, 51201];

        beforeEach(function() {
            buffer = new ArrayBuffer(12);
            output = new DataView(buffer);
            destination = new Uint8Array(buffer);
        });

        it('exists', function() {
            expect(ser_instance.setUint16Array).toBeDefined();
        });

        it('increments index by expected data size', function() {
            expect(ser_instance.index).toEqual(0);

            ser_instance.setUint16Array(output, input1);
            expect(ser_instance.index).toEqual(8);

            ser_instance.setUint16Array(output, input2);
            expect(ser_instance.index).toEqual(12);
        });

        it('reads data properly', function() {
            expect(destination)
                .toEqual(new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]));

            ser_instance.setUint16Array(output, input1);
            expect(destination)
                .toEqual(
                    new Uint8Array([2, 77, 13, 18, 4, 2, 61, 3, 0, 0, 0, 0]));

            ser_instance.setUint16Array(output, input2);
            expect(destination)
                .toEqual(
                    new Uint8Array([2, 77, 13, 18, 4, 2, 61, 3, 2, 1, 1, 200]));
        });
    });

    describe('.setUint8Array()', function() {
        var buffer;
        var output;
        var destination;
        var input1 = [5, 80, 120, 230];
        var input2 = [7, 200];

        beforeEach(function() {
            buffer = new ArrayBuffer(6);
            output = new DataView(buffer);
            destination = new Uint8Array(buffer);
        });

        it('exists', function() {
            expect(ser_instance.setUint8Array).toBeDefined();
        });

        it('increments index by expected data size', function() {
            expect(ser_instance.index).toEqual(0);

            ser_instance.setUint8Array(output, input1);
            expect(ser_instance.index).toEqual(4);

            ser_instance.setUint8Array(output, input2);
            expect(ser_instance.index).toEqual(6);
        });

        it('reads data properly', function() {
            expect(destination).toEqual(new Uint8Array([0, 0, 0, 0, 0, 0]));

            ser_instance.setUint8Array(output, input1);
            expect(destination)
                .toEqual(new Uint8Array([5, 80, 120, 230, 0, 0]));

            ser_instance.setUint8Array(output, input2);
            expect(destination)
                .toEqual(new Uint8Array([5, 80, 120, 230, 7, 200]));
        });
    });
});
