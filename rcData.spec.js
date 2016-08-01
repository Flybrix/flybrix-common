describe('RC Data service', function() {
    var rcData;
    var serial;
    var parser;
    var cobs;
    var $timeout;

    beforeEach(angular.mock.module('flybrixCommon'));

    beforeEach(
        inject(function(_rcData_, _serial_, _parser_, _cobs_, _$timeout_) {
            rcData = _rcData_;
            serial = _serial_;
            parser = _parser_;
            cobs = _cobs_;
            $timeout = _$timeout_;
        }));

    it('exists', function() {
        expect(rcData).toBeDefined();
    });

    describe('AUX', function() {
        it('exists', function() {
            expect(rcData.AUX).toBeDefined();
        });

        it('matches flag indices', function() {
            expect(rcData.AUX.LOW).toBe(0);
            expect(rcData.AUX.MID).toBe(1);
            expect(rcData.AUX.HIGH).toBe(2);
        });

    });

    describe('.AUX1', function() {
        it('has setter', function() {
            expect(rcData.setAux1).toBeDefined();
        });

        it('has getter', function() {
            expect(rcData.getAux1).toBeDefined();
        });

        it('defaults to HIGH', function() {
            expect(rcData.getAux1()).toBe(rcData.AUX.HIGH);
        });

        it('is stored', function() {
            rcData.setAux1(rcData.AUX.MID);
            expect(rcData.getAux1()).toBe(rcData.AUX.MID);
            rcData.setAux1(rcData.AUX.LOW);
            expect(rcData.getAux1()).toBe(rcData.AUX.LOW);
            rcData.setAux1(rcData.AUX.HIGH);
            expect(rcData.getAux1()).toBe(rcData.AUX.HIGH);
        });
    });

    describe('AUX2', function() {
        it('has setter', function() {
            expect(rcData.setAux2).toBeDefined();
        });

        it('has getter', function() {
            expect(rcData.getAux2).toBeDefined();
        });

        it('defaults to HIGH', function() {
            expect(rcData.getAux2()).toBe(rcData.AUX.HIGH);
        });

        it('is stored', function() {
            rcData.setAux2(rcData.AUX.MID);
            expect(rcData.getAux2()).toBe(rcData.AUX.MID);
            rcData.setAux2(rcData.AUX.LOW);
            expect(rcData.getAux2()).toBe(rcData.AUX.LOW);
            rcData.setAux2(rcData.AUX.HIGH);
            expect(rcData.getAux2()).toBe(rcData.AUX.HIGH);
        });
    });

    describe('throttle axis', function() {
        it('has setter', function() {
            expect(rcData.setThrottle).toBeDefined();
        });

        it('has getter', function() {
            expect(rcData.getThrottle).toBeDefined();
        });

        it('defaults to -1', function() {
            expect(rcData.getThrottle()).toBe(-1);
        });

        it('is stored', function() {
            rcData.setThrottle(0.4);
            expect(rcData.getThrottle()).toBe(0.4);
            rcData.setThrottle(0.2);
            expect(rcData.getThrottle()).toBe(0.2);
            rcData.setThrottle(-0.7);
            expect(rcData.getThrottle()).toBe(-0.7);
        });
    });

    describe('pitch axis', function() {
        it('has setter', function() {
            expect(rcData.setPitch).toBeDefined();
        });

        it('has getter', function() {
            expect(rcData.getPitch).toBeDefined();
        });

        it('defaults to 0', function() {
            expect(rcData.getPitch()).toBe(0);
        });

        it('is stored', function() {
            rcData.setPitch(0.4);
            expect(rcData.getPitch()).toBe(0.4);
            rcData.setPitch(0.2);
            expect(rcData.getPitch()).toBe(0.2);
            rcData.setPitch(-0.7);
            expect(rcData.getPitch()).toBe(-0.7);
        });
    });

    describe('roll axis', function() {
        it('has setter', function() {
            expect(rcData.setRoll).toBeDefined();
        });

        it('has getter', function() {
            expect(rcData.getRoll).toBeDefined();
        });

        it('defaults to 0', function() {
            expect(rcData.getRoll()).toBe(0);
        });

        it('is stored', function() {
            rcData.setRoll(0.4);
            expect(rcData.getRoll()).toBe(0.4);
            rcData.setRoll(0.2);
            expect(rcData.getRoll()).toBe(0.2);
            rcData.setRoll(-0.7);
            expect(rcData.getRoll()).toBe(-0.7);
        });
    });

    describe('yaw axis', function() {
        it('has setter', function() {
            expect(rcData.setYaw).toBeDefined();
        });

        it('has getter', function() {
            expect(rcData.getYaw).toBeDefined();
        });

        it('defaults to 0', function() {
            expect(rcData.getYaw()).toBe(0);
        });

        it('is stored', function() {
            rcData.setYaw(0.4);
            expect(rcData.getYaw()).toBe(0.4);
            rcData.setYaw(0.2);
            expect(rcData.getYaw()).toBe(0.2);
            rcData.setYaw(-0.7);
            expect(rcData.getYaw()).toBe(-0.7);
        });
    });

    describe('.send()', function() {
        var backend;

        beforeEach(function() {
            backend = new serial.Backend();
            serial.setBackend(backend);
        });

        it('exists', function() {
            expect(rcData.send).toBeDefined();
        });

        it('sends serial messages', function(done) {
            backend.send = function() {
                done();
            };
            rcData.send();
            $timeout.flush();
        });

        it('sends same data as radio RC by default', function(done) {
            backend.send = function(val) {
                var decoder = new cobs.Reader();
                decoder.AppendToBuffer(val, function(command, mask, data) {
                    expect(command).toBe(parser.MessageType.Command);
                    expect(mask & parser.CommandFields.COM_SET_SERIAL_RC)
                        .toBeTruthy();
                    data = new Uint8Array(data);
                    expect(data).toEqual(
                        new Uint8Array([1, 0, 0, 0, 0, 0, 0, 0, 0, 36]));
                    done();
                });
            };
            rcData.send();
            $timeout.flush();
        });

        it('responds to AUX changes', function(done) {
            backend.send = function(val) {
                var decoder = new cobs.Reader();
                decoder.AppendToBuffer(val, function(command, mask, data) {
                    expect(command).toBe(parser.MessageType.Command);
                    expect(mask & parser.CommandFields.COM_SET_SERIAL_RC)
                        .toBeTruthy();
                    data = new Uint8Array(data);
                    expect(data).toEqual(
                        new Uint8Array([1, 0, 0, 0, 0, 0, 0, 0, 0, 17]));
                    done();
                });
            };
            rcData.setAux1(rcData.AUX.LOW);
            rcData.setAux2(rcData.AUX.MID);
            rcData.send();
            $timeout.flush();
        });

        it('responds to movement of axes', function(done) {
            backend.send = function(val) {
                var decoder = new cobs.Reader();
                decoder.AppendToBuffer(val, function(command, mask, data) {
                    expect(command).toBe(parser.MessageType.Command);
                    expect(mask & parser.CommandFields.COM_SET_SERIAL_RC)
                        .toBeTruthy();
                    data = new Uint8Array(data);
                    expect(data).not.toEqual(
                        new Uint8Array([1, 0, 0, 0, 0, 0, 0, 0, 0, 36]));
                    done();
                });
            };
            rcData.setYaw(1);
            rcData.setPitch(-1);
            rcData.send();
            $timeout.flush();
        });

        it('is urgent by default', function() {
            var leftover = 3;
            backend.send = function(val) {
                expect(val.length).toBe(18);
                expect(val[16]).toBe(36);
                --leftover;
            };
            backend.busy = alwaysTrue;
            rcData.setAux1(2);
            rcData.setAux2(2);
            rcData.send();
            rcData.setAux1(0);
            rcData.setAux2(0);
            rcData.send();
            rcData.send();
            rcData.send();
            backend.busy = alwaysFalse;
            rcData.setAux1(2);
            rcData.setAux2(2);
            rcData.send();
            rcData.send();
            $timeout.flush();
            expect(leftover).toBe(0);
        });

        it('can be forced to send', function() {
            var leftover = 3;
            backend.send = function(val) {
                expect(val.length).toBe(18);
                expect(val[16]).toBe(36);
                --leftover;
            };
            backend.busy = alwaysTrue;
            rcData.setAux1(2);
            rcData.setAux2(2);
            rcData.send();
            rcData.setAux1(0);
            rcData.setAux2(0);
            rcData.send();
            rcData.send();
            rcData.send();
            rcData.setAux1(2);
            rcData.setAux2(2);
            rcData.forceNextSend();
            rcData.send();
            rcData.setAux1(0);
            rcData.setAux2(0);
            rcData.setAux1(2);
            rcData.setAux2(2);
            rcData.forceNextSend();
            rcData.send();
            $timeout.flush();
            expect(leftover).toBe(0);
        });

        function alwaysTrue() {
            return true;
        }

        function alwaysFalse() {
            return false;
        }
    });
});
