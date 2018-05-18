describe('Calibration service', function() {

    var calibration;
    var serial;
    var cobs;
    var commandLog;
    var $timeout;
    var $rootScope;
    var backend;

    beforeEach(angular.mock.module('flybrixCommon'));

    beforeEach(inject(function(_calibration_, _serial_, _cobs_, _commandLog_, _$timeout_, _$rootScope_) {
        calibration = _calibration_;
        serial = _serial_;
        cobs = _cobs_;
        commandLog = _commandLog_;
        $timeout = _$timeout_;
        $rootScope = _$rootScope_;
    }));

    beforeEach(function() {
        backend = new serial.Backend();
        serial.setBackend(backend);
    });

    it('exists', function() {
        expect(calibration).toBeDefined();
    });

    describe('Finishing calibration', function() {
        it('exists', function() {
            expect(calibration.finish).toBeDefined();
        });

        it('sends right data', function(done) {
            backend.send = function(val) {
                var decoder = new cobs.Reader();
                decoder.readBytes(val, function(data) {
                    expect(data).toEqual(new Uint8Array([1, 1, 0, 0, 4, 0, 0]));
                    done();
                });
            };
            calibration.finish();
            $timeout.flush();
        });
    });

    describe('Magnetometer calibration', function() {
        it('exists', function() {
            expect(calibration.magnetometer).toBeDefined();
        });

        it('sends right data', function(done) {
            backend.send = function(val) {
                var decoder = new cobs.Reader();
                decoder.readBytes(val, function(data) {
                    expect(data).toEqual(new Uint8Array([1, 1, 0, 0, 4, 1, 0]));
                    done();
                });
            };
            calibration.magnetometer();
            $timeout.flush();
        });
    });

    describe('Accelerometer calibration', function() {
        it('exists', function() {
            expect(calibration.accelerometer).toBeDefined();
        });

        it('has methods for each pose', function() {
            expect(calibration.accelerometer.flat).toBeDefined();
            expect(calibration.accelerometer.forward).toBeDefined();
            expect(calibration.accelerometer.back).toBeDefined();
            expect(calibration.accelerometer.right).toBeDefined();
            expect(calibration.accelerometer.left).toBeDefined();
        });

        it('sends right data for flat', function(done) {
            backend.send = function(val) {
                var decoder = new cobs.Reader();
                decoder.readBytes(val, function(data) {
                    expect(data).toEqual(new Uint8Array([1, 1, 0, 0, 4, 1, 1]));
                    done();
                });
            };
            calibration.accelerometer.flat();
            $timeout.flush();
        });

        it('sends right data for forward', function(done) {
            backend.send = function(val) {
                var decoder = new cobs.Reader();
                decoder.readBytes(val, function(data) {
                    expect(data).toEqual(new Uint8Array([1, 1, 0, 0, 4, 1, 2]));
                    done();
                });
            };
            calibration.accelerometer.forward();
            $timeout.flush();
        });

        it('sends right data for back', function(done) {
            backend.send = function(val) {
                var decoder = new cobs.Reader();
                decoder.readBytes(val, function(data) {
                    expect(data).toEqual(new Uint8Array([1, 1, 0, 0, 4, 1, 3]));
                    done();
                });
            };
            calibration.accelerometer.back();
            $timeout.flush();
        });

        it('sends right data for right', function(done) {
            backend.send = function(val) {
                var decoder = new cobs.Reader();
                decoder.readBytes(val, function(data) {
                    expect(data).toEqual(new Uint8Array([1, 1, 0, 0, 4, 1, 4]));
                    done();
                });
            };
            calibration.accelerometer.right();
            $timeout.flush();
        });

        it('sends right data for left', function(done) {
            backend.send = function(val) {
                var decoder = new cobs.Reader();
                decoder.readBytes(val, function(data) {
                    expect(data).toEqual(new Uint8Array([1, 1, 0, 0, 4, 1, 5]));
                    done();
                });
            };
            calibration.accelerometer.left();
            $timeout.flush();
        });
    });
});
