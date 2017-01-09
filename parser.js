(function() {
    'use strict';

    angular.module('flybrixCommon').factory('parser', parser);

    parser.$inject =
        ['commandLog', 'serializer', 'encodable', 'firmwareVersion'];

    function parser(commandLog, serializer, encodable, firmwareVersion) {
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
                (1 << 8) | (1 << 9) | (1 << 10) | (1 << 11) | (1 << 12),
            COM_SET_COMMAND_OVERRIDE: 1 << 13,
            COM_SET_STATE_MASK: 1 << 14,
            COM_SET_STATE_DELAY: 1 << 15,
            COM_SET_SD_WRITE_DELAY: 1 << 16,
            COM_SET_LED: 1 << 17,
            COM_SET_SERIAL_RC: 1 << 18,
            COM_SET_CARD_RECORDING: 1 << 19,
            COM_SET_PARTIAL_EEPROM_DATA: 1 << 20,
            COM_REINIT_PARTIAL_EEPROM_DATA: 1 << 21,
            COM_REQ_PARTIAL_EEPROM_DATA: 1 << 22,
            COM_REQ_CARD_RECORDING_STATE: 1 << 23,
            COM_SET_PARTIAL_TEMPORARY_CONFIG: 1 << 24,
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

        var stateHandler = (function() {
            var e = encodable;
            var pidHandler = e.polyarray([
                e.Uint32, e.Float32, e.Float32, e.Float32, e.Float32, e.Float32
            ]);
            return e.map([
                {key: 'timestamp_us', element: e.Uint32},
                {key: 'status', element: e.Uint16},
                {key: 'V0_raw', element: e.Uint16},
                {key: 'I0_raw', element: e.Uint16},
                {key: 'I1_raw', element: e.Uint16},
                {key: 'accel', element: e.array(3, e.Float32)},
                {key: 'gyro', element: e.array(3, e.Float32)},
                {key: 'mag', element: e.array(3, e.Float32)},
                {key: 'temperature', element: e.Uint16},
                {key: 'pressure', element: e.Uint32},
                {key: 'ppm', element: e.array(6, e.Int16)},
                {key: 'AUX_chan_mask', element: e.Uint8},
                // throttle, pitch, roll, yaw
                {key: 'command', element: e.array(4, e.Int16)},
                // Fz, Tx, Ty, Tz
                {key: 'control', element: e.array(4, e.Float32)},
                {key: 'UNUSED', element: e.map([])},
                // time, input, setpoint, p_term, i_term, d_term
                {key: 'pid_master_Fz', element: pidHandler},
                {key: 'pid_master_Tx', element: pidHandler},
                {key: 'pid_master_Ty', element: pidHandler},
                {key: 'pid_master_Tz', element: pidHandler},
                {key: 'pid_slave_Fz', element: pidHandler},
                {key: 'pid_slave_Tx', element: pidHandler},
                {key: 'pid_slave_Ty', element: pidHandler},
                {key: 'pid_slave_Tz', element: pidHandler},
                {key: 'MotorOut', element: e.array(8, e.Int16)},
                {key: 'kinematicsAngle', element: e.array(3, e.Float32)},
                {key: 'kinematicsRate', element: e.array(3, e.Float32)},
                {key: 'kinematicsAltitude', element: e.Float32},
                {key: 'loopCount', element: e.Uint32},
            ]);
        }());

        function processBinaryDatastream(
            command, mask, message_buffer, cb_state, cb_command, cb_ack) {
            dispatch(command, mask, message_buffer, function() {
                callbackStateHelper(mask, message_buffer, cb_state)
            }, cb_command, cb_ack);
        }

        function dispatch(
            command, mask, message_buffer, cb_state, cb_command, cb_ack) {
            switch (command) {
                case MessageType.State:
                    cb_state(mask, message_buffer);
                    break;
                case MessageType.Command:
                    cb_command(mask, message_buffer);
                    break;
                case MessageType.DebugString:
                    var debug_string = arraybuffer2string(message_buffer);
                    commandLog(
                        'Received <span style="color: orange">' +
                        'DEBUG' +
                        '</span>: ' + debug_string);
                    break;
                case MessageType.HistoryData:
                    var debug_string = arraybuffer2string(message_buffer);
                    commandLog(
                        'Received <span style="color: orange">' +
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

        function callbackStateHelper(mask, message_buffer, cb_state) {
            var state = stateHandler.empty();
            var state_data_mask = [];  // TODO: get rid of this in general
            var data = new DataView(message_buffer, 0);
            var b = new serializer();
            var serial_update_rate_Hz = 0;

            mask &= firmwareVersion.stateMask();

            stateHandler.children.forEach(function(child, idx) {
                var submask = (1 << idx);
                if (!(mask & submask)) {
                    return;
                }
                state_data_mask[idx] = true;
                var handler = child.element;
                var key = child.key;
                state[key] = handler.decode(data, b);
            });

            if (mask & StateFields.STATE_MICROS) {
                serial_update_rate_Hz =
                    1000000 / (state.timestamp_us - last_timestamp_us);
                last_timestamp_us = state.timestamp_us;
            }
            if (mask & StateFields.STATE_TEMPERATURE) {
                state.temperature /= 100.0;  // temperature
            }
            if (mask & StateFields.STATE_PRESSURE) {
                state.pressure /= 256.0;  // pressure (Q24.8)
            }
            cb_state(state, state_data_mask, serial_update_rate_Hz);
        }

        return {
            processBinaryDatastream: processBinaryDatastream,
            MessageType: MessageType,
            CommandFields: CommandFields,
            StatusCodes: StatusCodes,
        };
    }
}());
