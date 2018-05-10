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
            try {
                var serializer = new serializationHandler.Serializer(new DataView(bytes.buffer, 1));
                var message = handler.decode(serializer);
            } catch (err) {
                commandLog('Unrecognized message format received');
            }
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZS5qcyIsImNhbGlicmF0aW9uLmpzIiwiY29icy5qcyIsImNvbW1hbmRMb2cuanMiLCJkZXZpY2VDb25maWcuanMiLCJmaXJtd2FyZVZlcnNpb24uanMiLCJsZWQuanMiLCJyY0RhdGEuanMiLCJzZXJpYWwuanMiLCJzZXJpYWxpemF0aW9uSGFuZGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImZseWJyaXgtY29tbW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdmbHlicml4Q29tbW9uJywgW10pO1xyXG59KCkpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ2ZseWJyaXhDb21tb24nKS5mYWN0b3J5KCdjYWxpYnJhdGlvbicsIGNhbGlicmF0aW9uKTtcclxuXHJcbiAgICBjYWxpYnJhdGlvbi4kaW5qZWN0ID0gWydjb21tYW5kTG9nJywgJ3NlcmlhbCddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGNhbGlicmF0aW9uKGNvbW1hbmRMb2csIHNlcmlhbCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIG1hZ25ldG9tZXRlcjogbWFnbmV0b21ldGVyLFxyXG4gICAgICAgICAgICBhY2NlbGVyb21ldGVyOiB7XHJcbiAgICAgICAgICAgICAgICBmbGF0OiBjYWxpYnJhdGVBY2NlbGVyb21ldGVyLmJpbmQobnVsbCwgJ2ZsYXQnLCAwKSxcclxuICAgICAgICAgICAgICAgIGZvcndhcmQ6IGNhbGlicmF0ZUFjY2VsZXJvbWV0ZXIuYmluZChudWxsLCAnbGVhbiBmb3J3YXJkJywgMSksXHJcbiAgICAgICAgICAgICAgICBiYWNrOiBjYWxpYnJhdGVBY2NlbGVyb21ldGVyLmJpbmQobnVsbCwgJ2xlYW4gYmFjaycsIDIpLFxyXG4gICAgICAgICAgICAgICAgcmlnaHQ6IGNhbGlicmF0ZUFjY2VsZXJvbWV0ZXIuYmluZChudWxsLCAnbGVhbiByaWdodCcsIDMpLFxyXG4gICAgICAgICAgICAgICAgbGVmdDogY2FsaWJyYXRlQWNjZWxlcm9tZXRlci5iaW5kKG51bGwsICdsZWFuIGxlZnQnLCA0KSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZmluaXNoOiBmaW5pc2gsXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gbWFnbmV0b21ldGVyKCkge1xyXG4gICAgICAgICAgICBjb21tYW5kTG9nKFwiQ2FsaWJyYXRpbmcgbWFnbmV0b21ldGVyIGJpYXNcIik7XHJcbiAgICAgICAgICAgIHJldHVybiBzZXJpYWwuc2VuZFN0cnVjdHVyZSgnQ29tbWFuZCcsIHtcclxuICAgICAgICAgICAgICAgIHJlcXVlc3RfcmVzcG9uc2U6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBzZXRfY2FsaWJyYXRpb246IHtcclxuICAgICAgICAgICAgICAgICAgICBlbmFibGVkOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIG1vZGU6IDAsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9LCBmYWxzZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBjYWxpYnJhdGVBY2NlbGVyb21ldGVyKHBvc2VEZXNjcmlwdGlvbiwgcG9zZUlkKSB7XHJcbiAgICAgICAgICAgIGNvbW1hbmRMb2coXCJDYWxpYnJhdGluZyBncmF2aXR5IGZvciBwb3NlOiBcIiArIHBvc2VEZXNjcmlwdGlvbik7XHJcbiAgICAgICAgICAgIHJldHVybiBzZXJpYWwuc2VuZFN0cnVjdHVyZSgnQ29tbWFuZCcsIHtcclxuICAgICAgICAgICAgICAgIHJlcXVlc3RfcmVzcG9uc2U6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBzZXRfY2FsaWJyYXRpb246IHtcclxuICAgICAgICAgICAgICAgICAgICBlbmFibGVkOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIG1vZGU6IHBvc2VJZCArIDEsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9LCBmYWxzZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBmaW5pc2goKSB7XHJcbiAgICAgICAgICAgIGNvbW1hbmRMb2coXCJGaW5pc2hpbmcgY2FsaWJyYXRpb25cIik7XHJcbiAgICAgICAgICAgIHJldHVybiBzZXJpYWwuc2VuZFN0cnVjdHVyZSgnQ29tbWFuZCcsIHtcclxuICAgICAgICAgICAgICAgIHJlcXVlc3RfcmVzcG9uc2U6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBzZXRfY2FsaWJyYXRpb246IHtcclxuICAgICAgICAgICAgICAgICAgICBlbmFibGVkOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICBtb2RlOiAwLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSwgZmFsc2UpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSgpKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdmbHlicml4Q29tbW9uJykuZmFjdG9yeSgnY29icycsIGNvYnMpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGNvYnMoKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgUmVhZGVyOiBSZWFkZXIsXHJcbiAgICAgICAgICAgIGVuY29kZTogZW5jb2RlLFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG5cclxuICAgIGZ1bmN0aW9uIFJlYWRlcihjYXBhY2l0eSkge1xyXG4gICAgICAgIGlmIChjYXBhY2l0eSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgIGNhcGFjaXR5ID0gMjAwMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5OID0gY2FwYWNpdHk7XHJcbiAgICAgICAgdGhpcy5idWZmZXIgPSBuZXcgVWludDhBcnJheShjYXBhY2l0eSk7XHJcbiAgICAgICAgdGhpcy5yZWFkeV9mb3JfbmV3X21lc3NhZ2UgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuYnVmZmVyX2xlbmd0aCA9IDA7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gY29ic0RlY29kZShyZWFkZXIpIHtcclxuICAgICAgICB2YXIgc3JjX3B0ciA9IDA7XHJcbiAgICAgICAgdmFyIGRzdF9wdHIgPSAwO1xyXG4gICAgICAgIHZhciBsZWZ0b3Zlcl9sZW5ndGggPSAwO1xyXG4gICAgICAgIHZhciBhcHBlbmRfemVybyA9IGZhbHNlO1xyXG4gICAgICAgIHdoaWxlIChyZWFkZXIuYnVmZmVyW3NyY19wdHJdKSB7XHJcbiAgICAgICAgICAgIGlmICghbGVmdG92ZXJfbGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoYXBwZW5kX3plcm8pXHJcbiAgICAgICAgICAgICAgICAgICAgcmVhZGVyLmJ1ZmZlcltkc3RfcHRyKytdID0gMDtcclxuICAgICAgICAgICAgICAgIGxlZnRvdmVyX2xlbmd0aCA9IHJlYWRlci5idWZmZXJbc3JjX3B0cisrXSAtIDE7XHJcbiAgICAgICAgICAgICAgICBhcHBlbmRfemVybyA9IGxlZnRvdmVyX2xlbmd0aCA8IDB4RkU7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAtLWxlZnRvdmVyX2xlbmd0aDtcclxuICAgICAgICAgICAgICAgIHJlYWRlci5idWZmZXJbZHN0X3B0cisrXSA9IHJlYWRlci5idWZmZXJbc3JjX3B0cisrXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGxlZnRvdmVyX2xlbmd0aCA/IDAgOiBkc3RfcHRyO1xyXG4gICAgfVxyXG5cclxuICAgIFJlYWRlci5wcm90b3R5cGUucmVhZEJ5dGVzID0gZnVuY3Rpb24oZGF0YSwgb25TdWNjZXNzLCBvbkVycm9yKSB7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIHZhciBjID0gZGF0YVtpXTtcclxuICAgICAgICAgICAgaWYgKHRoaXMucmVhZHlfZm9yX25ld19tZXNzYWdlKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBmaXJzdCBieXRlIG9mIGEgbmV3IG1lc3NhZ2VcclxuICAgICAgICAgICAgICAgIHRoaXMucmVhZHlfZm9yX25ld19tZXNzYWdlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJ1ZmZlcl9sZW5ndGggPSAwO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLmJ1ZmZlclt0aGlzLmJ1ZmZlcl9sZW5ndGgrK10gPSBjO1xyXG5cclxuICAgICAgICAgICAgaWYgKGMpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmJ1ZmZlcl9sZW5ndGggPT09IHRoaXMuTikge1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIGJ1ZmZlciBvdmVyZmxvdywgcHJvYmFibHkgZHVlIHRvIGVycm9ycyBpbiBkYXRhXHJcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcignb3ZlcmZsb3cnLCAnYnVmZmVyIG92ZXJmbG93IGluIENPQlMgZGVjb2RpbmcnKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlYWR5X2Zvcl9uZXdfbWVzc2FnZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5idWZmZXJfbGVuZ3RoID0gY29ic0RlY29kZSh0aGlzKTtcclxuICAgICAgICAgICAgdmFyIGZhaWxlZF9kZWNvZGUgPSAodGhpcy5idWZmZXJfbGVuZ3RoID09PSAwKTtcclxuICAgICAgICAgICAgaWYgKGZhaWxlZF9kZWNvZGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYnVmZmVyWzBdID0gMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgajtcclxuICAgICAgICAgICAgZm9yIChqID0gMTsgaiA8IHRoaXMuYnVmZmVyX2xlbmd0aDsgKytqKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJ1ZmZlclswXSBePSB0aGlzLmJ1ZmZlcltqXTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodGhpcy5idWZmZXJbMF0gPT09IDApIHsgIC8vIGNoZWNrIHN1bSBpcyBjb3JyZWN0XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlYWR5X2Zvcl9uZXdfbWVzc2FnZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5idWZmZXJfbGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG9uU3VjY2Vzcyh0aGlzLmJ1ZmZlci5zbGljZSgxLCB0aGlzLmJ1ZmZlcl9sZW5ndGgpKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcignc2hvcnQnLCAnVG9vIHNob3J0IHBhY2tldCcpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2UgeyAgLy8gYmFkIGNoZWNrc3VtXHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlYWR5X2Zvcl9uZXdfbWVzc2FnZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB2YXIgYnl0ZXMgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgZm9yIChqID0gMDsgaiA8IHRoaXMuYnVmZmVyX2xlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYnl0ZXMgKz0gdGhpcy5idWZmZXJbal0gKyBcIixcIjtcclxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlICs9IFN0cmluZy5mcm9tQ2hhckNvZGUodGhpcy5idWZmZXJbal0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGZhaWxlZF9kZWNvZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKCdmcmFtZScsICdVbmV4cGVjdGVkIGVuZGluZyBvZiBwYWNrZXQnKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG1zZyA9ICdCQUQgQ0hFQ0tTVU0gKCcgKyB0aGlzLmJ1ZmZlcl9sZW5ndGggK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAnIGJ5dGVzKScgKyBieXRlcyArIG1lc3NhZ2U7XHJcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcignY2hlY2tzdW0nLCBtc2cpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBmdW5jdGlvbiBlbmNvZGUoYnVmKSB7XHJcbiAgICAgICAgdmFyIHJldHZhbCA9XHJcbiAgICAgICAgICAgIG5ldyBVaW50OEFycmF5KE1hdGguZmxvb3IoKGJ1Zi5ieXRlTGVuZ3RoICogMjU1ICsgNzYxKSAvIDI1NCkpO1xyXG4gICAgICAgIHZhciBsZW4gPSAxO1xyXG4gICAgICAgIHZhciBwb3NfY3RyID0gMDtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGJ1Zi5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICBpZiAocmV0dmFsW3Bvc19jdHJdID09IDB4RkUpIHtcclxuICAgICAgICAgICAgICAgIHJldHZhbFtwb3NfY3RyXSA9IDB4RkY7XHJcbiAgICAgICAgICAgICAgICBwb3NfY3RyID0gbGVuKys7XHJcbiAgICAgICAgICAgICAgICByZXR2YWxbcG9zX2N0cl0gPSAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciB2YWwgPSBidWZbaV07XHJcbiAgICAgICAgICAgICsrcmV0dmFsW3Bvc19jdHJdO1xyXG4gICAgICAgICAgICBpZiAodmFsKSB7XHJcbiAgICAgICAgICAgICAgICByZXR2YWxbbGVuKytdID0gdmFsO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcG9zX2N0ciA9IGxlbisrO1xyXG4gICAgICAgICAgICAgICAgcmV0dmFsW3Bvc19jdHJdID0gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gcmV0dmFsLnN1YmFycmF5KDAsIGxlbikuc2xpY2UoKS5idWZmZXI7XHJcbiAgICB9O1xyXG59KCkpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ2ZseWJyaXhDb21tb24nKS5mYWN0b3J5KCdjb21tYW5kTG9nJywgY29tbWFuZExvZyk7XHJcblxyXG4gICAgY29tbWFuZExvZy4kaW5qZWN0ID0gWyckcSddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGNvbW1hbmRMb2coJHEpIHtcclxuICAgICAgICB2YXIgbWVzc2FnZXMgPSBbXTtcclxuICAgICAgICB2YXIgcmVzcG9uZGVyID0gJHEuZGVmZXIoKTtcclxuXHJcbiAgICAgICAgdmFyIHNlcnZpY2UgPSBsb2c7XHJcbiAgICAgICAgc2VydmljZS5sb2cgPSBsb2c7XHJcbiAgICAgICAgc2VydmljZS5jbGVhclN1YnNjcmliZXJzID0gY2xlYXJTdWJzY3JpYmVycztcclxuICAgICAgICBzZXJ2aWNlLm9uTWVzc2FnZSA9IG9uTWVzc2FnZTtcclxuICAgICAgICBzZXJ2aWNlLnJlYWQgPSByZWFkO1xyXG5cclxuICAgICAgICByZXR1cm4gc2VydmljZTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gbG9nKG1lc3NhZ2UpIHtcclxuICAgICAgICAgICAgaWYgKG1lc3NhZ2UgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgbWVzc2FnZXMucHVzaChtZXNzYWdlKTtcclxuICAgICAgICAgICAgICAgIHJlc3BvbmRlci5ub3RpZnkocmVhZCgpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gcmVhZCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG1lc3NhZ2VzO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gY2xlYXJTdWJzY3JpYmVycygpIHtcclxuICAgICAgICAgICAgcmVzcG9uZGVyID0gJHEuZGVmZXIoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIG9uTWVzc2FnZShjYWxsYmFjaykge1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uZGVyLnByb21pc2UudGhlbih1bmRlZmluZWQsIHVuZGVmaW5lZCwgY2FsbGJhY2spO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSgpKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdmbHlicml4Q29tbW9uJykuZmFjdG9yeSgnZGV2aWNlQ29uZmlnJywgZGV2aWNlQ29uZmlnKTtcclxuXHJcbiAgICBkZXZpY2VDb25maWcuJGluamVjdCA9IFsnc2VyaWFsJywgJ2NvbW1hbmRMb2cnLCAnZmlybXdhcmVWZXJzaW9uJywgJ3NlcmlhbGl6YXRpb25IYW5kbGVyJ107XHJcblxyXG4gICAgZnVuY3Rpb24gZGV2aWNlQ29uZmlnKHNlcmlhbCwgY29tbWFuZExvZywgZmlybXdhcmVWZXJzaW9uLCBzZXJpYWxpemF0aW9uSGFuZGxlcikge1xyXG4gICAgICAgIHZhciBjb25maWc7XHJcblxyXG4gICAgICAgIHZhciBjb25maWdDYWxsYmFjayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBjb21tYW5kTG9nKCdObyBjYWxsYmFjayBkZWZpbmVkIGZvciByZWNlaXZpbmcgY29uZmlndXJhdGlvbnMhJyk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdmFyIGxvZ2dpbmdDYWxsYmFjayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBjb21tYW5kTG9nKFxyXG4gICAgICAgICAgICAgICAgJ05vIGNhbGxiYWNrIGRlZmluZWQgZm9yIHJlY2VpdmluZyBsb2dnaW5nIHN0YXRlIScgK1xyXG4gICAgICAgICAgICAgICAgJyBDYWxsYmFjayBhcmd1bWVudHM6IChpc0xvZ2dpbmcsIGlzTG9ja2VkLCBkZWxheSknKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBzZXJpYWwuYWRkT25SZWNlaXZlQ2FsbGJhY2soZnVuY3Rpb24obWVzc2FnZVR5cGUsIG1lc3NhZ2UpIHtcclxuICAgICAgICAgICAgaWYgKG1lc3NhZ2VUeXBlICE9PSAnQ29tbWFuZCcpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoJ3NldF9lZXByb21fZGF0YScgaW4gbWVzc2FnZSkge1xyXG4gICAgICAgICAgICAgICAgdXBkYXRlQ29uZmlnRnJvbVJlbW90ZURhdGEobWVzc2FnZS5zZXRfZWVwcm9tX2RhdGEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICgnc2V0X3BhcnRpYWxfZWVwcm9tX2RhdGEnIGluIG1lc3NhZ2UpIHtcclxuICAgICAgICAgICAgICAgIHVwZGF0ZUNvbmZpZ0Zyb21SZW1vdGVEYXRhKG1lc3NhZ2Uuc2V0X3BhcnRpYWxfZWVwcm9tX2RhdGEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICgoJ3NldF9jYXJkX3JlY29yZGluZ19zdGF0ZScgaW4gbWVzc2FnZSkgJiYgKCdzZXRfc2Rfd3JpdGVfZGVsYXknIGluIG1lc3NhZ2UpKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgY2FyZF9yZWNfc3RhdGUgPSBtZXNzYWdlLnNldF9jYXJkX3JlY29yZGluZ19zdGF0ZTtcclxuICAgICAgICAgICAgICAgIHZhciBzZF93cml0ZV9kZWxheSA9IG1lc3NhZ2Uuc2V0X3NkX3dyaXRlX2RlbGF5O1xyXG4gICAgICAgICAgICAgICAgbG9nZ2luZ0NhbGxiYWNrKGNhcmRfcmVjX3N0YXRlLnJlY29yZF90b19jYXJkLCBjYXJkX3JlY19zdGF0ZS5sb2NrX3JlY29yZGluZ19zdGF0ZSwgc2Rfd3JpdGVfZGVsYXkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdldERlc2lyZWRWZXJzaW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmlybXdhcmVWZXJzaW9uLmRlc2lyZWQoKTtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICBmdW5jdGlvbiByZXF1ZXN0KCkge1xyXG4gICAgICAgICAgICB2YXIgaGFuZGxlcnMgPSBmaXJtd2FyZVZlcnNpb24uc2VyaWFsaXphdGlvbkhhbmRsZXIoKTtcclxuICAgICAgICAgICAgY29tbWFuZExvZygnUmVxdWVzdGluZyBjdXJyZW50IGNvbmZpZ3VyYXRpb24gZGF0YS4uLicpO1xyXG4gICAgICAgICAgICByZXR1cm4gc2VyaWFsLnNlbmRTdHJ1Y3R1cmUoJ0NvbW1hbmQnLCB7XHJcbiAgICAgICAgICAgICAgICByZXF1ZXN0X3Jlc3BvbnNlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgcmVxX3BhcnRpYWxfZWVwcm9tX2RhdGE6IGhhbmRsZXJzLkNvbmZpZ3VyYXRpb25GbGFnLmVtcHR5KCksXHJcbiAgICAgICAgICAgIH0sIGZhbHNlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHJlaW5pdCgpIHtcclxuICAgICAgICAgICAgY29tbWFuZExvZygnU2V0dGluZyBmYWN0b3J5IGRlZmF1bHQgY29uZmlndXJhdGlvbiBkYXRhLi4uJyk7XHJcbiAgICAgICAgICAgIHJldHVybiBzZXJpYWwuc2VuZFN0cnVjdHVyZSgnQ29tbWFuZCcsIHtcclxuICAgICAgICAgICAgICAgIHJlcXVlc3RfcmVzcG9uc2U6IHRydWUsXHJcbiAgICAgICAgICAgICAgICByZWluaXRfZWVwcm9tX2RhdGE6IHRydWUsXHJcbiAgICAgICAgICAgIH0sIGZhbHNlKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oXHJcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByZXF1ZXN0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbihyZWFzb24pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29tbWFuZExvZyhcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdSZXF1ZXN0IGZvciBmYWN0b3J5IHJlc2V0IGZhaWxlZDogJyArIHJlYXNvbik7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZW5kKG5ld0NvbmZpZykge1xyXG4gICAgICAgICAgICByZXR1cm4gc2VuZENvbmZpZyh7IGNvbmZpZzogbmV3Q29uZmlnLCB0ZW1wb3Jhcnk6IGZhbHNlLCByZXF1ZXN0VXBkYXRlOiB0cnVlIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2VuZENvbmZpZyhwcm9wZXJ0aWVzKSB7XHJcbiAgICAgICAgICAgIHZhciBoYW5kbGVycyA9IGZpcm13YXJlVmVyc2lvbi5zZXJpYWxpemF0aW9uSGFuZGxlcigpO1xyXG4gICAgICAgICAgICB2YXIgbWFzayA9IHByb3BlcnRpZXMubWFzayB8fCBoYW5kbGVycy5Db25maWd1cmF0aW9uRmxhZy5lbXB0eSgpO1xyXG4gICAgICAgICAgICB2YXIgbmV3Q29uZmlnID0gcHJvcGVydGllcy5jb25maWcgfHwgY29uZmlnO1xyXG4gICAgICAgICAgICB2YXIgcmVxdWVzdFVwZGF0ZSA9IHByb3BlcnRpZXMucmVxdWVzdFVwZGF0ZSB8fCBmYWxzZTtcclxuICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSB7XHJcbiAgICAgICAgICAgICAgICByZXF1ZXN0X3Jlc3BvbnNlOiB0cnVlLFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBpZiAocHJvcGVydGllcy50ZW1wb3JhcnkpIHtcclxuICAgICAgICAgICAgICAgIG1lc3NhZ2Uuc2V0X3BhcnRpYWxfdGVtcG9yYXJ5X2NvbmZpZyA9IG5ld0NvbmZpZztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG1lc3NhZ2Uuc2V0X3BhcnRpYWxfZWVwcm9tX2RhdGEgPSBuZXdDb25maWc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHNlcmlhbC5zZW5kU3RydWN0dXJlKCdDb21tYW5kJywgbWVzc2FnZSwgdHJ1ZSwgbWFzaykudGhlbihmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGlmIChyZXF1ZXN0VXBkYXRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVxdWVzdCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHVwZGF0ZUNvbmZpZ0Zyb21SZW1vdGVEYXRhKGNvbmZpZ0NoYW5nZXMpIHtcclxuICAgICAgICAgICAgLy9jb21tYW5kTG9nKCdSZWNlaXZlZCBjb25maWchJyk7XHJcbiAgICAgICAgICAgIGNvbmZpZyA9IHNlcmlhbGl6YXRpb25IYW5kbGVyLnVwZGF0ZUZpZWxkcyhjb25maWcsIGNvbmZpZ0NoYW5nZXMpO1xyXG4gICAgICAgICAgICBmaXJtd2FyZVZlcnNpb24uc2V0KGNvbmZpZy52ZXJzaW9uKTtcclxuICAgICAgICAgICAgaWYgKCFmaXJtd2FyZVZlcnNpb24uc3VwcG9ydGVkKCkpIHtcclxuICAgICAgICAgICAgICAgIGNvbW1hbmRMb2coJ1JlY2VpdmVkIGFuIHVuc3VwcG9ydGVkIGNvbmZpZ3VyYXRpb24hJyk7XHJcbiAgICAgICAgICAgICAgICBjb21tYW5kTG9nKFxyXG4gICAgICAgICAgICAgICAgICAgICdGb3VuZCB2ZXJzaW9uOiAnICsgY29uZmlnLnZlcnNpb25bMF0gKyAnLicgK1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZy52ZXJzaW9uWzFdICsgJy4nICsgY29uZmlnLnZlcnNpb25bMl0gICtcclxuICAgICAgICAgICAgICAgICAgICAnIC0tLSBOZXdlc3QgdmVyc2lvbjogJyArXHJcbiAgICAgICAgICAgICAgICAgICAgZmlybXdhcmVWZXJzaW9uLmRlc2lyZWRLZXkoKSApO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29tbWFuZExvZyhcclxuICAgICAgICAgICAgICAgICAgICAnUmVjZWl2ZWQgY29uZmlndXJhdGlvbiBkYXRhICh2JyArXHJcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnLnZlcnNpb25bMF0gKyAnLicgKyBjb25maWcudmVyc2lvblsxXSArICcuJyArXHJcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnLnZlcnNpb25bMl0gKycpJyk7XHJcbiAgICAgICAgICAgICAgICBjb25maWdDYWxsYmFjaygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZXRDb25maWdDYWxsYmFjayhjYWxsYmFjaykge1xyXG4gICAgICAgICAgICBjb25maWdDYWxsYmFjayA9IGNhbGxiYWNrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2V0TG9nZ2luZ0NhbGxiYWNrKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIGxvZ2dpbmdDYWxsYmFjayA9IGNhbGxiYWNrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0Q29uZmlnKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gY29uZmlnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uZmlnID0gZmlybXdhcmVWZXJzaW9uLnNlcmlhbGl6YXRpb25IYW5kbGVyKCkuQ29uZmlndXJhdGlvbi5lbXB0eSgpO1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXF1ZXN0OiByZXF1ZXN0LFxyXG4gICAgICAgICAgICByZWluaXQ6IHJlaW5pdCxcclxuICAgICAgICAgICAgc2VuZDogc2VuZCxcclxuICAgICAgICAgICAgc2VuZENvbmZpZzogc2VuZENvbmZpZyxcclxuICAgICAgICAgICAgZ2V0Q29uZmlnOiBnZXRDb25maWcsXHJcbiAgICAgICAgICAgIHNldENvbmZpZ0NhbGxiYWNrOiBzZXRDb25maWdDYWxsYmFjayxcclxuICAgICAgICAgICAgc2V0TG9nZ2luZ0NhbGxiYWNrOiBzZXRMb2dnaW5nQ2FsbGJhY2ssXHJcbiAgICAgICAgICAgIGdldERlc2lyZWRWZXJzaW9uOiBnZXREZXNpcmVkVmVyc2lvbixcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59KCkpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ2ZseWJyaXhDb21tb24nKS5mYWN0b3J5KCdmaXJtd2FyZVZlcnNpb24nLCBmaXJtd2FyZVZlcnNpb24pO1xyXG5cclxuICAgIGZpcm13YXJlVmVyc2lvbi4kaW5qZWN0ID0gWydzZXJpYWxpemF0aW9uSGFuZGxlciddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGZpcm13YXJlVmVyc2lvbihzZXJpYWxpemF0aW9uSGFuZGxlcikge1xyXG4gICAgICAgIHZhciB2ZXJzaW9uID0gWzAsIDAsIDBdO1xyXG4gICAgICAgIHZhciBrZXkgPSAnMC4wLjAnO1xyXG4gICAgICAgIHZhciBzdXBwb3J0ZWQgPSB7XHJcbiAgICAgICAgICAgICcxLjQuMCc6IHRydWUsXHJcbiAgICAgICAgICAgICcxLjUuMCc6IHRydWUsXHJcbiAgICAgICAgICAgICcxLjUuMSc6IHRydWUsXHJcbiAgICAgICAgICAgICcxLjYuMCc6IHRydWUsXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdmFyIGRlc2lyZWQgPSBbMSwgNiwgMF07XHJcbiAgICAgICAgdmFyIGRlc2lyZWRLZXkgPSAnMS42LjAnO1xyXG5cclxuICAgICAgICB2YXIgZGVmYXVsdFNlcmlhbGl6YXRpb25IYW5kbGVyID0gc2VyaWFsaXphdGlvbkhhbmRsZXIuZ2V0SGFuZGxlcihkZXNpcmVkS2V5KTtcclxuICAgICAgICB2YXIgY3VycmVudFNlcmlhbGl6YXRpb25IYW5kbGVyID0gZGVmYXVsdFNlcmlhbGl6YXRpb25IYW5kbGVyO1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICB2ZXJzaW9uID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICBrZXkgPSB2YWx1ZS5qb2luKCcuJyk7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50U2VyaWFsaXphdGlvbkhhbmRsZXIgPVxyXG4gICAgICAgICAgICAgICAgICAgIHNlcmlhbGl6YXRpb25IYW5kbGVyLmdldEhhbmRsZXIoZGVzaXJlZEtleSkgfHwgZGVmYXVsdFNlcmlhbGl6YXRpb25IYW5kbGVyO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZlcnNpb247XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGtleTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4ga2V5O1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzdXBwb3J0ZWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHN1cHBvcnRlZFtrZXldID09PSB0cnVlO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBkZXNpcmVkOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBkZXNpcmVkO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBkZXNpcmVkS2V5OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBkZXNpcmVkS2V5O1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzZXJpYWxpemF0aW9uSGFuZGxlcjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY3VycmVudFNlcmlhbGl6YXRpb25IYW5kbGVyO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG59KCkpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ2ZseWJyaXhDb21tb24nKS5mYWN0b3J5KCdsZWQnLCBsZWQpO1xyXG5cclxuICAgIGxlZC4kaW5qZWN0ID0gWydkZXZpY2VDb25maWcnLCAnZmlybXdhcmVWZXJzaW9uJ107XHJcblxyXG4gICAgZnVuY3Rpb24gbGVkKGRldmljZUNvbmZpZywgZmlybXdhcmVWZXJzaW9uKSB7XHJcbiAgICAgICAgdmFyIExlZFBhdHRlcm5zID0ge1xyXG4gICAgICAgICAgICBOT19PVkVSUklERTogMCxcclxuICAgICAgICAgICAgRkxBU0g6IDEsXHJcbiAgICAgICAgICAgIEJFQUNPTjogMixcclxuICAgICAgICAgICAgQlJFQVRIRTogMyxcclxuICAgICAgICAgICAgQUxURVJOQVRFOiA0LFxyXG4gICAgICAgICAgICBTT0xJRDogNSxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIga2V5cyA9IFsncmlnaHRfZnJvbnQnLCAncmlnaHRfYmFjaycsICdsZWZ0X2Zyb250JywgJ2xlZnRfYmFjayddO1xyXG4gICAgICAgIHZhciBjb2xvcnMgPSB7fTtcclxuXHJcbiAgICAgICAga2V5cy5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xyXG4gICAgICAgICAgICBjb2xvcnNba2V5XSA9IHtcclxuICAgICAgICAgICAgICAgIHJlZDogMCxcclxuICAgICAgICAgICAgICAgIGdyZWVuOiAwLFxyXG4gICAgICAgICAgICAgICAgYmx1ZTogMCxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB2YXIgbGVkU3RhdGUgPSB7XHJcbiAgICAgICAgICAgIHN0YXR1czogNjU1MzUsXHJcbiAgICAgICAgICAgIHBhdHRlcm46IExlZFBhdHRlcm5zLlNPTElELFxyXG4gICAgICAgICAgICBjb2xvcnM6IGNvbG9ycyxcclxuICAgICAgICAgICAgaW5kaWNhdG9yX3JlZDogZmFsc2UsXHJcbiAgICAgICAgICAgIGluZGljYXRvcl9ncmVlbjogZmFsc2UsXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdmFyIGNvbmZpZ1BhcnQgPSB7IGxlZF9zdGF0ZXM6IFtsZWRTdGF0ZV0gfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2V0KFxyXG4gICAgICAgICAgICBjb2xvcl9yZiwgY29sb3JfcmIsIGNvbG9yX2xmLCBjb2xvcl9sYiwgcGF0dGVybiwgcmVkLCBncmVlbikge1xyXG4gICAgICAgICAgICBsZWRTdGF0ZS5zdGF0dXMgPSBmaXJtd2FyZVZlcnNpb24uc2VyaWFsaXphdGlvbkhhbmRsZXIoKS5TdGF0dXNGbGFnLmVtcHR5KCk7XHJcbiAgICAgICAgICAgIGlmIChwYXR0ZXJuID4gMCAmJiBwYXR0ZXJuIDwgNikge1xyXG4gICAgICAgICAgICAgICAgbGVkU3RhdGUucGF0dGVybiA9IHBhdHRlcm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgW2NvbG9yX3JmLCBjb2xvcl9yYiwgY29sb3JfbGYsIGNvbG9yX2xiXS5mb3JFYWNoKGZ1bmN0aW9uKFxyXG4gICAgICAgICAgICAgICAgY29sb3IsIGlkeCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFjb2xvcikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHZhciB2ID0gY29sb3JzW2tleXNbaWR4XV07XHJcbiAgICAgICAgICAgICAgICB2LnJlZCA9IGNvbG9yLnJlZDtcclxuICAgICAgICAgICAgICAgIHYuZ3JlZW4gPSBjb2xvci5ncmVlbjtcclxuICAgICAgICAgICAgICAgIHYuYmx1ZSA9IGNvbG9yLmJsdWU7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBpZiAocmVkICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIGxlZFN0YXRlLmluZGljYXRvcl9yZWQgPSByZWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGdyZWVuICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIGxlZFN0YXRlLmluZGljYXRvcl9ncmVlbiA9IGdyZWVuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBhcHBseSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2V0U2ltcGxlKHJlZCwgZ3JlZW4sIGJsdWUpIHtcclxuICAgICAgICAgICAgdmFyIGNvbG9yID0ge3JlZDogcmVkIHx8IDAsIGdyZWVuOiBncmVlbiB8fCAwLCBibHVlOiBibHVlIHx8IDB9O1xyXG4gICAgICAgICAgICBzZXQoY29sb3IsIGNvbG9yLCBjb2xvciwgY29sb3IsIExlZFBhdHRlcm5zLlNPTElEKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFwcGx5KCkge1xyXG4gICAgICAgICAgICBkZXZpY2VDb25maWcuc2VuZENvbmZpZyh7XHJcbiAgICAgICAgICAgICAgICBjb25maWc6IGNvbmZpZ1BhcnQsXHJcbiAgICAgICAgICAgICAgICB0ZW1wb3Jhcnk6IHRydWUsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgc2V0OiBzZXQsXHJcbiAgICAgICAgICAgIHNldFNpbXBsZTogc2V0U2ltcGxlLFxyXG4gICAgICAgICAgICBwYXR0ZXJuczogTGVkUGF0dGVybnMsXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgnZmx5YnJpeENvbW1vbicpLmZhY3RvcnkoJ3JjRGF0YScsIHJjRGF0YSk7XHJcblxyXG4gICAgcmNEYXRhLiRpbmplY3QgPSBbJ3NlcmlhbCddO1xyXG5cclxuICAgIGZ1bmN0aW9uIHJjRGF0YShzZXJpYWwpIHtcclxuICAgICAgICB2YXIgQVVYID0ge1xyXG4gICAgICAgICAgICBMT1c6IDAsXHJcbiAgICAgICAgICAgIE1JRDogMSxcclxuICAgICAgICAgICAgSElHSDogMixcclxuICAgICAgICB9O1xyXG4gICAgICAgIHZhciBhdXhOYW1lcyA9IFsnbG93JywgJ21pZCcsICdoaWdoJ107XHJcblxyXG4gICAgICAgIHZhciB0aHJvdHRsZSA9IC0xO1xyXG4gICAgICAgIHZhciBwaXRjaCA9IDA7XHJcbiAgICAgICAgdmFyIHJvbGwgPSAwO1xyXG4gICAgICAgIHZhciB5YXcgPSAwO1xyXG4gICAgICAgIC8vIGRlZmF1bHRzIHRvIGhpZ2ggLS0gbG93IGlzIGVuYWJsaW5nOyBoaWdoIGlzIGRpc2FibGluZ1xyXG4gICAgICAgIHZhciBhdXgxID0gQVVYLkhJR0g7XHJcbiAgICAgICAgLy8gZGVmYXVsdHMgdG8gPz8gLS0gbmVlZCB0byBjaGVjayB0cmFuc21pdHRlciBiZWhhdmlvclxyXG4gICAgICAgIHZhciBhdXgyID0gQVVYLkhJR0g7XHJcblxyXG4gICAgICAgIHZhciB1cmdlbnQgPSB0cnVlO1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBzZXRUaHJvdHRsZTogc2V0VGhyb3R0bGUsXHJcbiAgICAgICAgICAgIHNldFBpdGNoOiBzZXRQaXRjaCxcclxuICAgICAgICAgICAgc2V0Um9sbDogc2V0Um9sbCxcclxuICAgICAgICAgICAgc2V0WWF3OiBzZXRZYXcsXHJcbiAgICAgICAgICAgIHNldEF1eDE6IHNldEF1eDEsXHJcbiAgICAgICAgICAgIHNldEF1eDI6IHNldEF1eDIsXHJcbiAgICAgICAgICAgIGdldFRocm90dGxlOiBnZXRUaHJvdHRsZSxcclxuICAgICAgICAgICAgZ2V0UGl0Y2g6IGdldFBpdGNoLFxyXG4gICAgICAgICAgICBnZXRSb2xsOiBnZXRSb2xsLFxyXG4gICAgICAgICAgICBnZXRZYXc6IGdldFlhdyxcclxuICAgICAgICAgICAgZ2V0QXV4MTogZ2V0QXV4MSxcclxuICAgICAgICAgICAgZ2V0QXV4MjogZ2V0QXV4MixcclxuICAgICAgICAgICAgQVVYOiBBVVgsXHJcbiAgICAgICAgICAgIHNlbmQ6IHNlbmQsXHJcbiAgICAgICAgICAgIGZvcmNlTmV4dFNlbmQ6IGZvcmNlTmV4dFNlbmQsXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2VuZCgpIHtcclxuICAgICAgICAgICAgaWYgKCF1cmdlbnQgJiYgc2VyaWFsLmJ1c3koKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHVyZ2VudCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgdmFyIGNvbW1hbmQgPSB7fTtcclxuXHJcbiAgICAgICAgICAgIC8vIGludmVydCBwaXRjaCBhbmQgcm9sbFxyXG4gICAgICAgICAgICB2YXIgdGhyb3R0bGVfdGhyZXNob2xkID1cclxuICAgICAgICAgICAgICAgIC0wLjg7ICAvLyBrZWVwIGJvdHRvbSAxMCUgb2YgdGhyb3R0bGUgc3RpY2sgdG8gbWVhbiAnb2ZmJ1xyXG4gICAgICAgICAgICBjb21tYW5kLnRocm90dGxlID0gY29uc3RyYWluKFxyXG4gICAgICAgICAgICAgICAgKHRocm90dGxlIC0gdGhyb3R0bGVfdGhyZXNob2xkKSAqIDQwOTUgL1xyXG4gICAgICAgICAgICAgICAgICAgICgxIC0gdGhyb3R0bGVfdGhyZXNob2xkKSxcclxuICAgICAgICAgICAgICAgIDAsIDQwOTUpO1xyXG4gICAgICAgICAgICBjb21tYW5kLnBpdGNoID1cclxuICAgICAgICAgICAgICAgIGNvbnN0cmFpbigtKGFwcGx5RGVhZHpvbmUocGl0Y2gsIDAuMSkpICogNDA5NSAvIDIsIC0yMDQ3LCAyMDQ3KTtcclxuICAgICAgICAgICAgY29tbWFuZC5yb2xsID1cclxuICAgICAgICAgICAgICAgIGNvbnN0cmFpbigoYXBwbHlEZWFkem9uZShyb2xsLCAwLjEpKSAqIDQwOTUgLyAyLCAtMjA0NywgMjA0Nyk7XHJcbiAgICAgICAgICAgIGNvbW1hbmQueWF3ID1cclxuICAgICAgICAgICAgICAgIGNvbnN0cmFpbigtKGFwcGx5RGVhZHpvbmUoeWF3LCAwLjEpKSAqIDQwOTUgLyAyLCAtMjA0NywgMjA0Nyk7XHJcblxyXG4gICAgICAgICAgICB2YXIgYXV4X21hc2sgPSB7fTtcclxuICAgICAgICAgICAgLy8gYXV4MV9sb3csIGF1eDFfbWlkLCBhdXgxX2hpZ2gsIGFuZCBzYW1lIHdpdGggYXV4MlxyXG4gICAgICAgICAgICBhdXhfbWFza1snYXV4MV8nICsgYXV4TmFtZXNbYXV4MV1dID0gdHJ1ZTtcclxuICAgICAgICAgICAgYXV4X21hc2tbJ2F1eDJfJyArIGF1eE5hbWVzW2F1eDJdXSA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gc2VyaWFsLnNlbmRTdHJ1Y3R1cmUoJ0NvbW1hbmQnLCB7XHJcbiAgICAgICAgICAgICAgICByZXF1ZXN0X3Jlc3BvbnNlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgc2V0X3NlcmlhbF9yYzoge1xyXG4gICAgICAgICAgICAgICAgICAgIGVuYWJsZWQ6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgY29tbWFuZDogY29tbWFuZCxcclxuICAgICAgICAgICAgICAgICAgICBhdXhfbWFzazogYXV4X21hc2ssXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9LCBmYWxzZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZXRUaHJvdHRsZSh2KSB7XHJcbiAgICAgICAgICAgIHRocm90dGxlID0gdjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNldFBpdGNoKHYpIHtcclxuICAgICAgICAgICAgcGl0Y2ggPSB2O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2V0Um9sbCh2KSB7XHJcbiAgICAgICAgICAgIHJvbGwgPSB2O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2V0WWF3KHYpIHtcclxuICAgICAgICAgICAgeWF3ID0gdjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNldEF1eDEodikge1xyXG4gICAgICAgICAgICBhdXgxID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oMiwgdikpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2V0QXV4Mih2KSB7XHJcbiAgICAgICAgICAgIGF1eDIgPSBNYXRoLm1heCgwLCBNYXRoLm1pbigyLCB2KSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRUaHJvdHRsZSgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRocm90dGxlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0UGl0Y2goKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBwaXRjaDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdldFJvbGwoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByb2xsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0WWF3KCkge1xyXG4gICAgICAgICAgICByZXR1cm4geWF3O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0QXV4MSgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGF1eDE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRBdXgyKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gYXV4MjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGZvcmNlTmV4dFNlbmQoKSB7XHJcbiAgICAgICAgICAgIHVyZ2VudCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBjb25zdHJhaW4oeCwgeG1pbiwgeG1heCkge1xyXG4gICAgICAgICAgICByZXR1cm4gTWF0aC5tYXgoeG1pbiwgTWF0aC5taW4oeCwgeG1heCkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYXBwbHlEZWFkem9uZSh2YWx1ZSwgZGVhZHpvbmUpIHtcclxuICAgICAgICAgICAgaWYgKHZhbHVlID4gZGVhZHpvbmUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSAtIGRlYWR6b25lO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh2YWx1ZSA8IC1kZWFkem9uZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlICsgZGVhZHpvbmU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KCkpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ2ZseWJyaXhDb21tb24nKS5mYWN0b3J5KCdzZXJpYWwnLCBzZXJpYWwpO1xyXG5cclxuICAgIHNlcmlhbC4kaW5qZWN0ID0gWyckdGltZW91dCcsICckcScsICdjb2JzJywgJ2NvbW1hbmRMb2cnLCAnZmlybXdhcmVWZXJzaW9uJywgJ3NlcmlhbGl6YXRpb25IYW5kbGVyJ107XHJcblxyXG4gICAgZnVuY3Rpb24gc2VyaWFsKCR0aW1lb3V0LCAkcSwgY29icywgY29tbWFuZExvZywgZmlybXdhcmVWZXJzaW9uLCBzZXJpYWxpemF0aW9uSGFuZGxlcikge1xyXG4gICAgICAgIHZhciBNZXNzYWdlVHlwZSA9IHtcclxuICAgICAgICAgICAgU3RhdGU6IDAsXHJcbiAgICAgICAgICAgIENvbW1hbmQ6IDEsXHJcbiAgICAgICAgICAgIERlYnVnU3RyaW5nOiAzLFxyXG4gICAgICAgICAgICBIaXN0b3J5RGF0YTogNCxcclxuICAgICAgICAgICAgUmVzcG9uc2U6IDI1NSxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgYWNrbm93bGVkZ2VzID0gW107XHJcbiAgICAgICAgdmFyIGJhY2tlbmQgPSBuZXcgQmFja2VuZCgpO1xyXG5cclxuICAgICAgICB2YXIgb25SZWNlaXZlTGlzdGVuZXJzID0gW107XHJcblxyXG4gICAgICAgIHZhciBjb2JzUmVhZGVyID0gbmV3IGNvYnMuUmVhZGVyKDIwMDApO1xyXG4gICAgICAgIHZhciBieXRlc0hhbmRsZXIgPSB1bmRlZmluZWQ7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIEJhY2tlbmQoKSB7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBCYWNrZW5kLnByb3RvdHlwZS5idXN5ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBCYWNrZW5kLnByb3RvdHlwZS5zZW5kID0gZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICBjb21tYW5kTG9nKCdObyBcInNlbmRcIiBkZWZpbmVkIGZvciBzZXJpYWwgYmFja2VuZCcpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIEJhY2tlbmQucHJvdG90eXBlLm9uUmVhZCA9IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgICAgY29tbWFuZExvZygnTm8gXCJvblJlYWRcIiBkZWZpbmVkIGZvciBzZXJpYWwgYmFja2VuZCcpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHZhciBNZXNzYWdlVHlwZUludmVyc2lvbiA9IFtdO1xyXG4gICAgICAgIE9iamVjdC5rZXlzKE1lc3NhZ2VUeXBlKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xyXG4gICAgICAgICAgICBNZXNzYWdlVHlwZUludmVyc2lvbltNZXNzYWdlVHlwZVtrZXldXSA9IGtleTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgYWRkT25SZWNlaXZlQ2FsbGJhY2soZnVuY3Rpb24obWVzc2FnZVR5cGUsIG1lc3NhZ2UpIHtcclxuICAgICAgICAgICAgaWYgKG1lc3NhZ2VUeXBlID09PSAnUmVzcG9uc2UnKSB7XHJcbiAgICAgICAgICAgICAgICBhY2tub3dsZWRnZShtZXNzYWdlLm1hc2ssIG1lc3NhZ2UuYWNrKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBidXN5OiBidXN5LFxyXG4gICAgICAgICAgICBzZW5kU3RydWN0dXJlOiBzZW5kU3RydWN0dXJlLFxyXG4gICAgICAgICAgICBzZXRCYWNrZW5kOiBzZXRCYWNrZW5kLFxyXG4gICAgICAgICAgICBhZGRPblJlY2VpdmVDYWxsYmFjazogYWRkT25SZWNlaXZlQ2FsbGJhY2ssXHJcbiAgICAgICAgICAgIHJlbW92ZU9uUmVjZWl2ZUNhbGxiYWNrOiByZW1vdmVPblJlY2VpdmVDYWxsYmFjayxcclxuICAgICAgICAgICAgc2V0Qnl0ZXNIYW5kbGVyOiBzZXRCeXRlc0hhbmRsZXIsXHJcbiAgICAgICAgICAgIGhhbmRsZVBvc3RDb25uZWN0OiBoYW5kbGVQb3N0Q29ubmVjdCxcclxuICAgICAgICAgICAgQmFja2VuZDogQmFja2VuZCxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZXRCYWNrZW5kKHYpIHtcclxuICAgICAgICAgICAgYmFja2VuZCA9IHY7XHJcbiAgICAgICAgICAgIGJhY2tlbmQub25SZWFkID0gcmVhZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGhhbmRsZVBvc3RDb25uZWN0KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gcmVxdWVzdEZpcm13YXJlVmVyc2lvbigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gcmVxdWVzdEZpcm13YXJlVmVyc2lvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHNlbmRTdHJ1Y3R1cmUoJ0NvbW1hbmQnLCB7XHJcbiAgICAgICAgICAgICAgICByZXF1ZXN0X3Jlc3BvbnNlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgcmVxX3BhcnRpYWxfZWVwcm9tX2RhdGE6IHtcclxuICAgICAgICAgICAgICAgICAgICB2ZXJzaW9uOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZW5kU3RydWN0dXJlKG1lc3NhZ2VUeXBlLCBkYXRhLCBsb2dfc2VuZCwgZXh0cmFNYXNrKSB7XHJcbiAgICAgICAgICAgIGlmIChtZXNzYWdlVHlwZSA9PT0gJ1N0YXRlJykge1xyXG4gICAgICAgICAgICAgICAgZGF0YSA9IHByb2Nlc3NTdGF0ZU91dHB1dChkYXRhKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgaGFuZGxlcnMgPSBmaXJtd2FyZVZlcnNpb24uc2VyaWFsaXphdGlvbkhhbmRsZXIoKTtcclxuXHJcbiAgICAgICAgICAgIHZhciByZXNwb25zZSA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgICAgIGlmICghKG1lc3NhZ2VUeXBlIGluIE1lc3NhZ2VUeXBlKSkge1xyXG4gICAgICAgICAgICAgICAgcmVzcG9uc2UucmVqZWN0KCdNZXNzYWdlIHR5cGUgXCInICsgbWVzc2FnZVR5cGUgK1xyXG4gICAgICAgICAgICAgICAgICAgICdcIiBub3Qgc3VwcG9ydGVkIGJ5IGFwcCwgc3VwcG9ydGVkIG1lc3NhZ2UgdHlwZXMgYXJlOicgK1xyXG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKE1lc3NhZ2VUeXBlKS5qb2luKCcsICcpKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5wcm9taXNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghKG1lc3NhZ2VUeXBlIGluIGhhbmRsZXJzKSkge1xyXG4gICAgICAgICAgICAgICAgcmVzcG9uc2UucmVqZWN0KCdNZXNzYWdlIHR5cGUgXCInICsgbWVzc2FnZVR5cGUgK1xyXG4gICAgICAgICAgICAgICAgICAgICdcIiBub3Qgc3VwcG9ydGVkIGJ5IGZpcm13YXJlLCBzdXBwb3J0ZWQgbWVzc2FnZSB0eXBlcyBhcmU6JyArXHJcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmtleXMoaGFuZGxlcnMpLmpvaW4oJywgJykpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLnByb21pc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIHR5cGVDb2RlID0gTWVzc2FnZVR5cGVbbWVzc2FnZVR5cGVdO1xyXG4gICAgICAgICAgICB2YXIgaGFuZGxlciA9IGhhbmRsZXJzW21lc3NhZ2VUeXBlXTtcclxuXHJcbiAgICAgICAgICAgIHZhciBidWZmZXIgPSBuZXcgVWludDhBcnJheShoYW5kbGVyLmJ5dGVDb3VudCk7XHJcblxyXG4gICAgICAgICAgICB2YXIgc2VyaWFsaXplciA9IG5ldyBzZXJpYWxpemF0aW9uSGFuZGxlci5TZXJpYWxpemVyKG5ldyBEYXRhVmlldyhidWZmZXIuYnVmZmVyKSk7XHJcbiAgICAgICAgICAgIGhhbmRsZXIuZW5jb2RlKHNlcmlhbGl6ZXIsIGRhdGEsIGV4dHJhTWFzayk7XHJcbiAgICAgICAgICAgIHZhciBtYXNrID0gaGFuZGxlci5tYXNrQXJyYXkoZGF0YSwgZXh0cmFNYXNrKTtcclxuICAgICAgICAgICAgaWYgKG1hc2subGVuZ3RoIDwgNSkge1xyXG4gICAgICAgICAgICAgICAgbWFzayA9IChtYXNrWzBdIDw8IDApIHwgKG1hc2tbMV0gPDwgOCkgfCAobWFza1syXSA8PCAxNikgfCAobWFza1szXSA8PCAyNCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHZhciBkYXRhTGVuZ3RoID0gc2VyaWFsaXplci5pbmRleDtcclxuXHJcbiAgICAgICAgICAgIHZhciBvdXRwdXQgPSBuZXcgVWludDhBcnJheShkYXRhTGVuZ3RoICsgMyk7XHJcbiAgICAgICAgICAgIG91dHB1dFswXSA9IG91dHB1dFsxXSA9IHR5cGVDb2RlO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpZHggPSAwOyBpZHggPCBkYXRhTGVuZ3RoOyArK2lkeCkge1xyXG4gICAgICAgICAgICAgICAgb3V0cHV0WzBdIF49IG91dHB1dFtpZHggKyAyXSA9IGJ1ZmZlcltpZHhdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG91dHB1dFtkYXRhTGVuZ3RoICsgMl0gPSAwO1xyXG5cclxuICAgICAgICAgICAgYWNrbm93bGVkZ2VzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgbWFzazogbWFzayxcclxuICAgICAgICAgICAgICAgIHJlc3BvbnNlOiByZXNwb25zZSxcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGJhY2tlbmQuc2VuZChuZXcgVWludDhBcnJheShjb2JzLmVuY29kZShvdXRwdXQpKSk7XHJcbiAgICAgICAgICAgIH0sIDApO1xyXG5cclxuICAgICAgICAgICAgaWYgKGxvZ19zZW5kKSB7XHJcbiAgICAgICAgICAgICAgICBjb21tYW5kTG9nKCdTZW5kaW5nIGNvbW1hbmQgJyArIHR5cGVDb2RlKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLnByb21pc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBidXN5KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gYmFja2VuZC5idXN5KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZXRCeXRlc0hhbmRsZXIoaGFuZGxlcikge1xyXG4gICAgICAgICAgICBieXRlc0hhbmRsZXIgPSBoYW5kbGVyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gcmVhZChkYXRhKSB7XHJcbiAgICAgICAgICAgIGlmIChieXRlc0hhbmRsZXIpXHJcbiAgICAgICAgICAgICAgICBieXRlc0hhbmRsZXIoZGF0YSwgcHJvY2Vzc0RhdGEpO1xyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICBjb2JzUmVhZGVyLnJlYWRCeXRlcyhkYXRhLCBwcm9jZXNzRGF0YSwgcmVwb3J0SXNzdWVzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHJlcG9ydElzc3Vlcyhpc3N1ZSwgdGV4dCkge1xyXG4gICAgICAgICAgICBjb21tYW5kTG9nKCdDT0JTIGRlY29kaW5nIGZhaWxlZCAoJyArIGlzc3VlICsgJyk6ICcgKyB0ZXh0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFkZE9uUmVjZWl2ZUNhbGxiYWNrKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIG9uUmVjZWl2ZUxpc3RlbmVycyA9IG9uUmVjZWl2ZUxpc3RlbmVycy5jb25jYXQoW2NhbGxiYWNrXSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiByZW1vdmVPblJlY2VpdmVDYWxsYmFjayhjYWxsYmFjaykge1xyXG4gICAgICAgICAgICBvblJlY2VpdmVMaXN0ZW5lcnMgPSBvblJlY2VpdmVMaXN0ZW5lcnMuZmlsdGVyKGZ1bmN0aW9uKGNiKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY2IgPT09IGNhbGxiYWNrO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFja25vd2xlZGdlKG1hc2ssIHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHdoaWxlIChhY2tub3dsZWRnZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHYgPSBhY2tub3dsZWRnZXMuc2hpZnQoKTtcclxuICAgICAgICAgICAgICAgIGlmICh2Lm1hc2sgXiBtYXNrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdi5yZXNwb25zZS5yZWplY3QoJ01pc3NpbmcgQUNLJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB2YXIgcmVsYXhlZE1hc2sgPSBtYXNrO1xyXG4gICAgICAgICAgICAgICAgcmVsYXhlZE1hc2sgJj0gfjE7XHJcbiAgICAgICAgICAgICAgICBpZiAocmVsYXhlZE1hc2sgXiB2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHYucmVzcG9uc2UucmVqZWN0KCdSZXF1ZXN0IHdhcyBub3QgZnVsbHkgcHJvY2Vzc2VkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB2LnJlc3BvbnNlLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBwcm9jZXNzRGF0YShieXRlcykge1xyXG4gICAgICAgICAgICB2YXIgbWVzc2FnZVR5cGUgPSBNZXNzYWdlVHlwZUludmVyc2lvbltieXRlc1swXV07XHJcbiAgICAgICAgICAgIHZhciBoYW5kbGVyID0gZmlybXdhcmVWZXJzaW9uLnNlcmlhbGl6YXRpb25IYW5kbGVyKClbbWVzc2FnZVR5cGVdO1xyXG4gICAgICAgICAgICBpZiAoIW1lc3NhZ2VUeXBlIHx8ICFoYW5kbGVyKSB7XHJcbiAgICAgICAgICAgICAgICBjb21tYW5kTG9nKCdJbGxlZ2FsIG1lc3NhZ2UgdHlwZSBwYXNzZWQgZnJvbSBmaXJtd2FyZScpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgc2VyaWFsaXplciA9IG5ldyBzZXJpYWxpemF0aW9uSGFuZGxlci5TZXJpYWxpemVyKG5ldyBEYXRhVmlldyhieXRlcy5idWZmZXIsIDEpKTtcclxuICAgICAgICAgICAgICAgIHZhciBtZXNzYWdlID0gaGFuZGxlci5kZWNvZGUoc2VyaWFsaXplcik7XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICAgICAgICAgICAgY29tbWFuZExvZygnVW5yZWNvZ25pemVkIG1lc3NhZ2UgZm9ybWF0IHJlY2VpdmVkJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG1lc3NhZ2VUeXBlID09PSAnU3RhdGUnKSB7XHJcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gcHJvY2Vzc1N0YXRlSW5wdXQobWVzc2FnZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgb25SZWNlaXZlTGlzdGVuZXJzLmZvckVhY2goZnVuY3Rpb24obGlzdGVuZXIpIHtcclxuICAgICAgICAgICAgICAgIGxpc3RlbmVyKG1lc3NhZ2VUeXBlLCBtZXNzYWdlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgbGFzdF90aW1lc3RhbXBfdXMgPSAwO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBwcm9jZXNzU3RhdGVJbnB1dChzdGF0ZSkge1xyXG4gICAgICAgICAgICBzdGF0ZSA9IE9iamVjdC5hc3NpZ24oe30sIHN0YXRlKTtcclxuICAgICAgICAgICAgdmFyIHNlcmlhbF91cGRhdGVfcmF0ZV9IeiA9IDA7XHJcblxyXG4gICAgICAgICAgICBpZiAoJ3RpbWVzdGFtcF91cycgaW4gc3RhdGUpIHtcclxuICAgICAgICAgICAgICAgIHN0YXRlLnNlcmlhbF91cGRhdGVfcmF0ZV9lc3RpbWF0ZSA9IDEwMDAwMDAgLyAoc3RhdGUudGltZXN0YW1wX3VzIC0gbGFzdF90aW1lc3RhbXBfdXMpO1xyXG4gICAgICAgICAgICAgICAgbGFzdF90aW1lc3RhbXBfdXMgPSBzdGF0ZS50aW1lc3RhbXBfdXM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCd0ZW1wZXJhdHVyZScgaW4gc3RhdGUpIHtcclxuICAgICAgICAgICAgICAgIHN0YXRlLnRlbXBlcmF0dXJlIC89IDEwMC4wOyAgLy8gdGVtcGVyYXR1cmUgZ2l2ZW4gaW4gQ2Vsc2l1cyAqIDEwMFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICgncHJlc3N1cmUnIGluIHN0YXRlKSB7XHJcbiAgICAgICAgICAgICAgICBzdGF0ZS5wcmVzc3VyZSAvPSAyNTYuMDsgIC8vIHByZXNzdXJlIGdpdmVuIGluIChRMjQuOCkgZm9ybWF0XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHByb2Nlc3NTdGF0ZU91dHB1dChzdGF0ZSkge1xyXG4gICAgICAgICAgICBzdGF0ZSA9IE9iamVjdC5hc3NpZ24oe30sIHN0YXRlKTtcclxuICAgICAgICAgICAgaWYgKCd0ZW1wZXJhdHVyZScgaW4gc3RhdGUpIHtcclxuICAgICAgICAgICAgICAgIHN0YXRlLnRlbXBlcmF0dXJlICo9IDEwMC4wO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICgncHJlc3N1cmUnIGluIHN0YXRlKSB7XHJcbiAgICAgICAgICAgICAgICBzdGF0ZS5wcmVzc3VyZSAqPSAyNTYuMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KCkpO1xyXG4iLCIoZnVuY3Rpb24gKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIHNlcmlhbGl6YXRpb25IYW5kbGVyLiRpbmplY3QgPSBbXTtcclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgnZmx5YnJpeENvbW1vbicpLmZhY3RvcnkoJ3NlcmlhbGl6YXRpb25IYW5kbGVyJywgc2VyaWFsaXphdGlvbkhhbmRsZXIpO1xyXG5cclxuICAgIGZ1bmN0aW9uIHNlcmlhbGl6YXRpb25IYW5kbGVyKCkge1xyXG4gICAgICAgIHZhciBoYW5kbGVyQ2FjaGUgPSB7fTtcclxuICAgICAgICB2YXIgdmVyc2lvbiA9ICdWZXJzaW9uID0geyBtYWpvcjogdTgsIG1pbm9yOiB1OCwgcGF0Y2g6IHU4IH07JztcclxuICAgICAgICB2YXIgY29uZmlnSWQgPSAnQ29uZmlnSUQgPSB1MzI7JztcclxuXHJcbiAgICAgICAgdmFyIHZlY3RvcjNmID0gJ1ZlY3RvcjNmID0geyB4OiBmMzIsIHk6IGYzMiwgejogZjMyIH07JztcclxuXHJcbiAgICAgICAgdmFyIHBjYlRyYW5zZm9ybSA9ICdQY2JUcmFuc2Zvcm0gPSB7IG9yaWVudGF0aW9uOiBWZWN0b3IzZiwgdHJhbnNsYXRpb246IFZlY3RvcjNmIH07JztcclxuICAgICAgICB2YXIgbWl4VGFibGUgPSAnTWl4VGFibGUgPSB7IGZ6OiBbaTg6OF0sIHR4OiBbaTg6OF0sIHR5OiBbaTg6OF0sIHR6OiBbaTg6OF0gfTsnO1xyXG4gICAgICAgIHZhciBtYWdCaWFzID0gJ01hZ0JpYXMgPSB7IG9mZnNldDogVmVjdG9yM2YgfTsnO1xyXG4gICAgICAgIHZhciBjaGFubmVsUHJvcGVydGllcyA9ICdDaGFubmVsUHJvcGVydGllcyA9IHsnICtcclxuICAgICAgICAgICAgJ2Fzc2lnbm1lbnQ6IFt1ODo2XSwnICtcclxuICAgICAgICAgICAgJ2ludmVyc2lvbjogdTgsJyArXHJcbiAgICAgICAgICAgICdtaWRwb2ludDogW3UxNjo2XSwnICtcclxuICAgICAgICAgICAgJ2RlYWR6b25lOiBbdTE2OjZdIH07JztcclxuXHJcbiAgICAgICAgdmFyIHBpZFNldHRpbmdzID0gJ1BJRFNldHRpbmdzID0geycgK1xyXG4gICAgICAgICAgICAna3A6IGYzMiwnICtcclxuICAgICAgICAgICAgJ2tpOiBmMzIsJyArXHJcbiAgICAgICAgICAgICdrZDogZjMyLCcgK1xyXG4gICAgICAgICAgICAnaW50ZWdyYWxfd2luZHVwX2d1YXJkOiBmMzIsJyArXHJcbiAgICAgICAgICAgICdkX2ZpbHRlcl90aW1lOiBmMzIsJyArXHJcbiAgICAgICAgICAgICdzZXRwb2ludF9maWx0ZXJfdGltZTogZjMyLCcgK1xyXG4gICAgICAgICAgICAnY29tbWFuZF90b192YWx1ZTogZjMyIH07JztcclxuICAgICAgICB2YXIgcGlkUGFyYW1ldGVyczE0ID0gJ1BJRFBhcmFtZXRlcnMgPSB7JyArXHJcbiAgICAgICAgICAgICd0aHJ1c3RfbWFzdGVyOiBQSURTZXR0aW5ncywnICtcclxuICAgICAgICAgICAgJ3BpdGNoX21hc3RlcjogUElEU2V0dGluZ3MsJyArXHJcbiAgICAgICAgICAgICdyb2xsX21hc3RlcjogUElEU2V0dGluZ3MsJyArXHJcbiAgICAgICAgICAgICd5YXdfbWFzdGVyOiBQSURTZXR0aW5ncywnICtcclxuICAgICAgICAgICAgJ3RocnVzdF9zbGF2ZTogUElEU2V0dGluZ3MsJyArXHJcbiAgICAgICAgICAgICdwaXRjaF9zbGF2ZTogUElEU2V0dGluZ3MsJyArXHJcbiAgICAgICAgICAgICdyb2xsX3NsYXZlOiBQSURTZXR0aW5ncywnICtcclxuICAgICAgICAgICAgJ3lhd19zbGF2ZTogUElEU2V0dGluZ3MsJyArXHJcbiAgICAgICAgICAgICdwaWRfYnlwYXNzOiB1OCB9Oyc7XHJcbiAgICAgICAgdmFyIHBpZFBhcmFtZXRlcnMgPSAnUElEUGFyYW1ldGVycyA9IHsnICtcclxuICAgICAgICAgICAgJ3RocnVzdF9tYXN0ZXI6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAncGl0Y2hfbWFzdGVyOiBQSURTZXR0aW5ncywnICtcclxuICAgICAgICAgICAgJ3JvbGxfbWFzdGVyOiBQSURTZXR0aW5ncywnICtcclxuICAgICAgICAgICAgJ3lhd19tYXN0ZXI6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAndGhydXN0X3NsYXZlOiBQSURTZXR0aW5ncywnICtcclxuICAgICAgICAgICAgJ3BpdGNoX3NsYXZlOiBQSURTZXR0aW5ncywnICtcclxuICAgICAgICAgICAgJ3JvbGxfc2xhdmU6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAneWF3X3NsYXZlOiBQSURTZXR0aW5ncywnICtcclxuICAgICAgICAgICAgJ3RocnVzdF9nYWluOiBmMzIsJyArXHJcbiAgICAgICAgICAgICdwaXRjaF9nYWluOiBmMzIsJyArXHJcbiAgICAgICAgICAgICdyb2xsX2dhaW46IGYzMiwnICtcclxuICAgICAgICAgICAgJ3lhd19nYWluOiBmMzIsJyArXHJcbiAgICAgICAgICAgICdwaWRfYnlwYXNzOiB1OCB9Oyc7XHJcblxyXG4gICAgICAgIHZhciBzdGF0ZVBhcmFtZXRlcnMgPSAnU3RhdGVQYXJhbWV0ZXJzID0geyBzdGF0ZV9lc3RpbWF0aW9uOiBbZjMyOjJdLCBlbmFibGU6IFtmMzI6Ml0gfTsnO1xyXG5cclxuICAgICAgICB2YXIgc3RhdHVzRmxhZzE0MTUgPSAnU3RhdHVzRmxhZyA9IHsvMTYvJyArXHJcbiAgICAgICAgICAgICdib290OiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnbXB1X2ZhaWw6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdibXBfZmFpbDogdm9pZCwnICtcclxuICAgICAgICAgICAgJ3J4X2ZhaWw6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdpZGxlOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnZW5hYmxpbmc6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdjbGVhcl9tcHVfYmlhczogdm9pZCwnICtcclxuICAgICAgICAgICAgJ3NldF9tcHVfYmlhczogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2ZhaWxfc3RhYmlsaXR5OiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnZmFpbF9hbmdsZTogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2VuYWJsZWQ6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdiYXR0ZXJ5X2xvdzogdm9pZCwnICtcclxuICAgICAgICAgICAgJ3RlbXBfd2FybmluZzogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2xvZ19mdWxsOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnZmFpbF9vdGhlcjogdm9pZCwnICtcclxuICAgICAgICAgICAgJ292ZXJyaWRlOiB2b2lkIH07JztcclxuXHJcbiAgICAgICAgdmFyIHN0YXR1c0ZsYWcgPSAnU3RhdHVzRmxhZyA9IHsvMTYvJyArXHJcbiAgICAgICAgICAgICdfMDogdm9pZCwnICtcclxuICAgICAgICAgICAgJ18xOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnXzI6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdub19zaWduYWw6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdpZGxlOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnYXJtaW5nOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAncmVjb3JkaW5nX3NkOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnXzc6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdsb29wX3Nsb3c6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdfOTogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2FybWVkOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnYmF0dGVyeV9sb3c6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdiYXR0ZXJ5X2NyaXRpY2FsOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnbG9nX2Z1bGw6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdjcmFzaF9kZXRlY3RlZDogdm9pZCwnICtcclxuICAgICAgICAgICAgJ292ZXJyaWRlOiB2b2lkIH07JztcclxuXHJcbiAgICAgICAgdmFyIGNvbG9yID0gJ0NvbG9yID0geyByZWQ6IHU4LCBncmVlbjogdTgsIGJsdWU6IHU4IH07JztcclxuICAgICAgICB2YXIgbGVkU3RhdGVDYXNlID0gJ0xFRFN0YXRlQ2FzZSA9IHsnICtcclxuICAgICAgICAgICAgJ3N0YXR1czogU3RhdHVzRmxhZywnICtcclxuICAgICAgICAgICAgJ3BhdHRlcm46IHU4LCcgK1xyXG4gICAgICAgICAgICAnY29sb3JfcmlnaHRfZnJvbnQ6IENvbG9yLCcgK1xyXG4gICAgICAgICAgICAnY29sb3JfcmlnaHRfYmFjazogQ29sb3IsJyArXHJcbiAgICAgICAgICAgICdjb2xvcl9sZWZ0X2Zyb250OiBDb2xvciwnICtcclxuICAgICAgICAgICAgJ2NvbG9yX2xlZnRfYmFjazogQ29sb3IsJyArXHJcbiAgICAgICAgICAgICdpbmRpY2F0b3JfcmVkOiBib29sLCcgK1xyXG4gICAgICAgICAgICAnaW5kaWNhdG9yX2dyZWVuOiBib29sIH07JztcclxuICAgICAgICB2YXIgbGVkU3RhdGVzID0gJ0xFRFN0YXRlcyA9IFsvMTYvTEVEU3RhdGVDYXNlOjE2XTsnO1xyXG4gICAgICAgIHZhciBsZWRTdGF0ZXNGaXhlZCA9ICdMRURTdGF0ZXNGaXhlZCA9IFtMRURTdGF0ZUNhc2U6MTZdOyc7XHJcblxyXG4gICAgICAgIHZhciBkZXZpY2VOYW1lID0gJ0RldmljZU5hbWUgPSBzOTsnO1xyXG5cclxuICAgICAgICB2YXIgdmVsb2NpdHlQaWRQYXJhbWV0ZXJzID0gJ1ZlbG9jaXR5UElEUGFyYW1ldGVycyA9IHsnICtcclxuICAgICAgICAgICAgJ2ZvcndhcmRfbWFzdGVyOiBQSURTZXR0aW5ncywnICtcclxuICAgICAgICAgICAgJ3JpZ2h0X21hc3RlcjogUElEU2V0dGluZ3MsJyArXHJcbiAgICAgICAgICAgICd1cF9tYXN0ZXI6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAnZm9yd2FyZF9zbGF2ZTogUElEU2V0dGluZ3MsJyArXHJcbiAgICAgICAgICAgICdyaWdodF9zbGF2ZTogUElEU2V0dGluZ3MsJyArXHJcbiAgICAgICAgICAgICd1cF9zbGF2ZTogUElEU2V0dGluZ3MsJyArXHJcbiAgICAgICAgICAgICdwaWRfYnlwYXNzOiB1OCB9Oyc7XHJcblxyXG4gICAgICAgIHZhciBpbmVydGlhbEJpYXMgPSAnSW5lcnRpYWxCaWFzID0geyBhY2NlbDogVmVjdG9yM2YsIGd5cm86IFZlY3RvcjNmIH07JztcclxuXHJcbiAgICAgICAgdmFyIGNvbmZpZzE0MTUgPSAnQ29uZmlndXJhdGlvbiA9IHsvMTYvJyArXHJcbiAgICAgICAgICAgICd2ZXJzaW9uOiBWZXJzaW9uLCcgK1xyXG4gICAgICAgICAgICAnY29uZmlnX2lkOiBDb25maWdJRCwnICtcclxuICAgICAgICAgICAgJ3BjYl90cmFuc2Zvcm06IFBjYlRyYW5zZm9ybSwnICtcclxuICAgICAgICAgICAgJ21peF90YWJsZTogTWl4VGFibGUsJyArXHJcbiAgICAgICAgICAgICdtYWdfYmlhczogTWFnQmlhcywnICtcclxuICAgICAgICAgICAgJ2NoYW5uZWw6IENoYW5uZWxQcm9wZXJ0aWVzLCcgK1xyXG4gICAgICAgICAgICAncGlkX3BhcmFtZXRlcnM6IFBJRFBhcmFtZXRlcnMsJyArXHJcbiAgICAgICAgICAgICdzdGF0ZV9wYXJhbWV0ZXJzOiBTdGF0ZVBhcmFtZXRlcnMsJyArXHJcbiAgICAgICAgICAgICdsZWRfc3RhdGVzOiBMRURTdGF0ZXMsJyArXHJcbiAgICAgICAgICAgICdkZXZpY2VfbmFtZTogRGV2aWNlTmFtZSB9Oyc7XHJcblxyXG4gICAgICAgIHZhciBjb25maWdGaXhlZDE0MTUgPSAnQ29uZmlndXJhdGlvbkZpeGVkID0geycgK1xyXG4gICAgICAgICAgICAndmVyc2lvbjogVmVyc2lvbiwnICtcclxuICAgICAgICAgICAgJ2NvbmZpZ19pZDogQ29uZmlnSUQsJyArXHJcbiAgICAgICAgICAgICdwY2JfdHJhbnNmb3JtOiBQY2JUcmFuc2Zvcm0sJyArXHJcbiAgICAgICAgICAgICdtaXhfdGFibGU6IE1peFRhYmxlLCcgK1xyXG4gICAgICAgICAgICAnbWFnX2JpYXM6IE1hZ0JpYXMsJyArXHJcbiAgICAgICAgICAgICdjaGFubmVsOiBDaGFubmVsUHJvcGVydGllcywnICtcclxuICAgICAgICAgICAgJ3BpZF9wYXJhbWV0ZXJzOiBQSURQYXJhbWV0ZXJzLCcgK1xyXG4gICAgICAgICAgICAnc3RhdGVfcGFyYW1ldGVyczogU3RhdGVQYXJhbWV0ZXJzLCcgK1xyXG4gICAgICAgICAgICAnbGVkX3N0YXRlczogTEVEU3RhdGVzRml4ZWQsJyArXHJcbiAgICAgICAgICAgICdkZXZpY2VfbmFtZTogRGV2aWNlTmFtZSB9Oyc7XHJcblxyXG4gICAgICAgIHZhciBjb25maWcgPSAnQ29uZmlndXJhdGlvbiA9IHsvMTYvJyArXHJcbiAgICAgICAgICAgICd2ZXJzaW9uOiBWZXJzaW9uLCcgK1xyXG4gICAgICAgICAgICAnY29uZmlnX2lkOiBDb25maWdJRCwnICtcclxuICAgICAgICAgICAgJ3BjYl90cmFuc2Zvcm06IFBjYlRyYW5zZm9ybSwnICtcclxuICAgICAgICAgICAgJ21peF90YWJsZTogTWl4VGFibGUsJyArXHJcbiAgICAgICAgICAgICdtYWdfYmlhczogTWFnQmlhcywnICtcclxuICAgICAgICAgICAgJ2NoYW5uZWw6IENoYW5uZWxQcm9wZXJ0aWVzLCcgK1xyXG4gICAgICAgICAgICAncGlkX3BhcmFtZXRlcnM6IFBJRFBhcmFtZXRlcnMsJyArXHJcbiAgICAgICAgICAgICdzdGF0ZV9wYXJhbWV0ZXJzOiBTdGF0ZVBhcmFtZXRlcnMsJyArXHJcbiAgICAgICAgICAgICdsZWRfc3RhdGVzOiBMRURTdGF0ZXMsJyArXHJcbiAgICAgICAgICAgICdkZXZpY2VfbmFtZTogRGV2aWNlTmFtZSwnICtcclxuICAgICAgICAgICAgJ3ZlbG9jaXR5X3BpZF9wYXJhbWV0ZXJzOiBWZWxvY2l0eVBJRFBhcmFtZXRlcnMsJyArXHJcbiAgICAgICAgICAgICdpbmVydGlhbF9iaWFzOiBJbmVydGlhbEJpYXMgfTsnO1xyXG5cclxuICAgICAgICB2YXIgY29uZmlnRml4ZWQgPSAnQ29uZmlndXJhdGlvbkZpeGVkID0geycgK1xyXG4gICAgICAgICAgICAndmVyc2lvbjogVmVyc2lvbiwnICtcclxuICAgICAgICAgICAgJ2NvbmZpZ19pZDogQ29uZmlnSUQsJyArXHJcbiAgICAgICAgICAgICdwY2JfdHJhbnNmb3JtOiBQY2JUcmFuc2Zvcm0sJyArXHJcbiAgICAgICAgICAgICdtaXhfdGFibGU6IE1peFRhYmxlLCcgK1xyXG4gICAgICAgICAgICAnbWFnX2JpYXM6IE1hZ0JpYXMsJyArXHJcbiAgICAgICAgICAgICdjaGFubmVsOiBDaGFubmVsUHJvcGVydGllcywnICtcclxuICAgICAgICAgICAgJ3BpZF9wYXJhbWV0ZXJzOiBQSURQYXJhbWV0ZXJzLCcgK1xyXG4gICAgICAgICAgICAnc3RhdGVfcGFyYW1ldGVyczogU3RhdGVQYXJhbWV0ZXJzLCcgK1xyXG4gICAgICAgICAgICAnbGVkX3N0YXRlczogTEVEU3RhdGVzRml4ZWQsJyArXHJcbiAgICAgICAgICAgICdkZXZpY2VfbmFtZTogRGV2aWNlTmFtZSwnICtcclxuICAgICAgICAgICAgJ3ZlbG9jaXR5X3BpZF9wYXJhbWV0ZXJzOiBWZWxvY2l0eVBJRFBhcmFtZXRlcnMsJyArXHJcbiAgICAgICAgICAgICdpbmVydGlhbF9iaWFzOiBJbmVydGlhbEJpYXMgfTsnO1xyXG5cclxuICAgICAgICB2YXIgY29uZmlnRmxhZzE0ID0gJ0NvbmZpZ3VyYXRpb25GbGFnID0gey8xNi8nICtcclxuICAgICAgICAgICAgJ3ZlcnNpb246IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdjb25maWdfaWQ6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdwY2JfdHJhbnNmb3JtOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnbWl4X3RhYmxlOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnbWFnX2JpYXM6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdjaGFubmVsOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAncGlkX3BhcmFtZXRlcnM6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdzdGF0ZV9wYXJhbWV0ZXJzOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnbGVkX3N0YXRlczogWy8vIHZvaWQ6MTZdLCcgK1xyXG4gICAgICAgICAgICAnZGV2aWNlX25hbWU6IHZvaWR9Oyc7XHJcblxyXG4gICAgICAgIHZhciBjb25maWdGbGFnID0gJ0NvbmZpZ3VyYXRpb25GbGFnID0gey8xNi8nICtcclxuICAgICAgICAgICAgJ3ZlcnNpb246IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdjb25maWdfaWQ6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdwY2JfdHJhbnNmb3JtOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnbWl4X3RhYmxlOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnbWFnX2JpYXM6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdjaGFubmVsOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAncGlkX3BhcmFtZXRlcnM6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdzdGF0ZV9wYXJhbWV0ZXJzOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnbGVkX3N0YXRlczogWy8vIHZvaWQ6MTZdLCcgK1xyXG4gICAgICAgICAgICAnZGV2aWNlX25hbWU6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICd2ZWxvY2l0eV9waWRfcGFyYW1ldGVyczogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2luZXJ0aWFsX2JpYXM6IHZvaWQgfTsnO1xyXG5cclxuICAgICAgICB2YXIgY29uZmlnRnVsbDE0ID0gdmVjdG9yM2YgKyBwaWRTZXR0aW5ncyArIHZlcnNpb24gKyBjb25maWdJZCArIHBjYlRyYW5zZm9ybSArXHJcbiAgICAgICAgICAgIG1peFRhYmxlICsgbWFnQmlhcyArIGNoYW5uZWxQcm9wZXJ0aWVzICsgcGlkUGFyYW1ldGVyczE0ICsgc3RhdGVQYXJhbWV0ZXJzICtcclxuICAgICAgICAgICAgc3RhdHVzRmxhZzE0MTUgKyBjb2xvciArIGxlZFN0YXRlQ2FzZSArIGxlZFN0YXRlcyArIGxlZFN0YXRlc0ZpeGVkICsgZGV2aWNlTmFtZSArXHJcbiAgICAgICAgICAgIGNvbmZpZzE0MTUgKyBjb25maWdGaXhlZDE0MTUgKyBjb25maWdGbGFnMTQ7XHJcbiAgICAgICAgdmFyIGNvbmZpZ0Z1bGwxNSA9IHZlY3RvcjNmICsgcGlkU2V0dGluZ3MgKyB2ZXJzaW9uICsgY29uZmlnSWQgKyBwY2JUcmFuc2Zvcm0gKyBtaXhUYWJsZSArXHJcbiAgICAgICAgICAgIG1hZ0JpYXMgKyBjaGFubmVsUHJvcGVydGllcyArIHBpZFBhcmFtZXRlcnMgKyBzdGF0ZVBhcmFtZXRlcnMgK1xyXG4gICAgICAgICAgICBzdGF0dXNGbGFnMTQxNSArIGNvbG9yICsgbGVkU3RhdGVDYXNlICsgbGVkU3RhdGVzICsgbGVkU3RhdGVzRml4ZWQgKyBkZXZpY2VOYW1lICtcclxuICAgICAgICAgICAgY29uZmlnMTQxNSArIGNvbmZpZ0ZpeGVkMTQxNSArIGNvbmZpZ0ZsYWc7XHJcbiAgICAgICAgdmFyIGNvbmZpZ0Z1bGwxNiA9IHZlY3RvcjNmICsgcGlkU2V0dGluZ3MgKyB2ZXJzaW9uICsgY29uZmlnSWQgKyBwY2JUcmFuc2Zvcm0gKyBtaXhUYWJsZSArXHJcbiAgICAgICAgICAgIG1hZ0JpYXMgKyBjaGFubmVsUHJvcGVydGllcyArIHBpZFBhcmFtZXRlcnMgKyBzdGF0ZVBhcmFtZXRlcnMgK1xyXG4gICAgICAgICAgICBzdGF0dXNGbGFnICsgY29sb3IgKyBsZWRTdGF0ZUNhc2UgKyBsZWRTdGF0ZXMgKyBsZWRTdGF0ZXNGaXhlZCArIGRldmljZU5hbWUgK1xyXG4gICAgICAgICAgICBpbmVydGlhbEJpYXMgKyB2ZWxvY2l0eVBpZFBhcmFtZXRlcnMgK1xyXG4gICAgICAgICAgICBjb25maWcgKyBjb25maWdGaXhlZCArIGNvbmZpZ0ZsYWc7XHJcblxyXG4gICAgICAgIHZhciBzdGF0ZSA9ICdSb3RhdGlvbiA9IHsgcm9sbDogZjMyLCBwaXRjaDogZjMyLCB5YXc6IGYzMiB9OycgK1xyXG4gICAgICAgICAgICAnUElEU3RhdGUgPSB7JyArXHJcbiAgICAgICAgICAgICd0aW1lc3RhbXBfdXM6IHUzMiwnICtcclxuICAgICAgICAgICAgJ2lucHV0OiBmMzIsJyArXHJcbiAgICAgICAgICAgICdzZXRwb2ludDogZjMyLCcgK1xyXG4gICAgICAgICAgICAncF90ZXJtOiBmMzIsJyArXHJcbiAgICAgICAgICAgICdpX3Rlcm06IGYzMiwnICtcclxuICAgICAgICAgICAgJ2RfdGVybTogZjMyIH07JyArXHJcbiAgICAgICAgICAgICdSY0NvbW1hbmQgPSB7IHRocm90dGxlOiBpMTYsIHBpdGNoOiBpMTYsIHJvbGw6IGkxNiwgeWF3OiBpMTYgfTsnICtcclxuICAgICAgICAgICAgJ1N0YXRlID0gey8zMi8nICtcclxuICAgICAgICAgICAgJ3RpbWVzdGFtcF91czogdTMyLCcgK1xyXG4gICAgICAgICAgICAnc3RhdHVzOiBTdGF0dXNGbGFnLCcgK1xyXG4gICAgICAgICAgICAndjBfcmF3OiB1MTYsJyArXHJcbiAgICAgICAgICAgICdpMF9yYXc6IHUxNiwnICtcclxuICAgICAgICAgICAgJ2kxX3JhdzogdTE2LCcgK1xyXG4gICAgICAgICAgICAnYWNjZWw6IFZlY3RvcjNmLCcgK1xyXG4gICAgICAgICAgICAnZ3lybzogVmVjdG9yM2YsJyArXHJcbiAgICAgICAgICAgICdtYWc6IFZlY3RvcjNmLCcgK1xyXG4gICAgICAgICAgICAndGVtcGVyYXR1cmU6IHUxNiwnICtcclxuICAgICAgICAgICAgJ3ByZXNzdXJlOiB1MzIsJyArXHJcbiAgICAgICAgICAgICdwcG06IFtpMTY6Nl0sJyArXHJcbiAgICAgICAgICAgICdhdXhfY2hhbl9tYXNrOiB1OCwnICtcclxuICAgICAgICAgICAgJ2NvbW1hbmQ6IFJjQ29tbWFuZCwnICtcclxuICAgICAgICAgICAgJ2NvbnRyb2w6IHsgZno6IGYzMiwgdHg6IGYzMiwgdHk6IGYzMiwgdHo6IGYzMiB9LCcgK1xyXG4gICAgICAgICAgICAncGlkX21hc3Rlcl9mejogUElEU3RhdGUsJyArXHJcbiAgICAgICAgICAgICdwaWRfbWFzdGVyX3R4OiBQSURTdGF0ZSwnICtcclxuICAgICAgICAgICAgJ3BpZF9tYXN0ZXJfdHk6IFBJRFN0YXRlLCcgK1xyXG4gICAgICAgICAgICAncGlkX21hc3Rlcl90ejogUElEU3RhdGUsJyArXHJcbiAgICAgICAgICAgICdwaWRfc2xhdmVfZno6IFBJRFN0YXRlLCcgK1xyXG4gICAgICAgICAgICAncGlkX3NsYXZlX3R4OiBQSURTdGF0ZSwnICtcclxuICAgICAgICAgICAgJ3BpZF9zbGF2ZV90eTogUElEU3RhdGUsJyArXHJcbiAgICAgICAgICAgICdwaWRfc2xhdmVfdHo6IFBJRFN0YXRlLCcgK1xyXG4gICAgICAgICAgICAnbW90b3Jfb3V0OiBbaTE2OjhdLCcgK1xyXG4gICAgICAgICAgICAna2luZW1hdGljc19hbmdsZTogUm90YXRpb24sJyArXHJcbiAgICAgICAgICAgICdraW5lbWF0aWNzX3JhdGU6IFJvdGF0aW9uLCcgK1xyXG4gICAgICAgICAgICAna2luZW1hdGljc19hbHRpdHVkZTogZjMyLCcgK1xyXG4gICAgICAgICAgICAnbG9vcF9jb3VudDogdTMyIH07JztcclxuXHJcbiAgICAgICAgdmFyIGF1eE1hc2sgPSAnQXV4TWFzayA9IHsvLycgK1xyXG4gICAgICAgICAgICAnYXV4MV9sb3c6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdhdXgxX21pZDogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2F1eDFfaGlnaDogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2F1eDJfbG93OiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnYXV4Ml9taWQ6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdhdXgyX2hpZ2g6IHZvaWQgfTsnO1xyXG5cclxuICAgICAgICB2YXIgY29tbWFuZHMgPSBhdXhNYXNrICsgJ0NvbW1hbmQgPSB7LzMyLycgK1xyXG4gICAgICAgICAgICAncmVxdWVzdF9yZXNwb25zZTogdm9pZCwnICtcclxuICAgICAgICAgICAgJ3NldF9lZXByb21fZGF0YTogQ29uZmlndXJhdGlvbkZpeGVkLCcgK1xyXG4gICAgICAgICAgICAncmVpbml0X2VlcHJvbV9kYXRhOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAncmVxdWVzdF9lZXByb21fZGF0YTogdm9pZCwnICtcclxuICAgICAgICAgICAgJ3JlcXVlc3RfZW5hYmxlX2l0ZXJhdGlvbjogdTgsJyArXHJcbiAgICAgICAgICAgICdtb3Rvcl9vdmVycmlkZV9zcGVlZF8wOiB1MTYsJyArXHJcbiAgICAgICAgICAgICdtb3Rvcl9vdmVycmlkZV9zcGVlZF8xOiB1MTYsJyArXHJcbiAgICAgICAgICAgICdtb3Rvcl9vdmVycmlkZV9zcGVlZF8yOiB1MTYsJyArXHJcbiAgICAgICAgICAgICdtb3Rvcl9vdmVycmlkZV9zcGVlZF8zOiB1MTYsJyArXHJcbiAgICAgICAgICAgICdtb3Rvcl9vdmVycmlkZV9zcGVlZF80OiB1MTYsJyArXHJcbiAgICAgICAgICAgICdtb3Rvcl9vdmVycmlkZV9zcGVlZF81OiB1MTYsJyArXHJcbiAgICAgICAgICAgICdtb3Rvcl9vdmVycmlkZV9zcGVlZF82OiB1MTYsJyArXHJcbiAgICAgICAgICAgICdtb3Rvcl9vdmVycmlkZV9zcGVlZF83OiB1MTYsJyArXHJcbiAgICAgICAgICAgICdzZXRfY29tbWFuZF9vdmVycmlkZTogYm9vbCwnICtcclxuICAgICAgICAgICAgJ3NldF9zdGF0ZV9tYXNrOiB1MzIsJyArXHJcbiAgICAgICAgICAgICdzZXRfc3RhdGVfZGVsYXk6IHUxNiwnICtcclxuICAgICAgICAgICAgJ3NldF9zZF93cml0ZV9kZWxheTogdTE2LCcgK1xyXG4gICAgICAgICAgICAnc2V0X2xlZDogeycgK1xyXG4gICAgICAgICAgICAnICBwYXR0ZXJuOiB1OCwnICtcclxuICAgICAgICAgICAgJyAgY29sb3JfcmlnaHQ6IENvbG9yLCcgK1xyXG4gICAgICAgICAgICAnICBjb2xvcl9sZWZ0OiBDb2xvciwnICtcclxuICAgICAgICAgICAgJyAgaW5kaWNhdG9yX3JlZDogYm9vbCwnICtcclxuICAgICAgICAgICAgJyAgaW5kaWNhdG9yX2dyZWVuOiBib29sIH0sJyArXHJcbiAgICAgICAgICAgICdzZXRfc2VyaWFsX3JjOiB7IGVuYWJsZWQ6IGJvb2wsIGNvbW1hbmQ6IFJjQ29tbWFuZCwgYXV4X21hc2s6IEF1eE1hc2sgfSwnICtcclxuICAgICAgICAgICAgJ3NldF9jYXJkX3JlY29yZGluZ19zdGF0ZTogey84LyByZWNvcmRfdG9fY2FyZDogdm9pZCwgbG9ja19yZWNvcmRpbmdfc3RhdGU6IHZvaWQgfSwnICtcclxuICAgICAgICAgICAgJ3NldF9wYXJ0aWFsX2VlcHJvbV9kYXRhOiBDb25maWd1cmF0aW9uLCcgK1xyXG4gICAgICAgICAgICAncmVpbml0X3BhcnRpYWxfZWVwcm9tX2RhdGE6IENvbmZpZ3VyYXRpb25GbGFnLCcgK1xyXG4gICAgICAgICAgICAncmVxX3BhcnRpYWxfZWVwcm9tX2RhdGE6IENvbmZpZ3VyYXRpb25GbGFnLCcgK1xyXG4gICAgICAgICAgICAncmVxX2NhcmRfcmVjb3JkaW5nX3N0YXRlOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnc2V0X3BhcnRpYWxfdGVtcG9yYXJ5X2NvbmZpZzogQ29uZmlndXJhdGlvbiwnICtcclxuICAgICAgICAgICAgJ3NldF9jb21tYW5kX3NvdXJjZXM6IHsvOC8gc2VyaWFsOiB2b2lkLCByYWRpbzogdm9pZCB9LCcgK1xyXG4gICAgICAgICAgICAnc2V0X2NhbGlicmF0aW9uOiB7IGVuYWJsZWQ6IGJvb2wsIG1vZGU6IHU4IH0sJyArXHJcbiAgICAgICAgICAgICdzZXRfYXV0b3BpbG90X2VuYWJsZWQ6IGJvb2wsJyArXHJcbiAgICAgICAgICAgICdzZXRfdXNiX21vZGU6IHU4fTsnO1xyXG5cclxuICAgICAgICB2YXIgZGVidWdTdHJpbmcgPSBcIkRlYnVnU3RyaW5nID0geyBkZXByZWNhdGVkX21hc2s6IHUzMiwgbWVzc2FnZTogcyB9O1wiO1xyXG4gICAgICAgIHZhciBoaXN0b3J5RGF0YSA9IFwiSGlzdG9yeURhdGEgPSBEZWJ1Z1N0cmluZztcIjtcclxuICAgICAgICB2YXIgcmVzcG9uc2UgPSBcIlJlc3BvbnNlID0geyBtYXNrOiB1MzIsIGFjazogdTMyIH07XCI7XHJcblxyXG4gICAgICAgIHZhciBoYW5kbGVyMTQgPSBjb25maWdGdWxsMTQgKyBzdGF0ZSArIGNvbW1hbmRzICsgZGVidWdTdHJpbmcgKyBoaXN0b3J5RGF0YSArIHJlc3BvbnNlO1xyXG4gICAgICAgIHZhciBoYW5kbGVyMTUgPSBjb25maWdGdWxsMTUgKyBzdGF0ZSArIGNvbW1hbmRzICsgZGVidWdTdHJpbmcgKyBoaXN0b3J5RGF0YSArIHJlc3BvbnNlO1xyXG4gICAgICAgIHZhciBoYW5kbGVyMTYgPSBjb25maWdGdWxsMTYgKyBzdGF0ZSArIGNvbW1hbmRzICsgZGVidWdTdHJpbmcgKyBoaXN0b3J5RGF0YSArIHJlc3BvbnNlO1xyXG5cclxuICAgICAgICBoYW5kbGVyQ2FjaGVbJzEuNC4wJ10gPSBGbHlicml4U2VyaWFsaXphdGlvbi5wYXJzZShoYW5kbGVyMTQpO1xyXG4gICAgICAgIGhhbmRsZXJDYWNoZVsnMS41LjAnXSA9IGhhbmRsZXJDYWNoZVsnMS41LjEnXSA9IEZseWJyaXhTZXJpYWxpemF0aW9uLnBhcnNlKGhhbmRsZXIxNSk7XHJcbiAgICAgICAgaGFuZGxlckNhY2hlWycxLjYuMCddID0gRmx5YnJpeFNlcmlhbGl6YXRpb24ucGFyc2UoaGFuZGxlcjE2KTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gdXBkYXRlRmllbGRzKHRhcmdldCwgc291cmNlKSB7XHJcbiAgICAgICAgICAgIGlmIChzb3VyY2UgaW5zdGFuY2VvZiBBcnJheSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHVwZGF0ZUZpZWxkc0FycmF5KHRhcmdldCwgc291cmNlKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChzb3VyY2UgaW5zdGFuY2VvZiBPYmplY3QpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB1cGRhdGVGaWVsZHNPYmplY3QodGFyZ2V0LCBzb3VyY2UpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIChzb3VyY2UgPT09IG51bGwgfHwgc291cmNlID09PSB1bmRlZmluZWQpID8gdGFyZ2V0IDogc291cmNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiB1cGRhdGVGaWVsZHNPYmplY3QodGFyZ2V0LCBzb3VyY2UpIHtcclxuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHt9O1xyXG4gICAgICAgICAgICBPYmplY3Qua2V5cyh0YXJnZXQpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0W2tleV0gPSB1cGRhdGVGaWVsZHModGFyZ2V0W2tleV0sIHNvdXJjZVtrZXldKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKHNvdXJjZSkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoa2V5IGluIHJlc3VsdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJlc3VsdFtrZXldID0gdXBkYXRlRmllbGRzKHRhcmdldFtrZXldLCBzb3VyY2Vba2V5XSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gdXBkYXRlRmllbGRzQXJyYXkodGFyZ2V0LCBzb3VyY2UpIHtcclxuICAgICAgICAgICAgdmFyIGxlbmd0aCA9IE1hdGgubWF4KHRhcmdldC5sZW5ndGgsIHNvdXJjZS5sZW5ndGgpO1xyXG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gW107XHJcbiAgICAgICAgICAgIGZvciAodmFyIGlkeCA9IDA7IGlkeCA8IGxlbmd0aDsgKytpZHgpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKHVwZGF0ZUZpZWxkcyh0YXJnZXRbaWR4XSwgc291cmNlW2lkeF0pKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgU2VyaWFsaXplcjogRmx5YnJpeFNlcmlhbGl6YXRpb24uU2VyaWFsaXplcixcclxuICAgICAgICAgICAgZ2V0SGFuZGxlcjogZnVuY3Rpb24gKGZpcm13YXJlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlckNhY2hlW2Zpcm13YXJlXTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdXBkYXRlRmllbGRzOiB1cGRhdGVGaWVsZHMsXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbn0oKSk7XHJcbiJdfQ==
