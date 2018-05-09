(function() {
    'use strict';

    angular.module('flybrixCommon', []);
}());

(function() {
    'use strict';

    angular.module('flybrixCommon').factory('calibration', calibration);

    calibration.$inject = ['commandLog', 'serial'];

    function calibration(commandLog, serial) {
        return {
            magnetometer: magnetometer,
            accelerometer: {
                flat: calibrateAccelerometer.bind(null, 'flat', 0),
                forward: calibrateAccelerometer.bind(null, 'lean forward', 1),
                back: calibrateAccelerometer.bind(null, 'lean back', 2),
                right: calibrateAccelerometer.bind(null, 'lean right', 3),
                left: calibrateAccelerometer.bind(null, 'lean left', 4),
            },
            finish: finish,
        };

        function magnetometer() {
            commandLog("Calibrating magnetometer bias");
            return serial.sendStructure('Command', {
                request_response: true,
                set_calibration: {
                    enabled: true,
                    mode: 0,
                },
            }, false);
        }

        function calibrateAccelerometer(poseDescription, poseId) {
            commandLog("Calibrating gravity for pose: " + poseDescription);
            return serial.sendStructure('Command', {
                request_response: true,
                set_calibration: {
                    enabled: true,
                    mode: poseId + 1,
                },
            }, false);
        }

        function finish() {
            commandLog("Finishing calibration");
            return serial.sendStructure('Command', {
                request_response: true,
                set_calibration: {
                    enabled: false,
                    mode: 0,
                },
            }, false);
        }
    }
}());

(function() {
    'use strict';

    angular.module('flybrixCommon').factory('cobs', cobs);

    function cobs() {
        return {
            Reader: Reader,
            encode: encode,
        };
    }


    function Reader(capacity) {
        if (capacity === undefined) {
            capacity = 2000;
        }
        this.N = capacity;
        this.buffer = new Uint8Array(capacity);
        this.ready_for_new_message = true;
        this.buffer_length = 0;
    }

    function cobsDecode(reader) {
        var src_ptr = 0;
        var dst_ptr = 0;
        var leftover_length = 0;
        var append_zero = false;
        while (reader.buffer[src_ptr]) {
            if (!leftover_length) {
                if (append_zero)
                    reader.buffer[dst_ptr++] = 0;
                leftover_length = reader.buffer[src_ptr++] - 1;
                append_zero = leftover_length < 0xFE;
            } else {
                --leftover_length;
                reader.buffer[dst_ptr++] = reader.buffer[src_ptr++];
            }
        }

        return leftover_length ? 0 : dst_ptr;
    }

    Reader.prototype.readBytes = function(data, onSuccess, onError) {
        for (var i = 0; i < data.length; i++) {
            var c = data[i];
            if (this.ready_for_new_message) {
                // first byte of a new message
                this.ready_for_new_message = false;
                this.buffer_length = 0;
            }

            this.buffer[this.buffer_length++] = c;

            if (c) {
                if (this.buffer_length === this.N) {
                    // buffer overflow, probably due to errors in data
                    onError('overflow', 'buffer overflow in COBS decoding');
                    this.ready_for_new_message = true;
                }
                continue;
            }

            this.buffer_length = cobsDecode(this);
            var failed_decode = (this.buffer_length === 0);
            if (failed_decode) {
                this.buffer[0] = 1;
            }
            var j;
            for (j = 1; j < this.buffer_length; ++j) {
                this.buffer[0] ^= this.buffer[j];
            }
            if (this.buffer[0] === 0) {  // check sum is correct
                this.ready_for_new_message = true;
                if (this.buffer_length > 0) {
                    onSuccess(this.buffer.slice(1, this.buffer_length));
                } else {
                    onError('short', 'Too short packet');
                }
            } else {  // bad checksum
                this.ready_for_new_message = true;
                var bytes = "";
                var message = "";
                for (j = 0; j < this.buffer_length; j++) {
                    bytes += this.buffer[j] + ",";
                    message += String.fromCharCode(this.buffer[j]);
                }
                if (failed_decode) {
                    onError('frame', 'Unexpected ending of packet');
                } else {
                    var msg = 'BAD CHECKSUM (' + this.buffer_length +
                        ' bytes)' + bytes + message;
                    onError('checksum', msg);
                }
            }
        }
    };

    function encode(buf) {
        var retval =
            new Uint8Array(Math.floor((buf.byteLength * 255 + 761) / 254));
        var len = 1;
        var pos_ctr = 0;
        for (var i = 0; i < buf.length; ++i) {
            if (retval[pos_ctr] == 0xFE) {
                retval[pos_ctr] = 0xFF;
                pos_ctr = len++;
                retval[pos_ctr] = 0;
            }
            var val = buf[i];
            ++retval[pos_ctr];
            if (val) {
                retval[len++] = val;
            } else {
                pos_ctr = len++;
                retval[pos_ctr] = 0;
            }
        }
        return retval.subarray(0, len).slice().buffer;
    };
}());

(function() {
    'use strict';

    angular.module('flybrixCommon').factory('commandLog', commandLog);

    commandLog.$inject = ['$q'];

    function commandLog($q) {
        var messages = [];
        var responder = $q.defer();

        var service = log;
        service.log = log;
        service.clearSubscribers = clearSubscribers;
        service.onMessage = onMessage;
        service.read = read;

        return service;

        function log(message) {
            if (message !== undefined) {
                messages.push(message);
                responder.notify(read());
            }
        }

        function read() {
            return messages;
        }

        function clearSubscribers() {
            responder = $q.defer();
        }

        function onMessage(callback) {
            return responder.promise.then(undefined, undefined, callback);
        }
    }
}());

(function() {
    'use strict';

    angular.module('flybrixCommon').factory('deviceConfig', deviceConfig);

    deviceConfig.$inject = ['serial', 'commandLog', 'firmwareVersion', 'serializationHandler'];

    function deviceConfig(serial, commandLog, firmwareVersion, serializationHandler) {
        var config;

        var configCallback = function() {
            commandLog('No callback defined for receiving configurations!');
        };

        var loggingCallback = function() {
            commandLog(
                'No callback defined for receiving logging state!' +
                ' Callback arguments: (isLogging, isLocked, delay)');
        };

        serial.addOnReceiveCallback(function(messageType, message) {
            if (messageType !== 'Command') {
                return;
            }
            if ('set_eeprom_data' in message) {
                updateConfigFromRemoteData(message.set_eeprom_data);
            }
            if ('set_partial_eeprom_data' in message) {
                updateConfigFromRemoteData(message.set_partial_eeprom_data);
            }
            if (('set_card_recording_state' in message) && ('set_sd_write_delay' in message)) {
                var card_rec_state = message.set_card_recording_state;
                var sd_write_delay = message.set_sd_write_delay;
                loggingCallback(card_rec_state.record_to_card, card_rec_state.lock_recording_state, sd_write_delay);
            }
        });

        function getDesiredVersion() {
            return firmwareVersion.desired();
        }


        function request() {
            var handlers = firmwareVersion.serializationHandler();
            commandLog('Requesting current configuration data...');
            return serial.sendStructure('Command', {
                request_response: true,
                req_partial_eeprom_data: handlers.ConfigurationFlag.empty(),
            }, false);
        }

        function reinit() {
            commandLog('Setting factory default configuration data...');
            return serial.sendStructure('Command', {
                request_response: true,
                reinit_eeprom_data: true,
            }, false)
                .then(
                    function() {
                        return request();
                    },
                    function(reason) {
                        commandLog(
                            'Request for factory reset failed: ' + reason);
                    });
        }

        function send(newConfig) {
            return sendConfig({ config: newConfig, temporary: false, requestUpdate: true });
        }

        function sendConfig(properties) {
            var handlers = firmwareVersion.serializationHandler();
            var mask = properties.mask || handlers.ConfigurationFlag.empty();
            var newConfig = properties.config || config;
            var requestUpdate = properties.requestUpdate || false;
            var message = {
                request_response: true,
            };
            if (properties.temporary) {
                message.set_partial_temporary_config = newConfig;
            } else {
                message.set_partial_eeprom_data = newConfig;
            }
            return serial.sendStructure('Command', message, true, mask).then(function() {
                if (requestUpdate) {
                    request();
                }
            });
        }

        function updateConfigFromRemoteData(configChanges) {
            //commandLog('Received config!');
            config = serializationHandler.updateFields(config, configChanges);
            firmwareVersion.set(config.version);
            if (!firmwareVersion.supported()) {
                commandLog('Received an unsupported configuration!');
                commandLog(
                    'Found version: ' + config.version[0] + '.' +
                    config.version[1] + '.' + config.version[2]  +
                    ' --- Newest version: ' +
                    firmwareVersion.desiredKey() );
            } else {
                commandLog(
                    'Received configuration data (v' +
                    config.version[0] + '.' + config.version[1] + '.' +
                    config.version[2] +')');
                configCallback();
            }
        }

        function setConfigCallback(callback) {
            configCallback = callback;
        }

        function setLoggingCallback(callback) {
            loggingCallback = callback;
        }

        function getConfig() {
            return config;
        }

        config = firmwareVersion.serializationHandler().Configuration.empty();

        return {
            request: request,
            reinit: reinit,
            send: send,
            sendConfig: sendConfig,
            getConfig: getConfig,
            setConfigCallback: setConfigCallback,
            setLoggingCallback: setLoggingCallback,
            getDesiredVersion: getDesiredVersion,
        };
    }
}());

(function() {
    'use strict';

    angular.module('flybrixCommon').factory('firmwareVersion', firmwareVersion);

    firmwareVersion.$inject = ['serializationHandler'];

    function firmwareVersion(serializationHandler) {
        var version = [0, 0, 0];
        var key = '0.0.0';
        var supported = {
            '1.4.0': true,
            '1.5.0': true,
            '1.5.1': true,
            '1.6.0': true,
        };

        var desired = [1, 6, 0];
        var desiredKey = '1.6.0';

        var defaultSerializationHandler = serializationHandler.getHandler(desiredKey);
        var currentSerializationHandler = defaultSerializationHandler;

        return {
            set: function(value) {
                version = value;
                key = value.join('.');
                currentSerializationHandler =
                    serializationHandler.getHandler(desiredKey) || defaultSerializationHandler;
            },
            get: function() {
                return version;
            },
            key: function() {
                return key;
            },
            supported: function() {
                return supported[key] === true;
            },
            desired: function() {
                return desired;
            },
            desiredKey: function() {
                return desiredKey;
            },
            serializationHandler: function() {
                return currentSerializationHandler;
            },
        };
    }

}());

(function() {
    'use strict';

    angular.module('flybrixCommon').factory('led', led);

    led.$inject = ['deviceConfig', 'firmwareVersion'];

    function led(deviceConfig, firmwareVersion) {
        var LedPatterns = {
            NO_OVERRIDE: 0,
            FLASH: 1,
            BEACON: 2,
            BREATHE: 3,
            ALTERNATE: 4,
            SOLID: 5,
        };

        var keys = ['right_front', 'right_back', 'left_front', 'left_back'];
        var colors = {};

        keys.forEach(function(key) {
            colors[key] = {
                red: 0,
                green: 0,
                blue: 0,
            }
        });

        var ledState = {
            status: 65535,
            pattern: LedPatterns.SOLID,
            colors: colors,
            indicator_red: false,
            indicator_green: false,
        };

        var configPart = { led_states: [ledState] };

        function set(
            color_rf, color_rb, color_lf, color_lb, pattern, red, green) {
            ledState.status = firmwareVersion.serializationHandler().StatusFlag.empty();
            if (pattern > 0 && pattern < 6) {
                ledState.pattern = pattern;
            }
            [color_rf, color_rb, color_lf, color_lb].forEach(function(
                color, idx) {
                if (!color) {
                    return;
                }
                var v = colors[keys[idx]];
                v.red = color.red;
                v.green = color.green;
                v.blue = color.blue;
            });
            if (red !== undefined) {
                ledState.indicator_red = red;
            }
            if (green !== undefined) {
                ledState.indicator_green = green;
            }

            apply();
        }

        function setSimple(red, green, blue) {
            var color = {red: red || 0, green: green || 0, blue: blue || 0};
            set(color, color, color, color, LedPatterns.SOLID);
        }

        function apply() {
            deviceConfig.sendConfig({
                config: configPart,
                temporary: true,
            });
        }

        return {
            set: set,
            setSimple: setSimple,
            patterns: LedPatterns,
        };
    }

}());

(function() {
    'use strict';

    angular.module('flybrixCommon').factory('rcData', rcData);

    rcData.$inject = ['serial'];

    function rcData(serial) {
        var AUX = {
            LOW: 0,
            MID: 1,
            HIGH: 2,
        };
        var auxNames = ['low', 'mid', 'high'];

        var throttle = -1;
        var pitch = 0;
        var roll = 0;
        var yaw = 0;
        // defaults to high -- low is enabling; high is disabling
        var aux1 = AUX.HIGH;
        // defaults to ?? -- need to check transmitter behavior
        var aux2 = AUX.HIGH;

        var urgent = true;

        return {
            setThrottle: setThrottle,
            setPitch: setPitch,
            setRoll: setRoll,
            setYaw: setYaw,
            setAux1: setAux1,
            setAux2: setAux2,
            getThrottle: getThrottle,
            getPitch: getPitch,
            getRoll: getRoll,
            getYaw: getYaw,
            getAux1: getAux1,
            getAux2: getAux2,
            AUX: AUX,
            send: send,
            forceNextSend: forceNextSend,
        };

        function send() {
            if (!urgent && serial.busy()) {
                return;
            }
            urgent = false;

            var command = {};

            // invert pitch and roll
            var throttle_threshold =
                -0.8;  // keep bottom 10% of throttle stick to mean 'off'
            command.throttle = constrain(
                (throttle - throttle_threshold) * 4095 /
                    (1 - throttle_threshold),
                0, 4095);
            command.pitch =
                constrain(-(applyDeadzone(pitch, 0.1)) * 4095 / 2, -2047, 2047);
            command.roll =
                constrain((applyDeadzone(roll, 0.1)) * 4095 / 2, -2047, 2047);
            command.yaw =
                constrain(-(applyDeadzone(yaw, 0.1)) * 4095 / 2, -2047, 2047);

            var aux_mask = {};
            // aux1_low, aux1_mid, aux1_high, and same with aux2
            aux_mask['aux1_' + auxNames[aux1]] = true;
            aux_mask['aux2_' + auxNames[aux2]] = true;

            return serial.sendStructure('Command', {
                request_response: true,
                set_serial_rc: {
                    enabled: true,
                    command: command,
                    aux_mask: aux_mask,
                },
            }, false);
        }

        function setThrottle(v) {
            throttle = v;
        }

        function setPitch(v) {
            pitch = v;
        }

        function setRoll(v) {
            roll = v;
        }

        function setYaw(v) {
            yaw = v;
        }

        function setAux1(v) {
            aux1 = Math.max(0, Math.min(2, v));
        }

        function setAux2(v) {
            aux2 = Math.max(0, Math.min(2, v));
        }

        function getThrottle() {
            return throttle;
        }

        function getPitch() {
            return pitch;
        }

        function getRoll() {
            return roll;
        }

        function getYaw() {
            return yaw;
        }

        function getAux1() {
            return aux1;
        }

        function getAux2() {
            return aux2;
        }

        function forceNextSend() {
            urgent = true;
        }

        function constrain(x, xmin, xmax) {
            return Math.max(xmin, Math.min(x, xmax));
        }

        function applyDeadzone(value, deadzone) {
            if (value > deadzone) {
                return value - deadzone;
            }
            if (value < -deadzone) {
                return value + deadzone;
            }
            return 0;
        }
    }
}());

