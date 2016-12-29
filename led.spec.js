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
            deviceConfig.sendPartial = function(
                mask, ledMask, config, temporary) {
                expect(temporary).toBe(true);
                expect(mask).toBe(1 << 8);
                expect(ledMask).toBe(1);
                expect(config.ledStates).toBeDefined();
                expect(config.ledStates[0]).toBeDefined();
                var state = config.ledStates[0];
                expect(state.pattern).toBe(2);
                expect(state.indicator_red).toBe(true);
                expect(state.indicator_green).toBe(false);
                expect(state.colors.right_front.red).toBe(11);
                expect(state.colors.right_front.green).toBe(12);
                expect(state.colors.right_front.blue).toBe(13);
                expect(state.colors.right_back.red).toBe(21);
                expect(state.colors.right_back.green).toBe(22);
                expect(state.colors.right_back.blue).toBe(23);
                expect(state.colors.left_front.red).toBe(31);
                expect(state.colors.left_front.green).toBe(32);
                expect(state.colors.left_front.blue).toBe(33);
                expect(state.colors.left_back.red).toBe(41);
                expect(state.colors.left_back.green).toBe(42);
                expect(state.colors.left_back.blue).toBe(43);
                done();
            };

            led.set(
                {red: 11, green: 12, blue: 13}, {red: 21, green: 22, blue: 23},
                {red: 31, green: 32, blue: 33}, {red: 41, green: 42, blue: 43},
                2, true, false);
        });

        it('sends default value for unset arguments', function(done) {
            deviceConfig.sendPartial = function(
                mask, ledMask, config, temporary) {
                expect(temporary).toBe(true);
                expect(mask).toBe(1 << 8);
                expect(ledMask).toBe(1);
                expect(config.ledStates).toBeDefined();
                expect(config.ledStates[0]).toBeDefined();
                var state = config.ledStates[0];
                expect(state.status).toBe(65535);
                expect(state.pattern).toBe(5);
                expect(state.indicator_red).toBe(false);
                expect(state.indicator_green).toBe(false);
                expect(state.colors.right_front.red).toBe(0);
                expect(state.colors.right_front.green).toBe(0);
                expect(state.colors.right_front.blue).toBe(0);
                expect(state.colors.right_back.red).toBe(0);
                expect(state.colors.right_back.green).toBe(0);
                expect(state.colors.right_back.blue).toBe(0);
                expect(state.colors.left_front.red).toBe(0);
                expect(state.colors.left_front.green).toBe(0);
                expect(state.colors.left_front.blue).toBe(0);
                expect(state.colors.left_back.red).toBe(0);
                expect(state.colors.left_back.green).toBe(0);
                expect(state.colors.left_back.blue).toBe(0);
                done();
            };

            led.set();
        });

        it('sends previous value for unset arguments', function(done) {
            var counter = 4;
            deviceConfig.sendPartial = function(
                mask, ledMask, config, temporary) {
                expect(temporary).toBe(true);
                expect(mask).toBe(1 << 8);
                expect(ledMask).toBe(1);
                expect(config.ledStates).toBeDefined();
                expect(config.ledStates[0]).toBeDefined();
                var state = config.ledStates[0];
                expect(state.pattern).toBe(2);
                expect(state.indicator_red).toBe(true);
                expect(state.indicator_green).toBe(false);
                expect(state.colors.right_front.red).toBe(11);
                expect(state.colors.right_front.green).toBe(12);
                expect(state.colors.right_front.blue).toBe(13);
                expect(state.colors.right_back.red).toBe(21);
                expect(state.colors.right_back.green).toBe(22);
                expect(state.colors.right_back.blue).toBe(23);
                expect(state.colors.left_front.red).toBe(31);
                expect(state.colors.left_front.green).toBe(32);
                expect(state.colors.left_front.blue).toBe(33);
                expect(state.colors.left_back.red).toBe(41);
                expect(state.colors.left_back.green).toBe(42);
                expect(state.colors.left_back.blue).toBe(43);
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
            deviceConfig.sendPartial = function(
                mask, ledMask, config, temporary) {
                expect(temporary).toBe(true);
                expect(mask).toBe(1 << 8);
                expect(ledMask).toBe(1);
                expect(config.ledStates).toBeDefined();
                expect(config.ledStates[0]).toBeDefined();
                var state = config.ledStates[0];
                expect(state.pattern).toBe(5);
                expect(state.indicator_red).toBe(false);
                expect(state.indicator_green).toBe(false);
                expect(state.colors.right_front.red).toBe(11);
                expect(state.colors.right_front.green).toBe(12);
                expect(state.colors.right_front.blue).toBe(13);
                expect(state.colors.right_back.red).toBe(11);
                expect(state.colors.right_back.green).toBe(12);
                expect(state.colors.right_back.blue).toBe(13);
                expect(state.colors.left_front.red).toBe(11);
                expect(state.colors.left_front.green).toBe(12);
                expect(state.colors.left_front.blue).toBe(13);
                expect(state.colors.left_back.red).toBe(11);
                expect(state.colors.left_back.green).toBe(12);
                expect(state.colors.left_back.blue).toBe(13);
                done();
            };

            led.setSimple(11, 12, 13);
        });

        it('sends zeros by default', function(done) {
            var counter = 1;
            deviceConfig.sendPartial = function(
                mask, ledMask, config, temporary) {
                expect(temporary).toBe(true);
                expect(mask).toBe(1 << 8);
                expect(ledMask).toBe(1);
                expect(config.ledStates).toBeDefined();
                expect(config.ledStates[0]).toBeDefined();
                var state = config.ledStates[0];
                expect(state.pattern).toBe(5);
                expect(state.indicator_red).toBe(false);
                expect(state.indicator_green).toBe(false);
                expect(state.colors.right_front.red).toBe(counter * 11);
                expect(state.colors.right_front.green).toBe(counter * 12);
                expect(state.colors.right_front.blue).toBe(counter * 13);
                expect(state.colors.right_back.red).toBe(counter * 11);
                expect(state.colors.right_back.green).toBe(counter * 12);
                expect(state.colors.right_back.blue).toBe(counter * 13);
                expect(state.colors.left_front.red).toBe(counter * 11);
                expect(state.colors.left_front.green).toBe(counter * 12);
                expect(state.colors.left_front.blue).toBe(counter * 13);
                expect(state.colors.left_back.red).toBe(counter * 11);
                expect(state.colors.left_back.green).toBe(counter * 12);
                expect(state.colors.left_back.blue).toBe(counter * 13);
                if (!counter--) {
                    done();
                }
            };

            led.setSimple(11, 12, 13);
            led.setSimple();
        });
    });
});
