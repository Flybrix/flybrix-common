describe('LED service', function() {
    var led;
    var $rootScope;
    var deviceConfig;

    beforeEach(angular.mock.module('flybrixCommon'));

    beforeEach(inject(function(_led_, _deviceConfig_, _$rootScope_) {
        led = _led_;
        deviceConfig = _deviceConfig_;
    }));

    it('exists', function() {
        expect(led).toBeDefined();
    });

    describe('.set()', function() {
        it('exists', function() {
            expect(led.set).toBeDefined();
        });

        it('sends a partial temporary configuration', function(done) {
            deviceConfig.sendConfig = function(props) {
                var config = props.config;
                var temporary = props.temporary;
                expect(temporary).toBe(true);
                expect(config).toEqual({
                    led_states: [{
                        status: {
                            _0: true,
                            _1: true,
                            _2: true,
                            no_signal: true,
                            idle: true,
                            arming: true,
                            recording_sd: true,
                            _7: true,
                            loop_slow: true,
                            _9: true,
                            armed: true,
                            battery_low: true,
                            battery_critical: true,
                            log_full: true,
                            crash_detected: true,
                            override: true,
                        },
                        pattern: 2,
                        indicator_red: true,
                        indicator_green: false,
                        colors: {
                            right_front: {
                                red: 11,
                                green: 12,
                                blue: 13,
                            },
                            right_back: {
                                red: 21,
                                green: 22,
                                blue: 23,
                            },
                            left_front: {
                                red: 31,
                                green: 32,
                                blue: 33,
                            },
                            left_back: {
                                red: 41,
                                green: 42,
                                blue: 43,
                            },
                        }
                    }],
                });
                done();
            };

            led.set(
                {red: 11, green: 12, blue: 13}, {red: 21, green: 22, blue: 23},
                {red: 31, green: 32, blue: 33}, {red: 41, green: 42, blue: 43},
                2, true, false);
        });

        it('sends default value for unset arguments', function(done) {
            deviceConfig.sendConfig = function(props) {
                var config = props.config;
                var temporary = props.temporary;
                expect(temporary).toBe(true);
                expect(config).toEqual({
                    led_states: [{
                        status: {
                            _0: true,
                            _1: true,
                            _2: true,
                            no_signal: true,
                            idle: true,
                            arming: true,
                            recording_sd: true,
                            _7: true,
                            loop_slow: true,
                            _9: true,
                            armed: true,
                            battery_low: true,
                            battery_critical: true,
                            log_full: true,
                            crash_detected: true,
                            override: true,
                        },
                        pattern: 5,
                        indicator_red: false,
                        indicator_green: false,
                        colors: {
                            right_front: {
                                red: 0,
                                green: 0,
                                blue: 0,
                            },
                            right_back: {
                                red: 0,
                                green: 0,
                                blue: 0,
                            },
                            left_front: {
                                red: 0,
                                green: 0,
                                blue: 0,
                            },
                            left_back: {
                                red: 0,
                                green: 0,
                                blue: 0,
                            },
                        }
                    }],
                });
                done();
            };

            led.set();
        });

        it('sends previous value for unset arguments', function(done) {
            var counter = 4;
            deviceConfig.sendConfig = function(props) {
                var config = props.config;
                var temporary = props.temporary;
                expect(temporary).toBe(true);
                expect(config).toEqual({
                    led_states: [{
                        status: {
                            _0: true,
                            _1: true,
                            _2: true,
                            no_signal: true,
                            idle: true,
                            arming: true,
                            recording_sd: true,
                            _7: true,
                            loop_slow: true,
                            _9: true,
                            armed: true,
                            battery_low: true,
                            battery_critical: true,
                            log_full: true,
                            crash_detected: true,
                            override: true,
                        },
                        pattern: 2,
                        indicator_red: true,
                        indicator_green: false,
                        colors: {
                            right_front: {
                                red: 11,
                                green: 12,
                                blue: 13,
                            },
                            right_back: {
                                red: 21,
                                green: 22,
                                blue: 23,
                            },
                            left_front: {
                                red: 31,
                                green: 32,
                                blue: 33,
                            },
                            left_back: {
                                red: 41,
                                green: 42,
                                blue: 43,
                            },
                        }
                    }],
                });
                if (!--counter) {
                    done();
                }
            };

            led.set(
                {red: 11, green: 12, blue: 13}, {red: 21, green: 22, blue: 23},
                {red: 31, green: 32, blue: 33}, {red: 41, green: 42, blue: 43},
                2, true, false);

            led.set();
            led.set();
            led.set();
        });
    });

    describe('.setSimple()', function() {
        it('exists', function() {
            expect(led.setSimple).toBeDefined();
        });

        it('sends a partial temporary configuration', function(done) {
            deviceConfig.sendConfig = function(props) {
                var config = props.config;
                var temporary = props.temporary;
                expect(temporary).toBe(true);
                expect(config).toEqual({
                    led_states: [{
                        status: {
                            _0: true,
                            _1: true,
                            _2: true,
                            no_signal: true,
                            idle: true,
                            arming: true,
                            recording_sd: true,
                            _7: true,
                            loop_slow: true,
                            _9: true,
                            armed: true,
                            battery_low: true,
                            battery_critical: true,
                            log_full: true,
                            crash_detected: true,
                            override: true,
                        },
                        pattern: 5,
                        indicator_red: false,
                        indicator_green: false,
                        colors: {
                            right_front: {
                                red: 11,
                                green: 12,
                                blue: 13,
                            },
                            right_back: {
                                red: 11,
                                green: 12,
                                blue: 13,
                            },
                            left_front: {
                                red: 11,
                                green: 12,
                                blue: 13,
                            },
                            left_back: {
                                red: 11,
                                green: 12,
                                blue: 13,
                            },
                        }
                    }],
                });
                done();
            };

            led.setSimple(11, 12, 13);
        });

        it('sends zeros by default', function(done) {
            var counter = 1;
            deviceConfig.sendConfig = function(props) {
                var config = props.config;
                var temporary = props.temporary;
                expect(temporary).toBe(true);
                expect(config).toEqual({
                    led_states: [{
                        status: {
                            _0: true,
                            _1: true,
                            _2: true,
                            no_signal: true,
                            idle: true,
                            arming: true,
                            recording_sd: true,
                            _7: true,
                            loop_slow: true,
                            _9: true,
                            armed: true,
                            battery_low: true,
                            battery_critical: true,
                            log_full: true,
                            crash_detected: true,
                            override: true,
                        },
                        pattern: 5,
                        indicator_red: false,
                        indicator_green: false,
                        colors: {
                            right_front: {
                                red: counter * 11,
                                green: counter * 12,
                                blue: counter * 13,
                            },
                            right_back: {
                                red: counter * 11,
                                green: counter * 12,
                                blue: counter * 13,
                            },
                            left_front: {
                                red: counter * 11,
                                green: counter * 12,
                                blue: counter * 13,
                            },
                            left_back: {
                                red: counter * 11,
                                green: counter * 12,
                                blue: counter * 13,
                            },
                        }
                    }],
                });
                if (!counter--) {
                    done();
                }
            };

            led.setSimple(11, 12, 13);
            led.setSimple();
        });
    });
});