(function() {
    'use strict';

    angular.module('flybrixCommon').factory('serial', serial);

    serial.$inject = ['$timeout', '$q', 'cobs', 'commandLog', 'firmwareVersion', 'serializationHandler'];

    function serial($timeout, $q, cobs, commandLog, firmwareVersion, serializationHandler) {
        var MessageType = {
            State: 0,
            Command: 1,
            DebugString: 3,
            HistoryData: 4,
            Response: 255,
        };

        var acknowledges = [];
        var backend = new Backend();

        var onReceiveListeners = [];

        var cobsReader = new cobs.Reader(2000);
        var bytesHandler = undefined;

        function Backend() {
        }

        Backend.prototype.busy = function() {
            return false;
        };

        Backend.prototype.send = function(data) {
            commandLog('No "send" defined for serial backend');
        };

        Backend.prototype.onRead = function(data) {
            commandLog('No "onRead" defined for serial backend');
        };

        var MessageTypeInversion = [];
        Object.keys(MessageType).forEach(function(key) {
            MessageTypeInversion[MessageType[key]] = key;
        });

        addOnReceiveCallback(function(messageType, message) {
            if (messageType === 'Response') {
                acknowledge(message.mask, message.ack);
            }
        });

        return {
            busy: busy,
            sendStructure: sendStructure,
            setBackend: setBackend,
            addOnReceiveCallback: addOnReceiveCallback,
            removeOnReceiveCallback: removeOnReceiveCallback,
            setBytesHandler: setBytesHandler,
            handlePostConnect: handlePostConnect,
            Backend: Backend,
        };

        function setBackend(v) {
            backend = v;
            backend.onRead = read;
        }

        function handlePostConnect() {
            return requestFirmwareVersion();
        }

        function requestFirmwareVersion() {
            return sendStructure('Command', {
                request_response: true,
                req_partial_eeprom_data: {
                    version: true,
                },
            });
        }

        function sendStructure(messageType, data, log_send, extraMask) {
            if (messageType === 'State') {
                data = processStateOutput(data);
            }
            var handlers = firmwareVersion.serializationHandler();

            var response = $q.defer();
            if (!(messageType in MessageType)) {
                response.reject('Message type "' + messageType +
                    '" not supported by app, supported message types are:' +
                    Object.keys(MessageType).join(', '));
                return response.promise;
            }
            if (!(messageType in handlers)) {
                response.reject('Message type "' + messageType +
                    '" not supported by firmware, supported message types are:' +
                    Object.keys(handlers).join(', '));
                return response.promise;
            }
            var typeCode = MessageType[messageType];
            var handler = handlers[messageType];

            var buffer = new Uint8Array(handler.byteCount);

            var serializer = new serializationHandler.Serializer(new DataView(buffer.buffer));
            handler.encode(serializer, data, extraMask);
            var mask = handler.maskArray(data, extraMask);
            if (mask.length < 5) {
                mask = (mask[0] << 0) | (mask[1] << 8) | (mask[2] << 16) | (mask[3] << 24);
            }

            var dataLength = serializer.index;

            var output = new Uint8Array(dataLength + 3);
            output[0] = output[1] = typeCode;
            for (var idx = 0; idx < dataLength; ++idx) {
                output[0] ^= output[idx + 2] = buffer[idx];
            }
            output[dataLength + 2] = 0;

            acknowledges.push({
                mask: mask,
                response: response,
            });

            $timeout(function() {
                backend.send(new Uint8Array(cobs.encode(output)));
            }, 0);

            if (log_send) {
                commandLog('Sending command ' + typeCode);
            }

            return response.promise;
        }

        function busy() {
            return backend.busy();
        }

        function setBytesHandler(handler) {
            bytesHandler = handler;
        }

        function read(data) {
            if (bytesHandler)
                bytesHandler(data, processData);
            else
                cobsReader.readBytes(data, processData, reportIssues);
        }

        function reportIssues(issue, text) {
            commandLog('COBS decoding failed (' + issue + '): ' + text);
        }

        function addOnReceiveCallback(callback) {
            onReceiveListeners = onReceiveListeners.concat([callback]);
        }

        function removeOnReceiveCallback(callback) {
            onReceiveListeners = onReceiveListeners.filter(function(cb) {
                return cb === callback;
            });
        }

        function acknowledge(mask, value) {
            while (acknowledges.length > 0) {
                var v = acknowledges.shift();
                if (v.mask ^ mask) {
                    v.response.reject('Missing ACK');
                    continue;
                }
                var relaxedMask = mask;
                relaxedMask &= ~1;
                if (relaxedMask ^ value) {
                    v.response.reject('Request was not fully processed');
                    break;
                }
                v.response.resolve();
                break;
            }
        }

        function processData(bytes) {
            var messageType = MessageTypeInversion[bytes[0]];
            var handler = firmwareVersion.serializationHandler()[messageType];
            if (!messageType || !handler) {
                commandLog('Illegal message type passed from firmware');
                return;
            }
            var serializer = new serializationHandler.Serializer(new DataView(bytes.buffer, 1));
            var message = handler.decode(serializer);
            if (messageType === 'State') {
                message = processStateInput(message);
            }
            onReceiveListeners.forEach(function(listener) {
                listener(messageType, message);
            });
        }

        var last_timestamp_us = 0;

        function processStateInput(state) {
            state = Object.assign({}, state);
            var serial_update_rate_Hz = 0;

            if ('timestamp_us' in state) {
                state.serial_update_rate_estimate = 1000000 / (state.timestamp_us - last_timestamp_us);
                last_timestamp_us = state.timestamp_us;
            }
            if ('temperature' in state) {
                state.temperature /= 100.0;  // temperature given in Celsius * 100
            }
            if ('pressure' in state) {
                state.pressure /= 256.0;  // pressure given in (Q24.8) format
            }

            return state;
        }

        function processStateOutput(state) {
            state = Object.assign({}, state);
            if ('temperature' in state) {
                state.temperature *= 100.0;
            }
            if ('pressure' in state) {
                state.pressure *= 256.0;
            }
            return state;
        }
    }
}());

