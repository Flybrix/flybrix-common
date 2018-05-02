describe('Parser service', function() {

    var parser;
    var commandLog;
    var $rootScope;

    beforeEach(angular.mock.module('flybrixCommon'));

    beforeEach(inject(function(_parser_, _commandLog_, _$rootScope_) {
        parser = _parser_;
        commandLog = _commandLog_;
        $rootScope = _$rootScope_;
    }));

    it('exists', function() {
        expect(parser).toBeDefined();
    });

    it('implements processBinaryDatastream', function() {
        expect(parser.processBinaryDatastream).toBeDefined();
    });

    it('ignores bad messages', function() {
        expect(parser.MessageType.Response).toEqual(255);
        commandLog.onMessage(cbFail);
        parser.processBinaryDatastream(254, 0, new Uint8Array([]).buffer,
                                       cbFail, cbFail, cbFail, cbFail, cbFail);
    });

    it('parses ACK messages', function(done) {
        expect(parser.MessageType.Response).toEqual(255);
        commandLog.onMessage(cbFail);
        parser.processBinaryDatastream(
            255, 47, new Uint8Array([3, 2, 7, 4]).buffer, cbFail, cbFail,
            cbFail, cbFail, function(mask, response) {
                expect(mask).toEqual(47);
                expect(response).toEqual(0x04070203);
                done();
            });
    });

    it('parses debug messages', function(done) {
        expect(parser.MessageType.DebugString).toEqual(3);
        parser.processBinaryDatastream(
            3, 0, new Uint8Array([97, 98, 99, 100, 97, 98, 99]).buffer, cbFail,
            cbFail, function() { done(); }, cbFail, cbFail);
        $rootScope.$digest();
    });

    it('parses historic messages', function(done) {
        expect(parser.MessageType.HistoryData).toEqual(4);
        parser.processBinaryDatastream(
            4, 0, new Uint8Array([97, 98, 99, 100, 97, 98, 99]).buffer, cbFail,
            cbFail, cbFail, function() { done(); }, cbFail);
        $rootScope.$digest();
    });

    it('parses commands', function(done) {
        expect(parser.MessageType.Command).toEqual(1);
        commandLog.onMessage(cbFail);
        parser.processBinaryDatastream(
            1, 47, new Uint8Array([3, 2, 7, 4, 11, 127]).buffer,
            cbFail, function(mask, response) {
                expect(mask).toEqual(47);
                expect(new Uint8Array(response))
                    .toEqual(new Uint8Array([3, 2, 7, 4, 11, 127]));
                done();
            }, cbFail, cbFail, cbFail);
    });

    describe('state parsing', function() {
        it('parses timestamp', function(done) {
            expect(parser.MessageType.State).toEqual(0);
            commandLog.onMessage(cbFail);
            parser.processBinaryDatastream(
                0, 1 << 0,
                new Uint8Array([3, 2, 7, 4]).buffer, function(state, mask) {
                    mask.forEach(function(val, idx) {
                        expect(val).toEqual(idx === 0);
                    });
                    expect(state.timestamp_us).toEqual(0x04070203);
                    done();
                }, cbFail, cbFail, cbFail, cbFail);
        });

        it('parses status', function(done) {
            expect(parser.MessageType.State).toEqual(0);
            commandLog.onMessage(cbFail);
            parser.processBinaryDatastream(
                0, 1 << 1,
                new Uint8Array([3, 2]).buffer, function(state, mask) {
                    mask.forEach(function(val, idx) {
                        expect(val).toEqual(idx === 1);
                    });
                    expect(state.status).toEqual(0x0203);
                    done();
                }, cbFail, cbFail, cbFail, cbFail);
        });

        it('parses v0', function(done) {
            expect(parser.MessageType.State).toEqual(0);
            commandLog.onMessage(cbFail);
            parser.processBinaryDatastream(
                0, 1 << 2,
                new Uint8Array([3, 2]).buffer, function(state, mask) {
                    mask.forEach(function(val, idx) {
                        expect(val).toEqual(idx === 2);
                    });
                    expect(state.V0_raw).toEqual(0x0203);
                    done();
                }, cbFail, cbFail, cbFail, cbFail);
        });

        it('parses i0', function(done) {
            expect(parser.MessageType.State).toEqual(0);
            commandLog.onMessage(cbFail);
            parser.processBinaryDatastream(
                0, 1 << 3,
                new Uint8Array([3, 2]).buffer, function(state, mask) {
                    mask.forEach(function(val, idx) {
                        expect(val).toEqual(idx === 3);
                    });
                    expect(state.I0_raw).toEqual(0x0203);
                    done();
                }, cbFail, cbFail, cbFail, cbFail);
        });

        it('parses i1', function(done) {
            expect(parser.MessageType.State).toEqual(0);
            commandLog.onMessage(cbFail);
            parser.processBinaryDatastream(
                0, 1 << 4,
                new Uint8Array([3, 2]).buffer, function(state, mask) {
                    mask.forEach(function(val, idx) {
                        expect(val).toEqual(idx === 4);
                    });
                    expect(state.I1_raw).toEqual(0x0203);
                    done();
                }, cbFail, cbFail, cbFail, cbFail);
        });

        it('parses accel', function(done) {
            expect(parser.MessageType.State).toEqual(0);
            commandLog.onMessage(cbFail);
            parser.processBinaryDatastream(
                0, 1 << 5,
                new Uint8Array(
                    [0, 0, 0x98, 0x40, 0, 0, 0x40, 0x41, 0, 0x10, 0xA5, 0x43])
                    .buffer,
                function(state, mask) {
                    mask.forEach(function(val, idx) {
                        expect(val).toEqual(idx === 5);
                    });
                    expect(state.accel).toEqual([4.75, 12, 330.125]);
                    done();
                },
                cbFail, cbFail, cbFail, cbFail);
        });

        it('parses gyro', function(done) {
            expect(parser.MessageType.State).toEqual(0);
            commandLog.onMessage(cbFail);
            parser.processBinaryDatastream(
                0, 1 << 6,
                new Uint8Array(
                    [0, 0, 0x98, 0x40, 0, 0, 0x40, 0x41, 0, 0x10, 0xA5, 0x43])
                    .buffer,
                function(state, mask) {
                    mask.forEach(function(val, idx) {
                        expect(val).toEqual(idx === 6);
                    });
                    expect(state.gyro).toEqual([4.75, 12, 330.125]);
                    done();
                },
                cbFail, cbFail, cbFail, cbFail);
        });

        it('parses mag', function(done) {
            expect(parser.MessageType.State).toEqual(0);
            commandLog.onMessage(cbFail);
            parser.processBinaryDatastream(
                0, 1 << 7,
                new Uint8Array(
                    [0, 0, 0x98, 0x40, 0, 0, 0x40, 0x41, 0, 0x10, 0xA5, 0x43])
                    .buffer,
                function(state, mask) {
                    mask.forEach(function(val, idx) {
                        expect(val).toEqual(idx === 7);
                    });
                    expect(state.mag).toEqual([4.75, 12, 330.125]);
                    done();
                },
                cbFail, cbFail, cbFail, cbFail);
        });

        it('parses temperature', function(done) {
            expect(parser.MessageType.State).toEqual(0);
            commandLog.onMessage(cbFail);
            parser.processBinaryDatastream(
                0, 1 << 8,
                new Uint8Array([3, 2]).buffer, function(state, mask) {
                    mask.forEach(function(val, idx) {
                        expect(val).toEqual(idx === 8);
                    });
                    expect(state.temperature).toEqual(5.15);
                    done();
                }, cbFail, cbFail, cbFail, cbFail);
        });

        it('parses pressure', function(done) {
            expect(parser.MessageType.State).toEqual(0);
            commandLog.onMessage(cbFail);
            parser.processBinaryDatastream(
                0, 1 << 9,
                new Uint8Array([3, 2, 7, 4]).buffer, function(state, mask) {
                    mask.forEach(function(val, idx) {
                        expect(val).toEqual(idx === 9);
                    });
                    expect(state.pressure).toEqual(263938.01171875);
                    done();
                }, cbFail, cbFail, cbFail, cbFail);
        });

        it('parses RX PPM', function(done) {
            expect(parser.MessageType.State).toEqual(0);
            commandLog.onMessage(cbFail);
            parser.processBinaryDatastream(
                0, 1 << 10,
                new Uint8Array([3, 2, 7, 4, 1, 2, 3, 4, 5, 6, 7, 8]).buffer,
                function(state, mask) {
                    mask.forEach(function(val, idx) {
                        expect(val).toEqual(idx === 10);
                    });
                    expect(state.ppm)
                        .toEqual([0x203, 0x407, 0x201, 0x403, 0x605, 0x807]);
                    done();
                },
                cbFail, cbFail, cbFail, cbFail);
        });

        it('parses AUX chan mask', function(done) {
            expect(parser.MessageType.State).toEqual(0);
            commandLog.onMessage(cbFail);
            parser.processBinaryDatastream(
                0, 1 << 11, new Uint8Array([7]).buffer, function(state, mask) {
                    mask.forEach(function(val, idx) {
                        expect(val).toEqual(idx === 11);
                    });
                    expect(state.AUX_chan_mask).toEqual(7);
                    done();
                }, cbFail, cbFail, cbFail, cbFail);
        });

        it('parses commands', function(done) {
            expect(parser.MessageType.State).toEqual(0);
            commandLog.onMessage(cbFail);
            parser.processBinaryDatastream(
                0, 1 << 12,
                new Uint8Array([3, 2, 7, 4, 255, 255, 7, 12]).buffer,
                function(state, mask) {
                    mask.forEach(function(val, idx) {
                        expect(val).toEqual(idx === 12);
                    });
                    expect(state.command).toEqual([0x203, 0x407, -1, 0xC07]);
                    done();
                },
                cbFail, cbFail, cbFail, cbFail);
        });

        it('parses control', function(done) {
            expect(parser.MessageType.State).toEqual(0);
            commandLog.onMessage(cbFail);
            parser.processBinaryDatastream(
                0, 1 << 13, new Uint8Array([
                                0,
                                0,
                                0x98,
                                0x40,
                                0,
                                0,
                                0x40,
                                0x41,
                                0,
                                0x10,
                                0xA5,
                                0x43,
                                0,
                                0,
                                0,
                                0,
                            ]).buffer,
                function(state, mask) {
                    mask.forEach(function(val, idx) {
                        expect(val).toEqual(idx === 13);
                    });
                    expect(state.control).toEqual([4.75, 12, 330.125, 0]);
                    done();
                },
                cbFail, cbFail, cbFail, cbFail);
        });

        var pid_data = [0x40981215, 12, 330.125, -4.75, -12, -330.125];
        var pid_bytes = new Uint8Array([
                            0x15,
                            0x12,
                            0x98,
                            0x40,
                            0,
                            0,
                            0x40,
                            0x41,
                            0,
                            0x10,
                            0xA5,
                            0x43,
                            0,
                            0,
                            0x98,
                            0xC0,
                            0,
                            0,
                            0x40,
                            0xC1,
                            0,
                            0x10,
                            0xA5,
                            0xC3,
                        ]).buffer;

        it('parses pid_master_Fz', function(done) {
            expect(parser.MessageType.State).toEqual(0);
            commandLog.onMessage(cbFail);
            parser.processBinaryDatastream(
                0, 1 << 14, pid_bytes, function(state, mask) {
                    mask.forEach(function(val, idx) {
                        expect(val).toEqual(idx === 14);
                    });
                    expect(state.pid_master_Fz).toEqual(pid_data);
                    done();
                }, cbFail, cbFail, cbFail, cbFail);
        });

        it('parses pid_master_Tx', function(done) {
            expect(parser.MessageType.State).toEqual(0);
            commandLog.onMessage(cbFail);
            parser.processBinaryDatastream(
                0, 1 << 15, pid_bytes, function(state, mask) {
                    mask.forEach(function(val, idx) {
                        expect(val).toEqual(idx === 15);
                    });
                    expect(state.pid_master_Tx).toEqual(pid_data);
                    done();
                }, cbFail, cbFail, cbFail, cbFail);
        });

        it('parses pid_master_Ty', function(done) {
            expect(parser.MessageType.State).toEqual(0);
            commandLog.onMessage(cbFail);
            parser.processBinaryDatastream(
                0, 1 << 16, pid_bytes, function(state, mask) {
                    mask.forEach(function(val, idx) {
                        expect(val).toEqual(idx === 16);
                    });
                    expect(state.pid_master_Ty).toEqual(pid_data);
                    done();
                }, cbFail, cbFail, cbFail, cbFail);
        });

        it('parses pid_master_Tz', function(done) {
            expect(parser.MessageType.State).toEqual(0);
            commandLog.onMessage(cbFail);
            parser.processBinaryDatastream(
                0, 1 << 17, pid_bytes, function(state, mask) {
                    mask.forEach(function(val, idx) {
                        expect(val).toEqual(idx === 17);
                    });
                    expect(state.pid_master_Tz).toEqual(pid_data);
                    done();
                }, cbFail, cbFail, cbFail, cbFail);
        });

        it('parses pid_slave_Fz', function(done) {
            expect(parser.MessageType.State).toEqual(0);
            commandLog.onMessage(cbFail);
            parser.processBinaryDatastream(
                0, 1 << 18, pid_bytes, function(state, mask) {
                    mask.forEach(function(val, idx) {
                        expect(val).toEqual(idx === 18);
                    });
                    expect(state.pid_slave_Fz).toEqual(pid_data);
                    done();
                }, cbFail, cbFail, cbFail, cbFail);
        });

        it('parses pid_slave_Tx', function(done) {
            expect(parser.MessageType.State).toEqual(0);
            commandLog.onMessage(cbFail);
            parser.processBinaryDatastream(
                0, 1 << 19, pid_bytes, function(state, mask) {
                    mask.forEach(function(val, idx) {
                        expect(val).toEqual(idx === 19);
                    });
                    expect(state.pid_slave_Tx).toEqual(pid_data);
                    done();
                }, cbFail, cbFail, cbFail, cbFail);
        });

        it('parses pid_slave_Ty', function(done) {
            expect(parser.MessageType.State).toEqual(0);
            commandLog.onMessage(cbFail);
            parser.processBinaryDatastream(
                0, 1 << 20, pid_bytes, function(state, mask) {
                    mask.forEach(function(val, idx) {
                        expect(val).toEqual(idx === 20);
                    });
                    expect(state.pid_slave_Ty).toEqual(pid_data);
                    done();
                }, cbFail, cbFail, cbFail, cbFail);
        });

        it('parses pid_slave_Tz', function(done) {
            expect(parser.MessageType.State).toEqual(0);
            commandLog.onMessage(cbFail);
            parser.processBinaryDatastream(
                0, 1 << 21, pid_bytes, function(state, mask) {
                    mask.forEach(function(val, idx) {
                        expect(val).toEqual(idx === 21);
                    });
                    expect(state.pid_slave_Tz).toEqual(pid_data);
                    done();
                }, cbFail, cbFail, cbFail, cbFail);
        });

        it('parses motor out', function(done) {
            expect(parser.MessageType.State).toEqual(0);
            commandLog.onMessage(cbFail);
            parser.processBinaryDatastream(
                0, 1 << 22,
                new Uint8Array(
                    [1, 5, 2, 250, 3, 5, 4, 250, 5, 5, 6, 250, 7, 5, 8, 250])
                    .buffer,
                function(state, mask) {
                    mask.forEach(function(val, idx) {
                        expect(val).toEqual(idx === 22);
                    });
                    expect(state.MotorOut)
                        .toEqual([
                            1281,
                            -1534,
                            1283,
                            -1532,
                            1285,
                            -1530,
                            1287,
                            -1528,
                        ]);
                    done();
                },
                cbFail, cbFail, cbFail, cbFail);
        });

        it('parses kine angle', function(done) {
            expect(parser.MessageType.State).toEqual(0);
            commandLog.onMessage(cbFail);
            parser.processBinaryDatastream(
                0, 1 << 23,
                new Uint8Array(
                    [0, 0, 0x98, 0x40, 0, 0, 0x40, 0x41, 0, 0x10, 0xA5, 0x43])
                    .buffer,
                function(state, mask) {
                    mask.forEach(function(val, idx) {
                        expect(val).toEqual(idx === 23);
                    });
                    expect(state.kinematicsAngle).toEqual([4.75, 12, 330.125]);
                    done();
                },
                cbFail, cbFail, cbFail, cbFail);
        });

        it('parses kine rate', function(done) {
            expect(parser.MessageType.State).toEqual(0);
            commandLog.onMessage(cbFail);
            parser.processBinaryDatastream(
                0, 1 << 24,
                new Uint8Array(
                    [0, 0, 0x98, 0x40, 0, 0, 0x40, 0x41, 0, 0x10, 0xA5, 0x43])
                    .buffer,
                function(state, mask) {
                    mask.forEach(function(val, idx) {
                        expect(val).toEqual(idx === 24);
                    });
                    expect(state.kinematicsRate).toEqual([4.75, 12, 330.125]);
                    done();
                },
                cbFail, cbFail, cbFail, cbFail);
        });

        it('parses kine altitude', function(done) {
            expect(parser.MessageType.State).toEqual(0);
            commandLog.onMessage(cbFail);
            parser.processBinaryDatastream(
                0, 1 << 25, new Uint8Array([0, 0x10, 0xA5, 0x43]).buffer,
                function(state, mask) {
                    mask.forEach(function(val, idx) {
                        expect(val).toEqual(idx === 25);
                    });
                    expect(state.kinematicsAltitude).toEqual(330.125);
                    done();
                },
                cbFail, cbFail, cbFail, cbFail);
        });

        it('parses loop count', function(done) {
            expect(parser.MessageType.State).toEqual(0);
            commandLog.onMessage(cbFail);
            parser.processBinaryDatastream(
                0, 1 << 26,
                new Uint8Array([3, 2, 7, 4]).buffer, function(state, mask) {
                    mask.forEach(function(val, idx) {
                        expect(val).toEqual(idx === 26);
                    });
                    expect(state.loopCount).toEqual(0x04070203);
                    done();
                }, cbFail, cbFail, cbFail, cbFail);
        });

        it('parses partial message', function(done) {
            expect(parser.MessageType.State).toEqual(0);
            commandLog.onMessage(cbFail);
            parser.processBinaryDatastream(
                0, 67108895,
                new Uint8Array([3, 2, 7, 4, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 7, 4])
                    .buffer,
                function(state, mask) {
                    mask.forEach(function(val, idx) {
                        expect(val).toEqual(idx < 5 || idx === 26);
                    });
                    expect(state.timestamp_us).toEqual(0x04070203);
                    expect(state.status).toEqual(0x0203);
                    expect(state.V0_raw).toEqual(0x0203);
                    expect(state.I0_raw).toEqual(0x0203);
                    expect(state.I1_raw).toEqual(0x0203);
                    expect(state.loopCount).toEqual(0x04070203);
                    done();
                },
                cbFail, cbFail, cbFail, cbFail);
        });


        var full_data = new Uint8Array([
                            3,
                            2,
                            7,
                            4,
                            3,
                            2,
                            3,
                            2,
                            3,
                            2,
                            3,
                            2,
                            0,
                            0,
                            0x98,
                            0x40,
                            0,
                            0,
                            0x40,
                            0x41,
                            0,
                            0x10,
                            0xA5,
                            0x43,
                            0,
                            0,
                            0x98,
                            0x40,
                            0,
                            0,
                            0x40,
                            0x41,
                            0,
                            0x10,
                            0xA5,
                            0x43,
                            0,
                            0,
                            0x98,
                            0x40,
                            0,
                            0,
                            0x40,
                            0x41,
                            0,
                            0x10,
                            0xA5,
                            0x43,
                            3,
                            2,
                            3,
                            2,
                            7,
                            4,
                            3,
                            2,
                            7,
                            4,
                            1,
                            2,
                            3,
                            4,
                            5,
                            6,
                            7,
                            8,
                            7,
                            3,
                            2,
                            7,
                            4,
                            255,
                            255,
                            7,
                            12,
                            0,
                            0,
                            0x98,
                            0x40,
                            0,
                            0,
                            0x40,
                            0x41,
                            0,
                            0x10,
                            0xA5,
                            0x43,
                            0,
                            0,
                            0,
                            0,
                            0x15,
                            0x12,
                            0x98,
                            0x40,
                            0,
                            0,
                            0x40,
                            0x41,
                            0,
                            0x10,
                            0xA5,
                            0x43,
                            0,
                            0,
                            0x98,
                            0xC0,
                            0,
                            0,
                            0x40,
                            0xC1,
                            0,
                            0x10,
                            0xA5,
                            0xC3,
                            0x15,
                            0x12,
                            0x98,
                            0x40,
                            0,
                            0,
                            0x40,
                            0x41,
                            0,
                            0x10,
                            0xA5,
                            0x43,
                            0,
                            0,
                            0x98,
                            0xC0,
                            0,
                            0,
                            0x40,
                            0xC1,
                            0,
                            0x10,
                            0xA5,
                            0xC3,
                            0x15,
                            0x12,
                            0x98,
                            0x40,
                            0,
                            0,
                            0x40,
                            0x41,
                            0,
                            0x10,
                            0xA5,
                            0x43,
                            0,
                            0,
                            0x98,
                            0xC0,
                            0,
                            0,
                            0x40,
                            0xC1,
                            0,
                            0x10,
                            0xA5,
                            0xC3,
                            0x15,
                            0x12,
                            0x98,
                            0x40,
                            0,
                            0,
                            0x40,
                            0x41,
                            0,
                            0x10,
                            0xA5,
                            0x43,
                            0,
                            0,
                            0x98,
                            0xC0,
                            0,
                            0,
                            0x40,
                            0xC1,
                            0,
                            0x10,
                            0xA5,
                            0xC3,
                            0x15,
                            0x12,
                            0x98,
                            0x40,
                            0,
                            0,
                            0x40,
                            0x41,
                            0,
                            0x10,
                            0xA5,
                            0x43,
                            0,
                            0,
                            0x98,
                            0xC0,
                            0,
                            0,
                            0x40,
                            0xC1,
                            0,
                            0x10,
                            0xA5,
                            0xC3,
                            0x15,
                            0x12,
                            0x98,
                            0x40,
                            0,
                            0,
                            0x40,
                            0x41,
                            0,
                            0x10,
                            0xA5,
                            0x43,
                            0,
                            0,
                            0x98,
                            0xC0,
                            0,
                            0,
                            0x40,
                            0xC1,
                            0,
                            0x10,
                            0xA5,
                            0xC3,
                            0x15,
                            0x12,
                            0x98,
                            0x40,
                            0,
                            0,
                            0x40,
                            0x41,
                            0,
                            0x10,
                            0xA5,
                            0x43,
                            0,
                            0,
                            0x98,
                            0xC0,
                            0,
                            0,
                            0x40,
                            0xC1,
                            0,
                            0x10,
                            0xA5,
                            0xC3,
                            0x15,
                            0x12,
                            0x98,
                            0x40,
                            0,
                            0,
                            0x40,
                            0x41,
                            0,
                            0x10,
                            0xA5,
                            0x43,
                            0,
                            0,
                            0x98,
                            0xC0,
                            0,
                            0,
                            0x40,
                            0xC1,
                            0,
                            0x10,
                            0xA5,
                            0xC3,
                            1,
                            5,
                            2,
                            250,
                            3,
                            5,
                            4,
                            250,
                            5,
                            5,
                            6,
                            250,
                            7,
                            5,
                            8,
                            250,
                            0,
                            0,
                            0x98,
                            0x40,
                            0,
                            0,
                            0x40,
                            0x41,
                            0,
                            0x10,
                            0xA5,
                            0x43,
                            0,
                            0,
                            0x98,
                            0x40,
                            0,
                            0,
                            0x40,
                            0x41,
                            0,
                            0x10,
                            0xA5,
                            0x43,
                            0,
                            0x10,
                            0xA5,
                            0x43,
                            3,
                            2,
                            7,
                            4
                        ]).buffer;

        it('parses full state message', function(done) {
            expect(parser.MessageType.State).toEqual(0);
            commandLog.onMessage(cbFail);
            parser.processBinaryDatastream(
                0, 0xFFFFFFFF, full_data, function(state, mask) {
                    mask.forEach(function(val) {
                        expect(val).toBe(true);
                    });
                    expect(state.timestamp_us).toEqual(0x04070203);
                    expect(state.status).toEqual(0x0203);
                    expect(state.V0_raw).toEqual(0x0203);
                    expect(state.I0_raw).toEqual(0x0203);
                    expect(state.I1_raw).toEqual(0x0203);
                    expect(state.accel).toEqual([4.75, 12, 330.125]);
                    expect(state.gyro).toEqual([4.75, 12, 330.125]);
                    expect(state.mag).toEqual([4.75, 12, 330.125]);
                    expect(state.temperature).toEqual(5.15);
                    expect(state.pressure).toEqual(263938.01171875);
                    expect(state.ppm)
                        .toEqual([0x203, 0x407, 0x201, 0x403, 0x605, 0x807]);
                    expect(state.command).toEqual([0x203, 0x407, -1, 0xC07]);
                    expect(state.control).toEqual([4.75, 12, 330.125, 0]);
                    expect(state.pid_master_Fz).toEqual(pid_data);
                    expect(state.pid_master_Tx).toEqual(pid_data);
                    expect(state.pid_master_Ty).toEqual(pid_data);
                    expect(state.pid_master_Tz).toEqual(pid_data);
                    expect(state.pid_slave_Fz).toEqual(pid_data);
                    expect(state.pid_slave_Tx).toEqual(pid_data);
                    expect(state.pid_slave_Ty).toEqual(pid_data);
                    expect(state.pid_slave_Tz).toEqual(pid_data);
                    expect(state.MotorOut)
                        .toEqual([
                            1281,
                            -1534,
                            1283,
                            -1532,
                            1285,
                            -1530,
                            1287,
                            -1528,
                        ]);
                    expect(state.kinematicsAngle).toEqual([4.75, 12, 330.125]);
                    expect(state.kinematicsRate).toEqual([4.75, 12, 330.125]);
                    expect(state.kinematicsAltitude).toEqual(330.125);
                    expect(state.loopCount).toEqual(0x04070203);
                    done();
                }, cbFail, cbFail, cbFail, cbFail);
        });
    });

    function cbFail() {
        fail('Unexpected callback call');
    }
});
