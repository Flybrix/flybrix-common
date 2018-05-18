describe('Serial service', function() {
    var serial;
    var commandLog;
    var $rootScope;
    var $timeout;

    beforeEach(angular.mock.module('flybrixCommon'));

    beforeEach(
        inject(function(_serial_, _commandLog_, _$rootScope_, _$timeout_) {
            serial = _serial_;
            commandLog = _commandLog_;
            $rootScope = _$rootScope_;
            $timeout = _$timeout_;
        }));

    it('exists', function() {
        expect(serial).toBeDefined();
    });

    describe('.Backend()', function() {
        var backend;

        beforeEach(function() {
            backend = new serial.Backend();
        });

        it('exists', function() {
            expect(serial.Backend).toBeDefined();
        });

        it('is constructor', function() {
            expect(new serial.Backend()).toBeDefined();
        });

        describe('.busy()', function() {
            it('exists', function() {
                expect(backend.busy).toBeDefined();
            });

            it('is false by default', function() {
                expect(backend.busy()).toBeFalsy();
            });
        });

        describe('.onRead()', function() {
            it('exists', function() {
                expect(backend.onRead).toBeDefined();
            });

            it('logs issues by default', function(done) {
                commandLog.onMessage(function(msgs) {
                    expect(msgs.length).toBe(1);
                    expect(msgs[0]).toEqual(
                        'No "onRead" defined for serial backend');
                    done();
                });
                backend.onRead();
                $rootScope.$digest();
            });
        });

        describe('.send()', function() {
            it('exists', function() {
                expect(backend.send).toBeDefined();
            });

            it('logs issues by default', function(done) {
                commandLog.onMessage(function(msgs) {
                    expect(msgs.length).toBe(1);
                    expect(msgs[0]).toEqual(
                        'No "send" defined for serial backend');
                    done();
                });
                backend.send();
                $rootScope.$digest();
            });
        });
    });

    describe('.setBackend()', function() {
        it('exists', function() {
            expect(serial.setBackend).toBeDefined();
        });

        it('sets the serial backend', function(done) {
            var backend = new serial.Backend();
            backend.busy = function() {
                done();
                return true;
            };
            serial.setBackend(backend);
            serial.busy();
        });

        describe('.onRead()', function() {
            var backend;

            beforeEach(function() {
                backend = new serial.Backend();
                serial.setBackend(backend);
            });

            it('exists', function() {
                expect(backend.onRead).toBeDefined();
            });

            it('causes serial to read', function(done) {
                serial.setBytesHandler(function(data) {
                    expect(data).toEqual(new Uint8Array([1, 2, 3, 4]));
                    done();
                });
                backend.onRead(new Uint8Array([1, 2, 3, 4]))
            });
        });
    });

    describe('.busy()', function() {
        it('exists', function() {
            expect(serial.busy).toBeDefined();
        });

        it('is false by default', function() {
            expect(serial.busy()).toBeFalsy();
        });

        it('uses the backend to make answers', function() {
            var backend = new serial.Backend();
            backend.is_busy = false;
            backend.busy = function() {
                return this.is_busy;
            };

            serial.setBackend(backend);

            expect(serial.busy()).toBeFalsy();

            backend.is_busy = true;
            expect(serial.busy()).toBeTruthy();

            backend.is_busy = false;
            expect(serial.busy()).toBeFalsy();
        });
    });

    describe('.setBytesHandler()', function() {
        it('exists', function() {
            expect(serial.setBytesHandler).toBeDefined();
        });

        it('sets the response to reading', function(done) {
            var backend = new serial.Backend();
            serial.setBackend(backend);
            serial.setBytesHandler(function(data) {
                expect(data).toEqual(new Uint8Array([1, 2, 3, 4]));
                done();
            });
            backend.onRead(new Uint8Array([1, 2, 3, 4]));
        });
    });

    describe('reading data', function() {
        var backend;

        beforeEach(function() {
            backend = new serial.Backend();
            serial.setBackend(backend);
        });

        it('reads states', function(done) {
            serial.addOnReceiveCallback(function(messageType, message) {
                if (messageType !== 'State') {
                    fail('Unexpected message type ' + messageType);
                }
                expect(message).toEqual({
                    timestamp_us: 0x04030201,
                    loop_count: 0x08070605,
                    serial_update_rate_estimate: NaN,
                });
                done();
            });
            commandLog.onMessage(onFail);
            backend.onRead(new Uint8Array(
                [2, 13, 2, 1, 1, 10, 4, 1, 2, 3, 4, 5, 6, 7, 8, 0]));
            $rootScope.$digest();
        });

        it('reads commands', function(done) {
            serial.addOnReceiveCallback(function(messageType, message) {
                if (messageType !== 'Command') {
                    fail('Unexpected message type ' + messageType);
                }
                expect(message).toEqual({
                    request_response: true,
                    motor_override_speed_4: 0x0201,
                    set_sd_write_delay: 0x0403,
                    set_led: {
                        pattern: 1,
                        color_right: {
                            red: 2,
                            green: 3,
                            blue: 4,
                        },
                        color_left: {
                            red: 1,
                            green: 2,
                            blue: 3,
                        },
                        indicator_red: true,
                        indicator_green: true,
                    },
                    set_calibration: {
                        enabled: false,
                        mode: 5,
                    },
                });
                done();
            });
            commandLog.onMessage(onFail);
            backend.onRead(
                new Uint8Array([20, 1, 1, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 5, 2, 5, 0]));
            $rootScope.$digest();
        });

        it('reports bad data', function(done) {
            serial.addOnReceiveCallback(function(messageType) {
                fail('Unexpected message type ' + messageType);
            });
            commandLog.onMessage(done);
            backend.onRead(
                new Uint8Array([11, 2, 1, 1, 2, 3, 4, 1, 2, 3, 4, 0]));
            $rootScope.$digest();
        });
    });

    describe('.handlePostConnect()', function() {
        var backend;
        beforeEach(function() {
            backend = new serial.Backend();
            serial.setBackend(backend);
        });

        it('exists', function() {
            expect(serial.handlePostConnect).toBeDefined();
        });

        it('sends firmware version request', function(done) {
            backend.send = function(data) {
                expect(data).toEqual(
                    new Uint8Array([4, 65, 1, 1, 2, 64, 2, 1, 1, 0]));
                done();
            };
            serial.handlePostConnect();
            $timeout.flush();
        });
    });

    // TODO: rewrite ACK tests
    /*
    describe('acknowledging', function() {
        var backend;
        beforeEach(function() {
            backend = new serial.Backend();
            serial.setBackend(backend);
        });

        it('responds positively on match', function(done) {
            serial.send(0x87654321, []).then(done, onFail);
            backend.onRead(new Uint8Array([
                11, 254, 255, 0x21, 0x43, 0x65, 0x87, 0x20, 0x43, 0x65, 0x87, 0
            ]));
            $timeout.flush();
            $rootScope.$digest();
        });

        it('responds negatively on mask mismatch', function(done) {
            serial.send(0x87654331, []).then(onFail, function(message) {
                expect(message).toEqual('Missing ACK');
                done();
            });
            backend.onRead(new Uint8Array([
                11, 254, 255, 0x21, 0x43, 0x65, 0x87, 0x20, 0x43, 0x65, 0x87, 0
            ]));
            $timeout.flush();
            $rootScope.$digest();
        });

        it('responds negatively on unprocessed commands', function(done) {
            serial.send(0x87654321, []).then(onFail, function(message) {
                expect(message).toEqual('Request was not fully processed');
                done();
            });
            backend.onRead(new Uint8Array([
                11, 126, 255, 0x21, 0x43, 0x65, 0x87, 0x20, 0x43, 0x65, 0x07, 0
            ]));
            $timeout.flush();
            $rootScope.$digest();
        });

        it('responds positively on multiple matches', function(done) {
            var leftover = 5;
            function onDone() {
                if (!--leftover) {
                    done();
                }
            }
            serial.send(0x87654321, []).then(onDone, onFail);
            serial.send(0x67854321, []).then(onDone, onFail);
            serial.send(0x83654721, []).then(onDone, onFail);
            serial.send(0x87652341, []).then(onDone, onFail);
            serial.send(0x81654327, []).then(onDone, onFail);
            backend.onRead(new Uint8Array([
                11, 254, 255, 0x21, 0x43, 0x65, 0x87, 0x20, 0x43, 0x65, 0x87, 0
            ]));
            backend.onRead(new Uint8Array([
                11, 254, 255, 0x21, 0x43, 0x85, 0x67, 0x20, 0x43, 0x85, 0x67, 0
            ]));
            backend.onRead(new Uint8Array([
                11, 254, 255, 0x21, 0x47, 0x65, 0x83, 0x20, 0x47, 0x65, 0x83, 0
            ]));
            backend.onRead(new Uint8Array([
                11, 254, 255, 0x41, 0x23, 0x65, 0x87, 0x40, 0x23, 0x65, 0x87, 0
            ]));
            backend.onRead(new Uint8Array([
                11, 254, 255, 0x27, 0x43, 0x65, 0x81, 0x26, 0x43, 0x65, 0x81, 0
            ]));
            $timeout.flush();
            $rootScope.$digest();
        });

        it('matches responses to fitting messages', function(done) {
            var leftover = 2;
            function onDone() {
                if (!--leftover) {
                    done();
                }
            }
            serial.send(0x27654321, []).then(onFail, onDone);
            serial.send(0x87654321, []).then(onDone, onFail);
            backend.onRead(new Uint8Array([
                11, 254, 255, 0x21, 0x43, 0x65, 0x87, 0x20, 0x43, 0x65, 0x87, 0
            ]));
            $timeout.flush();
            $rootScope.$digest();
        });
    });
    */

    function onFail(msg) {
        if (msg) {
            fail('Unexpected callback call with: ' + msg);
        }
        fail('Unexpected callback call');
    }
});
