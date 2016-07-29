describe('COBS service', function() {
    var cobs;

    beforeEach(angular.mock.module('flybrixCommon'));

    beforeEach(inject(function(_cobs_) {
        cobs = _cobs_;
    }));

    it('exists', function() {
        expect(cobs).toBeDefined();
    });

    describe('.encode()', function() {
        it('exists', function() {
            expect(cobs.encode).toBeDefined();
        });

        it('encodes empty input data', function() {
            expect(new Uint8Array(cobs.encode(new Uint8Array([0]))))
                .toEqual(new Uint8Array([1, 0]));
        });

        it('encodes non-zero data', function() {
            expect(new Uint8Array(cobs.encode(new Uint8Array([2, 7, 44, 0]))))
                .toEqual(new Uint8Array([4, 2, 7, 44, 0]));
        });

        it('encodes data with zeros', function() {
            expect(new Uint8Array(cobs.encode(
                       new Uint8Array([2, 4, 0, 7, 44, 33, 12, 5, 0, 16, 0]))))
                .toEqual(
                    new Uint8Array([3, 2, 4, 6, 7, 44, 33, 12, 5, 2, 16, 0]));
        });

        it('encodes long non-zero blocks', function() {
            var input = new Uint8Array(351);
            var output = new Uint8Array(353);

            for (var i = 0; i < 350; ++i) {
                var n = i % 100 + 1;
                input[i] = n;
                output[i + (i > 253 ? 2 : 1)] = n;
            }

            input[350] = 0;
            output[352] = 0;
            output[0] = 255;
            output[255] = 97;

            var result = new Uint8Array(cobs.encode(input));
            expect(result.length).toEqual(353);
            expect(result).toEqual(output);
        });

        it('encodes long packets', function() {
            var input = new Uint8Array(351);
            var output = new Uint8Array(352);

            for (var i = 0; i < 351; ++i) {
                var n = i % 2;
                input[i] = n;
                output[i] = 1 + n;
            }

            input[350] = 0;
            output[351] = 0;

            var result = new Uint8Array(cobs.encode(input));
            expect(result.length).toEqual(352);
            expect(result).toEqual(output);
        });
    });

    describe('.Reader()', function() {
        var reader;

        beforeEach(function() {
            reader = new cobs.Reader();
        });

        it('exists', function() {
            expect(cobs.Reader).toBeDefined();
        });

        it('is constructor', function() {
            expect(reader).toBeDefined();
        });

        it('accepts capacity argument', function() {
            expect(new cobs.Reader(553).buffer.length).toEqual(553);
            expect(new cobs.Reader(3172).buffer.length).toEqual(3172);
        });

        describe('.AppendToBuffer()', function() {
            it('exists', function() {
                expect(reader.AppendToBuffer).toBeDefined();
            });

            it('handles trivial packet', function(done) {
                reader.AppendToBuffer(
                    [1, 1, 1, 1, 1, 1, 1, 0], function(command, mask, data) {
                        expect(command).toEqual(0);
                        expect(mask).toEqual(0);
                        expect(new Uint8Array(data)).toEqual(new Uint8Array());
                        done();
                    }, errFail);
            });

            it('handles full packets', function(done) {
                reader.AppendToBuffer(
                    [8, 236, 3, 0x12, 0xA4, 0x03, 0x1A, 13, 2, 77, 0],
                    function(command, mask, data) {
                        expect(command).toEqual(3);
                        expect(mask).toEqual(0x1A03A412);
                        expect(new Uint8Array(data))
                            .toEqual(new Uint8Array([13, 0, 77]));
                        done();
                    },
                    errFail);
            });

            it('handles partial packets', function(done) {
                reader.AppendToBuffer([8, 236, 3, 0x12], cbFail, errFail);
                reader.AppendToBuffer(
                    [0xA4, 0x03, 0x1A, 13, 2, 77, 0],
                    function(command, mask, data) {
                        expect(command).toEqual(3);
                        expect(mask).toEqual(0x1A03A412);
                        expect(new Uint8Array(data))
                            .toEqual(new Uint8Array([13, 0, 77]));
                        done();
                    },
                    errFail);
            });

            it('handles consecutive packets', function(done) {
                var counter = 0;
                var exp_command = [3, 7];
                var exp_mask = [0x1A03A412, 0x77112244];
                var exp_data = [
                    new Uint8Array([13, 0, 77]),
                    new Uint8Array([72, 55, 0, 18, 14, 0, 23]),
                ];
                reader.AppendToBuffer(
                    [
                      8,
                      236,
                      3,
                      0x12,
                      0xA4,
                      0x03,
                      0x1A,
                      13,
                      2,
                      77,
                      0,
                      9,
                      115,
                      7,
                      0x44,
                      0x22,
                      0x11,
                      0x77,
                      72,
                      55,
                      3,
                      18,
                      14,
                      2,
                      23,
                      0,
                    ],
                    function(command, mask, data) {
                        expect(command).toEqual(exp_command[counter]);
                        expect(mask).toEqual(exp_mask[counter]);
                        expect(new Uint8Array(data)).toEqual(exp_data[counter]);
                        if (++counter === 2) {
                            done();
                        }
                    },
                    errFail);
            });

            it('handles large non-zero packets', function() {
                var data = new Uint8Array(303);
                var output = new Uint8Array(294);
                for (var i = 0; i < 303; ++i) {
                    data[i] = 5;
                }
                for (var i = 0; i < 294; ++i) {
                    output[i] = 5;
                }
                data[0] = 255;
                data[255] = 47;
                data[302] = 0;
                reader.AppendToBuffer(data, function(command, mask, data) {
                    expect(command).toEqual(5);
                    expect(mask).toEqual(0x05050505);
                    expect(new Uint8Array(data)).toEqual(output);
                }, errFail);
            });


            it('refuses bad framing', function(done) {
                reader.AppendToBuffer([12, 3, 2, 14, 8, 1, 9, 0], cbFail,
                                      function(reason) {
                                          expect(reason).toEqual('frame');
                                          done();
                                      });
            });

            it('refuses bad checksum', function(done) {
                reader.AppendToBuffer([7, 1, 2, 2, 2, 2, 2, 0], cbFail,
                                      function(reason) {
                                          expect(reason).toEqual('checksum');
                                          done();
                                      });
            });

            it('refuses short packets', function(done) {
                reader.AppendToBuffer([1, 1, 1, 1, 1, 1, 0], cbFail,
                                      function(reason) {
                                          expect(reason).toEqual('short');
                                          done();
                                      });
            });

            it('fails on buffer overflow', function(done) {
                var counter = 0;
                var data = new Uint8Array(2501);
                for (var i = 0; i < 2500; ++i) {
                    data[i] = i % 250 ? 250 : 67;
                }
                data[2500] = 0;
                var short_reader = new cobs.Reader(700);
                short_reader.AppendToBuffer(data, cbFail, function(reason) {
                    if (counter >= 0 && counter < 3) {
                        expect(reason).toEqual('overflow');
                    } else if (counter === 3) {
                        expect(reason).toEqual('frame');
                        done();
                    }
                    ++counter;
                });
            });


            it('recovers from errors', function(done) {
                reader.AppendToBuffer([12, 3, 2, 14, 8, 1, 9, 0], cbFail,
                                      function(reason) {
                                          expect(reason).toEqual('frame');
                                          done();
                                      });
                reader.AppendToBuffer([7, 1, 2, 2, 2, 2, 2, 0], cbFail,
                                      function(reason) {
                                          expect(reason).toEqual('checksum');
                                          done();
                                      });
                reader.AppendToBuffer(
                    [1, 1, 1, 1, 1, 1, 1, 0], function(command, mask, data) {
                        expect(command).toEqual(0);
                        expect(mask).toEqual(0);
                        expect(new Uint8Array(data))
                            .toEqual(new Uint8Array([]));
                        done();
                    }, errFail);
            });

            function cbFail() {
                fail('Unexpected invocation of callback');
            }

            function errFail(reason) {
                fail('Unexpected invocation of error due to reason: ' + reason);
            }
        });
    });
});
