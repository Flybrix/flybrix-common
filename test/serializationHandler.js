describe('Serialization handler service', function () {
    var serializationHandler;

    beforeEach(angular.mock.module('flybrixCommon'));

    beforeEach(inject(function (_serializationHandler_) {
        serializationHandler = _serializationHandler_;
    }));

    it('exists', function () {
        expect(serializationHandler).toBeDefined();
    });

    describe('1.4.0', function () {
        var handlers = null;
        beforeEach(function () {
            handlers = serializationHandler.getHandler('1.4.0');
        });

        it('exists', function () {
            expect(handlers).toBeDefined();
        });

        it('has a config', function () {
            expect(handlers.Configuration).toBeDefined();
        });

        it('vector defaults to zeros', function () {
            expect(handlers.Vector3f.empty()).toEqual({
                x: 0,
                y: 0,
                z: 0,
            });
        });

        it('color defaults to zeros', function () {
            expect(handlers.Color.empty()).toEqual({
                red: 0,
                green: 0,
                blue: 0,
            });
        });

        it('status flag defaults to full flag', function () {
            expect(handlers.StatusFlag.empty()).toEqual({
                boot: true,
                mpu_fail: true,
                bmp_fail: true,
                rx_fail: true,
                idle: true,
                enabling: true,
                clear_mpu_bias: true,
                set_mpu_bias: true,
                fail_stability: true,
                fail_angle: true,
                enabled: true,
                battery_low: true,
                temp_warning: true,
                log_full: true,
                fail_other: true,
                override: true,
            });
        });

        it('LED state case defaults to zeros', function () {
            expect(handlers.LEDStateCase.empty()).toEqual({
                status: handlers.StatusFlag.empty(),
                pattern: 0,
                color_right_front: handlers.Color.empty(),
                color_right_back: handlers.Color.empty(),
                color_left_front: handlers.Color.empty(),
                color_left_back: handlers.Color.empty(),
                indicator_red: false,
                indicator_green: false,
            });
        });

        it('PID settings default to zero', function () {
            expect(handlers.PIDSettings.empty()).toEqual({
                kp: 0,
                ki: 0,
                kd: 0,
                integral_windup_guard: 0,
                d_filter_time: 0,
                setpoint_filter_time: 0,
                command_to_value: 0,
            });
        });

        it('configuration defaults to zeros', function () {
            var zeroVector = handlers.Vector3f.empty();
            var zeroLedStateCase = handlers.LEDStateCase.empty();
            var zeroPidSettings = handlers.PIDSettings.empty();
            var config = handlers.Configuration.empty();
            expect(config).toEqual({
                version: {
                    major: 0,
                    minor: 0,
                    patch: 0,
                },
                config_id: 0,
                pcb_transform: {
                    orientation: zeroVector,
                    translation: zeroVector,
                },
                mix_table: {
                    fz: [0, 0, 0, 0, 0, 0, 0, 0],
                    tx: [0, 0, 0, 0, 0, 0, 0, 0],
                    ty: [0, 0, 0, 0, 0, 0, 0, 0],
                    tz: [0, 0, 0, 0, 0, 0, 0, 0],
                },
                mag_bias: {
                    offset: zeroVector,
                },
                channel: {
                    assignment: [0, 0, 0, 0, 0, 0],
                    inversion: 0,
                    midpoint: [0, 0, 0, 0, 0, 0],
                    deadzone: [0, 0, 0, 0, 0, 0],
                },
                pid_parameters: {
                    thrust_master: zeroPidSettings,
                    pitch_master: zeroPidSettings,
                    roll_master: zeroPidSettings,
                    yaw_master: zeroPidSettings,
                    thrust_slave: zeroPidSettings,
                    pitch_slave: zeroPidSettings,
                    roll_slave: zeroPidSettings,
                    yaw_slave: zeroPidSettings,
                    pid_bypass: 0,
                },
                state_parameters: {
                    state_estimation: [0, 0],
                    enable: [0, 0],
                },
                led_states: [
                    zeroLedStateCase,
                    zeroLedStateCase,
                    zeroLedStateCase,
                    zeroLedStateCase,
                    zeroLedStateCase,
                    zeroLedStateCase,
                    zeroLedStateCase,
                    zeroLedStateCase,
                    zeroLedStateCase,
                    zeroLedStateCase,
                    zeroLedStateCase,
                    zeroLedStateCase,
                    zeroLedStateCase,
                    zeroLedStateCase,
                    zeroLedStateCase,
                    zeroLedStateCase,
                ],
                device_name: '',
            });
            expect(config).toEqual(handlers.ConfigurationFixed.empty());
        });
    });

    describe('1.5.0', function () {
        var handlers = null;
        beforeEach(function () {
            handlers = serializationHandler.getHandler('1.5.0');
        });

        it('exists', function () {
            expect(handlers).toBeDefined();
        });

        it('has a config', function () {
            expect(handlers.Configuration).toBeDefined();
        });

        it('vector defaults to zeros', function () {
            expect(handlers.Vector3f.empty()).toEqual({
                x: 0,
                y: 0,
                z: 0,
            });
        });

        it('color defaults to zeros', function () {
            expect(handlers.Color.empty()).toEqual({
                red: 0,
                green: 0,
                blue: 0,
            });
        });

        it('status flag defaults to full flag', function () {
            expect(handlers.StatusFlag.empty()).toEqual({
                boot: true,
                mpu_fail: true,
                bmp_fail: true,
                rx_fail: true,
                idle: true,
                enabling: true,
                clear_mpu_bias: true,
                set_mpu_bias: true,
                fail_stability: true,
                fail_angle: true,
                enabled: true,
                battery_low: true,
                temp_warning: true,
                log_full: true,
                fail_other: true,
                override: true,
            });
        });

        it('LED state case defaults to zeros', function () {
            expect(handlers.LEDStateCase.empty()).toEqual({
                status: handlers.StatusFlag.empty(),
                pattern: 0,
                color_right_front: handlers.Color.empty(),
                color_right_back: handlers.Color.empty(),
                color_left_front: handlers.Color.empty(),
                color_left_back: handlers.Color.empty(),
                indicator_red: false,
                indicator_green: false,
            });
        });

        it('PID settings default to zero', function () {
            expect(handlers.PIDSettings.empty()).toEqual({
                kp: 0,
                ki: 0,
                kd: 0,
                integral_windup_guard: 0,
                d_filter_time: 0,
                setpoint_filter_time: 0,
                command_to_value: 0,
            });
        });

        it('configuration defaults to zeros', function () {
            var zeroVector = handlers.Vector3f.empty();
            var zeroLedStateCase = handlers.LEDStateCase.empty();
            var zeroPidSettings = handlers.PIDSettings.empty();
            var config = handlers.Configuration.empty();
            expect(config).toEqual({
                version: {
                    major: 0,
                    minor: 0,
                    patch: 0,
                },
                config_id: 0,
                pcb_transform: {
                    orientation: zeroVector,
                    translation: zeroVector,
                },
                mix_table: {
                    fz: [0, 0, 0, 0, 0, 0, 0, 0],
                    tx: [0, 0, 0, 0, 0, 0, 0, 0],
                    ty: [0, 0, 0, 0, 0, 0, 0, 0],
                    tz: [0, 0, 0, 0, 0, 0, 0, 0],
                },
                mag_bias: {
                    offset: zeroVector,
                },
                channel: {
                    assignment: [0, 0, 0, 0, 0, 0],
                    inversion: 0,
                    midpoint: [0, 0, 0, 0, 0, 0],
                    deadzone: [0, 0, 0, 0, 0, 0],
                },
                pid_parameters: {
                    thrust_master: zeroPidSettings,
                    pitch_master: zeroPidSettings,
                    roll_master: zeroPidSettings,
                    yaw_master: zeroPidSettings,
                    thrust_slave: zeroPidSettings,
                    pitch_slave: zeroPidSettings,
                    roll_slave: zeroPidSettings,
                    yaw_slave: zeroPidSettings,
                    thrust_gain: 0,
                    pitch_gain: 0,
                    roll_gain: 0,
                    yaw_gain: 0,
                    pid_bypass: 0,
                },
                state_parameters: {
                    state_estimation: [0, 0],
                    enable: [0, 0],
                },
                led_states: [
                    zeroLedStateCase,
                    zeroLedStateCase,
                    zeroLedStateCase,
                    zeroLedStateCase,
                    zeroLedStateCase,
                    zeroLedStateCase,
                    zeroLedStateCase,
                    zeroLedStateCase,
                    zeroLedStateCase,
                    zeroLedStateCase,
                    zeroLedStateCase,
                    zeroLedStateCase,
                    zeroLedStateCase,
                    zeroLedStateCase,
                    zeroLedStateCase,
                    zeroLedStateCase,
                ],
                device_name: '',
            });
            expect(config).toEqual(handlers.ConfigurationFixed.empty());
        });
    });

    describe('1.6.0', function () {
        var handlers = null;
        beforeEach(function () {
            handlers = serializationHandler.getHandler('1.6.0');
        });

        it('exists', function () {
            expect(handlers).toBeDefined();
        });

        it('has a config', function () {
            expect(handlers.Configuration).toBeDefined();
        });

        it('vector defaults to zeros', function () {
            expect(handlers.Vector3f.empty()).toEqual({
                x: 0,
                y: 0,
                z: 0,
            });
        });

        it('color defaults to zeros', function () {
            expect(handlers.Color.empty()).toEqual({
                red: 0,
                green: 0,
                blue: 0,
            });
        });

        it('status flag defaults to full flag', function () {
            expect(handlers.StatusFlag.empty()).toEqual({
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
            });
        });

        it('LED state case defaults to zeros', function () {
            expect(handlers.LEDStateCase.empty()).toEqual({
                status: handlers.StatusFlag.empty(),
                pattern: 0,
                color_right_front: handlers.Color.empty(),
                color_right_back: handlers.Color.empty(),
                color_left_front: handlers.Color.empty(),
                color_left_back: handlers.Color.empty(),
                indicator_red: false,
                indicator_green: false,
            });
        });

        it('PID settings default to zero', function () {
            expect(handlers.PIDSettings.empty()).toEqual({
                kp: 0,
                ki: 0,
                kd: 0,
                integral_windup_guard: 0,
                d_filter_time: 0,
                setpoint_filter_time: 0,
                command_to_value: 0,
            });
        });

        it('configuration defaults to zeros', function () {
            var zeroVector = handlers.Vector3f.empty();
            var zeroLedStateCase = handlers.LEDStateCase.empty();
            var zeroPidSettings = handlers.PIDSettings.empty();
            var config = handlers.Configuration.empty();
            expect(config).toEqual({
                version: {
                    major: 0,
                    minor: 0,
                    patch: 0,
                },
                config_id: 0,
                pcb_transform: {
                    orientation: zeroVector,
                    translation: zeroVector,
                },
                mix_table: {
                    fz: [0, 0, 0, 0, 0, 0, 0, 0],
                    tx: [0, 0, 0, 0, 0, 0, 0, 0],
                    ty: [0, 0, 0, 0, 0, 0, 0, 0],
                    tz: [0, 0, 0, 0, 0, 0, 0, 0],
                },
                mag_bias: {
                    offset: zeroVector,
                },
                channel: {
                    assignment: [0, 0, 0, 0, 0, 0],
                    inversion: 0,
                    midpoint: [0, 0, 0, 0, 0, 0],
                    deadzone: [0, 0, 0, 0, 0, 0],
                },
                pid_parameters: {
                    thrust_master: zeroPidSettings,
                    pitch_master: zeroPidSettings,
                    roll_master: zeroPidSettings,
                    yaw_master: zeroPidSettings,
                    thrust_slave: zeroPidSettings,
                    pitch_slave: zeroPidSettings,
                    roll_slave: zeroPidSettings,
                    yaw_slave: zeroPidSettings,
                    thrust_gain: 0,
                    pitch_gain: 0,
                    roll_gain: 0,
                    yaw_gain: 0,
                    pid_bypass: 0,
                },
                state_parameters: {
                    state_estimation: [0, 0],
                    enable: [0, 0],
                },
                led_states: [
                    zeroLedStateCase,
                    zeroLedStateCase,
                    zeroLedStateCase,
                    zeroLedStateCase,
                    zeroLedStateCase,
                    zeroLedStateCase,
                    zeroLedStateCase,
                    zeroLedStateCase,
                    zeroLedStateCase,
                    zeroLedStateCase,
                    zeroLedStateCase,
                    zeroLedStateCase,
                    zeroLedStateCase,
                    zeroLedStateCase,
                    zeroLedStateCase,
                    zeroLedStateCase,
                ],
                device_name: '',
                velocity_pid_parameters: {
                    forward_master: zeroPidSettings,
                    right_master: zeroPidSettings,
                    up_master: zeroPidSettings,
                    forward_slave: zeroPidSettings,
                    right_slave: zeroPidSettings,
                    up_slave: zeroPidSettings,
                    pid_bypass: 0,
                },
                inertial_bias: {
                    accel: zeroVector,
                    gyro: zeroVector,
                },
            });
            expect(config).toEqual(handlers.ConfigurationFixed.empty());
        });
    });
});
