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
                mask = { request_response: true, set_partial_temporary_config: mask };
            } else {
                message.set_partial_eeprom_data = newConfig;
                mask = { request_response: true, set_partial_eeprom_data: mask };
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
            Protocol: 128,
            Response: 255,
        };

        var acknowledges = [];
        var backend = new Backend();

        var onReceiveListeners = [];

        var cobsReader = new cobs.Reader(10000);
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
            } else if (messageType === 'Protocol') {
                var data = message.response;
                if (data) {
                    serializationHandler.addHandler(data.version, data.structure);
                }
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
                return cb !== callback;
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
        var protocol = "ProtocolInfo = { version: Version, structure: s };" +
            "Protocol = {/32/ request: void, response: ProtocolInfo };";

        var handler14 = configFull14 + state + commands + debugString + historyData + response + protocol;
        var handler15 = configFull15 + state + commands + debugString + historyData + response + protocol;
        var handler16 = configFull16 + state + commands + debugString + historyData + response + protocol;

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
            addHandler: function (version, structure) {
                var versionString = version.major.toString() + '.' + version.minor.toString() + version.patch.toString();
                handlerCache[versionString] = FlybrixSerialization.parse(structure);
            },
            updateFields: updateFields,
        };
    }

}());

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZS5qcyIsImNhbGlicmF0aW9uLmpzIiwiY29icy5qcyIsImNvbW1hbmRMb2cuanMiLCJkZXZpY2VDb25maWcuanMiLCJmaXJtd2FyZVZlcnNpb24uanMiLCJsZWQuanMiLCJyY0RhdGEuanMiLCJzZXJpYWwuanMiLCJzZXJpYWxpemF0aW9uSGFuZGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJmbHlicml4LWNvbW1vbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgnZmx5YnJpeENvbW1vbicsIFtdKTtcclxufSgpKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdmbHlicml4Q29tbW9uJykuZmFjdG9yeSgnY2FsaWJyYXRpb24nLCBjYWxpYnJhdGlvbik7XHJcblxyXG4gICAgY2FsaWJyYXRpb24uJGluamVjdCA9IFsnY29tbWFuZExvZycsICdzZXJpYWwnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBjYWxpYnJhdGlvbihjb21tYW5kTG9nLCBzZXJpYWwpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBtYWduZXRvbWV0ZXI6IG1hZ25ldG9tZXRlcixcclxuICAgICAgICAgICAgYWNjZWxlcm9tZXRlcjoge1xyXG4gICAgICAgICAgICAgICAgZmxhdDogY2FsaWJyYXRlQWNjZWxlcm9tZXRlci5iaW5kKG51bGwsICdmbGF0JywgMCksXHJcbiAgICAgICAgICAgICAgICBmb3J3YXJkOiBjYWxpYnJhdGVBY2NlbGVyb21ldGVyLmJpbmQobnVsbCwgJ2xlYW4gZm9yd2FyZCcsIDEpLFxyXG4gICAgICAgICAgICAgICAgYmFjazogY2FsaWJyYXRlQWNjZWxlcm9tZXRlci5iaW5kKG51bGwsICdsZWFuIGJhY2snLCAyKSxcclxuICAgICAgICAgICAgICAgIHJpZ2h0OiBjYWxpYnJhdGVBY2NlbGVyb21ldGVyLmJpbmQobnVsbCwgJ2xlYW4gcmlnaHQnLCAzKSxcclxuICAgICAgICAgICAgICAgIGxlZnQ6IGNhbGlicmF0ZUFjY2VsZXJvbWV0ZXIuYmluZChudWxsLCAnbGVhbiBsZWZ0JywgNCksXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGZpbmlzaDogZmluaXNoLFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIG1hZ25ldG9tZXRlcigpIHtcclxuICAgICAgICAgICAgY29tbWFuZExvZyhcIkNhbGlicmF0aW5nIG1hZ25ldG9tZXRlciBiaWFzXCIpO1xyXG4gICAgICAgICAgICByZXR1cm4gc2VyaWFsLnNlbmRTdHJ1Y3R1cmUoJ0NvbW1hbmQnLCB7XHJcbiAgICAgICAgICAgICAgICByZXF1ZXN0X3Jlc3BvbnNlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgc2V0X2NhbGlicmF0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZW5hYmxlZDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBtb2RlOiAwLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSwgZmFsc2UpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gY2FsaWJyYXRlQWNjZWxlcm9tZXRlcihwb3NlRGVzY3JpcHRpb24sIHBvc2VJZCkge1xyXG4gICAgICAgICAgICBjb21tYW5kTG9nKFwiQ2FsaWJyYXRpbmcgZ3Jhdml0eSBmb3IgcG9zZTogXCIgKyBwb3NlRGVzY3JpcHRpb24pO1xyXG4gICAgICAgICAgICByZXR1cm4gc2VyaWFsLnNlbmRTdHJ1Y3R1cmUoJ0NvbW1hbmQnLCB7XHJcbiAgICAgICAgICAgICAgICByZXF1ZXN0X3Jlc3BvbnNlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgc2V0X2NhbGlicmF0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZW5hYmxlZDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBtb2RlOiBwb3NlSWQgKyAxLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSwgZmFsc2UpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZmluaXNoKCkge1xyXG4gICAgICAgICAgICBjb21tYW5kTG9nKFwiRmluaXNoaW5nIGNhbGlicmF0aW9uXCIpO1xyXG4gICAgICAgICAgICByZXR1cm4gc2VyaWFsLnNlbmRTdHJ1Y3R1cmUoJ0NvbW1hbmQnLCB7XHJcbiAgICAgICAgICAgICAgICByZXF1ZXN0X3Jlc3BvbnNlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgc2V0X2NhbGlicmF0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZW5hYmxlZDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgbW9kZTogMCxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0sIGZhbHNlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgnZmx5YnJpeENvbW1vbicpLmZhY3RvcnkoJ2NvYnMnLCBjb2JzKTtcclxuXHJcbiAgICBmdW5jdGlvbiBjb2JzKCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIFJlYWRlcjogUmVhZGVyLFxyXG4gICAgICAgICAgICBlbmNvZGU6IGVuY29kZSxcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBmdW5jdGlvbiBSZWFkZXIoY2FwYWNpdHkpIHtcclxuICAgICAgICBpZiAoY2FwYWNpdHkgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBjYXBhY2l0eSA9IDIwMDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuTiA9IGNhcGFjaXR5O1xyXG4gICAgICAgIHRoaXMuYnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoY2FwYWNpdHkpO1xyXG4gICAgICAgIHRoaXMucmVhZHlfZm9yX25ld19tZXNzYWdlID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmJ1ZmZlcl9sZW5ndGggPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNvYnNEZWNvZGUocmVhZGVyKSB7XHJcbiAgICAgICAgdmFyIHNyY19wdHIgPSAwO1xyXG4gICAgICAgIHZhciBkc3RfcHRyID0gMDtcclxuICAgICAgICB2YXIgbGVmdG92ZXJfbGVuZ3RoID0gMDtcclxuICAgICAgICB2YXIgYXBwZW5kX3plcm8gPSBmYWxzZTtcclxuICAgICAgICB3aGlsZSAocmVhZGVyLmJ1ZmZlcltzcmNfcHRyXSkge1xyXG4gICAgICAgICAgICBpZiAoIWxlZnRvdmVyX2xlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGFwcGVuZF96ZXJvKVxyXG4gICAgICAgICAgICAgICAgICAgIHJlYWRlci5idWZmZXJbZHN0X3B0cisrXSA9IDA7XHJcbiAgICAgICAgICAgICAgICBsZWZ0b3Zlcl9sZW5ndGggPSByZWFkZXIuYnVmZmVyW3NyY19wdHIrK10gLSAxO1xyXG4gICAgICAgICAgICAgICAgYXBwZW5kX3plcm8gPSBsZWZ0b3Zlcl9sZW5ndGggPCAweEZFO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLS1sZWZ0b3Zlcl9sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICByZWFkZXIuYnVmZmVyW2RzdF9wdHIrK10gPSByZWFkZXIuYnVmZmVyW3NyY19wdHIrK107XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBsZWZ0b3Zlcl9sZW5ndGggPyAwIDogZHN0X3B0cjtcclxuICAgIH1cclxuXHJcbiAgICBSZWFkZXIucHJvdG90eXBlLnJlYWRCeXRlcyA9IGZ1bmN0aW9uKGRhdGEsIG9uU3VjY2Vzcywgb25FcnJvcikge1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgYyA9IGRhdGFbaV07XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnJlYWR5X2Zvcl9uZXdfbWVzc2FnZSkge1xyXG4gICAgICAgICAgICAgICAgLy8gZmlyc3QgYnl0ZSBvZiBhIG5ldyBtZXNzYWdlXHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlYWR5X2Zvcl9uZXdfbWVzc2FnZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5idWZmZXJfbGVuZ3RoID0gMDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5idWZmZXJbdGhpcy5idWZmZXJfbGVuZ3RoKytdID0gYztcclxuXHJcbiAgICAgICAgICAgIGlmIChjKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5idWZmZXJfbGVuZ3RoID09PSB0aGlzLk4pIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBidWZmZXIgb3ZlcmZsb3csIHByb2JhYmx5IGR1ZSB0byBlcnJvcnMgaW4gZGF0YVxyXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IoJ292ZXJmbG93JywgJ2J1ZmZlciBvdmVyZmxvdyBpbiBDT0JTIGRlY29kaW5nJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWFkeV9mb3JfbmV3X21lc3NhZ2UgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuYnVmZmVyX2xlbmd0aCA9IGNvYnNEZWNvZGUodGhpcyk7XHJcbiAgICAgICAgICAgIHZhciBmYWlsZWRfZGVjb2RlID0gKHRoaXMuYnVmZmVyX2xlbmd0aCA9PT0gMCk7XHJcbiAgICAgICAgICAgIGlmIChmYWlsZWRfZGVjb2RlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJ1ZmZlclswXSA9IDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIGo7XHJcbiAgICAgICAgICAgIGZvciAoaiA9IDE7IGogPCB0aGlzLmJ1ZmZlcl9sZW5ndGg7ICsraikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5idWZmZXJbMF0gXj0gdGhpcy5idWZmZXJbal07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoaXMuYnVmZmVyWzBdID09PSAwKSB7ICAvLyBjaGVjayBzdW0gaXMgY29ycmVjdFxyXG4gICAgICAgICAgICAgICAgdGhpcy5yZWFkeV9mb3JfbmV3X21lc3NhZ2UgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYnVmZmVyX2xlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBvblN1Y2Nlc3ModGhpcy5idWZmZXIuc2xpY2UoMSwgdGhpcy5idWZmZXJfbGVuZ3RoKSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IoJ3Nob3J0JywgJ1RvbyBzaG9ydCBwYWNrZXQnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHsgIC8vIGJhZCBjaGVja3N1bVxyXG4gICAgICAgICAgICAgICAgdGhpcy5yZWFkeV9mb3JfbmV3X21lc3NhZ2UgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgdmFyIGJ5dGVzID0gXCJcIjtcclxuICAgICAgICAgICAgICAgIHZhciBtZXNzYWdlID0gXCJcIjtcclxuICAgICAgICAgICAgICAgIGZvciAoaiA9IDA7IGogPCB0aGlzLmJ1ZmZlcl9sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGJ5dGVzICs9IHRoaXMuYnVmZmVyW2pdICsgXCIsXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZSArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKHRoaXMuYnVmZmVyW2pdKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChmYWlsZWRfZGVjb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcignZnJhbWUnLCAnVW5leHBlY3RlZCBlbmRpbmcgb2YgcGFja2V0Jyk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBtc2cgPSAnQkFEIENIRUNLU1VNICgnICsgdGhpcy5idWZmZXJfbGVuZ3RoICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJyBieXRlcyknICsgYnl0ZXMgKyBtZXNzYWdlO1xyXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IoJ2NoZWNrc3VtJywgbXNnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgZnVuY3Rpb24gZW5jb2RlKGJ1Zikge1xyXG4gICAgICAgIHZhciByZXR2YWwgPVxyXG4gICAgICAgICAgICBuZXcgVWludDhBcnJheShNYXRoLmZsb29yKChidWYuYnl0ZUxlbmd0aCAqIDI1NSArIDc2MSkgLyAyNTQpKTtcclxuICAgICAgICB2YXIgbGVuID0gMTtcclxuICAgICAgICB2YXIgcG9zX2N0ciA9IDA7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBidWYubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICAgICAgaWYgKHJldHZhbFtwb3NfY3RyXSA9PSAweEZFKSB7XHJcbiAgICAgICAgICAgICAgICByZXR2YWxbcG9zX2N0cl0gPSAweEZGO1xyXG4gICAgICAgICAgICAgICAgcG9zX2N0ciA9IGxlbisrO1xyXG4gICAgICAgICAgICAgICAgcmV0dmFsW3Bvc19jdHJdID0gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgdmFsID0gYnVmW2ldO1xyXG4gICAgICAgICAgICArK3JldHZhbFtwb3NfY3RyXTtcclxuICAgICAgICAgICAgaWYgKHZhbCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dmFsW2xlbisrXSA9IHZhbDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHBvc19jdHIgPSBsZW4rKztcclxuICAgICAgICAgICAgICAgIHJldHZhbFtwb3NfY3RyXSA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJldHZhbC5zdWJhcnJheSgwLCBsZW4pLnNsaWNlKCkuYnVmZmVyO1xyXG4gICAgfTtcclxufSgpKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdmbHlicml4Q29tbW9uJykuZmFjdG9yeSgnY29tbWFuZExvZycsIGNvbW1hbmRMb2cpO1xyXG5cclxuICAgIGNvbW1hbmRMb2cuJGluamVjdCA9IFsnJHEnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBjb21tYW5kTG9nKCRxKSB7XHJcbiAgICAgICAgdmFyIG1lc3NhZ2VzID0gW107XHJcbiAgICAgICAgdmFyIHJlc3BvbmRlciA9ICRxLmRlZmVyKCk7XHJcblxyXG4gICAgICAgIHZhciBzZXJ2aWNlID0gbG9nO1xyXG4gICAgICAgIHNlcnZpY2UubG9nID0gbG9nO1xyXG4gICAgICAgIHNlcnZpY2UuY2xlYXJTdWJzY3JpYmVycyA9IGNsZWFyU3Vic2NyaWJlcnM7XHJcbiAgICAgICAgc2VydmljZS5vbk1lc3NhZ2UgPSBvbk1lc3NhZ2U7XHJcbiAgICAgICAgc2VydmljZS5yZWFkID0gcmVhZDtcclxuXHJcbiAgICAgICAgcmV0dXJuIHNlcnZpY2U7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGxvZyhtZXNzYWdlKSB7XHJcbiAgICAgICAgICAgIGlmIChtZXNzYWdlICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIG1lc3NhZ2VzLnB1c2gobWVzc2FnZSk7XHJcbiAgICAgICAgICAgICAgICByZXNwb25kZXIubm90aWZ5KHJlYWQoKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHJlYWQoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBtZXNzYWdlcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGNsZWFyU3Vic2NyaWJlcnMoKSB7XHJcbiAgICAgICAgICAgIHJlc3BvbmRlciA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBvbk1lc3NhZ2UoY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbmRlci5wcm9taXNlLnRoZW4odW5kZWZpbmVkLCB1bmRlZmluZWQsIGNhbGxiYWNrKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgnZmx5YnJpeENvbW1vbicpLmZhY3RvcnkoJ2RldmljZUNvbmZpZycsIGRldmljZUNvbmZpZyk7XHJcblxyXG4gICAgZGV2aWNlQ29uZmlnLiRpbmplY3QgPSBbJ3NlcmlhbCcsICdjb21tYW5kTG9nJywgJ2Zpcm13YXJlVmVyc2lvbicsICdzZXJpYWxpemF0aW9uSGFuZGxlciddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGRldmljZUNvbmZpZyhzZXJpYWwsIGNvbW1hbmRMb2csIGZpcm13YXJlVmVyc2lvbiwgc2VyaWFsaXphdGlvbkhhbmRsZXIpIHtcclxuICAgICAgICB2YXIgY29uZmlnO1xyXG5cclxuICAgICAgICB2YXIgY29uZmlnQ2FsbGJhY2sgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgY29tbWFuZExvZygnTm8gY2FsbGJhY2sgZGVmaW5lZCBmb3IgcmVjZWl2aW5nIGNvbmZpZ3VyYXRpb25zIScpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHZhciBsb2dnaW5nQ2FsbGJhY2sgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgY29tbWFuZExvZyhcclxuICAgICAgICAgICAgICAgICdObyBjYWxsYmFjayBkZWZpbmVkIGZvciByZWNlaXZpbmcgbG9nZ2luZyBzdGF0ZSEnICtcclxuICAgICAgICAgICAgICAgICcgQ2FsbGJhY2sgYXJndW1lbnRzOiAoaXNMb2dnaW5nLCBpc0xvY2tlZCwgZGVsYXkpJyk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgc2VyaWFsLmFkZE9uUmVjZWl2ZUNhbGxiYWNrKGZ1bmN0aW9uKG1lc3NhZ2VUeXBlLCBtZXNzYWdlKSB7XHJcbiAgICAgICAgICAgIGlmIChtZXNzYWdlVHlwZSAhPT0gJ0NvbW1hbmQnKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCdzZXRfZWVwcm9tX2RhdGEnIGluIG1lc3NhZ2UpIHtcclxuICAgICAgICAgICAgICAgIHVwZGF0ZUNvbmZpZ0Zyb21SZW1vdGVEYXRhKG1lc3NhZ2Uuc2V0X2VlcHJvbV9kYXRhKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoJ3NldF9wYXJ0aWFsX2VlcHJvbV9kYXRhJyBpbiBtZXNzYWdlKSB7XHJcbiAgICAgICAgICAgICAgICB1cGRhdGVDb25maWdGcm9tUmVtb3RlRGF0YShtZXNzYWdlLnNldF9wYXJ0aWFsX2VlcHJvbV9kYXRhKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoKCdzZXRfY2FyZF9yZWNvcmRpbmdfc3RhdGUnIGluIG1lc3NhZ2UpICYmICgnc2V0X3NkX3dyaXRlX2RlbGF5JyBpbiBtZXNzYWdlKSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGNhcmRfcmVjX3N0YXRlID0gbWVzc2FnZS5zZXRfY2FyZF9yZWNvcmRpbmdfc3RhdGU7XHJcbiAgICAgICAgICAgICAgICB2YXIgc2Rfd3JpdGVfZGVsYXkgPSBtZXNzYWdlLnNldF9zZF93cml0ZV9kZWxheTtcclxuICAgICAgICAgICAgICAgIGxvZ2dpbmdDYWxsYmFjayhjYXJkX3JlY19zdGF0ZS5yZWNvcmRfdG9fY2FyZCwgY2FyZF9yZWNfc3RhdGUubG9ja19yZWNvcmRpbmdfc3RhdGUsIHNkX3dyaXRlX2RlbGF5KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXREZXNpcmVkVmVyc2lvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZpcm13YXJlVmVyc2lvbi5kZXNpcmVkKCk7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gcmVxdWVzdCgpIHtcclxuICAgICAgICAgICAgdmFyIGhhbmRsZXJzID0gZmlybXdhcmVWZXJzaW9uLnNlcmlhbGl6YXRpb25IYW5kbGVyKCk7XHJcbiAgICAgICAgICAgIGNvbW1hbmRMb2coJ1JlcXVlc3RpbmcgY3VycmVudCBjb25maWd1cmF0aW9uIGRhdGEuLi4nKTtcclxuICAgICAgICAgICAgcmV0dXJuIHNlcmlhbC5zZW5kU3RydWN0dXJlKCdDb21tYW5kJywge1xyXG4gICAgICAgICAgICAgICAgcmVxdWVzdF9yZXNwb25zZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHJlcV9wYXJ0aWFsX2VlcHJvbV9kYXRhOiBoYW5kbGVycy5Db25maWd1cmF0aW9uRmxhZy5lbXB0eSgpLFxyXG4gICAgICAgICAgICB9LCBmYWxzZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiByZWluaXQoKSB7XHJcbiAgICAgICAgICAgIGNvbW1hbmRMb2coJ1NldHRpbmcgZmFjdG9yeSBkZWZhdWx0IGNvbmZpZ3VyYXRpb24gZGF0YS4uLicpO1xyXG4gICAgICAgICAgICByZXR1cm4gc2VyaWFsLnNlbmRTdHJ1Y3R1cmUoJ0NvbW1hbmQnLCB7XHJcbiAgICAgICAgICAgICAgICByZXF1ZXN0X3Jlc3BvbnNlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgcmVpbml0X2VlcHJvbV9kYXRhOiB0cnVlLFxyXG4gICAgICAgICAgICB9LCBmYWxzZSlcclxuICAgICAgICAgICAgICAgIC50aGVuKFxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVxdWVzdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24ocmVhc29uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbW1hbmRMb2coXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnUmVxdWVzdCBmb3IgZmFjdG9yeSByZXNldCBmYWlsZWQ6ICcgKyByZWFzb24pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2VuZChuZXdDb25maWcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHNlbmRDb25maWcoeyBjb25maWc6IG5ld0NvbmZpZywgdGVtcG9yYXJ5OiBmYWxzZSwgcmVxdWVzdFVwZGF0ZTogdHJ1ZSB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNlbmRDb25maWcocHJvcGVydGllcykge1xyXG4gICAgICAgICAgICB2YXIgaGFuZGxlcnMgPSBmaXJtd2FyZVZlcnNpb24uc2VyaWFsaXphdGlvbkhhbmRsZXIoKTtcclxuICAgICAgICAgICAgdmFyIG1hc2sgPSBwcm9wZXJ0aWVzLm1hc2sgfHwgaGFuZGxlcnMuQ29uZmlndXJhdGlvbkZsYWcuZW1wdHkoKTtcclxuICAgICAgICAgICAgdmFyIG5ld0NvbmZpZyA9IHByb3BlcnRpZXMuY29uZmlnIHx8IGNvbmZpZztcclxuICAgICAgICAgICAgdmFyIHJlcXVlc3RVcGRhdGUgPSBwcm9wZXJ0aWVzLnJlcXVlc3RVcGRhdGUgfHwgZmFsc2U7XHJcbiAgICAgICAgICAgIHZhciBtZXNzYWdlID0ge1xyXG4gICAgICAgICAgICAgICAgcmVxdWVzdF9yZXNwb25zZTogdHJ1ZSxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgaWYgKHByb3BlcnRpZXMudGVtcG9yYXJ5KSB7XHJcbiAgICAgICAgICAgICAgICBtZXNzYWdlLnNldF9wYXJ0aWFsX3RlbXBvcmFyeV9jb25maWcgPSBuZXdDb25maWc7XHJcbiAgICAgICAgICAgICAgICBtYXNrID0geyByZXF1ZXN0X3Jlc3BvbnNlOiB0cnVlLCBzZXRfcGFydGlhbF90ZW1wb3JhcnlfY29uZmlnOiBtYXNrIH07XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBtZXNzYWdlLnNldF9wYXJ0aWFsX2VlcHJvbV9kYXRhID0gbmV3Q29uZmlnO1xyXG4gICAgICAgICAgICAgICAgbWFzayA9IHsgcmVxdWVzdF9yZXNwb25zZTogdHJ1ZSwgc2V0X3BhcnRpYWxfZWVwcm9tX2RhdGE6IG1hc2sgfTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gc2VyaWFsLnNlbmRTdHJ1Y3R1cmUoJ0NvbW1hbmQnLCBtZXNzYWdlLCB0cnVlLCBtYXNrKS50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlcXVlc3RVcGRhdGUpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXF1ZXN0KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gdXBkYXRlQ29uZmlnRnJvbVJlbW90ZURhdGEoY29uZmlnQ2hhbmdlcykge1xyXG4gICAgICAgICAgICAvL2NvbW1hbmRMb2coJ1JlY2VpdmVkIGNvbmZpZyEnKTtcclxuICAgICAgICAgICAgY29uZmlnID0gc2VyaWFsaXphdGlvbkhhbmRsZXIudXBkYXRlRmllbGRzKGNvbmZpZywgY29uZmlnQ2hhbmdlcyk7XHJcbiAgICAgICAgICAgIGZpcm13YXJlVmVyc2lvbi5zZXQoY29uZmlnLnZlcnNpb24pO1xyXG4gICAgICAgICAgICBpZiAoIWZpcm13YXJlVmVyc2lvbi5zdXBwb3J0ZWQoKSkge1xyXG4gICAgICAgICAgICAgICAgY29tbWFuZExvZygnUmVjZWl2ZWQgYW4gdW5zdXBwb3J0ZWQgY29uZmlndXJhdGlvbiEnKTtcclxuICAgICAgICAgICAgICAgIGNvbW1hbmRMb2coXHJcbiAgICAgICAgICAgICAgICAgICAgJ0ZvdW5kIHZlcnNpb246ICcgKyBjb25maWcudmVyc2lvblswXSArICcuJyArXHJcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnLnZlcnNpb25bMV0gKyAnLicgKyBjb25maWcudmVyc2lvblsyXSAgK1xyXG4gICAgICAgICAgICAgICAgICAgICcgLS0tIE5ld2VzdCB2ZXJzaW9uOiAnICtcclxuICAgICAgICAgICAgICAgICAgICBmaXJtd2FyZVZlcnNpb24uZGVzaXJlZEtleSgpICk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb21tYW5kTG9nKFxyXG4gICAgICAgICAgICAgICAgICAgICdSZWNlaXZlZCBjb25maWd1cmF0aW9uIGRhdGEgKHYnICtcclxuICAgICAgICAgICAgICAgICAgICBjb25maWcudmVyc2lvblswXSArICcuJyArIGNvbmZpZy52ZXJzaW9uWzFdICsgJy4nICtcclxuICAgICAgICAgICAgICAgICAgICBjb25maWcudmVyc2lvblsyXSArJyknKTtcclxuICAgICAgICAgICAgICAgIGNvbmZpZ0NhbGxiYWNrKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNldENvbmZpZ0NhbGxiYWNrKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIGNvbmZpZ0NhbGxiYWNrID0gY2FsbGJhY2s7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZXRMb2dnaW5nQ2FsbGJhY2soY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgbG9nZ2luZ0NhbGxiYWNrID0gY2FsbGJhY2s7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRDb25maWcoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBjb25maWc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25maWcgPSBmaXJtd2FyZVZlcnNpb24uc2VyaWFsaXphdGlvbkhhbmRsZXIoKS5Db25maWd1cmF0aW9uLmVtcHR5KCk7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlcXVlc3Q6IHJlcXVlc3QsXHJcbiAgICAgICAgICAgIHJlaW5pdDogcmVpbml0LFxyXG4gICAgICAgICAgICBzZW5kOiBzZW5kLFxyXG4gICAgICAgICAgICBzZW5kQ29uZmlnOiBzZW5kQ29uZmlnLFxyXG4gICAgICAgICAgICBnZXRDb25maWc6IGdldENvbmZpZyxcclxuICAgICAgICAgICAgc2V0Q29uZmlnQ2FsbGJhY2s6IHNldENvbmZpZ0NhbGxiYWNrLFxyXG4gICAgICAgICAgICBzZXRMb2dnaW5nQ2FsbGJhY2s6IHNldExvZ2dpbmdDYWxsYmFjayxcclxuICAgICAgICAgICAgZ2V0RGVzaXJlZFZlcnNpb246IGdldERlc2lyZWRWZXJzaW9uLFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgnZmx5YnJpeENvbW1vbicpLmZhY3RvcnkoJ2Zpcm13YXJlVmVyc2lvbicsIGZpcm13YXJlVmVyc2lvbik7XHJcblxyXG4gICAgZmlybXdhcmVWZXJzaW9uLiRpbmplY3QgPSBbJ3NlcmlhbGl6YXRpb25IYW5kbGVyJ107XHJcblxyXG4gICAgZnVuY3Rpb24gZmlybXdhcmVWZXJzaW9uKHNlcmlhbGl6YXRpb25IYW5kbGVyKSB7XHJcbiAgICAgICAgdmFyIHZlcnNpb24gPSBbMCwgMCwgMF07XHJcbiAgICAgICAgdmFyIGtleSA9ICcwLjAuMCc7XHJcbiAgICAgICAgdmFyIHN1cHBvcnRlZCA9IHtcclxuICAgICAgICAgICAgJzEuNC4wJzogdHJ1ZSxcclxuICAgICAgICAgICAgJzEuNS4wJzogdHJ1ZSxcclxuICAgICAgICAgICAgJzEuNS4xJzogdHJ1ZSxcclxuICAgICAgICAgICAgJzEuNi4wJzogdHJ1ZSxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgZGVzaXJlZCA9IFsxLCA2LCAwXTtcclxuICAgICAgICB2YXIgZGVzaXJlZEtleSA9ICcxLjYuMCc7XHJcblxyXG4gICAgICAgIHZhciBkZWZhdWx0U2VyaWFsaXphdGlvbkhhbmRsZXIgPSBzZXJpYWxpemF0aW9uSGFuZGxlci5nZXRIYW5kbGVyKGRlc2lyZWRLZXkpO1xyXG4gICAgICAgIHZhciBjdXJyZW50U2VyaWFsaXphdGlvbkhhbmRsZXIgPSBkZWZhdWx0U2VyaWFsaXphdGlvbkhhbmRsZXI7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24odmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIHZlcnNpb24gPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIGtleSA9IHZhbHVlLmpvaW4oJy4nKTtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnRTZXJpYWxpemF0aW9uSGFuZGxlciA9XHJcbiAgICAgICAgICAgICAgICAgICAgc2VyaWFsaXphdGlvbkhhbmRsZXIuZ2V0SGFuZGxlcihkZXNpcmVkS2V5KSB8fCBkZWZhdWx0U2VyaWFsaXphdGlvbkhhbmRsZXI7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmVyc2lvbjtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAga2V5OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBrZXk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHN1cHBvcnRlZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gc3VwcG9ydGVkW2tleV0gPT09IHRydWU7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGRlc2lyZWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlc2lyZWQ7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGRlc2lyZWRLZXk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlc2lyZWRLZXk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHNlcmlhbGl6YXRpb25IYW5kbGVyOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBjdXJyZW50U2VyaWFsaXphdGlvbkhhbmRsZXI7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgnZmx5YnJpeENvbW1vbicpLmZhY3RvcnkoJ2xlZCcsIGxlZCk7XHJcblxyXG4gICAgbGVkLiRpbmplY3QgPSBbJ2RldmljZUNvbmZpZycsICdmaXJtd2FyZVZlcnNpb24nXTtcclxuXHJcbiAgICBmdW5jdGlvbiBsZWQoZGV2aWNlQ29uZmlnLCBmaXJtd2FyZVZlcnNpb24pIHtcclxuICAgICAgICB2YXIgTGVkUGF0dGVybnMgPSB7XHJcbiAgICAgICAgICAgIE5PX09WRVJSSURFOiAwLFxyXG4gICAgICAgICAgICBGTEFTSDogMSxcclxuICAgICAgICAgICAgQkVBQ09OOiAyLFxyXG4gICAgICAgICAgICBCUkVBVEhFOiAzLFxyXG4gICAgICAgICAgICBBTFRFUk5BVEU6IDQsXHJcbiAgICAgICAgICAgIFNPTElEOiA1LFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHZhciBrZXlzID0gWydyaWdodF9mcm9udCcsICdyaWdodF9iYWNrJywgJ2xlZnRfZnJvbnQnLCAnbGVmdF9iYWNrJ107XHJcbiAgICAgICAgdmFyIGNvbG9ycyA9IHt9O1xyXG5cclxuICAgICAgICBrZXlzLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XHJcbiAgICAgICAgICAgIGNvbG9yc1trZXldID0ge1xyXG4gICAgICAgICAgICAgICAgcmVkOiAwLFxyXG4gICAgICAgICAgICAgICAgZ3JlZW46IDAsXHJcbiAgICAgICAgICAgICAgICBibHVlOiAwLFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHZhciBsZWRTdGF0ZSA9IHtcclxuICAgICAgICAgICAgc3RhdHVzOiA2NTUzNSxcclxuICAgICAgICAgICAgcGF0dGVybjogTGVkUGF0dGVybnMuU09MSUQsXHJcbiAgICAgICAgICAgIGNvbG9yczogY29sb3JzLFxyXG4gICAgICAgICAgICBpbmRpY2F0b3JfcmVkOiBmYWxzZSxcclxuICAgICAgICAgICAgaW5kaWNhdG9yX2dyZWVuOiBmYWxzZSxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgY29uZmlnUGFydCA9IHsgbGVkX3N0YXRlczogW2xlZFN0YXRlXSB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZXQoXHJcbiAgICAgICAgICAgIGNvbG9yX3JmLCBjb2xvcl9yYiwgY29sb3JfbGYsIGNvbG9yX2xiLCBwYXR0ZXJuLCByZWQsIGdyZWVuKSB7XHJcbiAgICAgICAgICAgIGxlZFN0YXRlLnN0YXR1cyA9IGZpcm13YXJlVmVyc2lvbi5zZXJpYWxpemF0aW9uSGFuZGxlcigpLlN0YXR1c0ZsYWcuZW1wdHkoKTtcclxuICAgICAgICAgICAgaWYgKHBhdHRlcm4gPiAwICYmIHBhdHRlcm4gPCA2KSB7XHJcbiAgICAgICAgICAgICAgICBsZWRTdGF0ZS5wYXR0ZXJuID0gcGF0dGVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBbY29sb3JfcmYsIGNvbG9yX3JiLCBjb2xvcl9sZiwgY29sb3JfbGJdLmZvckVhY2goZnVuY3Rpb24oXHJcbiAgICAgICAgICAgICAgICBjb2xvciwgaWR4KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWNvbG9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdmFyIHYgPSBjb2xvcnNba2V5c1tpZHhdXTtcclxuICAgICAgICAgICAgICAgIHYucmVkID0gY29sb3IucmVkO1xyXG4gICAgICAgICAgICAgICAgdi5ncmVlbiA9IGNvbG9yLmdyZWVuO1xyXG4gICAgICAgICAgICAgICAgdi5ibHVlID0gY29sb3IuYmx1ZTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGlmIChyZWQgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgbGVkU3RhdGUuaW5kaWNhdG9yX3JlZCA9IHJlZDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZ3JlZW4gIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgbGVkU3RhdGUuaW5kaWNhdG9yX2dyZWVuID0gZ3JlZW47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGFwcGx5KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZXRTaW1wbGUocmVkLCBncmVlbiwgYmx1ZSkge1xyXG4gICAgICAgICAgICB2YXIgY29sb3IgPSB7cmVkOiByZWQgfHwgMCwgZ3JlZW46IGdyZWVuIHx8IDAsIGJsdWU6IGJsdWUgfHwgMH07XHJcbiAgICAgICAgICAgIHNldChjb2xvciwgY29sb3IsIGNvbG9yLCBjb2xvciwgTGVkUGF0dGVybnMuU09MSUQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYXBwbHkoKSB7XHJcbiAgICAgICAgICAgIGRldmljZUNvbmZpZy5zZW5kQ29uZmlnKHtcclxuICAgICAgICAgICAgICAgIGNvbmZpZzogY29uZmlnUGFydCxcclxuICAgICAgICAgICAgICAgIHRlbXBvcmFyeTogdHJ1ZSxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBzZXQ6IHNldCxcclxuICAgICAgICAgICAgc2V0U2ltcGxlOiBzZXRTaW1wbGUsXHJcbiAgICAgICAgICAgIHBhdHRlcm5zOiBMZWRQYXR0ZXJucyxcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxufSgpKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdmbHlicml4Q29tbW9uJykuZmFjdG9yeSgncmNEYXRhJywgcmNEYXRhKTtcclxuXHJcbiAgICByY0RhdGEuJGluamVjdCA9IFsnc2VyaWFsJ107XHJcblxyXG4gICAgZnVuY3Rpb24gcmNEYXRhKHNlcmlhbCkge1xyXG4gICAgICAgIHZhciBBVVggPSB7XHJcbiAgICAgICAgICAgIExPVzogMCxcclxuICAgICAgICAgICAgTUlEOiAxLFxyXG4gICAgICAgICAgICBISUdIOiAyLFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdmFyIGF1eE5hbWVzID0gWydsb3cnLCAnbWlkJywgJ2hpZ2gnXTtcclxuXHJcbiAgICAgICAgdmFyIHRocm90dGxlID0gLTE7XHJcbiAgICAgICAgdmFyIHBpdGNoID0gMDtcclxuICAgICAgICB2YXIgcm9sbCA9IDA7XHJcbiAgICAgICAgdmFyIHlhdyA9IDA7XHJcbiAgICAgICAgLy8gZGVmYXVsdHMgdG8gaGlnaCAtLSBsb3cgaXMgZW5hYmxpbmc7IGhpZ2ggaXMgZGlzYWJsaW5nXHJcbiAgICAgICAgdmFyIGF1eDEgPSBBVVguSElHSDtcclxuICAgICAgICAvLyBkZWZhdWx0cyB0byA/PyAtLSBuZWVkIHRvIGNoZWNrIHRyYW5zbWl0dGVyIGJlaGF2aW9yXHJcbiAgICAgICAgdmFyIGF1eDIgPSBBVVguSElHSDtcclxuXHJcbiAgICAgICAgdmFyIHVyZ2VudCA9IHRydWU7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHNldFRocm90dGxlOiBzZXRUaHJvdHRsZSxcclxuICAgICAgICAgICAgc2V0UGl0Y2g6IHNldFBpdGNoLFxyXG4gICAgICAgICAgICBzZXRSb2xsOiBzZXRSb2xsLFxyXG4gICAgICAgICAgICBzZXRZYXc6IHNldFlhdyxcclxuICAgICAgICAgICAgc2V0QXV4MTogc2V0QXV4MSxcclxuICAgICAgICAgICAgc2V0QXV4Mjogc2V0QXV4MixcclxuICAgICAgICAgICAgZ2V0VGhyb3R0bGU6IGdldFRocm90dGxlLFxyXG4gICAgICAgICAgICBnZXRQaXRjaDogZ2V0UGl0Y2gsXHJcbiAgICAgICAgICAgIGdldFJvbGw6IGdldFJvbGwsXHJcbiAgICAgICAgICAgIGdldFlhdzogZ2V0WWF3LFxyXG4gICAgICAgICAgICBnZXRBdXgxOiBnZXRBdXgxLFxyXG4gICAgICAgICAgICBnZXRBdXgyOiBnZXRBdXgyLFxyXG4gICAgICAgICAgICBBVVg6IEFVWCxcclxuICAgICAgICAgICAgc2VuZDogc2VuZCxcclxuICAgICAgICAgICAgZm9yY2VOZXh0U2VuZDogZm9yY2VOZXh0U2VuZCxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZW5kKCkge1xyXG4gICAgICAgICAgICBpZiAoIXVyZ2VudCAmJiBzZXJpYWwuYnVzeSgpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdXJnZW50ID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICB2YXIgY29tbWFuZCA9IHt9O1xyXG5cclxuICAgICAgICAgICAgLy8gaW52ZXJ0IHBpdGNoIGFuZCByb2xsXHJcbiAgICAgICAgICAgIHZhciB0aHJvdHRsZV90aHJlc2hvbGQgPVxyXG4gICAgICAgICAgICAgICAgLTAuODsgIC8vIGtlZXAgYm90dG9tIDEwJSBvZiB0aHJvdHRsZSBzdGljayB0byBtZWFuICdvZmYnXHJcbiAgICAgICAgICAgIGNvbW1hbmQudGhyb3R0bGUgPSBjb25zdHJhaW4oXHJcbiAgICAgICAgICAgICAgICAodGhyb3R0bGUgLSB0aHJvdHRsZV90aHJlc2hvbGQpICogNDA5NSAvXHJcbiAgICAgICAgICAgICAgICAgICAgKDEgLSB0aHJvdHRsZV90aHJlc2hvbGQpLFxyXG4gICAgICAgICAgICAgICAgMCwgNDA5NSk7XHJcbiAgICAgICAgICAgIGNvbW1hbmQucGl0Y2ggPVxyXG4gICAgICAgICAgICAgICAgY29uc3RyYWluKC0oYXBwbHlEZWFkem9uZShwaXRjaCwgMC4xKSkgKiA0MDk1IC8gMiwgLTIwNDcsIDIwNDcpO1xyXG4gICAgICAgICAgICBjb21tYW5kLnJvbGwgPVxyXG4gICAgICAgICAgICAgICAgY29uc3RyYWluKChhcHBseURlYWR6b25lKHJvbGwsIDAuMSkpICogNDA5NSAvIDIsIC0yMDQ3LCAyMDQ3KTtcclxuICAgICAgICAgICAgY29tbWFuZC55YXcgPVxyXG4gICAgICAgICAgICAgICAgY29uc3RyYWluKC0oYXBwbHlEZWFkem9uZSh5YXcsIDAuMSkpICogNDA5NSAvIDIsIC0yMDQ3LCAyMDQ3KTtcclxuXHJcbiAgICAgICAgICAgIHZhciBhdXhfbWFzayA9IHt9O1xyXG4gICAgICAgICAgICAvLyBhdXgxX2xvdywgYXV4MV9taWQsIGF1eDFfaGlnaCwgYW5kIHNhbWUgd2l0aCBhdXgyXHJcbiAgICAgICAgICAgIGF1eF9tYXNrWydhdXgxXycgKyBhdXhOYW1lc1thdXgxXV0gPSB0cnVlO1xyXG4gICAgICAgICAgICBhdXhfbWFza1snYXV4Ml8nICsgYXV4TmFtZXNbYXV4Ml1dID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzZXJpYWwuc2VuZFN0cnVjdHVyZSgnQ29tbWFuZCcsIHtcclxuICAgICAgICAgICAgICAgIHJlcXVlc3RfcmVzcG9uc2U6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBzZXRfc2VyaWFsX3JjOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZW5hYmxlZDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBjb21tYW5kOiBjb21tYW5kLFxyXG4gICAgICAgICAgICAgICAgICAgIGF1eF9tYXNrOiBhdXhfbWFzayxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0sIGZhbHNlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNldFRocm90dGxlKHYpIHtcclxuICAgICAgICAgICAgdGhyb3R0bGUgPSB2O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2V0UGl0Y2godikge1xyXG4gICAgICAgICAgICBwaXRjaCA9IHY7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZXRSb2xsKHYpIHtcclxuICAgICAgICAgICAgcm9sbCA9IHY7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZXRZYXcodikge1xyXG4gICAgICAgICAgICB5YXcgPSB2O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2V0QXV4MSh2KSB7XHJcbiAgICAgICAgICAgIGF1eDEgPSBNYXRoLm1heCgwLCBNYXRoLm1pbigyLCB2KSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZXRBdXgyKHYpIHtcclxuICAgICAgICAgICAgYXV4MiA9IE1hdGgubWF4KDAsIE1hdGgubWluKDIsIHYpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdldFRocm90dGxlKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhyb3R0bGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRQaXRjaCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHBpdGNoO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0Um9sbCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJvbGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRZYXcoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB5YXc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRBdXgxKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gYXV4MTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdldEF1eDIoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBhdXgyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZm9yY2VOZXh0U2VuZCgpIHtcclxuICAgICAgICAgICAgdXJnZW50ID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGNvbnN0cmFpbih4LCB4bWluLCB4bWF4KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBNYXRoLm1heCh4bWluLCBNYXRoLm1pbih4LCB4bWF4KSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBhcHBseURlYWR6b25lKHZhbHVlLCBkZWFkem9uZSkge1xyXG4gICAgICAgICAgICBpZiAodmFsdWUgPiBkZWFkem9uZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlIC0gZGVhZHpvbmU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHZhbHVlIDwgLWRlYWR6b25lKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUgKyBkZWFkem9uZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgnZmx5YnJpeENvbW1vbicpLmZhY3RvcnkoJ3NlcmlhbCcsIHNlcmlhbCk7XHJcblxyXG4gICAgc2VyaWFsLiRpbmplY3QgPSBbJyR0aW1lb3V0JywgJyRxJywgJ2NvYnMnLCAnY29tbWFuZExvZycsICdmaXJtd2FyZVZlcnNpb24nLCAnc2VyaWFsaXphdGlvbkhhbmRsZXInXTtcclxuXHJcbiAgICBmdW5jdGlvbiBzZXJpYWwoJHRpbWVvdXQsICRxLCBjb2JzLCBjb21tYW5kTG9nLCBmaXJtd2FyZVZlcnNpb24sIHNlcmlhbGl6YXRpb25IYW5kbGVyKSB7XHJcbiAgICAgICAgdmFyIE1lc3NhZ2VUeXBlID0ge1xyXG4gICAgICAgICAgICBTdGF0ZTogMCxcclxuICAgICAgICAgICAgQ29tbWFuZDogMSxcclxuICAgICAgICAgICAgRGVidWdTdHJpbmc6IDMsXHJcbiAgICAgICAgICAgIEhpc3RvcnlEYXRhOiA0LFxyXG4gICAgICAgICAgICBQcm90b2NvbDogMTI4LFxyXG4gICAgICAgICAgICBSZXNwb25zZTogMjU1LFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHZhciBhY2tub3dsZWRnZXMgPSBbXTtcclxuICAgICAgICB2YXIgYmFja2VuZCA9IG5ldyBCYWNrZW5kKCk7XHJcblxyXG4gICAgICAgIHZhciBvblJlY2VpdmVMaXN0ZW5lcnMgPSBbXTtcclxuXHJcbiAgICAgICAgdmFyIGNvYnNSZWFkZXIgPSBuZXcgY29icy5SZWFkZXIoMTAwMDApO1xyXG4gICAgICAgIHZhciBieXRlc0hhbmRsZXIgPSB1bmRlZmluZWQ7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIEJhY2tlbmQoKSB7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBCYWNrZW5kLnByb3RvdHlwZS5idXN5ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBCYWNrZW5kLnByb3RvdHlwZS5zZW5kID0gZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICBjb21tYW5kTG9nKCdObyBcInNlbmRcIiBkZWZpbmVkIGZvciBzZXJpYWwgYmFja2VuZCcpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIEJhY2tlbmQucHJvdG90eXBlLm9uUmVhZCA9IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgICAgY29tbWFuZExvZygnTm8gXCJvblJlYWRcIiBkZWZpbmVkIGZvciBzZXJpYWwgYmFja2VuZCcpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHZhciBNZXNzYWdlVHlwZUludmVyc2lvbiA9IFtdO1xyXG4gICAgICAgIE9iamVjdC5rZXlzKE1lc3NhZ2VUeXBlKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xyXG4gICAgICAgICAgICBNZXNzYWdlVHlwZUludmVyc2lvbltNZXNzYWdlVHlwZVtrZXldXSA9IGtleTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgYWRkT25SZWNlaXZlQ2FsbGJhY2soZnVuY3Rpb24obWVzc2FnZVR5cGUsIG1lc3NhZ2UpIHtcclxuICAgICAgICAgICAgaWYgKG1lc3NhZ2VUeXBlID09PSAnUmVzcG9uc2UnKSB7XHJcbiAgICAgICAgICAgICAgICBhY2tub3dsZWRnZShtZXNzYWdlLm1hc2ssIG1lc3NhZ2UuYWNrKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChtZXNzYWdlVHlwZSA9PT0gJ1Byb3RvY29sJykge1xyXG4gICAgICAgICAgICAgICAgdmFyIGRhdGEgPSBtZXNzYWdlLnJlc3BvbnNlO1xyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICBzZXJpYWxpemF0aW9uSGFuZGxlci5hZGRIYW5kbGVyKGRhdGEudmVyc2lvbiwgZGF0YS5zdHJ1Y3R1cmUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGJ1c3k6IGJ1c3ksXHJcbiAgICAgICAgICAgIHNlbmRTdHJ1Y3R1cmU6IHNlbmRTdHJ1Y3R1cmUsXHJcbiAgICAgICAgICAgIHNldEJhY2tlbmQ6IHNldEJhY2tlbmQsXHJcbiAgICAgICAgICAgIGFkZE9uUmVjZWl2ZUNhbGxiYWNrOiBhZGRPblJlY2VpdmVDYWxsYmFjayxcclxuICAgICAgICAgICAgcmVtb3ZlT25SZWNlaXZlQ2FsbGJhY2s6IHJlbW92ZU9uUmVjZWl2ZUNhbGxiYWNrLFxyXG4gICAgICAgICAgICBzZXRCeXRlc0hhbmRsZXI6IHNldEJ5dGVzSGFuZGxlcixcclxuICAgICAgICAgICAgaGFuZGxlUG9zdENvbm5lY3Q6IGhhbmRsZVBvc3RDb25uZWN0LFxyXG4gICAgICAgICAgICBCYWNrZW5kOiBCYWNrZW5kLFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNldEJhY2tlbmQodikge1xyXG4gICAgICAgICAgICBiYWNrZW5kID0gdjtcclxuICAgICAgICAgICAgYmFja2VuZC5vblJlYWQgPSByZWFkO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gaGFuZGxlUG9zdENvbm5lY3QoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXF1ZXN0RmlybXdhcmVWZXJzaW9uKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiByZXF1ZXN0RmlybXdhcmVWZXJzaW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gc2VuZFN0cnVjdHVyZSgnQ29tbWFuZCcsIHtcclxuICAgICAgICAgICAgICAgIHJlcXVlc3RfcmVzcG9uc2U6IHRydWUsXHJcbiAgICAgICAgICAgICAgICByZXFfcGFydGlhbF9lZXByb21fZGF0YToge1xyXG4gICAgICAgICAgICAgICAgICAgIHZlcnNpb246IHRydWUsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNlbmRTdHJ1Y3R1cmUobWVzc2FnZVR5cGUsIGRhdGEsIGxvZ19zZW5kLCBleHRyYU1hc2spIHtcclxuICAgICAgICAgICAgaWYgKG1lc3NhZ2VUeXBlID09PSAnU3RhdGUnKSB7XHJcbiAgICAgICAgICAgICAgICBkYXRhID0gcHJvY2Vzc1N0YXRlT3V0cHV0KGRhdGEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciBoYW5kbGVycyA9IGZpcm13YXJlVmVyc2lvbi5zZXJpYWxpemF0aW9uSGFuZGxlcigpO1xyXG5cclxuICAgICAgICAgICAgdmFyIHJlc3BvbnNlID0gJHEuZGVmZXIoKTtcclxuICAgICAgICAgICAgaWYgKCEobWVzc2FnZVR5cGUgaW4gTWVzc2FnZVR5cGUpKSB7XHJcbiAgICAgICAgICAgICAgICByZXNwb25zZS5yZWplY3QoJ01lc3NhZ2UgdHlwZSBcIicgKyBtZXNzYWdlVHlwZSArXHJcbiAgICAgICAgICAgICAgICAgICAgJ1wiIG5vdCBzdXBwb3J0ZWQgYnkgYXBwLCBzdXBwb3J0ZWQgbWVzc2FnZSB0eXBlcyBhcmU6JyArXHJcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmtleXMoTWVzc2FnZVR5cGUpLmpvaW4oJywgJykpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLnByb21pc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCEobWVzc2FnZVR5cGUgaW4gaGFuZGxlcnMpKSB7XHJcbiAgICAgICAgICAgICAgICByZXNwb25zZS5yZWplY3QoJ01lc3NhZ2UgdHlwZSBcIicgKyBtZXNzYWdlVHlwZSArXHJcbiAgICAgICAgICAgICAgICAgICAgJ1wiIG5vdCBzdXBwb3J0ZWQgYnkgZmlybXdhcmUsIHN1cHBvcnRlZCBtZXNzYWdlIHR5cGVzIGFyZTonICtcclxuICAgICAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyhoYW5kbGVycykuam9pbignLCAnKSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UucHJvbWlzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgdHlwZUNvZGUgPSBNZXNzYWdlVHlwZVttZXNzYWdlVHlwZV07XHJcbiAgICAgICAgICAgIHZhciBoYW5kbGVyID0gaGFuZGxlcnNbbWVzc2FnZVR5cGVdO1xyXG5cclxuICAgICAgICAgICAgdmFyIGJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KGhhbmRsZXIuYnl0ZUNvdW50KTtcclxuXHJcbiAgICAgICAgICAgIHZhciBzZXJpYWxpemVyID0gbmV3IHNlcmlhbGl6YXRpb25IYW5kbGVyLlNlcmlhbGl6ZXIobmV3IERhdGFWaWV3KGJ1ZmZlci5idWZmZXIpKTtcclxuICAgICAgICAgICAgaGFuZGxlci5lbmNvZGUoc2VyaWFsaXplciwgZGF0YSwgZXh0cmFNYXNrKTtcclxuICAgICAgICAgICAgdmFyIG1hc2sgPSBoYW5kbGVyLm1hc2tBcnJheShkYXRhLCBleHRyYU1hc2spO1xyXG4gICAgICAgICAgICBpZiAobWFzay5sZW5ndGggPCA1KSB7XHJcbiAgICAgICAgICAgICAgICBtYXNrID0gKG1hc2tbMF0gPDwgMCkgfCAobWFza1sxXSA8PCA4KSB8IChtYXNrWzJdIDw8IDE2KSB8IChtYXNrWzNdIDw8IDI0KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIGRhdGFMZW5ndGggPSBzZXJpYWxpemVyLmluZGV4O1xyXG5cclxuICAgICAgICAgICAgdmFyIG91dHB1dCA9IG5ldyBVaW50OEFycmF5KGRhdGFMZW5ndGggKyAzKTtcclxuICAgICAgICAgICAgb3V0cHV0WzBdID0gb3V0cHV0WzFdID0gdHlwZUNvZGU7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGlkeCA9IDA7IGlkeCA8IGRhdGFMZW5ndGg7ICsraWR4KSB7XHJcbiAgICAgICAgICAgICAgICBvdXRwdXRbMF0gXj0gb3V0cHV0W2lkeCArIDJdID0gYnVmZmVyW2lkeF07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgb3V0cHV0W2RhdGFMZW5ndGggKyAyXSA9IDA7XHJcblxyXG4gICAgICAgICAgICBhY2tub3dsZWRnZXMucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBtYXNrOiBtYXNrLFxyXG4gICAgICAgICAgICAgICAgcmVzcG9uc2U6IHJlc3BvbnNlLFxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgYmFja2VuZC5zZW5kKG5ldyBVaW50OEFycmF5KGNvYnMuZW5jb2RlKG91dHB1dCkpKTtcclxuICAgICAgICAgICAgfSwgMCk7XHJcblxyXG4gICAgICAgICAgICBpZiAobG9nX3NlbmQpIHtcclxuICAgICAgICAgICAgICAgIGNvbW1hbmRMb2coJ1NlbmRpbmcgY29tbWFuZCAnICsgdHlwZUNvZGUpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UucHJvbWlzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGJ1c3koKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBiYWNrZW5kLmJ1c3koKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNldEJ5dGVzSGFuZGxlcihoYW5kbGVyKSB7XHJcbiAgICAgICAgICAgIGJ5dGVzSGFuZGxlciA9IGhhbmRsZXI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiByZWFkKGRhdGEpIHtcclxuICAgICAgICAgICAgaWYgKGJ5dGVzSGFuZGxlcilcclxuICAgICAgICAgICAgICAgIGJ5dGVzSGFuZGxlcihkYXRhLCBwcm9jZXNzRGF0YSk7XHJcbiAgICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgICAgIGNvYnNSZWFkZXIucmVhZEJ5dGVzKGRhdGEsIHByb2Nlc3NEYXRhLCByZXBvcnRJc3N1ZXMpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gcmVwb3J0SXNzdWVzKGlzc3VlLCB0ZXh0KSB7XHJcbiAgICAgICAgICAgIGNvbW1hbmRMb2coJ0NPQlMgZGVjb2RpbmcgZmFpbGVkICgnICsgaXNzdWUgKyAnKTogJyArIHRleHQpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYWRkT25SZWNlaXZlQ2FsbGJhY2soY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgb25SZWNlaXZlTGlzdGVuZXJzID0gb25SZWNlaXZlTGlzdGVuZXJzLmNvbmNhdChbY2FsbGJhY2tdKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHJlbW92ZU9uUmVjZWl2ZUNhbGxiYWNrKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIG9uUmVjZWl2ZUxpc3RlbmVycyA9IG9uUmVjZWl2ZUxpc3RlbmVycy5maWx0ZXIoZnVuY3Rpb24oY2IpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBjYiAhPT0gY2FsbGJhY2s7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYWNrbm93bGVkZ2UobWFzaywgdmFsdWUpIHtcclxuICAgICAgICAgICAgd2hpbGUgKGFja25vd2xlZGdlcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdiA9IGFja25vd2xlZGdlcy5zaGlmdCgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHYubWFzayBeIG1hc2spIHtcclxuICAgICAgICAgICAgICAgICAgICB2LnJlc3BvbnNlLnJlamVjdCgnTWlzc2luZyBBQ0snKTtcclxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHZhciByZWxheGVkTWFzayA9IG1hc2s7XHJcbiAgICAgICAgICAgICAgICByZWxheGVkTWFzayAmPSB+MTtcclxuICAgICAgICAgICAgICAgIGlmIChyZWxheGVkTWFzayBeIHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdi5yZXNwb25zZS5yZWplY3QoJ1JlcXVlc3Qgd2FzIG5vdCBmdWxseSBwcm9jZXNzZWQnKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHYucmVzcG9uc2UucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHByb2Nlc3NEYXRhKGJ5dGVzKSB7XHJcbiAgICAgICAgICAgIHZhciBtZXNzYWdlVHlwZSA9IE1lc3NhZ2VUeXBlSW52ZXJzaW9uW2J5dGVzWzBdXTtcclxuICAgICAgICAgICAgdmFyIGhhbmRsZXIgPSBmaXJtd2FyZVZlcnNpb24uc2VyaWFsaXphdGlvbkhhbmRsZXIoKVttZXNzYWdlVHlwZV07XHJcbiAgICAgICAgICAgIGlmICghbWVzc2FnZVR5cGUgfHwgIWhhbmRsZXIpIHtcclxuICAgICAgICAgICAgICAgIGNvbW1hbmRMb2coJ0lsbGVnYWwgbWVzc2FnZSB0eXBlIHBhc3NlZCBmcm9tIGZpcm13YXJlJyk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIHZhciBzZXJpYWxpemVyID0gbmV3IHNlcmlhbGl6YXRpb25IYW5kbGVyLlNlcmlhbGl6ZXIobmV3IERhdGFWaWV3KGJ5dGVzLmJ1ZmZlciwgMSkpO1xyXG4gICAgICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBoYW5kbGVyLmRlY29kZShzZXJpYWxpemVyKTtcclxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICBjb21tYW5kTG9nKCdVbnJlY29nbml6ZWQgbWVzc2FnZSBmb3JtYXQgcmVjZWl2ZWQnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAobWVzc2FnZVR5cGUgPT09ICdTdGF0ZScpIHtcclxuICAgICAgICAgICAgICAgIG1lc3NhZ2UgPSBwcm9jZXNzU3RhdGVJbnB1dChtZXNzYWdlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBvblJlY2VpdmVMaXN0ZW5lcnMuZm9yRWFjaChmdW5jdGlvbihsaXN0ZW5lcikge1xyXG4gICAgICAgICAgICAgICAgbGlzdGVuZXIobWVzc2FnZVR5cGUsIG1lc3NhZ2UpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBsYXN0X3RpbWVzdGFtcF91cyA9IDA7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHByb2Nlc3NTdGF0ZUlucHV0KHN0YXRlKSB7XHJcbiAgICAgICAgICAgIHN0YXRlID0gT2JqZWN0LmFzc2lnbih7fSwgc3RhdGUpO1xyXG4gICAgICAgICAgICB2YXIgc2VyaWFsX3VwZGF0ZV9yYXRlX0h6ID0gMDtcclxuXHJcbiAgICAgICAgICAgIGlmICgndGltZXN0YW1wX3VzJyBpbiBzdGF0ZSkge1xyXG4gICAgICAgICAgICAgICAgc3RhdGUuc2VyaWFsX3VwZGF0ZV9yYXRlX2VzdGltYXRlID0gMTAwMDAwMCAvIChzdGF0ZS50aW1lc3RhbXBfdXMgLSBsYXN0X3RpbWVzdGFtcF91cyk7XHJcbiAgICAgICAgICAgICAgICBsYXN0X3RpbWVzdGFtcF91cyA9IHN0YXRlLnRpbWVzdGFtcF91cztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoJ3RlbXBlcmF0dXJlJyBpbiBzdGF0ZSkge1xyXG4gICAgICAgICAgICAgICAgc3RhdGUudGVtcGVyYXR1cmUgLz0gMTAwLjA7ICAvLyB0ZW1wZXJhdHVyZSBnaXZlbiBpbiBDZWxzaXVzICogMTAwXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCdwcmVzc3VyZScgaW4gc3RhdGUpIHtcclxuICAgICAgICAgICAgICAgIHN0YXRlLnByZXNzdXJlIC89IDI1Ni4wOyAgLy8gcHJlc3N1cmUgZ2l2ZW4gaW4gKFEyNC44KSBmb3JtYXRcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gcHJvY2Vzc1N0YXRlT3V0cHV0KHN0YXRlKSB7XHJcbiAgICAgICAgICAgIHN0YXRlID0gT2JqZWN0LmFzc2lnbih7fSwgc3RhdGUpO1xyXG4gICAgICAgICAgICBpZiAoJ3RlbXBlcmF0dXJlJyBpbiBzdGF0ZSkge1xyXG4gICAgICAgICAgICAgICAgc3RhdGUudGVtcGVyYXR1cmUgKj0gMTAwLjA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCdwcmVzc3VyZScgaW4gc3RhdGUpIHtcclxuICAgICAgICAgICAgICAgIHN0YXRlLnByZXNzdXJlICo9IDI1Ni4wO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbiAoKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgc2VyaWFsaXphdGlvbkhhbmRsZXIuJGluamVjdCA9IFtdO1xyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdmbHlicml4Q29tbW9uJykuZmFjdG9yeSgnc2VyaWFsaXphdGlvbkhhbmRsZXInLCBzZXJpYWxpemF0aW9uSGFuZGxlcik7XHJcblxyXG4gICAgZnVuY3Rpb24gc2VyaWFsaXphdGlvbkhhbmRsZXIoKSB7XHJcbiAgICAgICAgdmFyIGhhbmRsZXJDYWNoZSA9IHt9O1xyXG4gICAgICAgIHZhciB2ZXJzaW9uID0gJ1ZlcnNpb24gPSB7IG1ham9yOiB1OCwgbWlub3I6IHU4LCBwYXRjaDogdTggfTsnO1xyXG4gICAgICAgIHZhciBjb25maWdJZCA9ICdDb25maWdJRCA9IHUzMjsnO1xyXG5cclxuICAgICAgICB2YXIgdmVjdG9yM2YgPSAnVmVjdG9yM2YgPSB7IHg6IGYzMiwgeTogZjMyLCB6OiBmMzIgfTsnO1xyXG5cclxuICAgICAgICB2YXIgcGNiVHJhbnNmb3JtID0gJ1BjYlRyYW5zZm9ybSA9IHsgb3JpZW50YXRpb246IFZlY3RvcjNmLCB0cmFuc2xhdGlvbjogVmVjdG9yM2YgfTsnO1xyXG4gICAgICAgIHZhciBtaXhUYWJsZSA9ICdNaXhUYWJsZSA9IHsgZno6IFtpODo4XSwgdHg6IFtpODo4XSwgdHk6IFtpODo4XSwgdHo6IFtpODo4XSB9Oyc7XHJcbiAgICAgICAgdmFyIG1hZ0JpYXMgPSAnTWFnQmlhcyA9IHsgb2Zmc2V0OiBWZWN0b3IzZiB9Oyc7XHJcbiAgICAgICAgdmFyIGNoYW5uZWxQcm9wZXJ0aWVzID0gJ0NoYW5uZWxQcm9wZXJ0aWVzID0geycgK1xyXG4gICAgICAgICAgICAnYXNzaWdubWVudDogW3U4OjZdLCcgK1xyXG4gICAgICAgICAgICAnaW52ZXJzaW9uOiB1OCwnICtcclxuICAgICAgICAgICAgJ21pZHBvaW50OiBbdTE2OjZdLCcgK1xyXG4gICAgICAgICAgICAnZGVhZHpvbmU6IFt1MTY6Nl0gfTsnO1xyXG5cclxuICAgICAgICB2YXIgcGlkU2V0dGluZ3MgPSAnUElEU2V0dGluZ3MgPSB7JyArXHJcbiAgICAgICAgICAgICdrcDogZjMyLCcgK1xyXG4gICAgICAgICAgICAna2k6IGYzMiwnICtcclxuICAgICAgICAgICAgJ2tkOiBmMzIsJyArXHJcbiAgICAgICAgICAgICdpbnRlZ3JhbF93aW5kdXBfZ3VhcmQ6IGYzMiwnICtcclxuICAgICAgICAgICAgJ2RfZmlsdGVyX3RpbWU6IGYzMiwnICtcclxuICAgICAgICAgICAgJ3NldHBvaW50X2ZpbHRlcl90aW1lOiBmMzIsJyArXHJcbiAgICAgICAgICAgICdjb21tYW5kX3RvX3ZhbHVlOiBmMzIgfTsnO1xyXG4gICAgICAgIHZhciBwaWRQYXJhbWV0ZXJzMTQgPSAnUElEUGFyYW1ldGVycyA9IHsnICtcclxuICAgICAgICAgICAgJ3RocnVzdF9tYXN0ZXI6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAncGl0Y2hfbWFzdGVyOiBQSURTZXR0aW5ncywnICtcclxuICAgICAgICAgICAgJ3JvbGxfbWFzdGVyOiBQSURTZXR0aW5ncywnICtcclxuICAgICAgICAgICAgJ3lhd19tYXN0ZXI6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAndGhydXN0X3NsYXZlOiBQSURTZXR0aW5ncywnICtcclxuICAgICAgICAgICAgJ3BpdGNoX3NsYXZlOiBQSURTZXR0aW5ncywnICtcclxuICAgICAgICAgICAgJ3JvbGxfc2xhdmU6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAneWF3X3NsYXZlOiBQSURTZXR0aW5ncywnICtcclxuICAgICAgICAgICAgJ3BpZF9ieXBhc3M6IHU4IH07JztcclxuICAgICAgICB2YXIgcGlkUGFyYW1ldGVycyA9ICdQSURQYXJhbWV0ZXJzID0geycgK1xyXG4gICAgICAgICAgICAndGhydXN0X21hc3RlcjogUElEU2V0dGluZ3MsJyArXHJcbiAgICAgICAgICAgICdwaXRjaF9tYXN0ZXI6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAncm9sbF9tYXN0ZXI6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAneWF3X21hc3RlcjogUElEU2V0dGluZ3MsJyArXHJcbiAgICAgICAgICAgICd0aHJ1c3Rfc2xhdmU6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAncGl0Y2hfc2xhdmU6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAncm9sbF9zbGF2ZTogUElEU2V0dGluZ3MsJyArXHJcbiAgICAgICAgICAgICd5YXdfc2xhdmU6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAndGhydXN0X2dhaW46IGYzMiwnICtcclxuICAgICAgICAgICAgJ3BpdGNoX2dhaW46IGYzMiwnICtcclxuICAgICAgICAgICAgJ3JvbGxfZ2FpbjogZjMyLCcgK1xyXG4gICAgICAgICAgICAneWF3X2dhaW46IGYzMiwnICtcclxuICAgICAgICAgICAgJ3BpZF9ieXBhc3M6IHU4IH07JztcclxuXHJcbiAgICAgICAgdmFyIHN0YXRlUGFyYW1ldGVycyA9ICdTdGF0ZVBhcmFtZXRlcnMgPSB7IHN0YXRlX2VzdGltYXRpb246IFtmMzI6Ml0sIGVuYWJsZTogW2YzMjoyXSB9Oyc7XHJcblxyXG4gICAgICAgIHZhciBzdGF0dXNGbGFnMTQxNSA9ICdTdGF0dXNGbGFnID0gey8xNi8nICtcclxuICAgICAgICAgICAgJ2Jvb3Q6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdtcHVfZmFpbDogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2JtcF9mYWlsOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAncnhfZmFpbDogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2lkbGU6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdlbmFibGluZzogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2NsZWFyX21wdV9iaWFzOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnc2V0X21wdV9iaWFzOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnZmFpbF9zdGFiaWxpdHk6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdmYWlsX2FuZ2xlOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnZW5hYmxlZDogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2JhdHRlcnlfbG93OiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAndGVtcF93YXJuaW5nOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnbG9nX2Z1bGw6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdmYWlsX290aGVyOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnb3ZlcnJpZGU6IHZvaWQgfTsnO1xyXG5cclxuICAgICAgICB2YXIgc3RhdHVzRmxhZyA9ICdTdGF0dXNGbGFnID0gey8xNi8nICtcclxuICAgICAgICAgICAgJ18wOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnXzE6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdfMjogdm9pZCwnICtcclxuICAgICAgICAgICAgJ25vX3NpZ25hbDogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2lkbGU6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdhcm1pbmc6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdyZWNvcmRpbmdfc2Q6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdfNzogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2xvb3Bfc2xvdzogdm9pZCwnICtcclxuICAgICAgICAgICAgJ185OiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnYXJtZWQ6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdiYXR0ZXJ5X2xvdzogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2JhdHRlcnlfY3JpdGljYWw6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdsb2dfZnVsbDogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2NyYXNoX2RldGVjdGVkOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnb3ZlcnJpZGU6IHZvaWQgfTsnO1xyXG5cclxuICAgICAgICB2YXIgY29sb3IgPSAnQ29sb3IgPSB7IHJlZDogdTgsIGdyZWVuOiB1OCwgYmx1ZTogdTggfTsnO1xyXG4gICAgICAgIHZhciBsZWRTdGF0ZUNhc2UgPSAnTEVEU3RhdGVDYXNlID0geycgK1xyXG4gICAgICAgICAgICAnc3RhdHVzOiBTdGF0dXNGbGFnLCcgK1xyXG4gICAgICAgICAgICAncGF0dGVybjogdTgsJyArXHJcbiAgICAgICAgICAgICdjb2xvcl9yaWdodF9mcm9udDogQ29sb3IsJyArXHJcbiAgICAgICAgICAgICdjb2xvcl9yaWdodF9iYWNrOiBDb2xvciwnICtcclxuICAgICAgICAgICAgJ2NvbG9yX2xlZnRfZnJvbnQ6IENvbG9yLCcgK1xyXG4gICAgICAgICAgICAnY29sb3JfbGVmdF9iYWNrOiBDb2xvciwnICtcclxuICAgICAgICAgICAgJ2luZGljYXRvcl9yZWQ6IGJvb2wsJyArXHJcbiAgICAgICAgICAgICdpbmRpY2F0b3JfZ3JlZW46IGJvb2wgfTsnO1xyXG4gICAgICAgIHZhciBsZWRTdGF0ZXMgPSAnTEVEU3RhdGVzID0gWy8xNi9MRURTdGF0ZUNhc2U6MTZdOyc7XHJcbiAgICAgICAgdmFyIGxlZFN0YXRlc0ZpeGVkID0gJ0xFRFN0YXRlc0ZpeGVkID0gW0xFRFN0YXRlQ2FzZToxNl07JztcclxuXHJcbiAgICAgICAgdmFyIGRldmljZU5hbWUgPSAnRGV2aWNlTmFtZSA9IHM5Oyc7XHJcblxyXG4gICAgICAgIHZhciB2ZWxvY2l0eVBpZFBhcmFtZXRlcnMgPSAnVmVsb2NpdHlQSURQYXJhbWV0ZXJzID0geycgK1xyXG4gICAgICAgICAgICAnZm9yd2FyZF9tYXN0ZXI6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAncmlnaHRfbWFzdGVyOiBQSURTZXR0aW5ncywnICtcclxuICAgICAgICAgICAgJ3VwX21hc3RlcjogUElEU2V0dGluZ3MsJyArXHJcbiAgICAgICAgICAgICdmb3J3YXJkX3NsYXZlOiBQSURTZXR0aW5ncywnICtcclxuICAgICAgICAgICAgJ3JpZ2h0X3NsYXZlOiBQSURTZXR0aW5ncywnICtcclxuICAgICAgICAgICAgJ3VwX3NsYXZlOiBQSURTZXR0aW5ncywnICtcclxuICAgICAgICAgICAgJ3BpZF9ieXBhc3M6IHU4IH07JztcclxuXHJcbiAgICAgICAgdmFyIGluZXJ0aWFsQmlhcyA9ICdJbmVydGlhbEJpYXMgPSB7IGFjY2VsOiBWZWN0b3IzZiwgZ3lybzogVmVjdG9yM2YgfTsnO1xyXG5cclxuICAgICAgICB2YXIgY29uZmlnMTQxNSA9ICdDb25maWd1cmF0aW9uID0gey8xNi8nICtcclxuICAgICAgICAgICAgJ3ZlcnNpb246IFZlcnNpb24sJyArXHJcbiAgICAgICAgICAgICdjb25maWdfaWQ6IENvbmZpZ0lELCcgK1xyXG4gICAgICAgICAgICAncGNiX3RyYW5zZm9ybTogUGNiVHJhbnNmb3JtLCcgK1xyXG4gICAgICAgICAgICAnbWl4X3RhYmxlOiBNaXhUYWJsZSwnICtcclxuICAgICAgICAgICAgJ21hZ19iaWFzOiBNYWdCaWFzLCcgK1xyXG4gICAgICAgICAgICAnY2hhbm5lbDogQ2hhbm5lbFByb3BlcnRpZXMsJyArXHJcbiAgICAgICAgICAgICdwaWRfcGFyYW1ldGVyczogUElEUGFyYW1ldGVycywnICtcclxuICAgICAgICAgICAgJ3N0YXRlX3BhcmFtZXRlcnM6IFN0YXRlUGFyYW1ldGVycywnICtcclxuICAgICAgICAgICAgJ2xlZF9zdGF0ZXM6IExFRFN0YXRlcywnICtcclxuICAgICAgICAgICAgJ2RldmljZV9uYW1lOiBEZXZpY2VOYW1lIH07JztcclxuXHJcbiAgICAgICAgdmFyIGNvbmZpZ0ZpeGVkMTQxNSA9ICdDb25maWd1cmF0aW9uRml4ZWQgPSB7JyArXHJcbiAgICAgICAgICAgICd2ZXJzaW9uOiBWZXJzaW9uLCcgK1xyXG4gICAgICAgICAgICAnY29uZmlnX2lkOiBDb25maWdJRCwnICtcclxuICAgICAgICAgICAgJ3BjYl90cmFuc2Zvcm06IFBjYlRyYW5zZm9ybSwnICtcclxuICAgICAgICAgICAgJ21peF90YWJsZTogTWl4VGFibGUsJyArXHJcbiAgICAgICAgICAgICdtYWdfYmlhczogTWFnQmlhcywnICtcclxuICAgICAgICAgICAgJ2NoYW5uZWw6IENoYW5uZWxQcm9wZXJ0aWVzLCcgK1xyXG4gICAgICAgICAgICAncGlkX3BhcmFtZXRlcnM6IFBJRFBhcmFtZXRlcnMsJyArXHJcbiAgICAgICAgICAgICdzdGF0ZV9wYXJhbWV0ZXJzOiBTdGF0ZVBhcmFtZXRlcnMsJyArXHJcbiAgICAgICAgICAgICdsZWRfc3RhdGVzOiBMRURTdGF0ZXNGaXhlZCwnICtcclxuICAgICAgICAgICAgJ2RldmljZV9uYW1lOiBEZXZpY2VOYW1lIH07JztcclxuXHJcbiAgICAgICAgdmFyIGNvbmZpZyA9ICdDb25maWd1cmF0aW9uID0gey8xNi8nICtcclxuICAgICAgICAgICAgJ3ZlcnNpb246IFZlcnNpb24sJyArXHJcbiAgICAgICAgICAgICdjb25maWdfaWQ6IENvbmZpZ0lELCcgK1xyXG4gICAgICAgICAgICAncGNiX3RyYW5zZm9ybTogUGNiVHJhbnNmb3JtLCcgK1xyXG4gICAgICAgICAgICAnbWl4X3RhYmxlOiBNaXhUYWJsZSwnICtcclxuICAgICAgICAgICAgJ21hZ19iaWFzOiBNYWdCaWFzLCcgK1xyXG4gICAgICAgICAgICAnY2hhbm5lbDogQ2hhbm5lbFByb3BlcnRpZXMsJyArXHJcbiAgICAgICAgICAgICdwaWRfcGFyYW1ldGVyczogUElEUGFyYW1ldGVycywnICtcclxuICAgICAgICAgICAgJ3N0YXRlX3BhcmFtZXRlcnM6IFN0YXRlUGFyYW1ldGVycywnICtcclxuICAgICAgICAgICAgJ2xlZF9zdGF0ZXM6IExFRFN0YXRlcywnICtcclxuICAgICAgICAgICAgJ2RldmljZV9uYW1lOiBEZXZpY2VOYW1lLCcgK1xyXG4gICAgICAgICAgICAndmVsb2NpdHlfcGlkX3BhcmFtZXRlcnM6IFZlbG9jaXR5UElEUGFyYW1ldGVycywnICtcclxuICAgICAgICAgICAgJ2luZXJ0aWFsX2JpYXM6IEluZXJ0aWFsQmlhcyB9Oyc7XHJcblxyXG4gICAgICAgIHZhciBjb25maWdGaXhlZCA9ICdDb25maWd1cmF0aW9uRml4ZWQgPSB7JyArXHJcbiAgICAgICAgICAgICd2ZXJzaW9uOiBWZXJzaW9uLCcgK1xyXG4gICAgICAgICAgICAnY29uZmlnX2lkOiBDb25maWdJRCwnICtcclxuICAgICAgICAgICAgJ3BjYl90cmFuc2Zvcm06IFBjYlRyYW5zZm9ybSwnICtcclxuICAgICAgICAgICAgJ21peF90YWJsZTogTWl4VGFibGUsJyArXHJcbiAgICAgICAgICAgICdtYWdfYmlhczogTWFnQmlhcywnICtcclxuICAgICAgICAgICAgJ2NoYW5uZWw6IENoYW5uZWxQcm9wZXJ0aWVzLCcgK1xyXG4gICAgICAgICAgICAncGlkX3BhcmFtZXRlcnM6IFBJRFBhcmFtZXRlcnMsJyArXHJcbiAgICAgICAgICAgICdzdGF0ZV9wYXJhbWV0ZXJzOiBTdGF0ZVBhcmFtZXRlcnMsJyArXHJcbiAgICAgICAgICAgICdsZWRfc3RhdGVzOiBMRURTdGF0ZXNGaXhlZCwnICtcclxuICAgICAgICAgICAgJ2RldmljZV9uYW1lOiBEZXZpY2VOYW1lLCcgK1xyXG4gICAgICAgICAgICAndmVsb2NpdHlfcGlkX3BhcmFtZXRlcnM6IFZlbG9jaXR5UElEUGFyYW1ldGVycywnICtcclxuICAgICAgICAgICAgJ2luZXJ0aWFsX2JpYXM6IEluZXJ0aWFsQmlhcyB9Oyc7XHJcblxyXG4gICAgICAgIHZhciBjb25maWdGbGFnMTQgPSAnQ29uZmlndXJhdGlvbkZsYWcgPSB7LzE2LycgK1xyXG4gICAgICAgICAgICAndmVyc2lvbjogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2NvbmZpZ19pZDogdm9pZCwnICtcclxuICAgICAgICAgICAgJ3BjYl90cmFuc2Zvcm06IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdtaXhfdGFibGU6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdtYWdfYmlhczogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2NoYW5uZWw6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdwaWRfcGFyYW1ldGVyczogdm9pZCwnICtcclxuICAgICAgICAgICAgJ3N0YXRlX3BhcmFtZXRlcnM6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdsZWRfc3RhdGVzOiBbLy8gdm9pZDoxNl0sJyArXHJcbiAgICAgICAgICAgICdkZXZpY2VfbmFtZTogdm9pZH07JztcclxuXHJcbiAgICAgICAgdmFyIGNvbmZpZ0ZsYWcgPSAnQ29uZmlndXJhdGlvbkZsYWcgPSB7LzE2LycgK1xyXG4gICAgICAgICAgICAndmVyc2lvbjogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2NvbmZpZ19pZDogdm9pZCwnICtcclxuICAgICAgICAgICAgJ3BjYl90cmFuc2Zvcm06IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdtaXhfdGFibGU6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdtYWdfYmlhczogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2NoYW5uZWw6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdwaWRfcGFyYW1ldGVyczogdm9pZCwnICtcclxuICAgICAgICAgICAgJ3N0YXRlX3BhcmFtZXRlcnM6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdsZWRfc3RhdGVzOiBbLy8gdm9pZDoxNl0sJyArXHJcbiAgICAgICAgICAgICdkZXZpY2VfbmFtZTogdm9pZCwnICtcclxuICAgICAgICAgICAgJ3ZlbG9jaXR5X3BpZF9wYXJhbWV0ZXJzOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnaW5lcnRpYWxfYmlhczogdm9pZCB9Oyc7XHJcblxyXG4gICAgICAgIHZhciBjb25maWdGdWxsMTQgPSB2ZWN0b3IzZiArIHBpZFNldHRpbmdzICsgdmVyc2lvbiArIGNvbmZpZ0lkICsgcGNiVHJhbnNmb3JtICtcclxuICAgICAgICAgICAgbWl4VGFibGUgKyBtYWdCaWFzICsgY2hhbm5lbFByb3BlcnRpZXMgKyBwaWRQYXJhbWV0ZXJzMTQgKyBzdGF0ZVBhcmFtZXRlcnMgK1xyXG4gICAgICAgICAgICBzdGF0dXNGbGFnMTQxNSArIGNvbG9yICsgbGVkU3RhdGVDYXNlICsgbGVkU3RhdGVzICsgbGVkU3RhdGVzRml4ZWQgKyBkZXZpY2VOYW1lICtcclxuICAgICAgICAgICAgY29uZmlnMTQxNSArIGNvbmZpZ0ZpeGVkMTQxNSArIGNvbmZpZ0ZsYWcxNDtcclxuICAgICAgICB2YXIgY29uZmlnRnVsbDE1ID0gdmVjdG9yM2YgKyBwaWRTZXR0aW5ncyArIHZlcnNpb24gKyBjb25maWdJZCArIHBjYlRyYW5zZm9ybSArIG1peFRhYmxlICtcclxuICAgICAgICAgICAgbWFnQmlhcyArIGNoYW5uZWxQcm9wZXJ0aWVzICsgcGlkUGFyYW1ldGVycyArIHN0YXRlUGFyYW1ldGVycyArXHJcbiAgICAgICAgICAgIHN0YXR1c0ZsYWcxNDE1ICsgY29sb3IgKyBsZWRTdGF0ZUNhc2UgKyBsZWRTdGF0ZXMgKyBsZWRTdGF0ZXNGaXhlZCArIGRldmljZU5hbWUgK1xyXG4gICAgICAgICAgICBjb25maWcxNDE1ICsgY29uZmlnRml4ZWQxNDE1ICsgY29uZmlnRmxhZztcclxuICAgICAgICB2YXIgY29uZmlnRnVsbDE2ID0gdmVjdG9yM2YgKyBwaWRTZXR0aW5ncyArIHZlcnNpb24gKyBjb25maWdJZCArIHBjYlRyYW5zZm9ybSArIG1peFRhYmxlICtcclxuICAgICAgICAgICAgbWFnQmlhcyArIGNoYW5uZWxQcm9wZXJ0aWVzICsgcGlkUGFyYW1ldGVycyArIHN0YXRlUGFyYW1ldGVycyArXHJcbiAgICAgICAgICAgIHN0YXR1c0ZsYWcgKyBjb2xvciArIGxlZFN0YXRlQ2FzZSArIGxlZFN0YXRlcyArIGxlZFN0YXRlc0ZpeGVkICsgZGV2aWNlTmFtZSArXHJcbiAgICAgICAgICAgIGluZXJ0aWFsQmlhcyArIHZlbG9jaXR5UGlkUGFyYW1ldGVycyArXHJcbiAgICAgICAgICAgIGNvbmZpZyArIGNvbmZpZ0ZpeGVkICsgY29uZmlnRmxhZztcclxuXHJcbiAgICAgICAgdmFyIHN0YXRlID0gJ1JvdGF0aW9uID0geyByb2xsOiBmMzIsIHBpdGNoOiBmMzIsIHlhdzogZjMyIH07JyArXHJcbiAgICAgICAgICAgICdQSURTdGF0ZSA9IHsnICtcclxuICAgICAgICAgICAgJ3RpbWVzdGFtcF91czogdTMyLCcgK1xyXG4gICAgICAgICAgICAnaW5wdXQ6IGYzMiwnICtcclxuICAgICAgICAgICAgJ3NldHBvaW50OiBmMzIsJyArXHJcbiAgICAgICAgICAgICdwX3Rlcm06IGYzMiwnICtcclxuICAgICAgICAgICAgJ2lfdGVybTogZjMyLCcgK1xyXG4gICAgICAgICAgICAnZF90ZXJtOiBmMzIgfTsnICtcclxuICAgICAgICAgICAgJ1JjQ29tbWFuZCA9IHsgdGhyb3R0bGU6IGkxNiwgcGl0Y2g6IGkxNiwgcm9sbDogaTE2LCB5YXc6IGkxNiB9OycgK1xyXG4gICAgICAgICAgICAnU3RhdGUgPSB7LzMyLycgK1xyXG4gICAgICAgICAgICAndGltZXN0YW1wX3VzOiB1MzIsJyArXHJcbiAgICAgICAgICAgICdzdGF0dXM6IFN0YXR1c0ZsYWcsJyArXHJcbiAgICAgICAgICAgICd2MF9yYXc6IHUxNiwnICtcclxuICAgICAgICAgICAgJ2kwX3JhdzogdTE2LCcgK1xyXG4gICAgICAgICAgICAnaTFfcmF3OiB1MTYsJyArXHJcbiAgICAgICAgICAgICdhY2NlbDogVmVjdG9yM2YsJyArXHJcbiAgICAgICAgICAgICdneXJvOiBWZWN0b3IzZiwnICtcclxuICAgICAgICAgICAgJ21hZzogVmVjdG9yM2YsJyArXHJcbiAgICAgICAgICAgICd0ZW1wZXJhdHVyZTogdTE2LCcgK1xyXG4gICAgICAgICAgICAncHJlc3N1cmU6IHUzMiwnICtcclxuICAgICAgICAgICAgJ3BwbTogW2kxNjo2XSwnICtcclxuICAgICAgICAgICAgJ2F1eF9jaGFuX21hc2s6IHU4LCcgK1xyXG4gICAgICAgICAgICAnY29tbWFuZDogUmNDb21tYW5kLCcgK1xyXG4gICAgICAgICAgICAnY29udHJvbDogeyBmejogZjMyLCB0eDogZjMyLCB0eTogZjMyLCB0ejogZjMyIH0sJyArXHJcbiAgICAgICAgICAgICdwaWRfbWFzdGVyX2Z6OiBQSURTdGF0ZSwnICtcclxuICAgICAgICAgICAgJ3BpZF9tYXN0ZXJfdHg6IFBJRFN0YXRlLCcgK1xyXG4gICAgICAgICAgICAncGlkX21hc3Rlcl90eTogUElEU3RhdGUsJyArXHJcbiAgICAgICAgICAgICdwaWRfbWFzdGVyX3R6OiBQSURTdGF0ZSwnICtcclxuICAgICAgICAgICAgJ3BpZF9zbGF2ZV9mejogUElEU3RhdGUsJyArXHJcbiAgICAgICAgICAgICdwaWRfc2xhdmVfdHg6IFBJRFN0YXRlLCcgK1xyXG4gICAgICAgICAgICAncGlkX3NsYXZlX3R5OiBQSURTdGF0ZSwnICtcclxuICAgICAgICAgICAgJ3BpZF9zbGF2ZV90ejogUElEU3RhdGUsJyArXHJcbiAgICAgICAgICAgICdtb3Rvcl9vdXQ6IFtpMTY6OF0sJyArXHJcbiAgICAgICAgICAgICdraW5lbWF0aWNzX2FuZ2xlOiBSb3RhdGlvbiwnICtcclxuICAgICAgICAgICAgJ2tpbmVtYXRpY3NfcmF0ZTogUm90YXRpb24sJyArXHJcbiAgICAgICAgICAgICdraW5lbWF0aWNzX2FsdGl0dWRlOiBmMzIsJyArXHJcbiAgICAgICAgICAgICdsb29wX2NvdW50OiB1MzIgfTsnO1xyXG5cclxuICAgICAgICB2YXIgYXV4TWFzayA9ICdBdXhNYXNrID0gey8vJyArXHJcbiAgICAgICAgICAgICdhdXgxX2xvdzogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2F1eDFfbWlkOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnYXV4MV9oaWdoOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnYXV4Ml9sb3c6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdhdXgyX21pZDogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2F1eDJfaGlnaDogdm9pZCB9Oyc7XHJcblxyXG4gICAgICAgIHZhciBjb21tYW5kcyA9IGF1eE1hc2sgKyAnQ29tbWFuZCA9IHsvMzIvJyArXHJcbiAgICAgICAgICAgICdyZXF1ZXN0X3Jlc3BvbnNlOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnc2V0X2VlcHJvbV9kYXRhOiBDb25maWd1cmF0aW9uRml4ZWQsJyArXHJcbiAgICAgICAgICAgICdyZWluaXRfZWVwcm9tX2RhdGE6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdyZXF1ZXN0X2VlcHJvbV9kYXRhOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAncmVxdWVzdF9lbmFibGVfaXRlcmF0aW9uOiB1OCwnICtcclxuICAgICAgICAgICAgJ21vdG9yX292ZXJyaWRlX3NwZWVkXzA6IHUxNiwnICtcclxuICAgICAgICAgICAgJ21vdG9yX292ZXJyaWRlX3NwZWVkXzE6IHUxNiwnICtcclxuICAgICAgICAgICAgJ21vdG9yX292ZXJyaWRlX3NwZWVkXzI6IHUxNiwnICtcclxuICAgICAgICAgICAgJ21vdG9yX292ZXJyaWRlX3NwZWVkXzM6IHUxNiwnICtcclxuICAgICAgICAgICAgJ21vdG9yX292ZXJyaWRlX3NwZWVkXzQ6IHUxNiwnICtcclxuICAgICAgICAgICAgJ21vdG9yX292ZXJyaWRlX3NwZWVkXzU6IHUxNiwnICtcclxuICAgICAgICAgICAgJ21vdG9yX292ZXJyaWRlX3NwZWVkXzY6IHUxNiwnICtcclxuICAgICAgICAgICAgJ21vdG9yX292ZXJyaWRlX3NwZWVkXzc6IHUxNiwnICtcclxuICAgICAgICAgICAgJ3NldF9jb21tYW5kX292ZXJyaWRlOiBib29sLCcgK1xyXG4gICAgICAgICAgICAnc2V0X3N0YXRlX21hc2s6IHUzMiwnICtcclxuICAgICAgICAgICAgJ3NldF9zdGF0ZV9kZWxheTogdTE2LCcgK1xyXG4gICAgICAgICAgICAnc2V0X3NkX3dyaXRlX2RlbGF5OiB1MTYsJyArXHJcbiAgICAgICAgICAgICdzZXRfbGVkOiB7JyArXHJcbiAgICAgICAgICAgICcgIHBhdHRlcm46IHU4LCcgK1xyXG4gICAgICAgICAgICAnICBjb2xvcl9yaWdodDogQ29sb3IsJyArXHJcbiAgICAgICAgICAgICcgIGNvbG9yX2xlZnQ6IENvbG9yLCcgK1xyXG4gICAgICAgICAgICAnICBpbmRpY2F0b3JfcmVkOiBib29sLCcgK1xyXG4gICAgICAgICAgICAnICBpbmRpY2F0b3JfZ3JlZW46IGJvb2wgfSwnICtcclxuICAgICAgICAgICAgJ3NldF9zZXJpYWxfcmM6IHsgZW5hYmxlZDogYm9vbCwgY29tbWFuZDogUmNDb21tYW5kLCBhdXhfbWFzazogQXV4TWFzayB9LCcgK1xyXG4gICAgICAgICAgICAnc2V0X2NhcmRfcmVjb3JkaW5nX3N0YXRlOiB7LzgvIHJlY29yZF90b19jYXJkOiB2b2lkLCBsb2NrX3JlY29yZGluZ19zdGF0ZTogdm9pZCB9LCcgK1xyXG4gICAgICAgICAgICAnc2V0X3BhcnRpYWxfZWVwcm9tX2RhdGE6IENvbmZpZ3VyYXRpb24sJyArXHJcbiAgICAgICAgICAgICdyZWluaXRfcGFydGlhbF9lZXByb21fZGF0YTogQ29uZmlndXJhdGlvbkZsYWcsJyArXHJcbiAgICAgICAgICAgICdyZXFfcGFydGlhbF9lZXByb21fZGF0YTogQ29uZmlndXJhdGlvbkZsYWcsJyArXHJcbiAgICAgICAgICAgICdyZXFfY2FyZF9yZWNvcmRpbmdfc3RhdGU6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdzZXRfcGFydGlhbF90ZW1wb3JhcnlfY29uZmlnOiBDb25maWd1cmF0aW9uLCcgK1xyXG4gICAgICAgICAgICAnc2V0X2NvbW1hbmRfc291cmNlczogey84LyBzZXJpYWw6IHZvaWQsIHJhZGlvOiB2b2lkIH0sJyArXHJcbiAgICAgICAgICAgICdzZXRfY2FsaWJyYXRpb246IHsgZW5hYmxlZDogYm9vbCwgbW9kZTogdTggfSwnICtcclxuICAgICAgICAgICAgJ3NldF9hdXRvcGlsb3RfZW5hYmxlZDogYm9vbCwnICtcclxuICAgICAgICAgICAgJ3NldF91c2JfbW9kZTogdTh9Oyc7XHJcblxyXG4gICAgICAgIHZhciBkZWJ1Z1N0cmluZyA9IFwiRGVidWdTdHJpbmcgPSB7IGRlcHJlY2F0ZWRfbWFzazogdTMyLCBtZXNzYWdlOiBzIH07XCI7XHJcbiAgICAgICAgdmFyIGhpc3RvcnlEYXRhID0gXCJIaXN0b3J5RGF0YSA9IERlYnVnU3RyaW5nO1wiO1xyXG4gICAgICAgIHZhciByZXNwb25zZSA9IFwiUmVzcG9uc2UgPSB7IG1hc2s6IHUzMiwgYWNrOiB1MzIgfTtcIjtcclxuICAgICAgICB2YXIgcHJvdG9jb2wgPSBcIlByb3RvY29sSW5mbyA9IHsgdmVyc2lvbjogVmVyc2lvbiwgc3RydWN0dXJlOiBzIH07XCIgK1xyXG4gICAgICAgICAgICBcIlByb3RvY29sID0gey8zMi8gcmVxdWVzdDogdm9pZCwgcmVzcG9uc2U6IFByb3RvY29sSW5mbyB9O1wiO1xyXG5cclxuICAgICAgICB2YXIgaGFuZGxlcjE0ID0gY29uZmlnRnVsbDE0ICsgc3RhdGUgKyBjb21tYW5kcyArIGRlYnVnU3RyaW5nICsgaGlzdG9yeURhdGEgKyByZXNwb25zZSArIHByb3RvY29sO1xyXG4gICAgICAgIHZhciBoYW5kbGVyMTUgPSBjb25maWdGdWxsMTUgKyBzdGF0ZSArIGNvbW1hbmRzICsgZGVidWdTdHJpbmcgKyBoaXN0b3J5RGF0YSArIHJlc3BvbnNlICsgcHJvdG9jb2w7XHJcbiAgICAgICAgdmFyIGhhbmRsZXIxNiA9IGNvbmZpZ0Z1bGwxNiArIHN0YXRlICsgY29tbWFuZHMgKyBkZWJ1Z1N0cmluZyArIGhpc3RvcnlEYXRhICsgcmVzcG9uc2UgKyBwcm90b2NvbDtcclxuXHJcbiAgICAgICAgaGFuZGxlckNhY2hlWycxLjQuMCddID0gRmx5YnJpeFNlcmlhbGl6YXRpb24ucGFyc2UoaGFuZGxlcjE0KTtcclxuICAgICAgICBoYW5kbGVyQ2FjaGVbJzEuNS4wJ10gPSBoYW5kbGVyQ2FjaGVbJzEuNS4xJ10gPSBGbHlicml4U2VyaWFsaXphdGlvbi5wYXJzZShoYW5kbGVyMTUpO1xyXG4gICAgICAgIGhhbmRsZXJDYWNoZVsnMS42LjAnXSA9IEZseWJyaXhTZXJpYWxpemF0aW9uLnBhcnNlKGhhbmRsZXIxNik7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHVwZGF0ZUZpZWxkcyh0YXJnZXQsIHNvdXJjZSkge1xyXG4gICAgICAgICAgICBpZiAoc291cmNlIGluc3RhbmNlb2YgQXJyYXkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB1cGRhdGVGaWVsZHNBcnJheSh0YXJnZXQsIHNvdXJjZSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoc291cmNlIGluc3RhbmNlb2YgT2JqZWN0KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdXBkYXRlRmllbGRzT2JqZWN0KHRhcmdldCwgc291cmNlKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAoc291cmNlID09PSBudWxsIHx8IHNvdXJjZSA9PT0gdW5kZWZpbmVkKSA/IHRhcmdldCA6IHNvdXJjZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gdXBkYXRlRmllbGRzT2JqZWN0KHRhcmdldCwgc291cmNlKSB7XHJcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSB7fTtcclxuICAgICAgICAgICAgT2JqZWN0LmtleXModGFyZ2V0KS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdFtrZXldID0gdXBkYXRlRmllbGRzKHRhcmdldFtrZXldLCBzb3VyY2Vba2V5XSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBPYmplY3Qua2V5cyhzb3VyY2UpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGtleSBpbiByZXN1bHQpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXN1bHRba2V5XSA9IHVwZGF0ZUZpZWxkcyh0YXJnZXRba2V5XSwgc291cmNlW2tleV0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHVwZGF0ZUZpZWxkc0FycmF5KHRhcmdldCwgc291cmNlKSB7XHJcbiAgICAgICAgICAgIHZhciBsZW5ndGggPSBNYXRoLm1heCh0YXJnZXQubGVuZ3RoLCBzb3VyY2UubGVuZ3RoKTtcclxuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpZHggPSAwOyBpZHggPCBsZW5ndGg7ICsraWR4KSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaCh1cGRhdGVGaWVsZHModGFyZ2V0W2lkeF0sIHNvdXJjZVtpZHhdKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIFNlcmlhbGl6ZXI6IEZseWJyaXhTZXJpYWxpemF0aW9uLlNlcmlhbGl6ZXIsXHJcbiAgICAgICAgICAgIGdldEhhbmRsZXI6IGZ1bmN0aW9uIChmaXJtd2FyZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZXJDYWNoZVtmaXJtd2FyZV07XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGFkZEhhbmRsZXI6IGZ1bmN0aW9uICh2ZXJzaW9uLCBzdHJ1Y3R1cmUpIHtcclxuICAgICAgICAgICAgICAgIHZhciB2ZXJzaW9uU3RyaW5nID0gdmVyc2lvbi5tYWpvci50b1N0cmluZygpICsgJy4nICsgdmVyc2lvbi5taW5vci50b1N0cmluZygpICsgdmVyc2lvbi5wYXRjaC50b1N0cmluZygpO1xyXG4gICAgICAgICAgICAgICAgaGFuZGxlckNhY2hlW3ZlcnNpb25TdHJpbmddID0gRmx5YnJpeFNlcmlhbGl6YXRpb24ucGFyc2Uoc3RydWN0dXJlKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdXBkYXRlRmllbGRzOiB1cGRhdGVGaWVsZHMsXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbn0oKSk7XHJcbiJdfQ==