(function () {
    'use strict';

    serializationHandler.$inject = [];

    angular.module('flybrixCommon').factory('serializationHandler', serializationHandler);

    function serializationHandler() {
        var handlerCache = {};
        var version = 'Version = { major: u8, minor: u8, patch: u8 };';
        var configId = 'ConfigID = u32;';

        var vector3f = 'Vector3f = { x: f32, y: f32, z: f32 };';

        var pcbTransform = 'PcbTransform = { orientation: Vector3f, translation: Vector3f };';
        var mixTable = 'MixTable = { fz: [i8:8], tx: [i8:8], ty: [i8:8], tz: [i8:8] };';
        var magBias = 'MagBias = { offset: Vector3f };';
        var channelProperties = 'ChannelProperties = {' +
            'assignment: [u8:6],' +
            'inversion: u8,' +
            'midpoint: [u16:6],' +
            'deadzone: [u16:6] };';

        var pidSettings = 'PIDSettings = {' +
            'kp: f32,' +
            'ki: f32,' +
            'kd: f32,' +
            'integral_windup_guard: f32,' +
            'd_filter_time: f32,' +
            'setpoint_filter_time: f32,' +
            'command_to_value: f32 };';
        var pidParameters14 = 'PIDParameters = {' +
            'thrust_master: PIDSettings,' +
            'pitch_master: PIDSettings,' +
            'roll_master: PIDSettings,' +
            'yaw_master: PIDSettings,' +
            'thrust_slave: PIDSettings,' +
            'pitch_slave: PIDSettings,' +
            'roll_slave: PIDSettings,' +
            'yaw_slave: PIDSettings,' +
            'pid_bypass: u8 };';
        var pidParameters = 'PIDParameters = {' +
            'thrust_master: PIDSettings,' +
            'pitch_master: PIDSettings,' +
            'roll_master: PIDSettings,' +
            'yaw_master: PIDSettings,' +
            'thrust_slave: PIDSettings,' +
            'pitch_slave: PIDSettings,' +
            'roll_slave: PIDSettings,' +
            'yaw_slave: PIDSettings,' +
            'thrust_gain: f32,' +
            'pitch_gain: f32,' +
            'roll_gain: f32,' +
            'yaw_gain: f32,' +
            'pid_bypass: u8 };';

        var stateParameters = 'StateParameters = { state_estimation: [f32:2], enable: [f32:2] };';

        var statusFlag1415 = 'StatusFlag = {/16/' +
            'boot: void,' +
            'mpu_fail: void,' +
            'bmp_fail: void,' +
            'rx_fail: void,' +
            'idle: void,' +
            'enabling: void,' +
            'clear_mpu_bias: void,' +
            'set_mpu_bias: void,' +
            'fail_stability: void,' +
            'fail_angle: void,' +
            'enabled: void,' +
            'battery_low: void,' +
            'temp_warning: void,' +
            'log_full: void,' +
            'fail_other: void,' +
            'override: void };';

        var statusFlag = 'StatusFlag = {/16/' +
            '_0: void,' +
            '_1: void,' +
            '_2: void,' +
            'no_signal: void,' +
            'idle: void,' +
            'arming: void,' +
            'recording_sd: void,' +
            '_7: void,' +
            'loop_slow: void,' +
            '_9: void,' +
            'armed: void,' +
            'battery_low: void,' +
            'battery_critical: void,' +
            'log_full: void,' +
            'crash_detected: void,' +
            'override: void };';

        var color = 'Color = { red: u8, green: u8, blue: u8 };';
        var ledStateCase = 'LEDStateCase = {' +
            'status: StatusFlag,' +
            'pattern: u8,' +
            'color_right_front: Color,' +
            'color_right_back: Color,' +
            'color_left_front: Color,' +
            'color_left_back: Color,' +
            'indicator_red: bool,' +
            'indicator_green: bool };';
        var ledStates = 'LEDStates = [/16/LEDStateCase:16];';
        var ledStatesFixed = 'LEDStatesFixed = [LEDStateCase:16];';

        var deviceName = 'DeviceName = s9;';

        var velocityPidParameters = 'VelocityPIDParameters = {' +
            'forward_master: PIDSettings,' +
            'right_master: PIDSettings,' +
            'up_master: PIDSettings,' +
            'forward_slave: PIDSettings,' +
            'right_slave: PIDSettings,' +
            'up_slave: PIDSettings,' +
            'pid_bypass: u8 };';

        var inertialBias = 'InertialBias = { accel: Vector3f, gyro: Vector3f };';

        var config1415 = 'Configuration = {/16/' +
            'version: Version,' +
            'config_id: ConfigID,' +
            'pcb_transform: PcbTransform,' +
            'mix_table: MixTable,' +
            'mag_bias: MagBias,' +
            'channel: ChannelProperties,' +
            'pid_parameters: PIDParameters,' +
            'state_parameters: StateParameters,' +
            'led_states: LEDStates,' +
            'device_name: DeviceName };';

        var configFixed1415 = 'ConfigurationFixed = {' +
            'version: Version,' +
            'config_id: ConfigID,' +
            'pcb_transform: PcbTransform,' +
            'mix_table: MixTable,' +
            'mag_bias: MagBias,' +
            'channel: ChannelProperties,' +
            'pid_parameters: PIDParameters,' +
            'state_parameters: StateParameters,' +
            'led_states: LEDStatesFixed,' +
            'device_name: DeviceName };';

        var config = 'Configuration = {/16/' +
            'version: Version,' +
            'config_id: ConfigID,' +
            'pcb_transform: PcbTransform,' +
            'mix_table: MixTable,' +
            'mag_bias: MagBias,' +
            'channel: ChannelProperties,' +
            'pid_parameters: PIDParameters,' +
            'state_parameters: StateParameters,' +
            'led_states: LEDStates,' +
            'device_name: DeviceName,' +
            'velocity_pid_parameters: VelocityPIDParameters,' +
            'inertial_bias: InertialBias };';

        var configFixed = 'ConfigurationFixed = {' +
            'version: Version,' +
            'config_id: ConfigID,' +
            'pcb_transform: PcbTransform,' +
            'mix_table: MixTable,' +
            'mag_bias: MagBias,' +
            'channel: ChannelProperties,' +
            'pid_parameters: PIDParameters,' +
            'state_parameters: StateParameters,' +
            'led_states: LEDStatesFixed,' +
            'device_name: DeviceName,' +
            'velocity_pid_parameters: VelocityPIDParameters,' +
            'inertial_bias: InertialBias };';

        var configFlag14 = 'ConfigurationFlag = {/16/' +
            'version: void,' +
            'config_id: void,' +
            'pcb_transform: void,' +
            'mix_table: void,' +
            'mag_bias: void,' +
            'channel: void,' +
            'pid_parameters: void,' +
            'state_parameters: void,' +
            'led_states: [// void:16],' +
            'device_name: void};';

        var configFlag = 'ConfigurationFlag = {/16/' +
            'version: void,' +
            'config_id: void,' +
            'pcb_transform: void,' +
            'mix_table: void,' +
            'mag_bias: void,' +
            'channel: void,' +
            'pid_parameters: void,' +
            'state_parameters: void,' +
            'led_states: [// void:16],' +
            'device_name: void,' +
            'velocity_pid_parameters: void,' +
            'inertial_bias: void };';

        var configFull14 = vector3f + pidSettings + version + configId + pcbTransform +
            mixTable + magBias + channelProperties + pidParameters14 + stateParameters +
            statusFlag1415 + color + ledStateCase + ledStates + ledStatesFixed + deviceName +
            config1415 + configFixed1415 + configFlag14;
        var configFull15 = vector3f + pidSettings + version + configId + pcbTransform + mixTable +
            magBias + channelProperties + pidParameters + stateParameters +
            statusFlag1415 + color + ledStateCase + ledStates + ledStatesFixed + deviceName +
            config1415 + configFixed1415 + configFlag;
        var configFull16 = vector3f + pidSettings + version + configId + pcbTransform + mixTable +
            magBias + channelProperties + pidParameters + stateParameters +
            statusFlag + color + ledStateCase + ledStates + ledStatesFixed + deviceName +
            inertialBias + velocityPidParameters +
            config + configFixed + configFlag;

        var state = 'Rotation = { roll: f32, pitch: f32, yaw: f32 };' +
            'PIDState = {' +
            'timestamp_us: u32,' +
            'input: f32,' +
            'setpoint: f32,' +
            'p_term: f32,' +
            'i_term: f32,' +
            'd_term: f32 };' +
            'RcCommand = { throttle: i16, pitch: i16, roll: i16, yaw: i16 };' +
            'State = {/32/' +
            'timestamp_us: u32,' +
            'status: StatusFlag,' +
            'v0_raw: u16,' +
            'i0_raw: u16,' +
            'i1_raw: u16,' +
            'accel: Vector3f,' +
            'gyro: Vector3f,' +
            'mag: Vector3f,' +
            'temperature: u16,' +
            'pressure: u32,' +
            'ppm: [i16:6],' +
            'aux_chan_mask: u8,' +
            'command: RcCommand,' +
            'control: { fz: f32, tx: f32, ty: f32, tz: f32 },' +
            'pid_master_fz: PIDState,' +
            'pid_master_tx: PIDState,' +
            'pid_master_ty: PIDState,' +
            'pid_master_tz: PIDState,' +
            'pid_slave_fz: PIDState,' +
            'pid_slave_tx: PIDState,' +
            'pid_slave_ty: PIDState,' +
            'pid_slave_tz: PIDState,' +
            'motor_out: [i16:8],' +
            'kinematics_angle: Rotation,' +
            'kinematics_rate: Rotation,' +
            'kinematics_altitude: f32,' +
            'loop_count: u32 };';

        var auxMask = 'AuxMask = {//' +
            'aux1_low: void,' +
            'aux1_mid: void,' +
            'aux1_high: void,' +
            'aux2_low: void,' +
            'aux2_mid: void,' +
            'aux2_high: void };';

        var commands = auxMask + 'Command = {/32/' +
            'request_response: void,' +
            'set_eeprom_data: ConfigurationFixed,' +
            'reinit_eeprom_data: void,' +
            'request_eeprom_data: void,' +
            'request_enable_iteration: u8,' +
            'motor_override_speed_0: u16,' +
            'motor_override_speed_1: u16,' +
            'motor_override_speed_2: u16,' +
            'motor_override_speed_3: u16,' +
            'motor_override_speed_4: u16,' +
            'motor_override_speed_5: u16,' +
            'motor_override_speed_6: u16,' +
            'motor_override_speed_7: u16,' +
            'set_command_override: bool,' +
            'set_state_mask: u32,' +
            'set_state_delay: u16,' +
            'set_sd_write_delay: u16,' +
            'set_led: {' +
            '  pattern: u8,' +
            '  color_right: Color,' +
            '  color_left: Color,' +
            '  indicator_red: bool,' +
            '  indicator_green: bool },' +
            'set_serial_rc: { enabled: bool, command: RcCommand, aux_mask: AuxMask },' +
            'set_card_recording_state: {/8/ record_to_card: void, lock_recording_state: void },' +
            'set_partial_eeprom_data: Configuration,' +
            'reinit_partial_eeprom_data: ConfigurationFlag,' +
            'req_partial_eeprom_data: ConfigurationFlag,' +
            'req_card_recording_state: void,' +
            'set_partial_temporary_config: Configuration,' +
            'set_command_sources: {/8/ serial: void, radio: void },' +
            'set_calibration: { enabled: bool, mode: u8 },' +
            'set_autopilot_enabled: bool,' +
            'set_usb_mode: u8};';

        var debugString = "DebugString = { deprecated_mask: u32, message: s };";
        var historyData = "HistoryData = DebugString;";
        var response = "Response = { mask: u32, ack: u32 };";

        var handler14 = configFull14 + state + commands + debugString + historyData + response;
        var handler15 = configFull15 + state + commands + debugString + historyData + response;
        var handler16 = configFull16 + state + commands + debugString + historyData + response;

        handlerCache['1.4.0'] = FlybrixSerialization.parse(handler14);
        handlerCache['1.5.0'] = handlerCache['1.5.1'] = FlybrixSerialization.parse(handler15);
        handlerCache['1.6.0'] = FlybrixSerialization.parse(handler16);

        function updateFields(target, source) {
            if (source instanceof Array) {
                return updateFieldsArray(target, source);
            } else if (source instanceof Object) {
                return updateFieldsObject(target, source);
            } else {
                return (source === null || source === undefined) ? target : source;
            }
        }

        function updateFieldsObject(target, source) {
            var result = {};
            Object.keys(target).forEach(function (key) {
                result[key] = updateFields(target[key], source[key]);
            });
            Object.keys(source).forEach(function (key) {
                if (key in result) {
                    return;
                }
                result[key] = updateFields(target[key], source[key]);
            });
            return result;
        }

        function updateFieldsArray(target, source) {
            var length = Math.max(target.length, source.length);
            var result = [];
            for (var idx = 0; idx < length; ++idx) {
                result.push(updateFields(target[idx], source[idx]));
            }
            return result;
        }

        return {
            Serializer: FlybrixSerialization.Serializer,
            getHandler: function (firmware) {
                return handlerCache[firmware];
            },
            updateFields: updateFields,
        };
    }

}());

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZS5qcyIsImNhbGlicmF0aW9uLmpzIiwiY29icy5qcyIsImNvbW1hbmRMb2cuanMiLCJkZXZpY2VDb25maWcuanMiLCJmaXJtd2FyZVZlcnNpb24uanMiLCJsZWQuanMiLCJyY0RhdGEuanMiLCJzZXJpYWwuanMiLCJzZXJpYWxpemF0aW9uSGFuZGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2T0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJmbHlicml4LWNvbW1vbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgnZmx5YnJpeENvbW1vbicsIFtdKTtcclxufSgpKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdmbHlicml4Q29tbW9uJykuZmFjdG9yeSgnY2FsaWJyYXRpb24nLCBjYWxpYnJhdGlvbik7XHJcblxyXG4gICAgY2FsaWJyYXRpb24uJGluamVjdCA9IFsnY29tbWFuZExvZycsICdzZXJpYWwnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBjYWxpYnJhdGlvbihjb21tYW5kTG9nLCBzZXJpYWwpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBtYWduZXRvbWV0ZXI6IG1hZ25ldG9tZXRlcixcclxuICAgICAgICAgICAgYWNjZWxlcm9tZXRlcjoge1xyXG4gICAgICAgICAgICAgICAgZmxhdDogY2FsaWJyYXRlQWNjZWxlcm9tZXRlci5iaW5kKG51bGwsICdmbGF0JywgMCksXHJcbiAgICAgICAgICAgICAgICBmb3J3YXJkOiBjYWxpYnJhdGVBY2NlbGVyb21ldGVyLmJpbmQobnVsbCwgJ2xlYW4gZm9yd2FyZCcsIDEpLFxyXG4gICAgICAgICAgICAgICAgYmFjazogY2FsaWJyYXRlQWNjZWxlcm9tZXRlci5iaW5kKG51bGwsICdsZWFuIGJhY2snLCAyKSxcclxuICAgICAgICAgICAgICAgIHJpZ2h0OiBjYWxpYnJhdGVBY2NlbGVyb21ldGVyLmJpbmQobnVsbCwgJ2xlYW4gcmlnaHQnLCAzKSxcclxuICAgICAgICAgICAgICAgIGxlZnQ6IGNhbGlicmF0ZUFjY2VsZXJvbWV0ZXIuYmluZChudWxsLCAnbGVhbiBsZWZ0JywgNCksXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGZpbmlzaDogZmluaXNoLFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIG1hZ25ldG9tZXRlcigpIHtcclxuICAgICAgICAgICAgY29tbWFuZExvZyhcIkNhbGlicmF0aW5nIG1hZ25ldG9tZXRlciBiaWFzXCIpO1xyXG4gICAgICAgICAgICByZXR1cm4gc2VyaWFsLnNlbmRTdHJ1Y3R1cmUoJ0NvbW1hbmQnLCB7XHJcbiAgICAgICAgICAgICAgICByZXF1ZXN0X3Jlc3BvbnNlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgc2V0X2NhbGlicmF0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZW5hYmxlZDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBtb2RlOiAwLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSwgZmFsc2UpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gY2FsaWJyYXRlQWNjZWxlcm9tZXRlcihwb3NlRGVzY3JpcHRpb24sIHBvc2VJZCkge1xyXG4gICAgICAgICAgICBjb21tYW5kTG9nKFwiQ2FsaWJyYXRpbmcgZ3Jhdml0eSBmb3IgcG9zZTogXCIgKyBwb3NlRGVzY3JpcHRpb24pO1xyXG4gICAgICAgICAgICByZXR1cm4gc2VyaWFsLnNlbmRTdHJ1Y3R1cmUoJ0NvbW1hbmQnLCB7XHJcbiAgICAgICAgICAgICAgICByZXF1ZXN0X3Jlc3BvbnNlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgc2V0X2NhbGlicmF0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZW5hYmxlZDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBtb2RlOiBwb3NlSWQgKyAxLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSwgZmFsc2UpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZmluaXNoKCkge1xyXG4gICAgICAgICAgICBjb21tYW5kTG9nKFwiRmluaXNoaW5nIGNhbGlicmF0aW9uXCIpO1xyXG4gICAgICAgICAgICByZXR1cm4gc2VyaWFsLnNlbmRTdHJ1Y3R1cmUoJ0NvbW1hbmQnLCB7XHJcbiAgICAgICAgICAgICAgICByZXF1ZXN0X3Jlc3BvbnNlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgc2V0X2NhbGlicmF0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZW5hYmxlZDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgbW9kZTogMCxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0sIGZhbHNlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgnZmx5YnJpeENvbW1vbicpLmZhY3RvcnkoJ2NvYnMnLCBjb2JzKTtcclxuXHJcbiAgICBmdW5jdGlvbiBjb2JzKCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIFJlYWRlcjogUmVhZGVyLFxyXG4gICAgICAgICAgICBlbmNvZGU6IGVuY29kZSxcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBmdW5jdGlvbiBSZWFkZXIoY2FwYWNpdHkpIHtcclxuICAgICAgICBpZiAoY2FwYWNpdHkgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBjYXBhY2l0eSA9IDIwMDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuTiA9IGNhcGFjaXR5O1xyXG4gICAgICAgIHRoaXMuYnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoY2FwYWNpdHkpO1xyXG4gICAgICAgIHRoaXMucmVhZHlfZm9yX25ld19tZXNzYWdlID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmJ1ZmZlcl9sZW5ndGggPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNvYnNEZWNvZGUocmVhZGVyKSB7XHJcbiAgICAgICAgdmFyIHNyY19wdHIgPSAwO1xyXG4gICAgICAgIHZhciBkc3RfcHRyID0gMDtcclxuICAgICAgICB2YXIgbGVmdG92ZXJfbGVuZ3RoID0gMDtcclxuICAgICAgICB2YXIgYXBwZW5kX3plcm8gPSBmYWxzZTtcclxuICAgICAgICB3aGlsZSAocmVhZGVyLmJ1ZmZlcltzcmNfcHRyXSkge1xyXG4gICAgICAgICAgICBpZiAoIWxlZnRvdmVyX2xlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGFwcGVuZF96ZXJvKVxyXG4gICAgICAgICAgICAgICAgICAgIHJlYWRlci5idWZmZXJbZHN0X3B0cisrXSA9IDA7XHJcbiAgICAgICAgICAgICAgICBsZWZ0b3Zlcl9sZW5ndGggPSByZWFkZXIuYnVmZmVyW3NyY19wdHIrK10gLSAxO1xyXG4gICAgICAgICAgICAgICAgYXBwZW5kX3plcm8gPSBsZWZ0b3Zlcl9sZW5ndGggPCAweEZFO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLS1sZWZ0b3Zlcl9sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICByZWFkZXIuYnVmZmVyW2RzdF9wdHIrK10gPSByZWFkZXIuYnVmZmVyW3NyY19wdHIrK107XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBsZWZ0b3Zlcl9sZW5ndGggPyAwIDogZHN0X3B0cjtcclxuICAgIH1cclxuXHJcbiAgICBSZWFkZXIucHJvdG90eXBlLnJlYWRCeXRlcyA9IGZ1bmN0aW9uKGRhdGEsIG9uU3VjY2Vzcywgb25FcnJvcikge1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgYyA9IGRhdGFbaV07XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnJlYWR5X2Zvcl9uZXdfbWVzc2FnZSkge1xyXG4gICAgICAgICAgICAgICAgLy8gZmlyc3QgYnl0ZSBvZiBhIG5ldyBtZXNzYWdlXHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlYWR5X2Zvcl9uZXdfbWVzc2FnZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5idWZmZXJfbGVuZ3RoID0gMDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5idWZmZXJbdGhpcy5idWZmZXJfbGVuZ3RoKytdID0gYztcclxuXHJcbiAgICAgICAgICAgIGlmIChjKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5idWZmZXJfbGVuZ3RoID09PSB0aGlzLk4pIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBidWZmZXIgb3ZlcmZsb3csIHByb2JhYmx5IGR1ZSB0byBlcnJvcnMgaW4gZGF0YVxyXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IoJ292ZXJmbG93JywgJ2J1ZmZlciBvdmVyZmxvdyBpbiBDT0JTIGRlY29kaW5nJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWFkeV9mb3JfbmV3X21lc3NhZ2UgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuYnVmZmVyX2xlbmd0aCA9IGNvYnNEZWNvZGUodGhpcyk7XHJcbiAgICAgICAgICAgIHZhciBmYWlsZWRfZGVjb2RlID0gKHRoaXMuYnVmZmVyX2xlbmd0aCA9PT0gMCk7XHJcbiAgICAgICAgICAgIGlmIChmYWlsZWRfZGVjb2RlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJ1ZmZlclswXSA9IDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIGo7XHJcbiAgICAgICAgICAgIGZvciAoaiA9IDE7IGogPCB0aGlzLmJ1ZmZlcl9sZW5ndGg7ICsraikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5idWZmZXJbMF0gXj0gdGhpcy5idWZmZXJbal07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoaXMuYnVmZmVyWzBdID09PSAwKSB7ICAvLyBjaGVjayBzdW0gaXMgY29ycmVjdFxyXG4gICAgICAgICAgICAgICAgdGhpcy5yZWFkeV9mb3JfbmV3X21lc3NhZ2UgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYnVmZmVyX2xlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBvblN1Y2Nlc3ModGhpcy5idWZmZXIuc2xpY2UoMSwgdGhpcy5idWZmZXJfbGVuZ3RoKSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IoJ3Nob3J0JywgJ1RvbyBzaG9ydCBwYWNrZXQnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHsgIC8vIGJhZCBjaGVja3N1bVxyXG4gICAgICAgICAgICAgICAgdGhpcy5yZWFkeV9mb3JfbmV3X21lc3NhZ2UgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgdmFyIGJ5dGVzID0gXCJcIjtcclxuICAgICAgICAgICAgICAgIHZhciBtZXNzYWdlID0gXCJcIjtcclxuICAgICAgICAgICAgICAgIGZvciAoaiA9IDA7IGogPCB0aGlzLmJ1ZmZlcl9sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGJ5dGVzICs9IHRoaXMuYnVmZmVyW2pdICsgXCIsXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZSArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKHRoaXMuYnVmZmVyW2pdKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChmYWlsZWRfZGVjb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcignZnJhbWUnLCAnVW5leHBlY3RlZCBlbmRpbmcgb2YgcGFja2V0Jyk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBtc2cgPSAnQkFEIENIRUNLU1VNICgnICsgdGhpcy5idWZmZXJfbGVuZ3RoICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJyBieXRlcyknICsgYnl0ZXMgKyBtZXNzYWdlO1xyXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IoJ2NoZWNrc3VtJywgbXNnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgZnVuY3Rpb24gZW5jb2RlKGJ1Zikge1xyXG4gICAgICAgIHZhciByZXR2YWwgPVxyXG4gICAgICAgICAgICBuZXcgVWludDhBcnJheShNYXRoLmZsb29yKChidWYuYnl0ZUxlbmd0aCAqIDI1NSArIDc2MSkgLyAyNTQpKTtcclxuICAgICAgICB2YXIgbGVuID0gMTtcclxuICAgICAgICB2YXIgcG9zX2N0ciA9IDA7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBidWYubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICAgICAgaWYgKHJldHZhbFtwb3NfY3RyXSA9PSAweEZFKSB7XHJcbiAgICAgICAgICAgICAgICByZXR2YWxbcG9zX2N0cl0gPSAweEZGO1xyXG4gICAgICAgICAgICAgICAgcG9zX2N0ciA9IGxlbisrO1xyXG4gICAgICAgICAgICAgICAgcmV0dmFsW3Bvc19jdHJdID0gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgdmFsID0gYnVmW2ldO1xyXG4gICAgICAgICAgICArK3JldHZhbFtwb3NfY3RyXTtcclxuICAgICAgICAgICAgaWYgKHZhbCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dmFsW2xlbisrXSA9IHZhbDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHBvc19jdHIgPSBsZW4rKztcclxuICAgICAgICAgICAgICAgIHJldHZhbFtwb3NfY3RyXSA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJldHZhbC5zdWJhcnJheSgwLCBsZW4pLnNsaWNlKCkuYnVmZmVyO1xyXG4gICAgfTtcclxufSgpKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdmbHlicml4Q29tbW9uJykuZmFjdG9yeSgnY29tbWFuZExvZycsIGNvbW1hbmRMb2cpO1xyXG5cclxuICAgIGNvbW1hbmRMb2cuJGluamVjdCA9IFsnJHEnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBjb21tYW5kTG9nKCRxKSB7XHJcbiAgICAgICAgdmFyIG1lc3NhZ2VzID0gW107XHJcbiAgICAgICAgdmFyIHJlc3BvbmRlciA9ICRxLmRlZmVyKCk7XHJcblxyXG4gICAgICAgIHZhciBzZXJ2aWNlID0gbG9nO1xyXG4gICAgICAgIHNlcnZpY2UubG9nID0gbG9nO1xyXG4gICAgICAgIHNlcnZpY2UuY2xlYXJTdWJzY3JpYmVycyA9IGNsZWFyU3Vic2NyaWJlcnM7XHJcbiAgICAgICAgc2VydmljZS5vbk1lc3NhZ2UgPSBvbk1lc3NhZ2U7XHJcbiAgICAgICAgc2VydmljZS5yZWFkID0gcmVhZDtcclxuXHJcbiAgICAgICAgcmV0dXJuIHNlcnZpY2U7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGxvZyhtZXNzYWdlKSB7XHJcbiAgICAgICAgICAgIGlmIChtZXNzYWdlICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIG1lc3NhZ2VzLnB1c2gobWVzc2FnZSk7XHJcbiAgICAgICAgICAgICAgICByZXNwb25kZXIubm90aWZ5KHJlYWQoKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHJlYWQoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBtZXNzYWdlcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGNsZWFyU3Vic2NyaWJlcnMoKSB7XHJcbiAgICAgICAgICAgIHJlc3BvbmRlciA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBvbk1lc3NhZ2UoY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbmRlci5wcm9taXNlLnRoZW4odW5kZWZpbmVkLCB1bmRlZmluZWQsIGNhbGxiYWNrKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgnZmx5YnJpeENvbW1vbicpLmZhY3RvcnkoJ2RldmljZUNvbmZpZycsIGRldmljZUNvbmZpZyk7XHJcblxyXG4gICAgZGV2aWNlQ29uZmlnLiRpbmplY3QgPSBbJ3NlcmlhbCcsICdjb21tYW5kTG9nJywgJ2Zpcm13YXJlVmVyc2lvbicsICdzZXJpYWxpemF0aW9uSGFuZGxlciddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGRldmljZUNvbmZpZyhzZXJpYWwsIGNvbW1hbmRMb2csIGZpcm13YXJlVmVyc2lvbiwgc2VyaWFsaXphdGlvbkhhbmRsZXIpIHtcclxuICAgICAgICB2YXIgY29uZmlnO1xyXG5cclxuICAgICAgICB2YXIgY29uZmlnQ2FsbGJhY2sgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgY29tbWFuZExvZygnTm8gY2FsbGJhY2sgZGVmaW5lZCBmb3IgcmVjZWl2aW5nIGNvbmZpZ3VyYXRpb25zIScpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHZhciBsb2dnaW5nQ2FsbGJhY2sgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgY29tbWFuZExvZyhcclxuICAgICAgICAgICAgICAgICdObyBjYWxsYmFjayBkZWZpbmVkIGZvciByZWNlaXZpbmcgbG9nZ2luZyBzdGF0ZSEnICtcclxuICAgICAgICAgICAgICAgICcgQ2FsbGJhY2sgYXJndW1lbnRzOiAoaXNMb2dnaW5nLCBpc0xvY2tlZCwgZGVsYXkpJyk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgc2VyaWFsLmFkZE9uUmVjZWl2ZUNhbGxiYWNrKGZ1bmN0aW9uKG1lc3NhZ2VUeXBlLCBtZXNzYWdlKSB7XHJcbiAgICAgICAgICAgIGlmIChtZXNzYWdlVHlwZSAhPT0gJ0NvbW1hbmQnKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCdzZXRfZWVwcm9tX2RhdGEnIGluIG1lc3NhZ2UpIHtcclxuICAgICAgICAgICAgICAgIHVwZGF0ZUNvbmZpZ0Zyb21SZW1vdGVEYXRhKG1lc3NhZ2Uuc2V0X2VlcHJvbV9kYXRhKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoJ3NldF9wYXJ0aWFsX2VlcHJvbV9kYXRhJyBpbiBtZXNzYWdlKSB7XHJcbiAgICAgICAgICAgICAgICB1cGRhdGVDb25maWdGcm9tUmVtb3RlRGF0YShtZXNzYWdlLnNldF9wYXJ0aWFsX2VlcHJvbV9kYXRhKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoKCdzZXRfY2FyZF9yZWNvcmRpbmdfc3RhdGUnIGluIG1lc3NhZ2UpICYmICgnc2V0X3NkX3dyaXRlX2RlbGF5JyBpbiBtZXNzYWdlKSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGNhcmRfcmVjX3N0YXRlID0gbWVzc2FnZS5zZXRfY2FyZF9yZWNvcmRpbmdfc3RhdGU7XHJcbiAgICAgICAgICAgICAgICB2YXIgc2Rfd3JpdGVfZGVsYXkgPSBtZXNzYWdlLnNldF9zZF93cml0ZV9kZWxheTtcclxuICAgICAgICAgICAgICAgIGxvZ2dpbmdDYWxsYmFjayhjYXJkX3JlY19zdGF0ZS5yZWNvcmRfdG9fY2FyZCwgY2FyZF9yZWNfc3RhdGUubG9ja19yZWNvcmRpbmdfc3RhdGUsIHNkX3dyaXRlX2RlbGF5KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXREZXNpcmVkVmVyc2lvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZpcm13YXJlVmVyc2lvbi5kZXNpcmVkKCk7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gcmVxdWVzdCgpIHtcclxuICAgICAgICAgICAgdmFyIGhhbmRsZXJzID0gZmlybXdhcmVWZXJzaW9uLnNlcmlhbGl6YXRpb25IYW5kbGVyKCk7XHJcbiAgICAgICAgICAgIGNvbW1hbmRMb2coJ1JlcXVlc3RpbmcgY3VycmVudCBjb25maWd1cmF0aW9uIGRhdGEuLi4nKTtcclxuICAgICAgICAgICAgcmV0dXJuIHNlcmlhbC5zZW5kU3RydWN0dXJlKCdDb21tYW5kJywge1xyXG4gICAgICAgICAgICAgICAgcmVxdWVzdF9yZXNwb25zZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHJlcV9wYXJ0aWFsX2VlcHJvbV9kYXRhOiBoYW5kbGVycy5Db25maWd1cmF0aW9uRmxhZy5lbXB0eSgpLFxyXG4gICAgICAgICAgICB9LCBmYWxzZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiByZWluaXQoKSB7XHJcbiAgICAgICAgICAgIGNvbW1hbmRMb2coJ1NldHRpbmcgZmFjdG9yeSBkZWZhdWx0IGNvbmZpZ3VyYXRpb24gZGF0YS4uLicpO1xyXG4gICAgICAgICAgICByZXR1cm4gc2VyaWFsLnNlbmRTdHJ1Y3R1cmUoJ0NvbW1hbmQnLCB7XHJcbiAgICAgICAgICAgICAgICByZXF1ZXN0X3Jlc3BvbnNlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgcmVpbml0X2VlcHJvbV9kYXRhOiB0cnVlLFxyXG4gICAgICAgICAgICB9LCBmYWxzZSlcclxuICAgICAgICAgICAgICAgIC50aGVuKFxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVxdWVzdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24ocmVhc29uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbW1hbmRMb2coXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnUmVxdWVzdCBmb3IgZmFjdG9yeSByZXNldCBmYWlsZWQ6ICcgKyByZWFzb24pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2VuZChuZXdDb25maWcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHNlbmRDb25maWcoeyBjb25maWc6IG5ld0NvbmZpZywgdGVtcG9yYXJ5OiBmYWxzZSwgcmVxdWVzdFVwZGF0ZTogdHJ1ZSB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNlbmRDb25maWcocHJvcGVydGllcykge1xyXG4gICAgICAgICAgICB2YXIgaGFuZGxlcnMgPSBmaXJtd2FyZVZlcnNpb24uc2VyaWFsaXphdGlvbkhhbmRsZXIoKTtcclxuICAgICAgICAgICAgdmFyIG1hc2sgPSBwcm9wZXJ0aWVzLm1hc2sgfHwgaGFuZGxlcnMuQ29uZmlndXJhdGlvbkZsYWcuZW1wdHkoKTtcclxuICAgICAgICAgICAgdmFyIG5ld0NvbmZpZyA9IHByb3BlcnRpZXMuY29uZmlnIHx8IGNvbmZpZztcclxuICAgICAgICAgICAgdmFyIHJlcXVlc3RVcGRhdGUgPSBwcm9wZXJ0aWVzLnJlcXVlc3RVcGRhdGUgfHwgZmFsc2U7XHJcbiAgICAgICAgICAgIHZhciBtZXNzYWdlID0ge1xyXG4gICAgICAgICAgICAgICAgcmVxdWVzdF9yZXNwb25zZTogdHJ1ZSxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgaWYgKHByb3BlcnRpZXMudGVtcG9yYXJ5KSB7XHJcbiAgICAgICAgICAgICAgICBtZXNzYWdlLnNldF9wYXJ0aWFsX3RlbXBvcmFyeV9jb25maWcgPSBuZXdDb25maWc7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBtZXNzYWdlLnNldF9wYXJ0aWFsX2VlcHJvbV9kYXRhID0gbmV3Q29uZmlnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBzZXJpYWwuc2VuZFN0cnVjdHVyZSgnQ29tbWFuZCcsIG1lc3NhZ2UsIHRydWUsIG1hc2spLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAocmVxdWVzdFVwZGF0ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3QoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiB1cGRhdGVDb25maWdGcm9tUmVtb3RlRGF0YShjb25maWdDaGFuZ2VzKSB7XHJcbiAgICAgICAgICAgIC8vY29tbWFuZExvZygnUmVjZWl2ZWQgY29uZmlnIScpO1xyXG4gICAgICAgICAgICBjb25maWcgPSBzZXJpYWxpemF0aW9uSGFuZGxlci51cGRhdGVGaWVsZHMoY29uZmlnLCBjb25maWdDaGFuZ2VzKTtcclxuICAgICAgICAgICAgZmlybXdhcmVWZXJzaW9uLnNldChjb25maWcudmVyc2lvbik7XHJcbiAgICAgICAgICAgIGlmICghZmlybXdhcmVWZXJzaW9uLnN1cHBvcnRlZCgpKSB7XHJcbiAgICAgICAgICAgICAgICBjb21tYW5kTG9nKCdSZWNlaXZlZCBhbiB1bnN1cHBvcnRlZCBjb25maWd1cmF0aW9uIScpO1xyXG4gICAgICAgICAgICAgICAgY29tbWFuZExvZyhcclxuICAgICAgICAgICAgICAgICAgICAnRm91bmQgdmVyc2lvbjogJyArIGNvbmZpZy52ZXJzaW9uWzBdICsgJy4nICtcclxuICAgICAgICAgICAgICAgICAgICBjb25maWcudmVyc2lvblsxXSArICcuJyArIGNvbmZpZy52ZXJzaW9uWzJdICArXHJcbiAgICAgICAgICAgICAgICAgICAgJyAtLS0gTmV3ZXN0IHZlcnNpb246ICcgK1xyXG4gICAgICAgICAgICAgICAgICAgIGZpcm13YXJlVmVyc2lvbi5kZXNpcmVkS2V5KCkgKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbW1hbmRMb2coXHJcbiAgICAgICAgICAgICAgICAgICAgJ1JlY2VpdmVkIGNvbmZpZ3VyYXRpb24gZGF0YSAodicgK1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZy52ZXJzaW9uWzBdICsgJy4nICsgY29uZmlnLnZlcnNpb25bMV0gKyAnLicgK1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZy52ZXJzaW9uWzJdICsnKScpO1xyXG4gICAgICAgICAgICAgICAgY29uZmlnQ2FsbGJhY2soKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2V0Q29uZmlnQ2FsbGJhY2soY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgY29uZmlnQ2FsbGJhY2sgPSBjYWxsYmFjaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNldExvZ2dpbmdDYWxsYmFjayhjYWxsYmFjaykge1xyXG4gICAgICAgICAgICBsb2dnaW5nQ2FsbGJhY2sgPSBjYWxsYmFjaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdldENvbmZpZygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGNvbmZpZztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbmZpZyA9IGZpcm13YXJlVmVyc2lvbi5zZXJpYWxpemF0aW9uSGFuZGxlcigpLkNvbmZpZ3VyYXRpb24uZW1wdHkoKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVxdWVzdDogcmVxdWVzdCxcclxuICAgICAgICAgICAgcmVpbml0OiByZWluaXQsXHJcbiAgICAgICAgICAgIHNlbmQ6IHNlbmQsXHJcbiAgICAgICAgICAgIHNlbmRDb25maWc6IHNlbmRDb25maWcsXHJcbiAgICAgICAgICAgIGdldENvbmZpZzogZ2V0Q29uZmlnLFxyXG4gICAgICAgICAgICBzZXRDb25maWdDYWxsYmFjazogc2V0Q29uZmlnQ2FsbGJhY2ssXHJcbiAgICAgICAgICAgIHNldExvZ2dpbmdDYWxsYmFjazogc2V0TG9nZ2luZ0NhbGxiYWNrLFxyXG4gICAgICAgICAgICBnZXREZXNpcmVkVmVyc2lvbjogZ2V0RGVzaXJlZFZlcnNpb24sXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufSgpKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdmbHlicml4Q29tbW9uJykuZmFjdG9yeSgnZmlybXdhcmVWZXJzaW9uJywgZmlybXdhcmVWZXJzaW9uKTtcclxuXHJcbiAgICBmaXJtd2FyZVZlcnNpb24uJGluamVjdCA9IFsnc2VyaWFsaXphdGlvbkhhbmRsZXInXTtcclxuXHJcbiAgICBmdW5jdGlvbiBmaXJtd2FyZVZlcnNpb24oc2VyaWFsaXphdGlvbkhhbmRsZXIpIHtcclxuICAgICAgICB2YXIgdmVyc2lvbiA9IFswLCAwLCAwXTtcclxuICAgICAgICB2YXIga2V5ID0gJzAuMC4wJztcclxuICAgICAgICB2YXIgc3VwcG9ydGVkID0ge1xyXG4gICAgICAgICAgICAnMS40LjAnOiB0cnVlLFxyXG4gICAgICAgICAgICAnMS41LjAnOiB0cnVlLFxyXG4gICAgICAgICAgICAnMS41LjEnOiB0cnVlLFxyXG4gICAgICAgICAgICAnMS42LjAnOiB0cnVlLFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHZhciBkZXNpcmVkID0gWzEsIDYsIDBdO1xyXG4gICAgICAgIHZhciBkZXNpcmVkS2V5ID0gJzEuNi4wJztcclxuXHJcbiAgICAgICAgdmFyIGRlZmF1bHRTZXJpYWxpemF0aW9uSGFuZGxlciA9IHNlcmlhbGl6YXRpb25IYW5kbGVyLmdldEhhbmRsZXIoZGVzaXJlZEtleSk7XHJcbiAgICAgICAgdmFyIGN1cnJlbnRTZXJpYWxpemF0aW9uSGFuZGxlciA9IGRlZmF1bHRTZXJpYWxpemF0aW9uSGFuZGxlcjtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgdmVyc2lvbiA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAga2V5ID0gdmFsdWUuam9pbignLicpO1xyXG4gICAgICAgICAgICAgICAgY3VycmVudFNlcmlhbGl6YXRpb25IYW5kbGVyID1cclxuICAgICAgICAgICAgICAgICAgICBzZXJpYWxpemF0aW9uSGFuZGxlci5nZXRIYW5kbGVyKGRlc2lyZWRLZXkpIHx8IGRlZmF1bHRTZXJpYWxpemF0aW9uSGFuZGxlcjtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB2ZXJzaW9uO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBrZXk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGtleTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc3VwcG9ydGVkOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBzdXBwb3J0ZWRba2V5XSA9PT0gdHJ1ZTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZGVzaXJlZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZGVzaXJlZDtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZGVzaXJlZEtleTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZGVzaXJlZEtleTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc2VyaWFsaXphdGlvbkhhbmRsZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnRTZXJpYWxpemF0aW9uSGFuZGxlcjtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxufSgpKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdmbHlicml4Q29tbW9uJykuZmFjdG9yeSgnbGVkJywgbGVkKTtcclxuXHJcbiAgICBsZWQuJGluamVjdCA9IFsnZGV2aWNlQ29uZmlnJywgJ2Zpcm13YXJlVmVyc2lvbiddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGxlZChkZXZpY2VDb25maWcsIGZpcm13YXJlVmVyc2lvbikge1xyXG4gICAgICAgIHZhciBMZWRQYXR0ZXJucyA9IHtcclxuICAgICAgICAgICAgTk9fT1ZFUlJJREU6IDAsXHJcbiAgICAgICAgICAgIEZMQVNIOiAxLFxyXG4gICAgICAgICAgICBCRUFDT046IDIsXHJcbiAgICAgICAgICAgIEJSRUFUSEU6IDMsXHJcbiAgICAgICAgICAgIEFMVEVSTkFURTogNCxcclxuICAgICAgICAgICAgU09MSUQ6IDUsXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdmFyIGtleXMgPSBbJ3JpZ2h0X2Zyb250JywgJ3JpZ2h0X2JhY2snLCAnbGVmdF9mcm9udCcsICdsZWZ0X2JhY2snXTtcclxuICAgICAgICB2YXIgY29sb3JzID0ge307XHJcblxyXG4gICAgICAgIGtleXMuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcclxuICAgICAgICAgICAgY29sb3JzW2tleV0gPSB7XHJcbiAgICAgICAgICAgICAgICByZWQ6IDAsXHJcbiAgICAgICAgICAgICAgICBncmVlbjogMCxcclxuICAgICAgICAgICAgICAgIGJsdWU6IDAsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdmFyIGxlZFN0YXRlID0ge1xyXG4gICAgICAgICAgICBzdGF0dXM6IDY1NTM1LFxyXG4gICAgICAgICAgICBwYXR0ZXJuOiBMZWRQYXR0ZXJucy5TT0xJRCxcclxuICAgICAgICAgICAgY29sb3JzOiBjb2xvcnMsXHJcbiAgICAgICAgICAgIGluZGljYXRvcl9yZWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICBpbmRpY2F0b3JfZ3JlZW46IGZhbHNlLFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHZhciBjb25maWdQYXJ0ID0geyBsZWRfc3RhdGVzOiBbbGVkU3RhdGVdIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNldChcclxuICAgICAgICAgICAgY29sb3JfcmYsIGNvbG9yX3JiLCBjb2xvcl9sZiwgY29sb3JfbGIsIHBhdHRlcm4sIHJlZCwgZ3JlZW4pIHtcclxuICAgICAgICAgICAgbGVkU3RhdGUuc3RhdHVzID0gZmlybXdhcmVWZXJzaW9uLnNlcmlhbGl6YXRpb25IYW5kbGVyKCkuU3RhdHVzRmxhZy5lbXB0eSgpO1xyXG4gICAgICAgICAgICBpZiAocGF0dGVybiA+IDAgJiYgcGF0dGVybiA8IDYpIHtcclxuICAgICAgICAgICAgICAgIGxlZFN0YXRlLnBhdHRlcm4gPSBwYXR0ZXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFtjb2xvcl9yZiwgY29sb3JfcmIsIGNvbG9yX2xmLCBjb2xvcl9sYl0uZm9yRWFjaChmdW5jdGlvbihcclxuICAgICAgICAgICAgICAgIGNvbG9yLCBpZHgpIHtcclxuICAgICAgICAgICAgICAgIGlmICghY29sb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB2YXIgdiA9IGNvbG9yc1trZXlzW2lkeF1dO1xyXG4gICAgICAgICAgICAgICAgdi5yZWQgPSBjb2xvci5yZWQ7XHJcbiAgICAgICAgICAgICAgICB2LmdyZWVuID0gY29sb3IuZ3JlZW47XHJcbiAgICAgICAgICAgICAgICB2LmJsdWUgPSBjb2xvci5ibHVlO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgaWYgKHJlZCAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICBsZWRTdGF0ZS5pbmRpY2F0b3JfcmVkID0gcmVkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChncmVlbiAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICBsZWRTdGF0ZS5pbmRpY2F0b3JfZ3JlZW4gPSBncmVlbjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgYXBwbHkoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNldFNpbXBsZShyZWQsIGdyZWVuLCBibHVlKSB7XHJcbiAgICAgICAgICAgIHZhciBjb2xvciA9IHtyZWQ6IHJlZCB8fCAwLCBncmVlbjogZ3JlZW4gfHwgMCwgYmx1ZTogYmx1ZSB8fCAwfTtcclxuICAgICAgICAgICAgc2V0KGNvbG9yLCBjb2xvciwgY29sb3IsIGNvbG9yLCBMZWRQYXR0ZXJucy5TT0xJRCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBhcHBseSgpIHtcclxuICAgICAgICAgICAgZGV2aWNlQ29uZmlnLnNlbmRDb25maWcoe1xyXG4gICAgICAgICAgICAgICAgY29uZmlnOiBjb25maWdQYXJ0LFxyXG4gICAgICAgICAgICAgICAgdGVtcG9yYXJ5OiB0cnVlLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHNldDogc2V0LFxyXG4gICAgICAgICAgICBzZXRTaW1wbGU6IHNldFNpbXBsZSxcclxuICAgICAgICAgICAgcGF0dGVybnM6IExlZFBhdHRlcm5zLFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG59KCkpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ2ZseWJyaXhDb21tb24nKS5mYWN0b3J5KCdyY0RhdGEnLCByY0RhdGEpO1xyXG5cclxuICAgIHJjRGF0YS4kaW5qZWN0ID0gWydzZXJpYWwnXTtcclxuXHJcbiAgICBmdW5jdGlvbiByY0RhdGEoc2VyaWFsKSB7XHJcbiAgICAgICAgdmFyIEFVWCA9IHtcclxuICAgICAgICAgICAgTE9XOiAwLFxyXG4gICAgICAgICAgICBNSUQ6IDEsXHJcbiAgICAgICAgICAgIEhJR0g6IDIsXHJcbiAgICAgICAgfTtcclxuICAgICAgICB2YXIgYXV4TmFtZXMgPSBbJ2xvdycsICdtaWQnLCAnaGlnaCddO1xyXG5cclxuICAgICAgICB2YXIgdGhyb3R0bGUgPSAtMTtcclxuICAgICAgICB2YXIgcGl0Y2ggPSAwO1xyXG4gICAgICAgIHZhciByb2xsID0gMDtcclxuICAgICAgICB2YXIgeWF3ID0gMDtcclxuICAgICAgICAvLyBkZWZhdWx0cyB0byBoaWdoIC0tIGxvdyBpcyBlbmFibGluZzsgaGlnaCBpcyBkaXNhYmxpbmdcclxuICAgICAgICB2YXIgYXV4MSA9IEFVWC5ISUdIO1xyXG4gICAgICAgIC8vIGRlZmF1bHRzIHRvID8/IC0tIG5lZWQgdG8gY2hlY2sgdHJhbnNtaXR0ZXIgYmVoYXZpb3JcclxuICAgICAgICB2YXIgYXV4MiA9IEFVWC5ISUdIO1xyXG5cclxuICAgICAgICB2YXIgdXJnZW50ID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgc2V0VGhyb3R0bGU6IHNldFRocm90dGxlLFxyXG4gICAgICAgICAgICBzZXRQaXRjaDogc2V0UGl0Y2gsXHJcbiAgICAgICAgICAgIHNldFJvbGw6IHNldFJvbGwsXHJcbiAgICAgICAgICAgIHNldFlhdzogc2V0WWF3LFxyXG4gICAgICAgICAgICBzZXRBdXgxOiBzZXRBdXgxLFxyXG4gICAgICAgICAgICBzZXRBdXgyOiBzZXRBdXgyLFxyXG4gICAgICAgICAgICBnZXRUaHJvdHRsZTogZ2V0VGhyb3R0bGUsXHJcbiAgICAgICAgICAgIGdldFBpdGNoOiBnZXRQaXRjaCxcclxuICAgICAgICAgICAgZ2V0Um9sbDogZ2V0Um9sbCxcclxuICAgICAgICAgICAgZ2V0WWF3OiBnZXRZYXcsXHJcbiAgICAgICAgICAgIGdldEF1eDE6IGdldEF1eDEsXHJcbiAgICAgICAgICAgIGdldEF1eDI6IGdldEF1eDIsXHJcbiAgICAgICAgICAgIEFVWDogQVVYLFxyXG4gICAgICAgICAgICBzZW5kOiBzZW5kLFxyXG4gICAgICAgICAgICBmb3JjZU5leHRTZW5kOiBmb3JjZU5leHRTZW5kLFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNlbmQoKSB7XHJcbiAgICAgICAgICAgIGlmICghdXJnZW50ICYmIHNlcmlhbC5idXN5KCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB1cmdlbnQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgIHZhciBjb21tYW5kID0ge307XHJcblxyXG4gICAgICAgICAgICAvLyBpbnZlcnQgcGl0Y2ggYW5kIHJvbGxcclxuICAgICAgICAgICAgdmFyIHRocm90dGxlX3RocmVzaG9sZCA9XHJcbiAgICAgICAgICAgICAgICAtMC44OyAgLy8ga2VlcCBib3R0b20gMTAlIG9mIHRocm90dGxlIHN0aWNrIHRvIG1lYW4gJ29mZidcclxuICAgICAgICAgICAgY29tbWFuZC50aHJvdHRsZSA9IGNvbnN0cmFpbihcclxuICAgICAgICAgICAgICAgICh0aHJvdHRsZSAtIHRocm90dGxlX3RocmVzaG9sZCkgKiA0MDk1IC9cclxuICAgICAgICAgICAgICAgICAgICAoMSAtIHRocm90dGxlX3RocmVzaG9sZCksXHJcbiAgICAgICAgICAgICAgICAwLCA0MDk1KTtcclxuICAgICAgICAgICAgY29tbWFuZC5waXRjaCA9XHJcbiAgICAgICAgICAgICAgICBjb25zdHJhaW4oLShhcHBseURlYWR6b25lKHBpdGNoLCAwLjEpKSAqIDQwOTUgLyAyLCAtMjA0NywgMjA0Nyk7XHJcbiAgICAgICAgICAgIGNvbW1hbmQucm9sbCA9XHJcbiAgICAgICAgICAgICAgICBjb25zdHJhaW4oKGFwcGx5RGVhZHpvbmUocm9sbCwgMC4xKSkgKiA0MDk1IC8gMiwgLTIwNDcsIDIwNDcpO1xyXG4gICAgICAgICAgICBjb21tYW5kLnlhdyA9XHJcbiAgICAgICAgICAgICAgICBjb25zdHJhaW4oLShhcHBseURlYWR6b25lKHlhdywgMC4xKSkgKiA0MDk1IC8gMiwgLTIwNDcsIDIwNDcpO1xyXG5cclxuICAgICAgICAgICAgdmFyIGF1eF9tYXNrID0ge307XHJcbiAgICAgICAgICAgIC8vIGF1eDFfbG93LCBhdXgxX21pZCwgYXV4MV9oaWdoLCBhbmQgc2FtZSB3aXRoIGF1eDJcclxuICAgICAgICAgICAgYXV4X21hc2tbJ2F1eDFfJyArIGF1eE5hbWVzW2F1eDFdXSA9IHRydWU7XHJcbiAgICAgICAgICAgIGF1eF9tYXNrWydhdXgyXycgKyBhdXhOYW1lc1thdXgyXV0gPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHNlcmlhbC5zZW5kU3RydWN0dXJlKCdDb21tYW5kJywge1xyXG4gICAgICAgICAgICAgICAgcmVxdWVzdF9yZXNwb25zZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHNldF9zZXJpYWxfcmM6IHtcclxuICAgICAgICAgICAgICAgICAgICBlbmFibGVkOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbW1hbmQ6IGNvbW1hbmQsXHJcbiAgICAgICAgICAgICAgICAgICAgYXV4X21hc2s6IGF1eF9tYXNrLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSwgZmFsc2UpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2V0VGhyb3R0bGUodikge1xyXG4gICAgICAgICAgICB0aHJvdHRsZSA9IHY7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZXRQaXRjaCh2KSB7XHJcbiAgICAgICAgICAgIHBpdGNoID0gdjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNldFJvbGwodikge1xyXG4gICAgICAgICAgICByb2xsID0gdjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNldFlhdyh2KSB7XHJcbiAgICAgICAgICAgIHlhdyA9IHY7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZXRBdXgxKHYpIHtcclxuICAgICAgICAgICAgYXV4MSA9IE1hdGgubWF4KDAsIE1hdGgubWluKDIsIHYpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNldEF1eDIodikge1xyXG4gICAgICAgICAgICBhdXgyID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oMiwgdikpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0VGhyb3R0bGUoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aHJvdHRsZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdldFBpdGNoKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gcGl0Y2g7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRSb2xsKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gcm9sbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdldFlhdygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHlhdztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdldEF1eDEoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBhdXgxO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0QXV4MigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGF1eDI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBmb3JjZU5leHRTZW5kKCkge1xyXG4gICAgICAgICAgICB1cmdlbnQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gY29uc3RyYWluKHgsIHhtaW4sIHhtYXgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE1hdGgubWF4KHhtaW4sIE1hdGgubWluKHgsIHhtYXgpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFwcGx5RGVhZHpvbmUodmFsdWUsIGRlYWR6b25lKSB7XHJcbiAgICAgICAgICAgIGlmICh2YWx1ZSA+IGRlYWR6b25lKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUgLSBkZWFkem9uZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodmFsdWUgPCAtZGVhZHpvbmUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSArIGRlYWR6b25lO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSgpKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdmbHlicml4Q29tbW9uJykuZmFjdG9yeSgnc2VyaWFsJywgc2VyaWFsKTtcclxuXHJcbiAgICBzZXJpYWwuJGluamVjdCA9IFsnJHRpbWVvdXQnLCAnJHEnLCAnY29icycsICdjb21tYW5kTG9nJywgJ2Zpcm13YXJlVmVyc2lvbicsICdzZXJpYWxpemF0aW9uSGFuZGxlciddO1xyXG5cclxuICAgIGZ1bmN0aW9uIHNlcmlhbCgkdGltZW91dCwgJHEsIGNvYnMsIGNvbW1hbmRMb2csIGZpcm13YXJlVmVyc2lvbiwgc2VyaWFsaXphdGlvbkhhbmRsZXIpIHtcclxuICAgICAgICB2YXIgTWVzc2FnZVR5cGUgPSB7XHJcbiAgICAgICAgICAgIFN0YXRlOiAwLFxyXG4gICAgICAgICAgICBDb21tYW5kOiAxLFxyXG4gICAgICAgICAgICBEZWJ1Z1N0cmluZzogMyxcclxuICAgICAgICAgICAgSGlzdG9yeURhdGE6IDQsXHJcbiAgICAgICAgICAgIFJlc3BvbnNlOiAyNTUsXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdmFyIGFja25vd2xlZGdlcyA9IFtdO1xyXG4gICAgICAgIHZhciBiYWNrZW5kID0gbmV3IEJhY2tlbmQoKTtcclxuXHJcbiAgICAgICAgdmFyIG9uUmVjZWl2ZUxpc3RlbmVycyA9IFtdO1xyXG5cclxuICAgICAgICB2YXIgY29ic1JlYWRlciA9IG5ldyBjb2JzLlJlYWRlcigyMDAwKTtcclxuICAgICAgICB2YXIgYnl0ZXNIYW5kbGVyID0gdW5kZWZpbmVkO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBCYWNrZW5kKCkge1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgQmFja2VuZC5wcm90b3R5cGUuYnVzeSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgQmFja2VuZC5wcm90b3R5cGUuc2VuZCA9IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgICAgY29tbWFuZExvZygnTm8gXCJzZW5kXCIgZGVmaW5lZCBmb3Igc2VyaWFsIGJhY2tlbmQnKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBCYWNrZW5kLnByb3RvdHlwZS5vblJlYWQgPSBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICAgIGNvbW1hbmRMb2coJ05vIFwib25SZWFkXCIgZGVmaW5lZCBmb3Igc2VyaWFsIGJhY2tlbmQnKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgTWVzc2FnZVR5cGVJbnZlcnNpb24gPSBbXTtcclxuICAgICAgICBPYmplY3Qua2V5cyhNZXNzYWdlVHlwZSkuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcclxuICAgICAgICAgICAgTWVzc2FnZVR5cGVJbnZlcnNpb25bTWVzc2FnZVR5cGVba2V5XV0gPSBrZXk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGFkZE9uUmVjZWl2ZUNhbGxiYWNrKGZ1bmN0aW9uKG1lc3NhZ2VUeXBlLCBtZXNzYWdlKSB7XHJcbiAgICAgICAgICAgIGlmIChtZXNzYWdlVHlwZSA9PT0gJ1Jlc3BvbnNlJykge1xyXG4gICAgICAgICAgICAgICAgYWNrbm93bGVkZ2UobWVzc2FnZS5tYXNrLCBtZXNzYWdlLmFjayk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgYnVzeTogYnVzeSxcclxuICAgICAgICAgICAgc2VuZFN0cnVjdHVyZTogc2VuZFN0cnVjdHVyZSxcclxuICAgICAgICAgICAgc2V0QmFja2VuZDogc2V0QmFja2VuZCxcclxuICAgICAgICAgICAgYWRkT25SZWNlaXZlQ2FsbGJhY2s6IGFkZE9uUmVjZWl2ZUNhbGxiYWNrLFxyXG4gICAgICAgICAgICByZW1vdmVPblJlY2VpdmVDYWxsYmFjazogcmVtb3ZlT25SZWNlaXZlQ2FsbGJhY2ssXHJcbiAgICAgICAgICAgIHNldEJ5dGVzSGFuZGxlcjogc2V0Qnl0ZXNIYW5kbGVyLFxyXG4gICAgICAgICAgICBoYW5kbGVQb3N0Q29ubmVjdDogaGFuZGxlUG9zdENvbm5lY3QsXHJcbiAgICAgICAgICAgIEJhY2tlbmQ6IEJhY2tlbmQsXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2V0QmFja2VuZCh2KSB7XHJcbiAgICAgICAgICAgIGJhY2tlbmQgPSB2O1xyXG4gICAgICAgICAgICBiYWNrZW5kLm9uUmVhZCA9IHJlYWQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBoYW5kbGVQb3N0Q29ubmVjdCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlcXVlc3RGaXJtd2FyZVZlcnNpb24oKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHJlcXVlc3RGaXJtd2FyZVZlcnNpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzZW5kU3RydWN0dXJlKCdDb21tYW5kJywge1xyXG4gICAgICAgICAgICAgICAgcmVxdWVzdF9yZXNwb25zZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHJlcV9wYXJ0aWFsX2VlcHJvbV9kYXRhOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmVyc2lvbjogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2VuZFN0cnVjdHVyZShtZXNzYWdlVHlwZSwgZGF0YSwgbG9nX3NlbmQsIGV4dHJhTWFzaykge1xyXG4gICAgICAgICAgICBpZiAobWVzc2FnZVR5cGUgPT09ICdTdGF0ZScpIHtcclxuICAgICAgICAgICAgICAgIGRhdGEgPSBwcm9jZXNzU3RhdGVPdXRwdXQoZGF0YSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIGhhbmRsZXJzID0gZmlybXdhcmVWZXJzaW9uLnNlcmlhbGl6YXRpb25IYW5kbGVyKCk7XHJcblxyXG4gICAgICAgICAgICB2YXIgcmVzcG9uc2UgPSAkcS5kZWZlcigpO1xyXG4gICAgICAgICAgICBpZiAoIShtZXNzYWdlVHlwZSBpbiBNZXNzYWdlVHlwZSkpIHtcclxuICAgICAgICAgICAgICAgIHJlc3BvbnNlLnJlamVjdCgnTWVzc2FnZSB0eXBlIFwiJyArIG1lc3NhZ2VUeXBlICtcclxuICAgICAgICAgICAgICAgICAgICAnXCIgbm90IHN1cHBvcnRlZCBieSBhcHAsIHN1cHBvcnRlZCBtZXNzYWdlIHR5cGVzIGFyZTonICtcclxuICAgICAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyhNZXNzYWdlVHlwZSkuam9pbignLCAnKSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UucHJvbWlzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIShtZXNzYWdlVHlwZSBpbiBoYW5kbGVycykpIHtcclxuICAgICAgICAgICAgICAgIHJlc3BvbnNlLnJlamVjdCgnTWVzc2FnZSB0eXBlIFwiJyArIG1lc3NhZ2VUeXBlICtcclxuICAgICAgICAgICAgICAgICAgICAnXCIgbm90IHN1cHBvcnRlZCBieSBmaXJtd2FyZSwgc3VwcG9ydGVkIG1lc3NhZ2UgdHlwZXMgYXJlOicgK1xyXG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKGhhbmRsZXJzKS5qb2luKCcsICcpKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5wcm9taXNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciB0eXBlQ29kZSA9IE1lc3NhZ2VUeXBlW21lc3NhZ2VUeXBlXTtcclxuICAgICAgICAgICAgdmFyIGhhbmRsZXIgPSBoYW5kbGVyc1ttZXNzYWdlVHlwZV07XHJcblxyXG4gICAgICAgICAgICB2YXIgYnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoaGFuZGxlci5ieXRlQ291bnQpO1xyXG5cclxuICAgICAgICAgICAgdmFyIHNlcmlhbGl6ZXIgPSBuZXcgc2VyaWFsaXphdGlvbkhhbmRsZXIuU2VyaWFsaXplcihuZXcgRGF0YVZpZXcoYnVmZmVyLmJ1ZmZlcikpO1xyXG4gICAgICAgICAgICBoYW5kbGVyLmVuY29kZShzZXJpYWxpemVyLCBkYXRhLCBleHRyYU1hc2spO1xyXG4gICAgICAgICAgICB2YXIgbWFzayA9IGhhbmRsZXIubWFza0FycmF5KGRhdGEsIGV4dHJhTWFzayk7XHJcbiAgICAgICAgICAgIGlmIChtYXNrLmxlbmd0aCA8IDUpIHtcclxuICAgICAgICAgICAgICAgIG1hc2sgPSAobWFza1swXSA8PCAwKSB8IChtYXNrWzFdIDw8IDgpIHwgKG1hc2tbMl0gPDwgMTYpIHwgKG1hc2tbM10gPDwgMjQpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2YXIgZGF0YUxlbmd0aCA9IHNlcmlhbGl6ZXIuaW5kZXg7XHJcblxyXG4gICAgICAgICAgICB2YXIgb3V0cHV0ID0gbmV3IFVpbnQ4QXJyYXkoZGF0YUxlbmd0aCArIDMpO1xyXG4gICAgICAgICAgICBvdXRwdXRbMF0gPSBvdXRwdXRbMV0gPSB0eXBlQ29kZTtcclxuICAgICAgICAgICAgZm9yICh2YXIgaWR4ID0gMDsgaWR4IDwgZGF0YUxlbmd0aDsgKytpZHgpIHtcclxuICAgICAgICAgICAgICAgIG91dHB1dFswXSBePSBvdXRwdXRbaWR4ICsgMl0gPSBidWZmZXJbaWR4XTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBvdXRwdXRbZGF0YUxlbmd0aCArIDJdID0gMDtcclxuXHJcbiAgICAgICAgICAgIGFja25vd2xlZGdlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIG1hc2s6IG1hc2ssXHJcbiAgICAgICAgICAgICAgICByZXNwb25zZTogcmVzcG9uc2UsXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBiYWNrZW5kLnNlbmQobmV3IFVpbnQ4QXJyYXkoY29icy5lbmNvZGUob3V0cHV0KSkpO1xyXG4gICAgICAgICAgICB9LCAwKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChsb2dfc2VuZCkge1xyXG4gICAgICAgICAgICAgICAgY29tbWFuZExvZygnU2VuZGluZyBjb21tYW5kICcgKyB0eXBlQ29kZSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5wcm9taXNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYnVzeSgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGJhY2tlbmQuYnVzeSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2V0Qnl0ZXNIYW5kbGVyKGhhbmRsZXIpIHtcclxuICAgICAgICAgICAgYnl0ZXNIYW5kbGVyID0gaGFuZGxlcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHJlYWQoZGF0YSkge1xyXG4gICAgICAgICAgICBpZiAoYnl0ZXNIYW5kbGVyKVxyXG4gICAgICAgICAgICAgICAgYnl0ZXNIYW5kbGVyKGRhdGEsIHByb2Nlc3NEYXRhKTtcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgY29ic1JlYWRlci5yZWFkQnl0ZXMoZGF0YSwgcHJvY2Vzc0RhdGEsIHJlcG9ydElzc3Vlcyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiByZXBvcnRJc3N1ZXMoaXNzdWUsIHRleHQpIHtcclxuICAgICAgICAgICAgY29tbWFuZExvZygnQ09CUyBkZWNvZGluZyBmYWlsZWQgKCcgKyBpc3N1ZSArICcpOiAnICsgdGV4dCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBhZGRPblJlY2VpdmVDYWxsYmFjayhjYWxsYmFjaykge1xyXG4gICAgICAgICAgICBvblJlY2VpdmVMaXN0ZW5lcnMgPSBvblJlY2VpdmVMaXN0ZW5lcnMuY29uY2F0KFtjYWxsYmFja10pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gcmVtb3ZlT25SZWNlaXZlQ2FsbGJhY2soY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgb25SZWNlaXZlTGlzdGVuZXJzID0gb25SZWNlaXZlTGlzdGVuZXJzLmZpbHRlcihmdW5jdGlvbihjYikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNiID09PSBjYWxsYmFjaztcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBhY2tub3dsZWRnZShtYXNrLCB2YWx1ZSkge1xyXG4gICAgICAgICAgICB3aGlsZSAoYWNrbm93bGVkZ2VzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIHZhciB2ID0gYWNrbm93bGVkZ2VzLnNoaWZ0KCk7XHJcbiAgICAgICAgICAgICAgICBpZiAodi5tYXNrIF4gbWFzaykge1xyXG4gICAgICAgICAgICAgICAgICAgIHYucmVzcG9uc2UucmVqZWN0KCdNaXNzaW5nIEFDSycpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdmFyIHJlbGF4ZWRNYXNrID0gbWFzaztcclxuICAgICAgICAgICAgICAgIHJlbGF4ZWRNYXNrICY9IH4xO1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlbGF4ZWRNYXNrIF4gdmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICB2LnJlc3BvbnNlLnJlamVjdCgnUmVxdWVzdCB3YXMgbm90IGZ1bGx5IHByb2Nlc3NlZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdi5yZXNwb25zZS5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gcHJvY2Vzc0RhdGEoYnl0ZXMpIHtcclxuICAgICAgICAgICAgdmFyIG1lc3NhZ2VUeXBlID0gTWVzc2FnZVR5cGVJbnZlcnNpb25bYnl0ZXNbMF1dO1xyXG4gICAgICAgICAgICB2YXIgaGFuZGxlciA9IGZpcm13YXJlVmVyc2lvbi5zZXJpYWxpemF0aW9uSGFuZGxlcigpW21lc3NhZ2VUeXBlXTtcclxuICAgICAgICAgICAgaWYgKCFtZXNzYWdlVHlwZSB8fCAhaGFuZGxlcikge1xyXG4gICAgICAgICAgICAgICAgY29tbWFuZExvZygnSWxsZWdhbCBtZXNzYWdlIHR5cGUgcGFzc2VkIGZyb20gZmlybXdhcmUnKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgc2VyaWFsaXplciA9IG5ldyBzZXJpYWxpemF0aW9uSGFuZGxlci5TZXJpYWxpemVyKG5ldyBEYXRhVmlldyhieXRlcy5idWZmZXIsIDEpKTtcclxuICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBoYW5kbGVyLmRlY29kZShzZXJpYWxpemVyKTtcclxuICAgICAgICAgICAgaWYgKG1lc3NhZ2VUeXBlID09PSAnU3RhdGUnKSB7XHJcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gcHJvY2Vzc1N0YXRlSW5wdXQobWVzc2FnZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgb25SZWNlaXZlTGlzdGVuZXJzLmZvckVhY2goZnVuY3Rpb24obGlzdGVuZXIpIHtcclxuICAgICAgICAgICAgICAgIGxpc3RlbmVyKG1lc3NhZ2VUeXBlLCBtZXNzYWdlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgbGFzdF90aW1lc3RhbXBfdXMgPSAwO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBwcm9jZXNzU3RhdGVJbnB1dChzdGF0ZSkge1xyXG4gICAgICAgICAgICBzdGF0ZSA9IE9iamVjdC5hc3NpZ24oe30sIHN0YXRlKTtcclxuICAgICAgICAgICAgdmFyIHNlcmlhbF91cGRhdGVfcmF0ZV9IeiA9IDA7XHJcblxyXG4gICAgICAgICAgICBpZiAoJ3RpbWVzdGFtcF91cycgaW4gc3RhdGUpIHtcclxuICAgICAgICAgICAgICAgIHN0YXRlLnNlcmlhbF91cGRhdGVfcmF0ZV9lc3RpbWF0ZSA9IDEwMDAwMDAgLyAoc3RhdGUudGltZXN0YW1wX3VzIC0gbGFzdF90aW1lc3RhbXBfdXMpO1xyXG4gICAgICAgICAgICAgICAgbGFzdF90aW1lc3RhbXBfdXMgPSBzdGF0ZS50aW1lc3RhbXBfdXM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCd0ZW1wZXJhdHVyZScgaW4gc3RhdGUpIHtcclxuICAgICAgICAgICAgICAgIHN0YXRlLnRlbXBlcmF0dXJlIC89IDEwMC4wOyAgLy8gdGVtcGVyYXR1cmUgZ2l2ZW4gaW4gQ2Vsc2l1cyAqIDEwMFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICgncHJlc3N1cmUnIGluIHN0YXRlKSB7XHJcbiAgICAgICAgICAgICAgICBzdGF0ZS5wcmVzc3VyZSAvPSAyNTYuMDsgIC8vIHByZXNzdXJlIGdpdmVuIGluIChRMjQuOCkgZm9ybWF0XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHByb2Nlc3NTdGF0ZU91dHB1dChzdGF0ZSkge1xyXG4gICAgICAgICAgICBzdGF0ZSA9IE9iamVjdC5hc3NpZ24oe30sIHN0YXRlKTtcclxuICAgICAgICAgICAgaWYgKCd0ZW1wZXJhdHVyZScgaW4gc3RhdGUpIHtcclxuICAgICAgICAgICAgICAgIHN0YXRlLnRlbXBlcmF0dXJlICo9IDEwMC4wO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICgncHJlc3N1cmUnIGluIHN0YXRlKSB7XHJcbiAgICAgICAgICAgICAgICBzdGF0ZS5wcmVzc3VyZSAqPSAyNTYuMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KCkpO1xyXG4iLCIoZnVuY3Rpb24gKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIHNlcmlhbGl6YXRpb25IYW5kbGVyLiRpbmplY3QgPSBbXTtcclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgnZmx5YnJpeENvbW1vbicpLmZhY3RvcnkoJ3NlcmlhbGl6YXRpb25IYW5kbGVyJywgc2VyaWFsaXphdGlvbkhhbmRsZXIpO1xyXG5cclxuICAgIGZ1bmN0aW9uIHNlcmlhbGl6YXRpb25IYW5kbGVyKCkge1xyXG4gICAgICAgIHZhciBoYW5kbGVyQ2FjaGUgPSB7fTtcclxuICAgICAgICB2YXIgdmVyc2lvbiA9ICdWZXJzaW9uID0geyBtYWpvcjogdTgsIG1pbm9yOiB1OCwgcGF0Y2g6IHU4IH07JztcclxuICAgICAgICB2YXIgY29uZmlnSWQgPSAnQ29uZmlnSUQgPSB1MzI7JztcclxuXHJcbiAgICAgICAgdmFyIHZlY3RvcjNmID0gJ1ZlY3RvcjNmID0geyB4OiBmMzIsIHk6IGYzMiwgejogZjMyIH07JztcclxuXHJcbiAgICAgICAgdmFyIHBjYlRyYW5zZm9ybSA9ICdQY2JUcmFuc2Zvcm0gPSB7IG9yaWVudGF0aW9uOiBWZWN0b3IzZiwgdHJhbnNsYXRpb246IFZlY3RvcjNmIH07JztcclxuICAgICAgICB2YXIgbWl4VGFibGUgPSAnTWl4VGFibGUgPSB7IGZ6OiBbaTg6OF0sIHR4OiBbaTg6OF0sIHR5OiBbaTg6OF0sIHR6OiBbaTg6OF0gfTsnO1xyXG4gICAgICAgIHZhciBtYWdCaWFzID0gJ01hZ0JpYXMgPSB7IG9mZnNldDogVmVjdG9yM2YgfTsnO1xyXG4gICAgICAgIHZhciBjaGFubmVsUHJvcGVydGllcyA9ICdDaGFubmVsUHJvcGVydGllcyA9IHsnICtcclxuICAgICAgICAgICAgJ2Fzc2lnbm1lbnQ6IFt1ODo2XSwnICtcclxuICAgICAgICAgICAgJ2ludmVyc2lvbjogdTgsJyArXHJcbiAgICAgICAgICAgICdtaWRwb2ludDogW3UxNjo2XSwnICtcclxuICAgICAgICAgICAgJ2RlYWR6b25lOiBbdTE2OjZdIH07JztcclxuXHJcbiAgICAgICAgdmFyIHBpZFNldHRpbmdzID0gJ1BJRFNldHRpbmdzID0geycgK1xyXG4gICAgICAgICAgICAna3A6IGYzMiwnICtcclxuICAgICAgICAgICAgJ2tpOiBmMzIsJyArXHJcbiAgICAgICAgICAgICdrZDogZjMyLCcgK1xyXG4gICAgICAgICAgICAnaW50ZWdyYWxfd2luZHVwX2d1YXJkOiBmMzIsJyArXHJcbiAgICAgICAgICAgICdkX2ZpbHRlcl90aW1lOiBmMzIsJyArXHJcbiAgICAgICAgICAgICdzZXRwb2ludF9maWx0ZXJfdGltZTogZjMyLCcgK1xyXG4gICAgICAgICAgICAnY29tbWFuZF90b192YWx1ZTogZjMyIH07JztcclxuICAgICAgICB2YXIgcGlkUGFyYW1ldGVyczE0ID0gJ1BJRFBhcmFtZXRlcnMgPSB7JyArXHJcbiAgICAgICAgICAgICd0aHJ1c3RfbWFzdGVyOiBQSURTZXR0aW5ncywnICtcclxuICAgICAgICAgICAgJ3BpdGNoX21hc3RlcjogUElEU2V0dGluZ3MsJyArXHJcbiAgICAgICAgICAgICdyb2xsX21hc3RlcjogUElEU2V0dGluZ3MsJyArXHJcbiAgICAgICAgICAgICd5YXdfbWFzdGVyOiBQSURTZXR0aW5ncywnICtcclxuICAgICAgICAgICAgJ3RocnVzdF9zbGF2ZTogUElEU2V0dGluZ3MsJyArXHJcbiAgICAgICAgICAgICdwaXRjaF9zbGF2ZTogUElEU2V0dGluZ3MsJyArXHJcbiAgICAgICAgICAgICdyb2xsX3NsYXZlOiBQSURTZXR0aW5ncywnICtcclxuICAgICAgICAgICAgJ3lhd19zbGF2ZTogUElEU2V0dGluZ3MsJyArXHJcbiAgICAgICAgICAgICdwaWRfYnlwYXNzOiB1OCB9Oyc7XHJcbiAgICAgICAgdmFyIHBpZFBhcmFtZXRlcnMgPSAnUElEUGFyYW1ldGVycyA9IHsnICtcclxuICAgICAgICAgICAgJ3RocnVzdF9tYXN0ZXI6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAncGl0Y2hfbWFzdGVyOiBQSURTZXR0aW5ncywnICtcclxuICAgICAgICAgICAgJ3JvbGxfbWFzdGVyOiBQSURTZXR0aW5ncywnICtcclxuICAgICAgICAgICAgJ3lhd19tYXN0ZXI6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAndGhydXN0X3NsYXZlOiBQSURTZXR0aW5ncywnICtcclxuICAgICAgICAgICAgJ3BpdGNoX3NsYXZlOiBQSURTZXR0aW5ncywnICtcclxuICAgICAgICAgICAgJ3JvbGxfc2xhdmU6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAneWF3X3NsYXZlOiBQSURTZXR0aW5ncywnICtcclxuICAgICAgICAgICAgJ3RocnVzdF9nYWluOiBmMzIsJyArXHJcbiAgICAgICAgICAgICdwaXRjaF9nYWluOiBmMzIsJyArXHJcbiAgICAgICAgICAgICdyb2xsX2dhaW46IGYzMiwnICtcclxuICAgICAgICAgICAgJ3lhd19nYWluOiBmMzIsJyArXHJcbiAgICAgICAgICAgICdwaWRfYnlwYXNzOiB1OCB9Oyc7XHJcblxyXG4gICAgICAgIHZhciBzdGF0ZVBhcmFtZXRlcnMgPSAnU3RhdGVQYXJhbWV0ZXJzID0geyBzdGF0ZV9lc3RpbWF0aW9uOiBbZjMyOjJdLCBlbmFibGU6IFtmMzI6Ml0gfTsnO1xyXG5cclxuICAgICAgICB2YXIgc3RhdHVzRmxhZzE0MTUgPSAnU3RhdHVzRmxhZyA9IHsvMTYvJyArXHJcbiAgICAgICAgICAgICdib290OiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnbXB1X2ZhaWw6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdibXBfZmFpbDogdm9pZCwnICtcclxuICAgICAgICAgICAgJ3J4X2ZhaWw6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdpZGxlOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnZW5hYmxpbmc6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdjbGVhcl9tcHVfYmlhczogdm9pZCwnICtcclxuICAgICAgICAgICAgJ3NldF9tcHVfYmlhczogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2ZhaWxfc3RhYmlsaXR5OiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnZmFpbF9hbmdsZTogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2VuYWJsZWQ6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdiYXR0ZXJ5X2xvdzogdm9pZCwnICtcclxuICAgICAgICAgICAgJ3RlbXBfd2FybmluZzogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2xvZ19mdWxsOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnZmFpbF9vdGhlcjogdm9pZCwnICtcclxuICAgICAgICAgICAgJ292ZXJyaWRlOiB2b2lkIH07JztcclxuXHJcbiAgICAgICAgdmFyIHN0YXR1c0ZsYWcgPSAnU3RhdHVzRmxhZyA9IHsvMTYvJyArXHJcbiAgICAgICAgICAgICdfMDogdm9pZCwnICtcclxuICAgICAgICAgICAgJ18xOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnXzI6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdub19zaWduYWw6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdpZGxlOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnYXJtaW5nOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAncmVjb3JkaW5nX3NkOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnXzc6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdsb29wX3Nsb3c6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdfOTogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2FybWVkOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnYmF0dGVyeV9sb3c6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdiYXR0ZXJ5X2NyaXRpY2FsOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnbG9nX2Z1bGw6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdjcmFzaF9kZXRlY3RlZDogdm9pZCwnICtcclxuICAgICAgICAgICAgJ292ZXJyaWRlOiB2b2lkIH07JztcclxuXHJcbiAgICAgICAgdmFyIGNvbG9yID0gJ0NvbG9yID0geyByZWQ6IHU4LCBncmVlbjogdTgsIGJsdWU6IHU4IH07JztcclxuICAgICAgICB2YXIgbGVkU3RhdGVDYXNlID0gJ0xFRFN0YXRlQ2FzZSA9IHsnICtcclxuICAgICAgICAgICAgJ3N0YXR1czogU3RhdHVzRmxhZywnICtcclxuICAgICAgICAgICAgJ3BhdHRlcm46IHU4LCcgK1xyXG4gICAgICAgICAgICAnY29sb3JfcmlnaHRfZnJvbnQ6IENvbG9yLCcgK1xyXG4gICAgICAgICAgICAnY29sb3JfcmlnaHRfYmFjazogQ29sb3IsJyArXHJcbiAgICAgICAgICAgICdjb2xvcl9sZWZ0X2Zyb250OiBDb2xvciwnICtcclxuICAgICAgICAgICAgJ2NvbG9yX2xlZnRfYmFjazogQ29sb3IsJyArXHJcbiAgICAgICAgICAgICdpbmRpY2F0b3JfcmVkOiBib29sLCcgK1xyXG4gICAgICAgICAgICAnaW5kaWNhdG9yX2dyZWVuOiBib29sIH07JztcclxuICAgICAgICB2YXIgbGVkU3RhdGVzID0gJ0xFRFN0YXRlcyA9IFsvMTYvTEVEU3RhdGVDYXNlOjE2XTsnO1xyXG4gICAgICAgIHZhciBsZWRTdGF0ZXNGaXhlZCA9ICdMRURTdGF0ZXNGaXhlZCA9IFtMRURTdGF0ZUNhc2U6MTZdOyc7XHJcblxyXG4gICAgICAgIHZhciBkZXZpY2VOYW1lID0gJ0RldmljZU5hbWUgPSBzOTsnO1xyXG5cclxuICAgICAgICB2YXIgdmVsb2NpdHlQaWRQYXJhbWV0ZXJzID0gJ1ZlbG9jaXR5UElEUGFyYW1ldGVycyA9IHsnICtcclxuICAgICAgICAgICAgJ2ZvcndhcmRfbWFzdGVyOiBQSURTZXR0aW5ncywnICtcclxuICAgICAgICAgICAgJ3JpZ2h0X21hc3RlcjogUElEU2V0dGluZ3MsJyArXHJcbiAgICAgICAgICAgICd1cF9tYXN0ZXI6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAnZm9yd2FyZF9zbGF2ZTogUElEU2V0dGluZ3MsJyArXHJcbiAgICAgICAgICAgICdyaWdodF9zbGF2ZTogUElEU2V0dGluZ3MsJyArXHJcbiAgICAgICAgICAgICd1cF9zbGF2ZTogUElEU2V0dGluZ3MsJyArXHJcbiAgICAgICAgICAgICdwaWRfYnlwYXNzOiB1OCB9Oyc7XHJcblxyXG4gICAgICAgIHZhciBpbmVydGlhbEJpYXMgPSAnSW5lcnRpYWxCaWFzID0geyBhY2NlbDogVmVjdG9yM2YsIGd5cm86IFZlY3RvcjNmIH07JztcclxuXHJcbiAgICAgICAgdmFyIGNvbmZpZzE0MTUgPSAnQ29uZmlndXJhdGlvbiA9IHsvMTYvJyArXHJcbiAgICAgICAgICAgICd2ZXJzaW9uOiBWZXJzaW9uLCcgK1xyXG4gICAgICAgICAgICAnY29uZmlnX2lkOiBDb25maWdJRCwnICtcclxuICAgICAgICAgICAgJ3BjYl90cmFuc2Zvcm06IFBjYlRyYW5zZm9ybSwnICtcclxuICAgICAgICAgICAgJ21peF90YWJsZTogTWl4VGFibGUsJyArXHJcbiAgICAgICAgICAgICdtYWdfYmlhczogTWFnQmlhcywnICtcclxuICAgICAgICAgICAgJ2NoYW5uZWw6IENoYW5uZWxQcm9wZXJ0aWVzLCcgK1xyXG4gICAgICAgICAgICAncGlkX3BhcmFtZXRlcnM6IFBJRFBhcmFtZXRlcnMsJyArXHJcbiAgICAgICAgICAgICdzdGF0ZV9wYXJhbWV0ZXJzOiBTdGF0ZVBhcmFtZXRlcnMsJyArXHJcbiAgICAgICAgICAgICdsZWRfc3RhdGVzOiBMRURTdGF0ZXMsJyArXHJcbiAgICAgICAgICAgICdkZXZpY2VfbmFtZTogRGV2aWNlTmFtZSB9Oyc7XHJcblxyXG4gICAgICAgIHZhciBjb25maWdGaXhlZDE0MTUgPSAnQ29uZmlndXJhdGlvbkZpeGVkID0geycgK1xyXG4gICAgICAgICAgICAndmVyc2lvbjogVmVyc2lvbiwnICtcclxuICAgICAgICAgICAgJ2NvbmZpZ19pZDogQ29uZmlnSUQsJyArXHJcbiAgICAgICAgICAgICdwY2JfdHJhbnNmb3JtOiBQY2JUcmFuc2Zvcm0sJyArXHJcbiAgICAgICAgICAgICdtaXhfdGFibGU6IE1peFRhYmxlLCcgK1xyXG4gICAgICAgICAgICAnbWFnX2JpYXM6IE1hZ0JpYXMsJyArXHJcbiAgICAgICAgICAgICdjaGFubmVsOiBDaGFubmVsUHJvcGVydGllcywnICtcclxuICAgICAgICAgICAgJ3BpZF9wYXJhbWV0ZXJzOiBQSURQYXJhbWV0ZXJzLCcgK1xyXG4gICAgICAgICAgICAnc3RhdGVfcGFyYW1ldGVyczogU3RhdGVQYXJhbWV0ZXJzLCcgK1xyXG4gICAgICAgICAgICAnbGVkX3N0YXRlczogTEVEU3RhdGVzRml4ZWQsJyArXHJcbiAgICAgICAgICAgICdkZXZpY2VfbmFtZTogRGV2aWNlTmFtZSB9Oyc7XHJcblxyXG4gICAgICAgIHZhciBjb25maWcgPSAnQ29uZmlndXJhdGlvbiA9IHsvMTYvJyArXHJcbiAgICAgICAgICAgICd2ZXJzaW9uOiBWZXJzaW9uLCcgK1xyXG4gICAgICAgICAgICAnY29uZmlnX2lkOiBDb25maWdJRCwnICtcclxuICAgICAgICAgICAgJ3BjYl90cmFuc2Zvcm06IFBjYlRyYW5zZm9ybSwnICtcclxuICAgICAgICAgICAgJ21peF90YWJsZTogTWl4VGFibGUsJyArXHJcbiAgICAgICAgICAgICdtYWdfYmlhczogTWFnQmlhcywnICtcclxuICAgICAgICAgICAgJ2NoYW5uZWw6IENoYW5uZWxQcm9wZXJ0aWVzLCcgK1xyXG4gICAgICAgICAgICAncGlkX3BhcmFtZXRlcnM6IFBJRFBhcmFtZXRlcnMsJyArXHJcbiAgICAgICAgICAgICdzdGF0ZV9wYXJhbWV0ZXJzOiBTdGF0ZVBhcmFtZXRlcnMsJyArXHJcbiAgICAgICAgICAgICdsZWRfc3RhdGVzOiBMRURTdGF0ZXMsJyArXHJcbiAgICAgICAgICAgICdkZXZpY2VfbmFtZTogRGV2aWNlTmFtZSwnICtcclxuICAgICAgICAgICAgJ3ZlbG9jaXR5X3BpZF9wYXJhbWV0ZXJzOiBWZWxvY2l0eVBJRFBhcmFtZXRlcnMsJyArXHJcbiAgICAgICAgICAgICdpbmVydGlhbF9iaWFzOiBJbmVydGlhbEJpYXMgfTsnO1xyXG5cclxuICAgICAgICB2YXIgY29uZmlnRml4ZWQgPSAnQ29uZmlndXJhdGlvbkZpeGVkID0geycgK1xyXG4gICAgICAgICAgICAndmVyc2lvbjogVmVyc2lvbiwnICtcclxuICAgICAgICAgICAgJ2NvbmZpZ19pZDogQ29uZmlnSUQsJyArXHJcbiAgICAgICAgICAgICdwY2JfdHJhbnNmb3JtOiBQY2JUcmFuc2Zvcm0sJyArXHJcbiAgICAgICAgICAgICdtaXhfdGFibGU6IE1peFRhYmxlLCcgK1xyXG4gICAgICAgICAgICAnbWFnX2JpYXM6IE1hZ0JpYXMsJyArXHJcbiAgICAgICAgICAgICdjaGFubmVsOiBDaGFubmVsUHJvcGVydGllcywnICtcclxuICAgICAgICAgICAgJ3BpZF9wYXJhbWV0ZXJzOiBQSURQYXJhbWV0ZXJzLCcgK1xyXG4gICAgICAgICAgICAnc3RhdGVfcGFyYW1ldGVyczogU3RhdGVQYXJhbWV0ZXJzLCcgK1xyXG4gICAgICAgICAgICAnbGVkX3N0YXRlczogTEVEU3RhdGVzRml4ZWQsJyArXHJcbiAgICAgICAgICAgICdkZXZpY2VfbmFtZTogRGV2aWNlTmFtZSwnICtcclxuICAgICAgICAgICAgJ3ZlbG9jaXR5X3BpZF9wYXJhbWV0ZXJzOiBWZWxvY2l0eVBJRFBhcmFtZXRlcnMsJyArXHJcbiAgICAgICAgICAgICdpbmVydGlhbF9iaWFzOiBJbmVydGlhbEJpYXMgfTsnO1xyXG5cclxuICAgICAgICB2YXIgY29uZmlnRmxhZzE0ID0gJ0NvbmZpZ3VyYXRpb25GbGFnID0gey8xNi8nICtcclxuICAgICAgICAgICAgJ3ZlcnNpb246IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdjb25maWdfaWQ6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdwY2JfdHJhbnNmb3JtOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnbWl4X3RhYmxlOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnbWFnX2JpYXM6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdjaGFubmVsOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAncGlkX3BhcmFtZXRlcnM6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdzdGF0ZV9wYXJhbWV0ZXJzOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnbGVkX3N0YXRlczogWy8vIHZvaWQ6MTZdLCcgK1xyXG4gICAgICAgICAgICAnZGV2aWNlX25hbWU6IHZvaWR9Oyc7XHJcblxyXG4gICAgICAgIHZhciBjb25maWdGbGFnID0gJ0NvbmZpZ3VyYXRpb25GbGFnID0gey8xNi8nICtcclxuICAgICAgICAgICAgJ3ZlcnNpb246IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdjb25maWdfaWQ6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdwY2JfdHJhbnNmb3JtOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnbWl4X3RhYmxlOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnbWFnX2JpYXM6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdjaGFubmVsOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAncGlkX3BhcmFtZXRlcnM6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdzdGF0ZV9wYXJhbWV0ZXJzOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnbGVkX3N0YXRlczogWy8vIHZvaWQ6MTZdLCcgK1xyXG4gICAgICAgICAgICAnZGV2aWNlX25hbWU6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICd2ZWxvY2l0eV9waWRfcGFyYW1ldGVyczogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2luZXJ0aWFsX2JpYXM6IHZvaWQgfTsnO1xyXG5cclxuICAgICAgICB2YXIgY29uZmlnRnVsbDE0ID0gdmVjdG9yM2YgKyBwaWRTZXR0aW5ncyArIHZlcnNpb24gKyBjb25maWdJZCArIHBjYlRyYW5zZm9ybSArXHJcbiAgICAgICAgICAgIG1peFRhYmxlICsgbWFnQmlhcyArIGNoYW5uZWxQcm9wZXJ0aWVzICsgcGlkUGFyYW1ldGVyczE0ICsgc3RhdGVQYXJhbWV0ZXJzICtcclxuICAgICAgICAgICAgc3RhdHVzRmxhZzE0MTUgKyBjb2xvciArIGxlZFN0YXRlQ2FzZSArIGxlZFN0YXRlcyArIGxlZFN0YXRlc0ZpeGVkICsgZGV2aWNlTmFtZSArXHJcbiAgICAgICAgICAgIGNvbmZpZzE0MTUgKyBjb25maWdGaXhlZDE0MTUgKyBjb25maWdGbGFnMTQ7XHJcbiAgICAgICAgdmFyIGNvbmZpZ0Z1bGwxNSA9IHZlY3RvcjNmICsgcGlkU2V0dGluZ3MgKyB2ZXJzaW9uICsgY29uZmlnSWQgKyBwY2JUcmFuc2Zvcm0gKyBtaXhUYWJsZSArXHJcbiAgICAgICAgICAgIG1hZ0JpYXMgKyBjaGFubmVsUHJvcGVydGllcyArIHBpZFBhcmFtZXRlcnMgKyBzdGF0ZVBhcmFtZXRlcnMgK1xyXG4gICAgICAgICAgICBzdGF0dXNGbGFnMTQxNSArIGNvbG9yICsgbGVkU3RhdGVDYXNlICsgbGVkU3RhdGVzICsgbGVkU3RhdGVzRml4ZWQgKyBkZXZpY2VOYW1lICtcclxuICAgICAgICAgICAgY29uZmlnMTQxNSArIGNvbmZpZ0ZpeGVkMTQxNSArIGNvbmZpZ0ZsYWc7XHJcbiAgICAgICAgdmFyIGNvbmZpZ0Z1bGwxNiA9IHZlY3RvcjNmICsgcGlkU2V0dGluZ3MgKyB2ZXJzaW9uICsgY29uZmlnSWQgKyBwY2JUcmFuc2Zvcm0gKyBtaXhUYWJsZSArXHJcbiAgICAgICAgICAgIG1hZ0JpYXMgKyBjaGFubmVsUHJvcGVydGllcyArIHBpZFBhcmFtZXRlcnMgKyBzdGF0ZVBhcmFtZXRlcnMgK1xyXG4gICAgICAgICAgICBzdGF0dXNGbGFnICsgY29sb3IgKyBsZWRTdGF0ZUNhc2UgKyBsZWRTdGF0ZXMgKyBsZWRTdGF0ZXNGaXhlZCArIGRldmljZU5hbWUgK1xyXG4gICAgICAgICAgICBpbmVydGlhbEJpYXMgKyB2ZWxvY2l0eVBpZFBhcmFtZXRlcnMgK1xyXG4gICAgICAgICAgICBjb25maWcgKyBjb25maWdGaXhlZCArIGNvbmZpZ0ZsYWc7XHJcblxyXG4gICAgICAgIHZhciBzdGF0ZSA9ICdSb3RhdGlvbiA9IHsgcm9sbDogZjMyLCBwaXRjaDogZjMyLCB5YXc6IGYzMiB9OycgK1xyXG4gICAgICAgICAgICAnUElEU3RhdGUgPSB7JyArXHJcbiAgICAgICAgICAgICd0aW1lc3RhbXBfdXM6IHUzMiwnICtcclxuICAgICAgICAgICAgJ2lucHV0OiBmMzIsJyArXHJcbiAgICAgICAgICAgICdzZXRwb2ludDogZjMyLCcgK1xyXG4gICAgICAgICAgICAncF90ZXJtOiBmMzIsJyArXHJcbiAgICAgICAgICAgICdpX3Rlcm06IGYzMiwnICtcclxuICAgICAgICAgICAgJ2RfdGVybTogZjMyIH07JyArXHJcbiAgICAgICAgICAgICdSY0NvbW1hbmQgPSB7IHRocm90dGxlOiBpMTYsIHBpdGNoOiBpMTYsIHJvbGw6IGkxNiwgeWF3OiBpMTYgfTsnICtcclxuICAgICAgICAgICAgJ1N0YXRlID0gey8zMi8nICtcclxuICAgICAgICAgICAgJ3RpbWVzdGFtcF91czogdTMyLCcgK1xyXG4gICAgICAgICAgICAnc3RhdHVzOiBTdGF0dXNGbGFnLCcgK1xyXG4gICAgICAgICAgICAndjBfcmF3OiB1MTYsJyArXHJcbiAgICAgICAgICAgICdpMF9yYXc6IHUxNiwnICtcclxuICAgICAgICAgICAgJ2kxX3JhdzogdTE2LCcgK1xyXG4gICAgICAgICAgICAnYWNjZWw6IFZlY3RvcjNmLCcgK1xyXG4gICAgICAgICAgICAnZ3lybzogVmVjdG9yM2YsJyArXHJcbiAgICAgICAgICAgICdtYWc6IFZlY3RvcjNmLCcgK1xyXG4gICAgICAgICAgICAndGVtcGVyYXR1cmU6IHUxNiwnICtcclxuICAgICAgICAgICAgJ3ByZXNzdXJlOiB1MzIsJyArXHJcbiAgICAgICAgICAgICdwcG06IFtpMTY6Nl0sJyArXHJcbiAgICAgICAgICAgICdhdXhfY2hhbl9tYXNrOiB1OCwnICtcclxuICAgICAgICAgICAgJ2NvbW1hbmQ6IFJjQ29tbWFuZCwnICtcclxuICAgICAgICAgICAgJ2NvbnRyb2w6IHsgZno6IGYzMiwgdHg6IGYzMiwgdHk6IGYzMiwgdHo6IGYzMiB9LCcgK1xyXG4gICAgICAgICAgICAncGlkX21hc3Rlcl9mejogUElEU3RhdGUsJyArXHJcbiAgICAgICAgICAgICdwaWRfbWFzdGVyX3R4OiBQSURTdGF0ZSwnICtcclxuICAgICAgICAgICAgJ3BpZF9tYXN0ZXJfdHk6IFBJRFN0YXRlLCcgK1xyXG4gICAgICAgICAgICAncGlkX21hc3Rlcl90ejogUElEU3RhdGUsJyArXHJcbiAgICAgICAgICAgICdwaWRfc2xhdmVfZno6IFBJRFN0YXRlLCcgK1xyXG4gICAgICAgICAgICAncGlkX3NsYXZlX3R4OiBQSURTdGF0ZSwnICtcclxuICAgICAgICAgICAgJ3BpZF9zbGF2ZV90eTogUElEU3RhdGUsJyArXHJcbiAgICAgICAgICAgICdwaWRfc2xhdmVfdHo6IFBJRFN0YXRlLCcgK1xyXG4gICAgICAgICAgICAnbW90b3Jfb3V0OiBbaTE2OjhdLCcgK1xyXG4gICAgICAgICAgICAna2luZW1hdGljc19hbmdsZTogUm90YXRpb24sJyArXHJcbiAgICAgICAgICAgICdraW5lbWF0aWNzX3JhdGU6IFJvdGF0aW9uLCcgK1xyXG4gICAgICAgICAgICAna2luZW1hdGljc19hbHRpdHVkZTogZjMyLCcgK1xyXG4gICAgICAgICAgICAnbG9vcF9jb3VudDogdTMyIH07JztcclxuXHJcbiAgICAgICAgdmFyIGF1eE1hc2sgPSAnQXV4TWFzayA9IHsvLycgK1xyXG4gICAgICAgICAgICAnYXV4MV9sb3c6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdhdXgxX21pZDogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2F1eDFfaGlnaDogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2F1eDJfbG93OiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnYXV4Ml9taWQ6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdhdXgyX2hpZ2g6IHZvaWQgfTsnO1xyXG5cclxuICAgICAgICB2YXIgY29tbWFuZHMgPSBhdXhNYXNrICsgJ0NvbW1hbmQgPSB7LzMyLycgK1xyXG4gICAgICAgICAgICAncmVxdWVzdF9yZXNwb25zZTogdm9pZCwnICtcclxuICAgICAgICAgICAgJ3NldF9lZXByb21fZGF0YTogQ29uZmlndXJhdGlvbkZpeGVkLCcgK1xyXG4gICAgICAgICAgICAncmVpbml0X2VlcHJvbV9kYXRhOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAncmVxdWVzdF9lZXByb21fZGF0YTogdm9pZCwnICtcclxuICAgICAgICAgICAgJ3JlcXVlc3RfZW5hYmxlX2l0ZXJhdGlvbjogdTgsJyArXHJcbiAgICAgICAgICAgICdtb3Rvcl9vdmVycmlkZV9zcGVlZF8wOiB1MTYsJyArXHJcbiAgICAgICAgICAgICdtb3Rvcl9vdmVycmlkZV9zcGVlZF8xOiB1MTYsJyArXHJcbiAgICAgICAgICAgICdtb3Rvcl9vdmVycmlkZV9zcGVlZF8yOiB1MTYsJyArXHJcbiAgICAgICAgICAgICdtb3Rvcl9vdmVycmlkZV9zcGVlZF8zOiB1MTYsJyArXHJcbiAgICAgICAgICAgICdtb3Rvcl9vdmVycmlkZV9zcGVlZF80OiB1MTYsJyArXHJcbiAgICAgICAgICAgICdtb3Rvcl9vdmVycmlkZV9zcGVlZF81OiB1MTYsJyArXHJcbiAgICAgICAgICAgICdtb3Rvcl9vdmVycmlkZV9zcGVlZF82OiB1MTYsJyArXHJcbiAgICAgICAgICAgICdtb3Rvcl9vdmVycmlkZV9zcGVlZF83OiB1MTYsJyArXHJcbiAgICAgICAgICAgICdzZXRfY29tbWFuZF9vdmVycmlkZTogYm9vbCwnICtcclxuICAgICAgICAgICAgJ3NldF9zdGF0ZV9tYXNrOiB1MzIsJyArXHJcbiAgICAgICAgICAgICdzZXRfc3RhdGVfZGVsYXk6IHUxNiwnICtcclxuICAgICAgICAgICAgJ3NldF9zZF93cml0ZV9kZWxheTogdTE2LCcgK1xyXG4gICAgICAgICAgICAnc2V0X2xlZDogeycgK1xyXG4gICAgICAgICAgICAnICBwYXR0ZXJuOiB1OCwnICtcclxuICAgICAgICAgICAgJyAgY29sb3JfcmlnaHQ6IENvbG9yLCcgK1xyXG4gICAgICAgICAgICAnICBjb2xvcl9sZWZ0OiBDb2xvciwnICtcclxuICAgICAgICAgICAgJyAgaW5kaWNhdG9yX3JlZDogYm9vbCwnICtcclxuICAgICAgICAgICAgJyAgaW5kaWNhdG9yX2dyZWVuOiBib29sIH0sJyArXHJcbiAgICAgICAgICAgICdzZXRfc2VyaWFsX3JjOiB7IGVuYWJsZWQ6IGJvb2wsIGNvbW1hbmQ6IFJjQ29tbWFuZCwgYXV4X21hc2s6IEF1eE1hc2sgfSwnICtcclxuICAgICAgICAgICAgJ3NldF9jYXJkX3JlY29yZGluZ19zdGF0ZTogey84LyByZWNvcmRfdG9fY2FyZDogdm9pZCwgbG9ja19yZWNvcmRpbmdfc3RhdGU6IHZvaWQgfSwnICtcclxuICAgICAgICAgICAgJ3NldF9wYXJ0aWFsX2VlcHJvbV9kYXRhOiBDb25maWd1cmF0aW9uLCcgK1xyXG4gICAgICAgICAgICAncmVpbml0X3BhcnRpYWxfZWVwcm9tX2RhdGE6IENvbmZpZ3VyYXRpb25GbGFnLCcgK1xyXG4gICAgICAgICAgICAncmVxX3BhcnRpYWxfZWVwcm9tX2RhdGE6IENvbmZpZ3VyYXRpb25GbGFnLCcgK1xyXG4gICAgICAgICAgICAncmVxX2NhcmRfcmVjb3JkaW5nX3N0YXRlOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnc2V0X3BhcnRpYWxfdGVtcG9yYXJ5X2NvbmZpZzogQ29uZmlndXJhdGlvbiwnICtcclxuICAgICAgICAgICAgJ3NldF9jb21tYW5kX3NvdXJjZXM6IHsvOC8gc2VyaWFsOiB2b2lkLCByYWRpbzogdm9pZCB9LCcgK1xyXG4gICAgICAgICAgICAnc2V0X2NhbGlicmF0aW9uOiB7IGVuYWJsZWQ6IGJvb2wsIG1vZGU6IHU4IH0sJyArXHJcbiAgICAgICAgICAgICdzZXRfYXV0b3BpbG90X2VuYWJsZWQ6IGJvb2wsJyArXHJcbiAgICAgICAgICAgICdzZXRfdXNiX21vZGU6IHU4fTsnO1xyXG5cclxuICAgICAgICB2YXIgZGVidWdTdHJpbmcgPSBcIkRlYnVnU3RyaW5nID0geyBkZXByZWNhdGVkX21hc2s6IHUzMiwgbWVzc2FnZTogcyB9O1wiO1xyXG4gICAgICAgIHZhciBoaXN0b3J5RGF0YSA9IFwiSGlzdG9yeURhdGEgPSBEZWJ1Z1N0cmluZztcIjtcclxuICAgICAgICB2YXIgcmVzcG9uc2UgPSBcIlJlc3BvbnNlID0geyBtYXNrOiB1MzIsIGFjazogdTMyIH07XCI7XHJcblxyXG4gICAgICAgIHZhciBoYW5kbGVyMTQgPSBjb25maWdGdWxsMTQgKyBzdGF0ZSArIGNvbW1hbmRzICsgZGVidWdTdHJpbmcgKyBoaXN0b3J5RGF0YSArIHJlc3BvbnNlO1xyXG4gICAgICAgIHZhciBoYW5kbGVyMTUgPSBjb25maWdGdWxsMTUgKyBzdGF0ZSArIGNvbW1hbmRzICsgZGVidWdTdHJpbmcgKyBoaXN0b3J5RGF0YSArIHJlc3BvbnNlO1xyXG4gICAgICAgIHZhciBoYW5kbGVyMTYgPSBjb25maWdGdWxsMTYgKyBzdGF0ZSArIGNvbW1hbmRzICsgZGVidWdTdHJpbmcgKyBoaXN0b3J5RGF0YSArIHJlc3BvbnNlO1xyXG5cclxuICAgICAgICBoYW5kbGVyQ2FjaGVbJzEuNC4wJ10gPSBGbHlicml4U2VyaWFsaXphdGlvbi5wYXJzZShoYW5kbGVyMTQpO1xyXG4gICAgICAgIGhhbmRsZXJDYWNoZVsnMS41LjAnXSA9IGhhbmRsZXJDYWNoZVsnMS41LjEnXSA9IEZseWJyaXhTZXJpYWxpemF0aW9uLnBhcnNlKGhhbmRsZXIxNSk7XHJcbiAgICAgICAgaGFuZGxlckNhY2hlWycxLjYuMCddID0gRmx5YnJpeFNlcmlhbGl6YXRpb24ucGFyc2UoaGFuZGxlcjE2KTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gdXBkYXRlRmllbGRzKHRhcmdldCwgc291cmNlKSB7XHJcbiAgICAgICAgICAgIGlmIChzb3VyY2UgaW5zdGFuY2VvZiBBcnJheSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHVwZGF0ZUZpZWxkc0FycmF5KHRhcmdldCwgc291cmNlKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChzb3VyY2UgaW5zdGFuY2VvZiBPYmplY3QpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB1cGRhdGVGaWVsZHNPYmplY3QodGFyZ2V0LCBzb3VyY2UpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIChzb3VyY2UgPT09IG51bGwgfHwgc291cmNlID09PSB1bmRlZmluZWQpID8gdGFyZ2V0IDogc291cmNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiB1cGRhdGVGaWVsZHNPYmplY3QodGFyZ2V0LCBzb3VyY2UpIHtcclxuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHt9O1xyXG4gICAgICAgICAgICBPYmplY3Qua2V5cyh0YXJnZXQpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0W2tleV0gPSB1cGRhdGVGaWVsZHModGFyZ2V0W2tleV0sIHNvdXJjZVtrZXldKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKHNvdXJjZSkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoa2V5IGluIHJlc3VsdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJlc3VsdFtrZXldID0gdXBkYXRlRmllbGRzKHRhcmdldFtrZXldLCBzb3VyY2Vba2V5XSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gdXBkYXRlRmllbGRzQXJyYXkodGFyZ2V0LCBzb3VyY2UpIHtcclxuICAgICAgICAgICAgdmFyIGxlbmd0aCA9IE1hdGgubWF4KHRhcmdldC5sZW5ndGgsIHNvdXJjZS5sZW5ndGgpO1xyXG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gW107XHJcbiAgICAgICAgICAgIGZvciAodmFyIGlkeCA9IDA7IGlkeCA8IGxlbmd0aDsgKytpZHgpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKHVwZGF0ZUZpZWxkcyh0YXJnZXRbaWR4XSwgc291cmNlW2lkeF0pKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgU2VyaWFsaXplcjogRmx5YnJpeFNlcmlhbGl6YXRpb24uU2VyaWFsaXplcixcclxuICAgICAgICAgICAgZ2V0SGFuZGxlcjogZnVuY3Rpb24gKGZpcm13YXJlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlckNhY2hlW2Zpcm13YXJlXTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdXBkYXRlRmllbGRzOiB1cGRhdGVGaWVsZHMsXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbn0oKSk7XHJcbiJdfQ==
