describe('Config handler service', function() {
    var configHandler;

    beforeEach(angular.mock.module('flybrixCommon'));

    beforeEach(inject(function(_configHandler_) {
        configHandler = _configHandler_;
    }));

    it('exists', function() {
        expect(configHandler).toBeDefined();
    });

    describe('1.4.0', function() {
        it('exists', function() {
            expect(configHandler['1.4.0']).toBeDefined();
        });

        it('defaults to zeros', function() {
            var config = configHandler['1.4.0'].empty();
            expect(Object.keys(config).length).toBe(26);
            expect(config.version).toEqual([0.0, 0.0, 0.0]);
            expect(config.id).toEqual(0);
            expect(config.pcbOrientation).toEqual([0.0, 0.0, 0.0]);
            expect(config.pcbTranslation).toEqual([0.0, 0.0, 0.0]);
            expect(config.mixTableFz).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
            expect(config.mixTableTx).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
            expect(config.mixTableTy).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
            expect(config.mixTableTz).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
            expect(config.magBias).toEqual([0.0, 0.0, 0.0]);
            expect(config.assignedChannel).toEqual([0, 0, 0, 0, 0, 0]);
            expect(config.commandInversion).toEqual(0);
            expect(config.channelMidpoint).toEqual([0, 0, 0, 0, 0, 0]);
            expect(config.channelDeadzone).toEqual([0, 0, 0, 0, 0, 0]);
            expect(config.thrustMasterPIDParameters).toEqual([
                0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
            ]);
            expect(config.pitchMasterPIDParameters).toEqual([
                0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
            ]);
            expect(config.rollMasterPIDParameters).toEqual([
                0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
            ]);
            expect(config.yawMasterPIDParameters).toEqual([
                0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
            ]);
            expect(config.thrustSlavePIDParameters).toEqual([
                0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
            ]);
            expect(config.pitchSlavePIDParameters).toEqual([
                0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
            ]);
            expect(config.rollSlavePIDParameters).toEqual([
                0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
            ]);
            expect(config.yawSlavePIDParameters).toEqual([
                0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
            ]);
            expect(config.pidBypass).toEqual(0);
            expect(config.stateEstimationParameters).toEqual([0.0, 0.0]);
            expect(config.enableParameters).toEqual([0.0, 0.0]);
            expect(config.ledStates.length).toEqual(16);
            for (var i = 0; i < 16; ++i) {
                var state = config.ledStates[i];
                state.status = 0;
                state.pattern = 0;
                state.colors.right_front.red = 0;
                state.colors.right_front.green = 0;
                state.colors.right_front.blue = 0;
                state.colors.right_back.red = 0;
                state.colors.right_back.green = 0;
                state.colors.right_back.blue = 0;
                state.colors.left_front.red = 0;
                state.colors.left_front.green = 0;
                state.colors.left_front.blue = 0;
                state.colors.left_back.red = 0;
                state.colors.left_back.green = 0;
                state.colors.left_back.blue = 0;
                state.indicator_red = false;
                state.indicator_green = false;
            }
            expect(config.name).toEqual('');
        });
    });

    describe('1.5.0', function() {
        it('exists', function() {
            expect(configHandler['1.5.0']).toBeDefined();
        });

        it('defaults to zeros', function() {
            var config = configHandler['1.5.0'].empty();
            expect(Object.keys(config).length).toBe(30);
            expect(config.version).toEqual([0.0, 0.0, 0.0]);
            expect(config.id).toEqual(0);
            expect(config.pcbOrientation).toEqual([0.0, 0.0, 0.0]);
            expect(config.pcbTranslation).toEqual([0.0, 0.0, 0.0]);
            expect(config.mixTableFz).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
            expect(config.mixTableTx).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
            expect(config.mixTableTy).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
            expect(config.mixTableTz).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
            expect(config.magBias).toEqual([0.0, 0.0, 0.0]);
            expect(config.assignedChannel).toEqual([0, 0, 0, 0, 0, 0]);
            expect(config.commandInversion).toEqual(0);
            expect(config.channelMidpoint).toEqual([0, 0, 0, 0, 0, 0]);
            expect(config.channelDeadzone).toEqual([0, 0, 0, 0, 0, 0]);
            expect(config.thrustMasterPIDParameters).toEqual([
                0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
            ]);
            expect(config.pitchMasterPIDParameters).toEqual([
                0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
            ]);
            expect(config.rollMasterPIDParameters).toEqual([
                0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
            ]);
            expect(config.yawMasterPIDParameters).toEqual([
                0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
            ]);
            expect(config.thrustSlavePIDParameters).toEqual([
                0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
            ]);
            expect(config.pitchSlavePIDParameters).toEqual([
                0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
            ]);
            expect(config.rollSlavePIDParameters).toEqual([
                0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
            ]);
            expect(config.yawSlavePIDParameters).toEqual([
                0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
            ]);
            expect(config.thrustGain).toBe(0);
            expect(config.pitchGain).toBe(0);
            expect(config.rollGain).toBe(0);
            expect(config.yawGain).toBe(0);
            expect(config.pidBypass).toEqual(0);
            expect(config.stateEstimationParameters).toEqual([0.0, 0.0]);
            expect(config.enableParameters).toEqual([0.0, 0.0]);
            expect(config.ledStates.length).toEqual(16);
            for (var i = 0; i < 16; ++i) {
                var state = config.ledStates[i];
                state.status = 0;
                state.pattern = 0;
                state.colors.right_front.red = 0;
                state.colors.right_front.green = 0;
                state.colors.right_front.blue = 0;
                state.colors.right_back.red = 0;
                state.colors.right_back.green = 0;
                state.colors.right_back.blue = 0;
                state.colors.left_front.red = 0;
                state.colors.left_front.green = 0;
                state.colors.left_front.blue = 0;
                state.colors.left_back.red = 0;
                state.colors.left_back.green = 0;
                state.colors.left_back.blue = 0;
                state.indicator_red = false;
                state.indicator_green = false;
            }
            expect(config.name).toEqual('');
        });
    });

    describe('1.6.0', function() {
        it('exists', function() {
            expect(configHandler['1.6.0']).toBeDefined();
        });

        it('defaults to zeros', function() {
            var config = configHandler['1.6.0'].empty();
            expect(Object.keys(config).length).toBe(34);
            expect(config.version).toEqual([0.0, 0.0, 0.0]);
            expect(config.id).toEqual(0);
            expect(config.pcbOrientation).toEqual([0.0, 0.0, 0.0]);
            expect(config.pcbTranslation).toEqual([0.0, 0.0, 0.0]);
            expect(config.mixTableFz).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
            expect(config.mixTableTx).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
            expect(config.mixTableTy).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
            expect(config.mixTableTz).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
            expect(config.magBias).toEqual([0.0, 0.0, 0.0]);
            expect(config.assignedChannel).toEqual([0, 0, 0, 0, 0, 0]);
            expect(config.commandInversion).toEqual(0);
            expect(config.channelMidpoint).toEqual([0, 0, 0, 0, 0, 0]);
            expect(config.channelDeadzone).toEqual([0, 0, 0, 0, 0, 0]);
            expect(config.thrustMasterPIDParameters).toEqual([
                0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
            ]);
            expect(config.pitchMasterPIDParameters).toEqual([
                0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
            ]);
            expect(config.rollMasterPIDParameters).toEqual([
                0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
            ]);
            expect(config.yawMasterPIDParameters).toEqual([
                0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
            ]);
            expect(config.thrustSlavePIDParameters).toEqual([
                0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
            ]);
            expect(config.pitchSlavePIDParameters).toEqual([
                0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
            ]);
            expect(config.rollSlavePIDParameters).toEqual([
                0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
            ]);
            expect(config.yawSlavePIDParameters).toEqual([
                0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
            ]);
            expect(config.thrustGain).toBe(0);
            expect(config.pitchGain).toBe(0);
            expect(config.rollGain).toBe(0);
            expect(config.yawGain).toBe(0);
            expect(config.pidBypass).toEqual(0);
            expect(config.stateEstimationParameters).toEqual([0.0, 0.0]);
            expect(config.enableParameters).toEqual([0.0, 0.0]);
            expect(config.ledStates.length).toEqual(16);
            for (var i = 0; i < 16; ++i) {
                var state = config.ledStates[i];
                state.status = 0;
                state.pattern = 0;
                state.colors.right_front.red = 0;
                state.colors.right_front.green = 0;
                state.colors.right_front.blue = 0;
                state.colors.right_back.red = 0;
                state.colors.right_back.green = 0;
                state.colors.right_back.blue = 0;
                state.colors.left_front.red = 0;
                state.colors.left_front.green = 0;
                state.colors.left_front.blue = 0;
                state.colors.left_back.red = 0;
                state.colors.left_back.green = 0;
                state.colors.left_back.blue = 0;
                state.indicator_red = false;
                state.indicator_green = false;
            }
            expect(config.name).toEqual('');
            expect(config.vxPIDParameters).toEqual([
                0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
            ]);
            expect(config.vyPIDParameters).toEqual([
                0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
            ]);
            expect(config.vzPIDParameters).toEqual([
                0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
            ]);
            expect(config.velocityPidBypass).toEqual(false);
        });
    });
});
