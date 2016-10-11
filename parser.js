(function() {
    'use strict';

    angular.module('flybrixCommon').factory('parser', parser);

    parser.$inject = ['commandLog', 'serializer'];

    function parser(commandLog, serializer) {
        var MessageType = {
            State: 0,
            Command: 1,
            DebugString: 3,
            HistoryData: 4,
            Response: 255,
        };

        var CommandFields = {
            COM_REQ_RESPONSE: 1 << 0,
            COM_SET_EEPROM_DATA: 1 << 1,
            COM_REINIT_EEPROM_DATA: 1 << 2,
            COM_REQ_EEPROM_DATA: 1 << 3,
            COM_REQ_ENABLE_ITERATION: 1 << 4,
            COM_MOTOR_OVERRIDE_SPEED_0: 1 << 5,
            COM_MOTOR_OVERRIDE_SPEED_1: 1 << 6,
            COM_MOTOR_OVERRIDE_SPEED_2: 1 << 7,
            COM_MOTOR_OVERRIDE_SPEED_3: 1 << 8,
            COM_MOTOR_OVERRIDE_SPEED_4: 1 << 9,
            COM_MOTOR_OVERRIDE_SPEED_5: 1 << 10,
            COM_MOTOR_OVERRIDE_SPEED_6: 1 << 11,
            COM_MOTOR_OVERRIDE_SPEED_7: 1 << 12,
            COM_MOTOR_OVERRIDE_SPEED_ALL: (1 << 5) | (1 << 6) | (1 << 7) |
                                              (1 << 8) | (1 << 9) | (1 << 10) |
                                              (1 << 11) | (1 << 12),
            COM_SET_COMMAND_OVERRIDE: 1 << 13,
            COM_SET_STATE_MASK: 1 << 14,
            COM_SET_STATE_DELAY: 1 << 15,
            COM_REQ_HISTORY: 1 << 16,
            COM_SET_LED: 1 << 17,
            COM_SET_SERIAL_RC: 1 << 18,
            COM_SET_CARD_RECORDING: 1 << 19,
            COM_SET_PARTIAL_EEPROM_DATA: 1 << 20,
            COM_REINIT_PARTIAL_EEPROM_DATA: 1 << 21,
            COM_REQ_PARTIAL_EEPROM_DATA: 1 << 22,
            COM_REQ_CARD_RECORDING_STATE: 1 << 23,
        };

        var StateFields = {
            STATE_ALL: 0xFFFFFFFF,
            STATE_NONE: 0,
            STATE_MICROS: 1 << 0,
            STATE_STATUS: 1 << 1,
            STATE_V0: 1 << 2,
            STATE_I0: 1 << 3,
            STATE_I1: 1 << 4,
            STATE_ACCEL: 1 << 5,
            STATE_GYRO: 1 << 6,
            STATE_MAG: 1 << 7,
            STATE_TEMPERATURE: 1 << 8,
            STATE_PRESSURE: 1 << 9,
            STATE_RX_PPM: 1 << 10,
            STATE_AUX_CHAN_MASK: 1 << 11,
            STATE_COMMANDS: 1 << 12,
            STATE_F_AND_T: 1 << 13,
            STATE_PID_FZ_MASTER: 1 << 15,
            STATE_PID_TX_MASTER: 1 << 16,
            STATE_PID_TY_MASTER: 1 << 17,
            STATE_PID_TZ_MASTER: 1 << 18,
            STATE_PID_FZ_SLAVE: 1 << 19,
            STATE_PID_TX_SLAVE: 1 << 20,
            STATE_PID_TY_SLAVE: 1 << 21,
            STATE_PID_TZ_SLAVE: 1 << 22,
            STATE_MOTOR_OUT: 1 << 23,
            STATE_KINE_ANGLE: 1 << 24,
            STATE_KINE_RATE: 1 << 25,
            STATE_KINE_ALTITUDE: 1 << 26,
            STATE_LOOP_COUNT: 1 << 27,
        };

        var StatusCodes = {
            STATUS_BOOT: 0x0001,
            STATUS_MPU_FAIL: 0x0002,
            STATUS_BMP_FAIL: 0x0004,
            STATUS_RX_FAIL: 0x0008,

            STATUS_IDLE: 0x0010,

            STATUS_ENABLING: 0x0020,
            STATUS_CLEAR_MPU_BIAS: 0x0040,
            STATUS_SET_MPU_BIAS: 0x0080,

            STATUS_FAIL_STABILITY: 0x0100,
            STATUS_FAIL_ANGLE: 0x0200,

            STATUS_ENABLED: 0x0400,
            STATUS_BATTERY_LOW: 0x0800,

            STATUS_TEMP_WARNING: 0x1000,
            STATUS_LOG_FULL: 0x2000,
            STATUS_UNPAIRED: 0x4000,
            STATUS_OVERRIDE: 0x8000,
        };

        var last_timestamp_us = 0;

        return {
            processBinaryDatastream: processBinaryDatastream,
            MessageType: MessageType,
            CommandFields: CommandFields,
            StatusCodes: StatusCodes,
        };

        function State() {
            this.timestamp_us = 0;
            this.status = 0;
            this.V0_raw = 0;
            this.I0_raw = 0;
            this.I1_raw = 0;
            this.accel = [0, 0, 0];
            this.gyro = [0, 0, 0];
            this.mag = [0, 0, 0];
            this.temperature = 0;
            this.pressure = 0;
            this.ppm = [0, 0, 0, 0, 0, 0];
            this.AUX_chan_mask = 0;
            this.command = [0, 0, 0, 0];  // throttle, pitch, roll, yaw
            this.control = [0, 0, 0, 0];  // Fz, Tx, Ty, Tz
            // time, input, setpoint, p_term, i_term, d_term
            this.pid_master_Fz = [0, 0, 0, 0, 0, 0];
            this.pid_master_Tx = [0, 0, 0, 0, 0, 0];
            this.pid_master_Ty = [0, 0, 0, 0, 0, 0];
            this.pid_master_Tz = [0, 0, 0, 0, 0, 0];
            this.pid_slave_Fz = [0, 0, 0, 0, 0, 0];
            this.pid_slave_Tx = [0, 0, 0, 0, 0, 0];
            this.pid_slave_Ty = [0, 0, 0, 0, 0, 0];
            this.pid_slave_Tz = [0, 0, 0, 0, 0, 0];
            this.MotorOut = [0, 0, 0, 0, 0, 0, 0, 0];
            this.kinematicsAngle = [0, 0, 0];
            this.kinematicsRate = [0, 0, 0];
            this.kinematicsAltitude = 0;
            this.loopCount = 0;
        }

        function processBinaryDatastream(command, mask, message_buffer,
                                         cb_state, cb_command, cb_ack) {
            dispatch(command, mask, message_buffer, function() {
                callbackStateHelper(mask, message_buffer, cb_state)
            }, cb_command, cb_ack);
        }

        function dispatch(command, mask, message_buffer, cb_state, cb_command,
                          cb_ack) {
            switch (command) {
                case MessageType.State:
                    cb_state(mask, message_buffer);
                    break;
                case MessageType.Command:
                    cb_command(mask, message_buffer);
                    break;
                case MessageType.DebugString:
                    var debug_string = arraybuffer2string(message_buffer);
                    commandLog('Received <span style="color: orange">' +
                               'DEBUG' +
                               '</span>: ' + debug_string);
                    break;
                case MessageType.HistoryData:
                    var debug_string = arraybuffer2string(message_buffer);
                    commandLog('Received <span style="color: orange">' +
                               'HISTORY DATA' +
                               '</span>');
                    break;
                case MessageType.Response:
                    var data = new DataView(message_buffer, 0);
                    cb_ack(mask, data.getInt32(0, 1));
                    break;
                default:
                    break;
            }
        }

        function arraybuffer2string(buf) {
            return String.fromCharCode.apply(null, new Uint8Array(buf));
        }

        function parse_pid_data(data, destination, byteRef) {
            destination[0] = data.getUint32(byteRef.index, 1);  // time
            byteRef.add(4);
            for (var i = 1; i < 6; i++) {
                destination[i] = data.getFloat32(byteRef.index, 1);
                byteRef.add(4);
            }
        }

        function callbackStateHelper(mask, message_buffer, cb_state) {
            var state = new State();
            var state_data_mask = [];  // TODO: get rid of this in general
            var data = new DataView(message_buffer, 0);
            var b = new serializer();
            var serial_update_rate_Hz = 0;

            if (0 != (mask & StateFields.STATE_MICROS)) {
                state_data_mask[0] = true;
                state.timestamp_us = data.getUint32(b.index, 1);
                b.add(4);

                serial_update_rate_Hz =
                    1000000 / (state.timestamp_us - last_timestamp_us);
                last_timestamp_us = state.timestamp_us;
            }
            if (0 != (mask & StateFields.STATE_STATUS)) {
                state_data_mask[1] = true;
                state.status = data.getUint16(b.index, 1);
                b.add(2);
            }
            if (0 != (mask & StateFields.STATE_V0)) {
                state_data_mask[2] = true;
                state.V0_raw = data.getUint16(b.index, 1);
                b.add(2);
            }
            if (0 != (mask & StateFields.STATE_I0)) {
                state_data_mask[3] = true;
                state.I0_raw = data.getUint16(b.index, 1);
                b.add(2);
            }
            if (0 != (mask & StateFields.STATE_I1)) {
                state_data_mask[4] = true;
                state.I1_raw = data.getUint16(b.index, 1);
                b.add(2);
            }
            if (0 != (mask & StateFields.STATE_ACCEL)) {
                state_data_mask[5] = true;
                b.parseFloat32Array(data, state.accel);
            }
            if (0 != (mask & StateFields.STATE_GYRO)) {
                state_data_mask[6] = true;
                b.parseFloat32Array(data, state.gyro);
            }
            if (0 != (mask & StateFields.STATE_MAG)) {
                state_data_mask[7] = true;
                b.parseFloat32Array(data, state.mag);
            }
            if (0 != (mask & StateFields.STATE_TEMPERATURE)) {
                state_data_mask[8] = true;
                state.temperature =
                    data.getUint16(b.index, 1) / 100.0;  // temperature
                b.add(2);
            }
            if (0 != (mask & StateFields.STATE_PRESSURE)) {
                state_data_mask[9] = true;
                state.pressure =
                    data.getUint32(b.index, 1) / 256.0;  // pressure (Q24.8)
                b.add(4);
            }
            if (0 != (mask & StateFields.STATE_RX_PPM)) {
                state_data_mask[10] = true;
                b.parseInt16Array(data, state.ppm);
            }
            if (0 != (mask & StateFields.STATE_AUX_CHAN_MASK)) {
                state_data_mask[11] = true;
                state.AUX_chan_mask = data.getUint8(b.index, 1);
                b.add(1);
            }
            if (0 != (mask & StateFields.STATE_COMMANDS)) {
                state_data_mask[12] = true;
                b.parseInt16Array(data, state.command);
            }
            if (0 != (mask & StateFields.STATE_F_AND_T)) {
                state_data_mask[13] = true;
                b.parseFloat32Array(data, state.control);
            }
            if (0 != (mask & StateFields.STATE_PID_FZ_MASTER)) {
                state_data_mask[15] = true;
                parse_pid_data(data, state.pid_master_Fz, b);
            }
            if (0 != (mask & StateFields.STATE_PID_TX_MASTER)) {
                state_data_mask[16] = true;
                parse_pid_data(data, state.pid_master_Tx, b);
            }
            if (0 != (mask & StateFields.STATE_PID_TY_MASTER)) {
                state_data_mask[17] = true;
                parse_pid_data(data, state.pid_master_Ty, b);
            }
            if (0 != (mask & StateFields.STATE_PID_TZ_MASTER)) {
                state_data_mask[18] = true;
                parse_pid_data(data, state.pid_master_Tz, b);
            }
            if (0 != (mask & StateFields.STATE_PID_FZ_SLAVE)) {
                state_data_mask[19] = true;
                parse_pid_data(data, state.pid_slave_Fz, b);
            }
            if (0 != (mask & StateFields.STATE_PID_TX_SLAVE)) {
                state_data_mask[20] = true;
                parse_pid_data(data, state.pid_slave_Tx, b);
            }
            if (0 != (mask & StateFields.STATE_PID_TY_SLAVE)) {
                state_data_mask[21] = true;
                parse_pid_data(data, state.pid_slave_Ty, b);
            }
            if (0 != (mask & StateFields.STATE_PID_TZ_SLAVE)) {
                state_data_mask[22] = true;
                parse_pid_data(data, state.pid_slave_Tz, b);
            }
            if (0 != (mask & StateFields.STATE_MOTOR_OUT)) {
                state_data_mask[23] = true;
                b.parseInt16Array(data, state.MotorOut);
            }
            if (0 != (mask & StateFields.STATE_KINE_ANGLE)) {
                state_data_mask[24] = true;
                b.parseFloat32Array(data, state.kinematicsAngle);
            }
            if (0 != (mask & StateFields.STATE_KINE_RATE)) {
                state_data_mask[25] = true;
                b.parseFloat32Array(data, state.kinematicsRate);
            }
            if (0 != (mask & StateFields.STATE_KINE_ALTITUDE)) {
                state_data_mask[26] = true;
                state.kinematicsAltitude = data.getFloat32(b.index, 1);
                b.add(4);
            }
            if (0 != (mask & StateFields.STATE_LOOP_COUNT)) {
                state_data_mask[27] = true;
                state.loopCount = data.getUint32(b.index, 1);
                b.add(4);
            }
            cb_state(state, state_data_mask, serial_update_rate_Hz);
        }
    }
}());
