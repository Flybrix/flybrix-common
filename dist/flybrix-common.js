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
            var version = [config.version.major, config.version.minor, config.version.patch];
            firmwareVersion.set(version);
            if (!firmwareVersion.supported()) {
                commandLog('Received an unsupported configuration!');
                commandLog(
                    'Found version: ' + version[0] + '.' + version[1] + '.' + version[2]  +
                    ' --- Newest version: ' +
                    firmwareVersion.desiredKey() );
            } else {
                commandLog(
                    'Received configuration data (v' +
                    version[0] + '.' + version[1] + '.' + version[2] +')');
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

        var state = 'Rotation = { pitch: f32, roll: f32, yaw: f32 };' +
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
            'loop_count: u32 };' +
            'StateFields = {/32/' +
            'timestamp_us: void,' +
            'status: void,' +
            'v0_raw: void,' +
            'i0_raw: void,' +
            'i1_raw: void,' +
            'accel: void,' +
            'gyro: void,' +
            'mag: void,' +
            'temperature: void,' +
            'pressure: void,' +
            'ppm: void,' +
            'aux_chan_mask: void,' +
            'command: void,' +
            'control: void,' +
            'pid_master_fz: void,' +
            'pid_master_tx: void,' +
            'pid_master_ty: void,' +
            'pid_master_tz: void,' +
            'pid_slave_fz: void,' +
            'pid_slave_tx: void,' +
            'pid_slave_ty: void,' +
            'pid_slave_tz: void,' +
            'motor_out: void,' +
            'kinematics_angle: void,' +
            'kinematics_rate: void,' +
            'kinematics_altitude: void,' +
            'loop_count: void };';

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
            'set_state_mask: StateFields,' +
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZS5qcyIsImNhbGlicmF0aW9uLmpzIiwiY29icy5qcyIsImNvbW1hbmRMb2cuanMiLCJkZXZpY2VDb25maWcuanMiLCJmaXJtd2FyZVZlcnNpb24uanMiLCJsZWQuanMiLCJyY0RhdGEuanMiLCJzZXJpYWwuanMiLCJzZXJpYWxpemF0aW9uSGFuZGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDalBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJmbHlicml4LWNvbW1vbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgnZmx5YnJpeENvbW1vbicsIFtdKTtcclxufSgpKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdmbHlicml4Q29tbW9uJykuZmFjdG9yeSgnY2FsaWJyYXRpb24nLCBjYWxpYnJhdGlvbik7XHJcblxyXG4gICAgY2FsaWJyYXRpb24uJGluamVjdCA9IFsnY29tbWFuZExvZycsICdzZXJpYWwnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBjYWxpYnJhdGlvbihjb21tYW5kTG9nLCBzZXJpYWwpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBtYWduZXRvbWV0ZXI6IG1hZ25ldG9tZXRlcixcclxuICAgICAgICAgICAgYWNjZWxlcm9tZXRlcjoge1xyXG4gICAgICAgICAgICAgICAgZmxhdDogY2FsaWJyYXRlQWNjZWxlcm9tZXRlci5iaW5kKG51bGwsICdmbGF0JywgMCksXHJcbiAgICAgICAgICAgICAgICBmb3J3YXJkOiBjYWxpYnJhdGVBY2NlbGVyb21ldGVyLmJpbmQobnVsbCwgJ2xlYW4gZm9yd2FyZCcsIDEpLFxyXG4gICAgICAgICAgICAgICAgYmFjazogY2FsaWJyYXRlQWNjZWxlcm9tZXRlci5iaW5kKG51bGwsICdsZWFuIGJhY2snLCAyKSxcclxuICAgICAgICAgICAgICAgIHJpZ2h0OiBjYWxpYnJhdGVBY2NlbGVyb21ldGVyLmJpbmQobnVsbCwgJ2xlYW4gcmlnaHQnLCAzKSxcclxuICAgICAgICAgICAgICAgIGxlZnQ6IGNhbGlicmF0ZUFjY2VsZXJvbWV0ZXIuYmluZChudWxsLCAnbGVhbiBsZWZ0JywgNCksXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGZpbmlzaDogZmluaXNoLFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIG1hZ25ldG9tZXRlcigpIHtcclxuICAgICAgICAgICAgY29tbWFuZExvZyhcIkNhbGlicmF0aW5nIG1hZ25ldG9tZXRlciBiaWFzXCIpO1xyXG4gICAgICAgICAgICByZXR1cm4gc2VyaWFsLnNlbmRTdHJ1Y3R1cmUoJ0NvbW1hbmQnLCB7XHJcbiAgICAgICAgICAgICAgICByZXF1ZXN0X3Jlc3BvbnNlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgc2V0X2NhbGlicmF0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZW5hYmxlZDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBtb2RlOiAwLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSwgZmFsc2UpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gY2FsaWJyYXRlQWNjZWxlcm9tZXRlcihwb3NlRGVzY3JpcHRpb24sIHBvc2VJZCkge1xyXG4gICAgICAgICAgICBjb21tYW5kTG9nKFwiQ2FsaWJyYXRpbmcgZ3Jhdml0eSBmb3IgcG9zZTogXCIgKyBwb3NlRGVzY3JpcHRpb24pO1xyXG4gICAgICAgICAgICByZXR1cm4gc2VyaWFsLnNlbmRTdHJ1Y3R1cmUoJ0NvbW1hbmQnLCB7XHJcbiAgICAgICAgICAgICAgICByZXF1ZXN0X3Jlc3BvbnNlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgc2V0X2NhbGlicmF0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZW5hYmxlZDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBtb2RlOiBwb3NlSWQgKyAxLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSwgZmFsc2UpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZmluaXNoKCkge1xyXG4gICAgICAgICAgICBjb21tYW5kTG9nKFwiRmluaXNoaW5nIGNhbGlicmF0aW9uXCIpO1xyXG4gICAgICAgICAgICByZXR1cm4gc2VyaWFsLnNlbmRTdHJ1Y3R1cmUoJ0NvbW1hbmQnLCB7XHJcbiAgICAgICAgICAgICAgICByZXF1ZXN0X3Jlc3BvbnNlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgc2V0X2NhbGlicmF0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZW5hYmxlZDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgbW9kZTogMCxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0sIGZhbHNlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgnZmx5YnJpeENvbW1vbicpLmZhY3RvcnkoJ2NvYnMnLCBjb2JzKTtcclxuXHJcbiAgICBmdW5jdGlvbiBjb2JzKCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIFJlYWRlcjogUmVhZGVyLFxyXG4gICAgICAgICAgICBlbmNvZGU6IGVuY29kZSxcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBmdW5jdGlvbiBSZWFkZXIoY2FwYWNpdHkpIHtcclxuICAgICAgICBpZiAoY2FwYWNpdHkgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBjYXBhY2l0eSA9IDIwMDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuTiA9IGNhcGFjaXR5O1xyXG4gICAgICAgIHRoaXMuYnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoY2FwYWNpdHkpO1xyXG4gICAgICAgIHRoaXMucmVhZHlfZm9yX25ld19tZXNzYWdlID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmJ1ZmZlcl9sZW5ndGggPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNvYnNEZWNvZGUocmVhZGVyKSB7XHJcbiAgICAgICAgdmFyIHNyY19wdHIgPSAwO1xyXG4gICAgICAgIHZhciBkc3RfcHRyID0gMDtcclxuICAgICAgICB2YXIgbGVmdG92ZXJfbGVuZ3RoID0gMDtcclxuICAgICAgICB2YXIgYXBwZW5kX3plcm8gPSBmYWxzZTtcclxuICAgICAgICB3aGlsZSAocmVhZGVyLmJ1ZmZlcltzcmNfcHRyXSkge1xyXG4gICAgICAgICAgICBpZiAoIWxlZnRvdmVyX2xlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGFwcGVuZF96ZXJvKVxyXG4gICAgICAgICAgICAgICAgICAgIHJlYWRlci5idWZmZXJbZHN0X3B0cisrXSA9IDA7XHJcbiAgICAgICAgICAgICAgICBsZWZ0b3Zlcl9sZW5ndGggPSByZWFkZXIuYnVmZmVyW3NyY19wdHIrK10gLSAxO1xyXG4gICAgICAgICAgICAgICAgYXBwZW5kX3plcm8gPSBsZWZ0b3Zlcl9sZW5ndGggPCAweEZFO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLS1sZWZ0b3Zlcl9sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICByZWFkZXIuYnVmZmVyW2RzdF9wdHIrK10gPSByZWFkZXIuYnVmZmVyW3NyY19wdHIrK107XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBsZWZ0b3Zlcl9sZW5ndGggPyAwIDogZHN0X3B0cjtcclxuICAgIH1cclxuXHJcbiAgICBSZWFkZXIucHJvdG90eXBlLnJlYWRCeXRlcyA9IGZ1bmN0aW9uKGRhdGEsIG9uU3VjY2Vzcywgb25FcnJvcikge1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgYyA9IGRhdGFbaV07XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnJlYWR5X2Zvcl9uZXdfbWVzc2FnZSkge1xyXG4gICAgICAgICAgICAgICAgLy8gZmlyc3QgYnl0ZSBvZiBhIG5ldyBtZXNzYWdlXHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlYWR5X2Zvcl9uZXdfbWVzc2FnZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5idWZmZXJfbGVuZ3RoID0gMDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5idWZmZXJbdGhpcy5idWZmZXJfbGVuZ3RoKytdID0gYztcclxuXHJcbiAgICAgICAgICAgIGlmIChjKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5idWZmZXJfbGVuZ3RoID09PSB0aGlzLk4pIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBidWZmZXIgb3ZlcmZsb3csIHByb2JhYmx5IGR1ZSB0byBlcnJvcnMgaW4gZGF0YVxyXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IoJ292ZXJmbG93JywgJ2J1ZmZlciBvdmVyZmxvdyBpbiBDT0JTIGRlY29kaW5nJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWFkeV9mb3JfbmV3X21lc3NhZ2UgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuYnVmZmVyX2xlbmd0aCA9IGNvYnNEZWNvZGUodGhpcyk7XHJcbiAgICAgICAgICAgIHZhciBmYWlsZWRfZGVjb2RlID0gKHRoaXMuYnVmZmVyX2xlbmd0aCA9PT0gMCk7XHJcbiAgICAgICAgICAgIGlmIChmYWlsZWRfZGVjb2RlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJ1ZmZlclswXSA9IDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIGo7XHJcbiAgICAgICAgICAgIGZvciAoaiA9IDE7IGogPCB0aGlzLmJ1ZmZlcl9sZW5ndGg7ICsraikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5idWZmZXJbMF0gXj0gdGhpcy5idWZmZXJbal07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoaXMuYnVmZmVyWzBdID09PSAwKSB7ICAvLyBjaGVjayBzdW0gaXMgY29ycmVjdFxyXG4gICAgICAgICAgICAgICAgdGhpcy5yZWFkeV9mb3JfbmV3X21lc3NhZ2UgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYnVmZmVyX2xlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBvblN1Y2Nlc3ModGhpcy5idWZmZXIuc2xpY2UoMSwgdGhpcy5idWZmZXJfbGVuZ3RoKSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IoJ3Nob3J0JywgJ1RvbyBzaG9ydCBwYWNrZXQnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHsgIC8vIGJhZCBjaGVja3N1bVxyXG4gICAgICAgICAgICAgICAgdGhpcy5yZWFkeV9mb3JfbmV3X21lc3NhZ2UgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgdmFyIGJ5dGVzID0gXCJcIjtcclxuICAgICAgICAgICAgICAgIHZhciBtZXNzYWdlID0gXCJcIjtcclxuICAgICAgICAgICAgICAgIGZvciAoaiA9IDA7IGogPCB0aGlzLmJ1ZmZlcl9sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGJ5dGVzICs9IHRoaXMuYnVmZmVyW2pdICsgXCIsXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZSArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKHRoaXMuYnVmZmVyW2pdKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChmYWlsZWRfZGVjb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcignZnJhbWUnLCAnVW5leHBlY3RlZCBlbmRpbmcgb2YgcGFja2V0Jyk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBtc2cgPSAnQkFEIENIRUNLU1VNICgnICsgdGhpcy5idWZmZXJfbGVuZ3RoICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJyBieXRlcyknICsgYnl0ZXMgKyBtZXNzYWdlO1xyXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IoJ2NoZWNrc3VtJywgbXNnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgZnVuY3Rpb24gZW5jb2RlKGJ1Zikge1xyXG4gICAgICAgIHZhciByZXR2YWwgPVxyXG4gICAgICAgICAgICBuZXcgVWludDhBcnJheShNYXRoLmZsb29yKChidWYuYnl0ZUxlbmd0aCAqIDI1NSArIDc2MSkgLyAyNTQpKTtcclxuICAgICAgICB2YXIgbGVuID0gMTtcclxuICAgICAgICB2YXIgcG9zX2N0ciA9IDA7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBidWYubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICAgICAgaWYgKHJldHZhbFtwb3NfY3RyXSA9PSAweEZFKSB7XHJcbiAgICAgICAgICAgICAgICByZXR2YWxbcG9zX2N0cl0gPSAweEZGO1xyXG4gICAgICAgICAgICAgICAgcG9zX2N0ciA9IGxlbisrO1xyXG4gICAgICAgICAgICAgICAgcmV0dmFsW3Bvc19jdHJdID0gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgdmFsID0gYnVmW2ldO1xyXG4gICAgICAgICAgICArK3JldHZhbFtwb3NfY3RyXTtcclxuICAgICAgICAgICAgaWYgKHZhbCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dmFsW2xlbisrXSA9IHZhbDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHBvc19jdHIgPSBsZW4rKztcclxuICAgICAgICAgICAgICAgIHJldHZhbFtwb3NfY3RyXSA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJldHZhbC5zdWJhcnJheSgwLCBsZW4pLnNsaWNlKCkuYnVmZmVyO1xyXG4gICAgfTtcclxufSgpKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdmbHlicml4Q29tbW9uJykuZmFjdG9yeSgnY29tbWFuZExvZycsIGNvbW1hbmRMb2cpO1xyXG5cclxuICAgIGNvbW1hbmRMb2cuJGluamVjdCA9IFsnJHEnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBjb21tYW5kTG9nKCRxKSB7XHJcbiAgICAgICAgdmFyIG1lc3NhZ2VzID0gW107XHJcbiAgICAgICAgdmFyIHJlc3BvbmRlciA9ICRxLmRlZmVyKCk7XHJcblxyXG4gICAgICAgIHZhciBzZXJ2aWNlID0gbG9nO1xyXG4gICAgICAgIHNlcnZpY2UubG9nID0gbG9nO1xyXG4gICAgICAgIHNlcnZpY2UuY2xlYXJTdWJzY3JpYmVycyA9IGNsZWFyU3Vic2NyaWJlcnM7XHJcbiAgICAgICAgc2VydmljZS5vbk1lc3NhZ2UgPSBvbk1lc3NhZ2U7XHJcbiAgICAgICAgc2VydmljZS5yZWFkID0gcmVhZDtcclxuXHJcbiAgICAgICAgcmV0dXJuIHNlcnZpY2U7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGxvZyhtZXNzYWdlKSB7XHJcbiAgICAgICAgICAgIGlmIChtZXNzYWdlICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIG1lc3NhZ2VzLnB1c2gobWVzc2FnZSk7XHJcbiAgICAgICAgICAgICAgICByZXNwb25kZXIubm90aWZ5KHJlYWQoKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHJlYWQoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBtZXNzYWdlcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGNsZWFyU3Vic2NyaWJlcnMoKSB7XHJcbiAgICAgICAgICAgIHJlc3BvbmRlciA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBvbk1lc3NhZ2UoY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbmRlci5wcm9taXNlLnRoZW4odW5kZWZpbmVkLCB1bmRlZmluZWQsIGNhbGxiYWNrKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgnZmx5YnJpeENvbW1vbicpLmZhY3RvcnkoJ2RldmljZUNvbmZpZycsIGRldmljZUNvbmZpZyk7XHJcblxyXG4gICAgZGV2aWNlQ29uZmlnLiRpbmplY3QgPSBbJ3NlcmlhbCcsICdjb21tYW5kTG9nJywgJ2Zpcm13YXJlVmVyc2lvbicsICdzZXJpYWxpemF0aW9uSGFuZGxlciddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGRldmljZUNvbmZpZyhzZXJpYWwsIGNvbW1hbmRMb2csIGZpcm13YXJlVmVyc2lvbiwgc2VyaWFsaXphdGlvbkhhbmRsZXIpIHtcclxuICAgICAgICB2YXIgY29uZmlnO1xyXG5cclxuICAgICAgICB2YXIgY29uZmlnQ2FsbGJhY2sgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgY29tbWFuZExvZygnTm8gY2FsbGJhY2sgZGVmaW5lZCBmb3IgcmVjZWl2aW5nIGNvbmZpZ3VyYXRpb25zIScpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHZhciBsb2dnaW5nQ2FsbGJhY2sgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgY29tbWFuZExvZyhcclxuICAgICAgICAgICAgICAgICdObyBjYWxsYmFjayBkZWZpbmVkIGZvciByZWNlaXZpbmcgbG9nZ2luZyBzdGF0ZSEnICtcclxuICAgICAgICAgICAgICAgICcgQ2FsbGJhY2sgYXJndW1lbnRzOiAoaXNMb2dnaW5nLCBpc0xvY2tlZCwgZGVsYXkpJyk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgc2VyaWFsLmFkZE9uUmVjZWl2ZUNhbGxiYWNrKGZ1bmN0aW9uKG1lc3NhZ2VUeXBlLCBtZXNzYWdlKSB7XHJcbiAgICAgICAgICAgIGlmIChtZXNzYWdlVHlwZSAhPT0gJ0NvbW1hbmQnKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCdzZXRfZWVwcm9tX2RhdGEnIGluIG1lc3NhZ2UpIHtcclxuICAgICAgICAgICAgICAgIHVwZGF0ZUNvbmZpZ0Zyb21SZW1vdGVEYXRhKG1lc3NhZ2Uuc2V0X2VlcHJvbV9kYXRhKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoJ3NldF9wYXJ0aWFsX2VlcHJvbV9kYXRhJyBpbiBtZXNzYWdlKSB7XHJcbiAgICAgICAgICAgICAgICB1cGRhdGVDb25maWdGcm9tUmVtb3RlRGF0YShtZXNzYWdlLnNldF9wYXJ0aWFsX2VlcHJvbV9kYXRhKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoKCdzZXRfY2FyZF9yZWNvcmRpbmdfc3RhdGUnIGluIG1lc3NhZ2UpICYmICgnc2V0X3NkX3dyaXRlX2RlbGF5JyBpbiBtZXNzYWdlKSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGNhcmRfcmVjX3N0YXRlID0gbWVzc2FnZS5zZXRfY2FyZF9yZWNvcmRpbmdfc3RhdGU7XHJcbiAgICAgICAgICAgICAgICB2YXIgc2Rfd3JpdGVfZGVsYXkgPSBtZXNzYWdlLnNldF9zZF93cml0ZV9kZWxheTtcclxuICAgICAgICAgICAgICAgIGxvZ2dpbmdDYWxsYmFjayhjYXJkX3JlY19zdGF0ZS5yZWNvcmRfdG9fY2FyZCwgY2FyZF9yZWNfc3RhdGUubG9ja19yZWNvcmRpbmdfc3RhdGUsIHNkX3dyaXRlX2RlbGF5KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXREZXNpcmVkVmVyc2lvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZpcm13YXJlVmVyc2lvbi5kZXNpcmVkKCk7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gcmVxdWVzdCgpIHtcclxuICAgICAgICAgICAgdmFyIGhhbmRsZXJzID0gZmlybXdhcmVWZXJzaW9uLnNlcmlhbGl6YXRpb25IYW5kbGVyKCk7XHJcbiAgICAgICAgICAgIGNvbW1hbmRMb2coJ1JlcXVlc3RpbmcgY3VycmVudCBjb25maWd1cmF0aW9uIGRhdGEuLi4nKTtcclxuICAgICAgICAgICAgcmV0dXJuIHNlcmlhbC5zZW5kU3RydWN0dXJlKCdDb21tYW5kJywge1xyXG4gICAgICAgICAgICAgICAgcmVxdWVzdF9yZXNwb25zZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHJlcV9wYXJ0aWFsX2VlcHJvbV9kYXRhOiBoYW5kbGVycy5Db25maWd1cmF0aW9uRmxhZy5lbXB0eSgpLFxyXG4gICAgICAgICAgICB9LCBmYWxzZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiByZWluaXQoKSB7XHJcbiAgICAgICAgICAgIGNvbW1hbmRMb2coJ1NldHRpbmcgZmFjdG9yeSBkZWZhdWx0IGNvbmZpZ3VyYXRpb24gZGF0YS4uLicpO1xyXG4gICAgICAgICAgICByZXR1cm4gc2VyaWFsLnNlbmRTdHJ1Y3R1cmUoJ0NvbW1hbmQnLCB7XHJcbiAgICAgICAgICAgICAgICByZXF1ZXN0X3Jlc3BvbnNlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgcmVpbml0X2VlcHJvbV9kYXRhOiB0cnVlLFxyXG4gICAgICAgICAgICB9LCBmYWxzZSlcclxuICAgICAgICAgICAgICAgIC50aGVuKFxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVxdWVzdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24ocmVhc29uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbW1hbmRMb2coXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnUmVxdWVzdCBmb3IgZmFjdG9yeSByZXNldCBmYWlsZWQ6ICcgKyByZWFzb24pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2VuZChuZXdDb25maWcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHNlbmRDb25maWcoeyBjb25maWc6IG5ld0NvbmZpZywgdGVtcG9yYXJ5OiBmYWxzZSwgcmVxdWVzdFVwZGF0ZTogdHJ1ZSB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNlbmRDb25maWcocHJvcGVydGllcykge1xyXG4gICAgICAgICAgICB2YXIgaGFuZGxlcnMgPSBmaXJtd2FyZVZlcnNpb24uc2VyaWFsaXphdGlvbkhhbmRsZXIoKTtcclxuICAgICAgICAgICAgdmFyIG1hc2sgPSBwcm9wZXJ0aWVzLm1hc2sgfHwgaGFuZGxlcnMuQ29uZmlndXJhdGlvbkZsYWcuZW1wdHkoKTtcclxuICAgICAgICAgICAgdmFyIG5ld0NvbmZpZyA9IHByb3BlcnRpZXMuY29uZmlnIHx8IGNvbmZpZztcclxuICAgICAgICAgICAgdmFyIHJlcXVlc3RVcGRhdGUgPSBwcm9wZXJ0aWVzLnJlcXVlc3RVcGRhdGUgfHwgZmFsc2U7XHJcbiAgICAgICAgICAgIHZhciBtZXNzYWdlID0ge1xyXG4gICAgICAgICAgICAgICAgcmVxdWVzdF9yZXNwb25zZTogdHJ1ZSxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgaWYgKHByb3BlcnRpZXMudGVtcG9yYXJ5KSB7XHJcbiAgICAgICAgICAgICAgICBtZXNzYWdlLnNldF9wYXJ0aWFsX3RlbXBvcmFyeV9jb25maWcgPSBuZXdDb25maWc7XHJcbiAgICAgICAgICAgICAgICBtYXNrID0geyByZXF1ZXN0X3Jlc3BvbnNlOiB0cnVlLCBzZXRfcGFydGlhbF90ZW1wb3JhcnlfY29uZmlnOiBtYXNrIH07XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBtZXNzYWdlLnNldF9wYXJ0aWFsX2VlcHJvbV9kYXRhID0gbmV3Q29uZmlnO1xyXG4gICAgICAgICAgICAgICAgbWFzayA9IHsgcmVxdWVzdF9yZXNwb25zZTogdHJ1ZSwgc2V0X3BhcnRpYWxfZWVwcm9tX2RhdGE6IG1hc2sgfTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gc2VyaWFsLnNlbmRTdHJ1Y3R1cmUoJ0NvbW1hbmQnLCBtZXNzYWdlLCB0cnVlLCBtYXNrKS50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlcXVlc3RVcGRhdGUpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXF1ZXN0KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gdXBkYXRlQ29uZmlnRnJvbVJlbW90ZURhdGEoY29uZmlnQ2hhbmdlcykge1xyXG4gICAgICAgICAgICAvL2NvbW1hbmRMb2coJ1JlY2VpdmVkIGNvbmZpZyEnKTtcclxuICAgICAgICAgICAgY29uZmlnID0gc2VyaWFsaXphdGlvbkhhbmRsZXIudXBkYXRlRmllbGRzKGNvbmZpZywgY29uZmlnQ2hhbmdlcyk7XHJcbiAgICAgICAgICAgIHZhciB2ZXJzaW9uID0gW2NvbmZpZy52ZXJzaW9uLm1ham9yLCBjb25maWcudmVyc2lvbi5taW5vciwgY29uZmlnLnZlcnNpb24ucGF0Y2hdO1xyXG4gICAgICAgICAgICBmaXJtd2FyZVZlcnNpb24uc2V0KHZlcnNpb24pO1xyXG4gICAgICAgICAgICBpZiAoIWZpcm13YXJlVmVyc2lvbi5zdXBwb3J0ZWQoKSkge1xyXG4gICAgICAgICAgICAgICAgY29tbWFuZExvZygnUmVjZWl2ZWQgYW4gdW5zdXBwb3J0ZWQgY29uZmlndXJhdGlvbiEnKTtcclxuICAgICAgICAgICAgICAgIGNvbW1hbmRMb2coXHJcbiAgICAgICAgICAgICAgICAgICAgJ0ZvdW5kIHZlcnNpb246ICcgKyB2ZXJzaW9uWzBdICsgJy4nICsgdmVyc2lvblsxXSArICcuJyArIHZlcnNpb25bMl0gICtcclxuICAgICAgICAgICAgICAgICAgICAnIC0tLSBOZXdlc3QgdmVyc2lvbjogJyArXHJcbiAgICAgICAgICAgICAgICAgICAgZmlybXdhcmVWZXJzaW9uLmRlc2lyZWRLZXkoKSApO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29tbWFuZExvZyhcclxuICAgICAgICAgICAgICAgICAgICAnUmVjZWl2ZWQgY29uZmlndXJhdGlvbiBkYXRhICh2JyArXHJcbiAgICAgICAgICAgICAgICAgICAgdmVyc2lvblswXSArICcuJyArIHZlcnNpb25bMV0gKyAnLicgKyB2ZXJzaW9uWzJdICsnKScpO1xyXG4gICAgICAgICAgICAgICAgY29uZmlnQ2FsbGJhY2soKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2V0Q29uZmlnQ2FsbGJhY2soY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgY29uZmlnQ2FsbGJhY2sgPSBjYWxsYmFjaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNldExvZ2dpbmdDYWxsYmFjayhjYWxsYmFjaykge1xyXG4gICAgICAgICAgICBsb2dnaW5nQ2FsbGJhY2sgPSBjYWxsYmFjaztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdldENvbmZpZygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGNvbmZpZztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbmZpZyA9IGZpcm13YXJlVmVyc2lvbi5zZXJpYWxpemF0aW9uSGFuZGxlcigpLkNvbmZpZ3VyYXRpb24uZW1wdHkoKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgcmVxdWVzdDogcmVxdWVzdCxcclxuICAgICAgICAgICAgcmVpbml0OiByZWluaXQsXHJcbiAgICAgICAgICAgIHNlbmQ6IHNlbmQsXHJcbiAgICAgICAgICAgIHNlbmRDb25maWc6IHNlbmRDb25maWcsXHJcbiAgICAgICAgICAgIGdldENvbmZpZzogZ2V0Q29uZmlnLFxyXG4gICAgICAgICAgICBzZXRDb25maWdDYWxsYmFjazogc2V0Q29uZmlnQ2FsbGJhY2ssXHJcbiAgICAgICAgICAgIHNldExvZ2dpbmdDYWxsYmFjazogc2V0TG9nZ2luZ0NhbGxiYWNrLFxyXG4gICAgICAgICAgICBnZXREZXNpcmVkVmVyc2lvbjogZ2V0RGVzaXJlZFZlcnNpb24sXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxufSgpKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdmbHlicml4Q29tbW9uJykuZmFjdG9yeSgnZmlybXdhcmVWZXJzaW9uJywgZmlybXdhcmVWZXJzaW9uKTtcclxuXHJcbiAgICBmaXJtd2FyZVZlcnNpb24uJGluamVjdCA9IFsnc2VyaWFsaXphdGlvbkhhbmRsZXInXTtcclxuXHJcbiAgICBmdW5jdGlvbiBmaXJtd2FyZVZlcnNpb24oc2VyaWFsaXphdGlvbkhhbmRsZXIpIHtcclxuICAgICAgICB2YXIgdmVyc2lvbiA9IFswLCAwLCAwXTtcclxuICAgICAgICB2YXIga2V5ID0gJzAuMC4wJztcclxuICAgICAgICB2YXIgc3VwcG9ydGVkID0ge1xyXG4gICAgICAgICAgICAnMS40LjAnOiB0cnVlLFxyXG4gICAgICAgICAgICAnMS41LjAnOiB0cnVlLFxyXG4gICAgICAgICAgICAnMS41LjEnOiB0cnVlLFxyXG4gICAgICAgICAgICAnMS42LjAnOiB0cnVlLFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHZhciBkZXNpcmVkID0gWzEsIDYsIDBdO1xyXG4gICAgICAgIHZhciBkZXNpcmVkS2V5ID0gJzEuNi4wJztcclxuXHJcbiAgICAgICAgdmFyIGRlZmF1bHRTZXJpYWxpemF0aW9uSGFuZGxlciA9IHNlcmlhbGl6YXRpb25IYW5kbGVyLmdldEhhbmRsZXIoZGVzaXJlZEtleSk7XHJcbiAgICAgICAgdmFyIGN1cnJlbnRTZXJpYWxpemF0aW9uSGFuZGxlciA9IGRlZmF1bHRTZXJpYWxpemF0aW9uSGFuZGxlcjtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgdmVyc2lvbiA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAga2V5ID0gdmFsdWUuam9pbignLicpO1xyXG4gICAgICAgICAgICAgICAgY3VycmVudFNlcmlhbGl6YXRpb25IYW5kbGVyID1cclxuICAgICAgICAgICAgICAgICAgICBzZXJpYWxpemF0aW9uSGFuZGxlci5nZXRIYW5kbGVyKGRlc2lyZWRLZXkpIHx8IGRlZmF1bHRTZXJpYWxpemF0aW9uSGFuZGxlcjtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB2ZXJzaW9uO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBrZXk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGtleTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc3VwcG9ydGVkOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBzdXBwb3J0ZWRba2V5XSA9PT0gdHJ1ZTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZGVzaXJlZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZGVzaXJlZDtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZGVzaXJlZEtleTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZGVzaXJlZEtleTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc2VyaWFsaXphdGlvbkhhbmRsZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnRTZXJpYWxpemF0aW9uSGFuZGxlcjtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxufSgpKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdmbHlicml4Q29tbW9uJykuZmFjdG9yeSgnbGVkJywgbGVkKTtcclxuXHJcbiAgICBsZWQuJGluamVjdCA9IFsnZGV2aWNlQ29uZmlnJywgJ2Zpcm13YXJlVmVyc2lvbiddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGxlZChkZXZpY2VDb25maWcsIGZpcm13YXJlVmVyc2lvbikge1xyXG4gICAgICAgIHZhciBMZWRQYXR0ZXJucyA9IHtcclxuICAgICAgICAgICAgTk9fT1ZFUlJJREU6IDAsXHJcbiAgICAgICAgICAgIEZMQVNIOiAxLFxyXG4gICAgICAgICAgICBCRUFDT046IDIsXHJcbiAgICAgICAgICAgIEJSRUFUSEU6IDMsXHJcbiAgICAgICAgICAgIEFMVEVSTkFURTogNCxcclxuICAgICAgICAgICAgU09MSUQ6IDUsXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdmFyIGtleXMgPSBbJ3JpZ2h0X2Zyb250JywgJ3JpZ2h0X2JhY2snLCAnbGVmdF9mcm9udCcsICdsZWZ0X2JhY2snXTtcclxuICAgICAgICB2YXIgY29sb3JzID0ge307XHJcblxyXG4gICAgICAgIGtleXMuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcclxuICAgICAgICAgICAgY29sb3JzW2tleV0gPSB7XHJcbiAgICAgICAgICAgICAgICByZWQ6IDAsXHJcbiAgICAgICAgICAgICAgICBncmVlbjogMCxcclxuICAgICAgICAgICAgICAgIGJsdWU6IDAsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdmFyIGxlZFN0YXRlID0ge1xyXG4gICAgICAgICAgICBzdGF0dXM6IDY1NTM1LFxyXG4gICAgICAgICAgICBwYXR0ZXJuOiBMZWRQYXR0ZXJucy5TT0xJRCxcclxuICAgICAgICAgICAgY29sb3JzOiBjb2xvcnMsXHJcbiAgICAgICAgICAgIGluZGljYXRvcl9yZWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICBpbmRpY2F0b3JfZ3JlZW46IGZhbHNlLFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHZhciBjb25maWdQYXJ0ID0geyBsZWRfc3RhdGVzOiBbbGVkU3RhdGVdIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNldChcclxuICAgICAgICAgICAgY29sb3JfcmYsIGNvbG9yX3JiLCBjb2xvcl9sZiwgY29sb3JfbGIsIHBhdHRlcm4sIHJlZCwgZ3JlZW4pIHtcclxuICAgICAgICAgICAgbGVkU3RhdGUuc3RhdHVzID0gZmlybXdhcmVWZXJzaW9uLnNlcmlhbGl6YXRpb25IYW5kbGVyKCkuU3RhdHVzRmxhZy5lbXB0eSgpO1xyXG4gICAgICAgICAgICBpZiAocGF0dGVybiA+IDAgJiYgcGF0dGVybiA8IDYpIHtcclxuICAgICAgICAgICAgICAgIGxlZFN0YXRlLnBhdHRlcm4gPSBwYXR0ZXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFtjb2xvcl9yZiwgY29sb3JfcmIsIGNvbG9yX2xmLCBjb2xvcl9sYl0uZm9yRWFjaChmdW5jdGlvbihcclxuICAgICAgICAgICAgICAgIGNvbG9yLCBpZHgpIHtcclxuICAgICAgICAgICAgICAgIGlmICghY29sb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB2YXIgdiA9IGNvbG9yc1trZXlzW2lkeF1dO1xyXG4gICAgICAgICAgICAgICAgdi5yZWQgPSBjb2xvci5yZWQ7XHJcbiAgICAgICAgICAgICAgICB2LmdyZWVuID0gY29sb3IuZ3JlZW47XHJcbiAgICAgICAgICAgICAgICB2LmJsdWUgPSBjb2xvci5ibHVlO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgaWYgKHJlZCAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICBsZWRTdGF0ZS5pbmRpY2F0b3JfcmVkID0gcmVkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChncmVlbiAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICBsZWRTdGF0ZS5pbmRpY2F0b3JfZ3JlZW4gPSBncmVlbjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgYXBwbHkoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNldFNpbXBsZShyZWQsIGdyZWVuLCBibHVlKSB7XHJcbiAgICAgICAgICAgIHZhciBjb2xvciA9IHtyZWQ6IHJlZCB8fCAwLCBncmVlbjogZ3JlZW4gfHwgMCwgYmx1ZTogYmx1ZSB8fCAwfTtcclxuICAgICAgICAgICAgc2V0KGNvbG9yLCBjb2xvciwgY29sb3IsIGNvbG9yLCBMZWRQYXR0ZXJucy5TT0xJRCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBhcHBseSgpIHtcclxuICAgICAgICAgICAgZGV2aWNlQ29uZmlnLnNlbmRDb25maWcoe1xyXG4gICAgICAgICAgICAgICAgY29uZmlnOiBjb25maWdQYXJ0LFxyXG4gICAgICAgICAgICAgICAgdGVtcG9yYXJ5OiB0cnVlLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHNldDogc2V0LFxyXG4gICAgICAgICAgICBzZXRTaW1wbGU6IHNldFNpbXBsZSxcclxuICAgICAgICAgICAgcGF0dGVybnM6IExlZFBhdHRlcm5zLFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG59KCkpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ2ZseWJyaXhDb21tb24nKS5mYWN0b3J5KCdyY0RhdGEnLCByY0RhdGEpO1xyXG5cclxuICAgIHJjRGF0YS4kaW5qZWN0ID0gWydzZXJpYWwnXTtcclxuXHJcbiAgICBmdW5jdGlvbiByY0RhdGEoc2VyaWFsKSB7XHJcbiAgICAgICAgdmFyIEFVWCA9IHtcclxuICAgICAgICAgICAgTE9XOiAwLFxyXG4gICAgICAgICAgICBNSUQ6IDEsXHJcbiAgICAgICAgICAgIEhJR0g6IDIsXHJcbiAgICAgICAgfTtcclxuICAgICAgICB2YXIgYXV4TmFtZXMgPSBbJ2xvdycsICdtaWQnLCAnaGlnaCddO1xyXG5cclxuICAgICAgICB2YXIgdGhyb3R0bGUgPSAtMTtcclxuICAgICAgICB2YXIgcGl0Y2ggPSAwO1xyXG4gICAgICAgIHZhciByb2xsID0gMDtcclxuICAgICAgICB2YXIgeWF3ID0gMDtcclxuICAgICAgICAvLyBkZWZhdWx0cyB0byBoaWdoIC0tIGxvdyBpcyBlbmFibGluZzsgaGlnaCBpcyBkaXNhYmxpbmdcclxuICAgICAgICB2YXIgYXV4MSA9IEFVWC5ISUdIO1xyXG4gICAgICAgIC8vIGRlZmF1bHRzIHRvID8/IC0tIG5lZWQgdG8gY2hlY2sgdHJhbnNtaXR0ZXIgYmVoYXZpb3JcclxuICAgICAgICB2YXIgYXV4MiA9IEFVWC5ISUdIO1xyXG5cclxuICAgICAgICB2YXIgdXJnZW50ID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgc2V0VGhyb3R0bGU6IHNldFRocm90dGxlLFxyXG4gICAgICAgICAgICBzZXRQaXRjaDogc2V0UGl0Y2gsXHJcbiAgICAgICAgICAgIHNldFJvbGw6IHNldFJvbGwsXHJcbiAgICAgICAgICAgIHNldFlhdzogc2V0WWF3LFxyXG4gICAgICAgICAgICBzZXRBdXgxOiBzZXRBdXgxLFxyXG4gICAgICAgICAgICBzZXRBdXgyOiBzZXRBdXgyLFxyXG4gICAgICAgICAgICBnZXRUaHJvdHRsZTogZ2V0VGhyb3R0bGUsXHJcbiAgICAgICAgICAgIGdldFBpdGNoOiBnZXRQaXRjaCxcclxuICAgICAgICAgICAgZ2V0Um9sbDogZ2V0Um9sbCxcclxuICAgICAgICAgICAgZ2V0WWF3OiBnZXRZYXcsXHJcbiAgICAgICAgICAgIGdldEF1eDE6IGdldEF1eDEsXHJcbiAgICAgICAgICAgIGdldEF1eDI6IGdldEF1eDIsXHJcbiAgICAgICAgICAgIEFVWDogQVVYLFxyXG4gICAgICAgICAgICBzZW5kOiBzZW5kLFxyXG4gICAgICAgICAgICBmb3JjZU5leHRTZW5kOiBmb3JjZU5leHRTZW5kLFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNlbmQoKSB7XHJcbiAgICAgICAgICAgIGlmICghdXJnZW50ICYmIHNlcmlhbC5idXN5KCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB1cmdlbnQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgIHZhciBjb21tYW5kID0ge307XHJcblxyXG4gICAgICAgICAgICAvLyBpbnZlcnQgcGl0Y2ggYW5kIHJvbGxcclxuICAgICAgICAgICAgdmFyIHRocm90dGxlX3RocmVzaG9sZCA9XHJcbiAgICAgICAgICAgICAgICAtMC44OyAgLy8ga2VlcCBib3R0b20gMTAlIG9mIHRocm90dGxlIHN0aWNrIHRvIG1lYW4gJ29mZidcclxuICAgICAgICAgICAgY29tbWFuZC50aHJvdHRsZSA9IGNvbnN0cmFpbihcclxuICAgICAgICAgICAgICAgICh0aHJvdHRsZSAtIHRocm90dGxlX3RocmVzaG9sZCkgKiA0MDk1IC9cclxuICAgICAgICAgICAgICAgICAgICAoMSAtIHRocm90dGxlX3RocmVzaG9sZCksXHJcbiAgICAgICAgICAgICAgICAwLCA0MDk1KTtcclxuICAgICAgICAgICAgY29tbWFuZC5waXRjaCA9XHJcbiAgICAgICAgICAgICAgICBjb25zdHJhaW4oLShhcHBseURlYWR6b25lKHBpdGNoLCAwLjEpKSAqIDQwOTUgLyAyLCAtMjA0NywgMjA0Nyk7XHJcbiAgICAgICAgICAgIGNvbW1hbmQucm9sbCA9XHJcbiAgICAgICAgICAgICAgICBjb25zdHJhaW4oKGFwcGx5RGVhZHpvbmUocm9sbCwgMC4xKSkgKiA0MDk1IC8gMiwgLTIwNDcsIDIwNDcpO1xyXG4gICAgICAgICAgICBjb21tYW5kLnlhdyA9XHJcbiAgICAgICAgICAgICAgICBjb25zdHJhaW4oLShhcHBseURlYWR6b25lKHlhdywgMC4xKSkgKiA0MDk1IC8gMiwgLTIwNDcsIDIwNDcpO1xyXG5cclxuICAgICAgICAgICAgdmFyIGF1eF9tYXNrID0ge307XHJcbiAgICAgICAgICAgIC8vIGF1eDFfbG93LCBhdXgxX21pZCwgYXV4MV9oaWdoLCBhbmQgc2FtZSB3aXRoIGF1eDJcclxuICAgICAgICAgICAgYXV4X21hc2tbJ2F1eDFfJyArIGF1eE5hbWVzW2F1eDFdXSA9IHRydWU7XHJcbiAgICAgICAgICAgIGF1eF9tYXNrWydhdXgyXycgKyBhdXhOYW1lc1thdXgyXV0gPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHNlcmlhbC5zZW5kU3RydWN0dXJlKCdDb21tYW5kJywge1xyXG4gICAgICAgICAgICAgICAgcmVxdWVzdF9yZXNwb25zZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHNldF9zZXJpYWxfcmM6IHtcclxuICAgICAgICAgICAgICAgICAgICBlbmFibGVkOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbW1hbmQ6IGNvbW1hbmQsXHJcbiAgICAgICAgICAgICAgICAgICAgYXV4X21hc2s6IGF1eF9tYXNrLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSwgZmFsc2UpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2V0VGhyb3R0bGUodikge1xyXG4gICAgICAgICAgICB0aHJvdHRsZSA9IHY7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZXRQaXRjaCh2KSB7XHJcbiAgICAgICAgICAgIHBpdGNoID0gdjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNldFJvbGwodikge1xyXG4gICAgICAgICAgICByb2xsID0gdjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNldFlhdyh2KSB7XHJcbiAgICAgICAgICAgIHlhdyA9IHY7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZXRBdXgxKHYpIHtcclxuICAgICAgICAgICAgYXV4MSA9IE1hdGgubWF4KDAsIE1hdGgubWluKDIsIHYpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNldEF1eDIodikge1xyXG4gICAgICAgICAgICBhdXgyID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oMiwgdikpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0VGhyb3R0bGUoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aHJvdHRsZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdldFBpdGNoKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gcGl0Y2g7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRSb2xsKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gcm9sbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdldFlhdygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHlhdztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdldEF1eDEoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBhdXgxO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0QXV4MigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGF1eDI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBmb3JjZU5leHRTZW5kKCkge1xyXG4gICAgICAgICAgICB1cmdlbnQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gY29uc3RyYWluKHgsIHhtaW4sIHhtYXgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE1hdGgubWF4KHhtaW4sIE1hdGgubWluKHgsIHhtYXgpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFwcGx5RGVhZHpvbmUodmFsdWUsIGRlYWR6b25lKSB7XHJcbiAgICAgICAgICAgIGlmICh2YWx1ZSA+IGRlYWR6b25lKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUgLSBkZWFkem9uZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodmFsdWUgPCAtZGVhZHpvbmUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSArIGRlYWR6b25lO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSgpKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdmbHlicml4Q29tbW9uJykuZmFjdG9yeSgnc2VyaWFsJywgc2VyaWFsKTtcclxuXHJcbiAgICBzZXJpYWwuJGluamVjdCA9IFsnJHRpbWVvdXQnLCAnJHEnLCAnY29icycsICdjb21tYW5kTG9nJywgJ2Zpcm13YXJlVmVyc2lvbicsICdzZXJpYWxpemF0aW9uSGFuZGxlciddO1xyXG5cclxuICAgIGZ1bmN0aW9uIHNlcmlhbCgkdGltZW91dCwgJHEsIGNvYnMsIGNvbW1hbmRMb2csIGZpcm13YXJlVmVyc2lvbiwgc2VyaWFsaXphdGlvbkhhbmRsZXIpIHtcclxuICAgICAgICB2YXIgTWVzc2FnZVR5cGUgPSB7XHJcbiAgICAgICAgICAgIFN0YXRlOiAwLFxyXG4gICAgICAgICAgICBDb21tYW5kOiAxLFxyXG4gICAgICAgICAgICBEZWJ1Z1N0cmluZzogMyxcclxuICAgICAgICAgICAgSGlzdG9yeURhdGE6IDQsXHJcbiAgICAgICAgICAgIFByb3RvY29sOiAxMjgsXHJcbiAgICAgICAgICAgIFJlc3BvbnNlOiAyNTUsXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdmFyIGFja25vd2xlZGdlcyA9IFtdO1xyXG4gICAgICAgIHZhciBiYWNrZW5kID0gbmV3IEJhY2tlbmQoKTtcclxuXHJcbiAgICAgICAgdmFyIG9uUmVjZWl2ZUxpc3RlbmVycyA9IFtdO1xyXG5cclxuICAgICAgICB2YXIgY29ic1JlYWRlciA9IG5ldyBjb2JzLlJlYWRlcigxMDAwMCk7XHJcbiAgICAgICAgdmFyIGJ5dGVzSGFuZGxlciA9IHVuZGVmaW5lZDtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gQmFja2VuZCgpIHtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIEJhY2tlbmQucHJvdG90eXBlLmJ1c3kgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIEJhY2tlbmQucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICAgIGNvbW1hbmRMb2coJ05vIFwic2VuZFwiIGRlZmluZWQgZm9yIHNlcmlhbCBiYWNrZW5kJyk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgQmFja2VuZC5wcm90b3R5cGUub25SZWFkID0gZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICBjb21tYW5kTG9nKCdObyBcIm9uUmVhZFwiIGRlZmluZWQgZm9yIHNlcmlhbCBiYWNrZW5kJyk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdmFyIE1lc3NhZ2VUeXBlSW52ZXJzaW9uID0gW107XHJcbiAgICAgICAgT2JqZWN0LmtleXMoTWVzc2FnZVR5cGUpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XHJcbiAgICAgICAgICAgIE1lc3NhZ2VUeXBlSW52ZXJzaW9uW01lc3NhZ2VUeXBlW2tleV1dID0ga2V5O1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBhZGRPblJlY2VpdmVDYWxsYmFjayhmdW5jdGlvbihtZXNzYWdlVHlwZSwgbWVzc2FnZSkge1xyXG4gICAgICAgICAgICBpZiAobWVzc2FnZVR5cGUgPT09ICdSZXNwb25zZScpIHtcclxuICAgICAgICAgICAgICAgIGFja25vd2xlZGdlKG1lc3NhZ2UubWFzaywgbWVzc2FnZS5hY2spO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKG1lc3NhZ2VUeXBlID09PSAnUHJvdG9jb2wnKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IG1lc3NhZ2UucmVzcG9uc2U7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlcmlhbGl6YXRpb25IYW5kbGVyLmFkZEhhbmRsZXIoZGF0YS52ZXJzaW9uLCBkYXRhLnN0cnVjdHVyZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgYnVzeTogYnVzeSxcclxuICAgICAgICAgICAgc2VuZFN0cnVjdHVyZTogc2VuZFN0cnVjdHVyZSxcclxuICAgICAgICAgICAgc2V0QmFja2VuZDogc2V0QmFja2VuZCxcclxuICAgICAgICAgICAgYWRkT25SZWNlaXZlQ2FsbGJhY2s6IGFkZE9uUmVjZWl2ZUNhbGxiYWNrLFxyXG4gICAgICAgICAgICByZW1vdmVPblJlY2VpdmVDYWxsYmFjazogcmVtb3ZlT25SZWNlaXZlQ2FsbGJhY2ssXHJcbiAgICAgICAgICAgIHNldEJ5dGVzSGFuZGxlcjogc2V0Qnl0ZXNIYW5kbGVyLFxyXG4gICAgICAgICAgICBoYW5kbGVQb3N0Q29ubmVjdDogaGFuZGxlUG9zdENvbm5lY3QsXHJcbiAgICAgICAgICAgIEJhY2tlbmQ6IEJhY2tlbmQsXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2V0QmFja2VuZCh2KSB7XHJcbiAgICAgICAgICAgIGJhY2tlbmQgPSB2O1xyXG4gICAgICAgICAgICBiYWNrZW5kLm9uUmVhZCA9IHJlYWQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBoYW5kbGVQb3N0Q29ubmVjdCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlcXVlc3RGaXJtd2FyZVZlcnNpb24oKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHJlcXVlc3RGaXJtd2FyZVZlcnNpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzZW5kU3RydWN0dXJlKCdDb21tYW5kJywge1xyXG4gICAgICAgICAgICAgICAgcmVxdWVzdF9yZXNwb25zZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHJlcV9wYXJ0aWFsX2VlcHJvbV9kYXRhOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmVyc2lvbjogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2VuZFN0cnVjdHVyZShtZXNzYWdlVHlwZSwgZGF0YSwgbG9nX3NlbmQsIGV4dHJhTWFzaykge1xyXG4gICAgICAgICAgICBpZiAobWVzc2FnZVR5cGUgPT09ICdTdGF0ZScpIHtcclxuICAgICAgICAgICAgICAgIGRhdGEgPSBwcm9jZXNzU3RhdGVPdXRwdXQoZGF0YSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIGhhbmRsZXJzID0gZmlybXdhcmVWZXJzaW9uLnNlcmlhbGl6YXRpb25IYW5kbGVyKCk7XHJcblxyXG4gICAgICAgICAgICB2YXIgcmVzcG9uc2UgPSAkcS5kZWZlcigpO1xyXG4gICAgICAgICAgICBpZiAoIShtZXNzYWdlVHlwZSBpbiBNZXNzYWdlVHlwZSkpIHtcclxuICAgICAgICAgICAgICAgIHJlc3BvbnNlLnJlamVjdCgnTWVzc2FnZSB0eXBlIFwiJyArIG1lc3NhZ2VUeXBlICtcclxuICAgICAgICAgICAgICAgICAgICAnXCIgbm90IHN1cHBvcnRlZCBieSBhcHAsIHN1cHBvcnRlZCBtZXNzYWdlIHR5cGVzIGFyZTonICtcclxuICAgICAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyhNZXNzYWdlVHlwZSkuam9pbignLCAnKSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UucHJvbWlzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIShtZXNzYWdlVHlwZSBpbiBoYW5kbGVycykpIHtcclxuICAgICAgICAgICAgICAgIHJlc3BvbnNlLnJlamVjdCgnTWVzc2FnZSB0eXBlIFwiJyArIG1lc3NhZ2VUeXBlICtcclxuICAgICAgICAgICAgICAgICAgICAnXCIgbm90IHN1cHBvcnRlZCBieSBmaXJtd2FyZSwgc3VwcG9ydGVkIG1lc3NhZ2UgdHlwZXMgYXJlOicgK1xyXG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKGhhbmRsZXJzKS5qb2luKCcsICcpKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5wcm9taXNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciB0eXBlQ29kZSA9IE1lc3NhZ2VUeXBlW21lc3NhZ2VUeXBlXTtcclxuICAgICAgICAgICAgdmFyIGhhbmRsZXIgPSBoYW5kbGVyc1ttZXNzYWdlVHlwZV07XHJcblxyXG4gICAgICAgICAgICB2YXIgYnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoaGFuZGxlci5ieXRlQ291bnQpO1xyXG5cclxuICAgICAgICAgICAgdmFyIHNlcmlhbGl6ZXIgPSBuZXcgc2VyaWFsaXphdGlvbkhhbmRsZXIuU2VyaWFsaXplcihuZXcgRGF0YVZpZXcoYnVmZmVyLmJ1ZmZlcikpO1xyXG4gICAgICAgICAgICBoYW5kbGVyLmVuY29kZShzZXJpYWxpemVyLCBkYXRhLCBleHRyYU1hc2spO1xyXG4gICAgICAgICAgICB2YXIgbWFzayA9IGhhbmRsZXIubWFza0FycmF5KGRhdGEsIGV4dHJhTWFzayk7XHJcbiAgICAgICAgICAgIGlmIChtYXNrLmxlbmd0aCA8IDUpIHtcclxuICAgICAgICAgICAgICAgIG1hc2sgPSAobWFza1swXSA8PCAwKSB8IChtYXNrWzFdIDw8IDgpIHwgKG1hc2tbMl0gPDwgMTYpIHwgKG1hc2tbM10gPDwgMjQpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2YXIgZGF0YUxlbmd0aCA9IHNlcmlhbGl6ZXIuaW5kZXg7XHJcblxyXG4gICAgICAgICAgICB2YXIgb3V0cHV0ID0gbmV3IFVpbnQ4QXJyYXkoZGF0YUxlbmd0aCArIDMpO1xyXG4gICAgICAgICAgICBvdXRwdXRbMF0gPSBvdXRwdXRbMV0gPSB0eXBlQ29kZTtcclxuICAgICAgICAgICAgZm9yICh2YXIgaWR4ID0gMDsgaWR4IDwgZGF0YUxlbmd0aDsgKytpZHgpIHtcclxuICAgICAgICAgICAgICAgIG91dHB1dFswXSBePSBvdXRwdXRbaWR4ICsgMl0gPSBidWZmZXJbaWR4XTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBvdXRwdXRbZGF0YUxlbmd0aCArIDJdID0gMDtcclxuXHJcbiAgICAgICAgICAgIGFja25vd2xlZGdlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIG1hc2s6IG1hc2ssXHJcbiAgICAgICAgICAgICAgICByZXNwb25zZTogcmVzcG9uc2UsXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBiYWNrZW5kLnNlbmQobmV3IFVpbnQ4QXJyYXkoY29icy5lbmNvZGUob3V0cHV0KSkpO1xyXG4gICAgICAgICAgICB9LCAwKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChsb2dfc2VuZCkge1xyXG4gICAgICAgICAgICAgICAgY29tbWFuZExvZygnU2VuZGluZyBjb21tYW5kICcgKyB0eXBlQ29kZSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5wcm9taXNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYnVzeSgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGJhY2tlbmQuYnVzeSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2V0Qnl0ZXNIYW5kbGVyKGhhbmRsZXIpIHtcclxuICAgICAgICAgICAgYnl0ZXNIYW5kbGVyID0gaGFuZGxlcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHJlYWQoZGF0YSkge1xyXG4gICAgICAgICAgICBpZiAoYnl0ZXNIYW5kbGVyKVxyXG4gICAgICAgICAgICAgICAgYnl0ZXNIYW5kbGVyKGRhdGEsIHByb2Nlc3NEYXRhKTtcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgY29ic1JlYWRlci5yZWFkQnl0ZXMoZGF0YSwgcHJvY2Vzc0RhdGEsIHJlcG9ydElzc3Vlcyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiByZXBvcnRJc3N1ZXMoaXNzdWUsIHRleHQpIHtcclxuICAgICAgICAgICAgY29tbWFuZExvZygnQ09CUyBkZWNvZGluZyBmYWlsZWQgKCcgKyBpc3N1ZSArICcpOiAnICsgdGV4dCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBhZGRPblJlY2VpdmVDYWxsYmFjayhjYWxsYmFjaykge1xyXG4gICAgICAgICAgICBvblJlY2VpdmVMaXN0ZW5lcnMgPSBvblJlY2VpdmVMaXN0ZW5lcnMuY29uY2F0KFtjYWxsYmFja10pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gcmVtb3ZlT25SZWNlaXZlQ2FsbGJhY2soY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgb25SZWNlaXZlTGlzdGVuZXJzID0gb25SZWNlaXZlTGlzdGVuZXJzLmZpbHRlcihmdW5jdGlvbihjYikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNiICE9PSBjYWxsYmFjaztcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBhY2tub3dsZWRnZShtYXNrLCB2YWx1ZSkge1xyXG4gICAgICAgICAgICB3aGlsZSAoYWNrbm93bGVkZ2VzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIHZhciB2ID0gYWNrbm93bGVkZ2VzLnNoaWZ0KCk7XHJcbiAgICAgICAgICAgICAgICBpZiAodi5tYXNrIF4gbWFzaykge1xyXG4gICAgICAgICAgICAgICAgICAgIHYucmVzcG9uc2UucmVqZWN0KCdNaXNzaW5nIEFDSycpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdmFyIHJlbGF4ZWRNYXNrID0gbWFzaztcclxuICAgICAgICAgICAgICAgIHJlbGF4ZWRNYXNrICY9IH4xO1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlbGF4ZWRNYXNrIF4gdmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICB2LnJlc3BvbnNlLnJlamVjdCgnUmVxdWVzdCB3YXMgbm90IGZ1bGx5IHByb2Nlc3NlZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdi5yZXNwb25zZS5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gcHJvY2Vzc0RhdGEoYnl0ZXMpIHtcclxuICAgICAgICAgICAgdmFyIG1lc3NhZ2VUeXBlID0gTWVzc2FnZVR5cGVJbnZlcnNpb25bYnl0ZXNbMF1dO1xyXG4gICAgICAgICAgICB2YXIgaGFuZGxlciA9IGZpcm13YXJlVmVyc2lvbi5zZXJpYWxpemF0aW9uSGFuZGxlcigpW21lc3NhZ2VUeXBlXTtcclxuICAgICAgICAgICAgaWYgKCFtZXNzYWdlVHlwZSB8fCAhaGFuZGxlcikge1xyXG4gICAgICAgICAgICAgICAgY29tbWFuZExvZygnSWxsZWdhbCBtZXNzYWdlIHR5cGUgcGFzc2VkIGZyb20gZmlybXdhcmUnKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHNlcmlhbGl6ZXIgPSBuZXcgc2VyaWFsaXphdGlvbkhhbmRsZXIuU2VyaWFsaXplcihuZXcgRGF0YVZpZXcoYnl0ZXMuYnVmZmVyLCAxKSk7XHJcbiAgICAgICAgICAgICAgICB2YXIgbWVzc2FnZSA9IGhhbmRsZXIuZGVjb2RlKHNlcmlhbGl6ZXIpO1xyXG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICAgICAgICAgIGNvbW1hbmRMb2coJ1VucmVjb2duaXplZCBtZXNzYWdlIGZvcm1hdCByZWNlaXZlZCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChtZXNzYWdlVHlwZSA9PT0gJ1N0YXRlJykge1xyXG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IHByb2Nlc3NTdGF0ZUlucHV0KG1lc3NhZ2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG9uUmVjZWl2ZUxpc3RlbmVycy5mb3JFYWNoKGZ1bmN0aW9uKGxpc3RlbmVyKSB7XHJcbiAgICAgICAgICAgICAgICBsaXN0ZW5lcihtZXNzYWdlVHlwZSwgbWVzc2FnZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIGxhc3RfdGltZXN0YW1wX3VzID0gMDtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gcHJvY2Vzc1N0YXRlSW5wdXQoc3RhdGUpIHtcclxuICAgICAgICAgICAgc3RhdGUgPSBPYmplY3QuYXNzaWduKHt9LCBzdGF0ZSk7XHJcbiAgICAgICAgICAgIHZhciBzZXJpYWxfdXBkYXRlX3JhdGVfSHogPSAwO1xyXG5cclxuICAgICAgICAgICAgaWYgKCd0aW1lc3RhbXBfdXMnIGluIHN0YXRlKSB7XHJcbiAgICAgICAgICAgICAgICBzdGF0ZS5zZXJpYWxfdXBkYXRlX3JhdGVfZXN0aW1hdGUgPSAxMDAwMDAwIC8gKHN0YXRlLnRpbWVzdGFtcF91cyAtIGxhc3RfdGltZXN0YW1wX3VzKTtcclxuICAgICAgICAgICAgICAgIGxhc3RfdGltZXN0YW1wX3VzID0gc3RhdGUudGltZXN0YW1wX3VzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICgndGVtcGVyYXR1cmUnIGluIHN0YXRlKSB7XHJcbiAgICAgICAgICAgICAgICBzdGF0ZS50ZW1wZXJhdHVyZSAvPSAxMDAuMDsgIC8vIHRlbXBlcmF0dXJlIGdpdmVuIGluIENlbHNpdXMgKiAxMDBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoJ3ByZXNzdXJlJyBpbiBzdGF0ZSkge1xyXG4gICAgICAgICAgICAgICAgc3RhdGUucHJlc3N1cmUgLz0gMjU2LjA7ICAvLyBwcmVzc3VyZSBnaXZlbiBpbiAoUTI0LjgpIGZvcm1hdFxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBwcm9jZXNzU3RhdGVPdXRwdXQoc3RhdGUpIHtcclxuICAgICAgICAgICAgc3RhdGUgPSBPYmplY3QuYXNzaWduKHt9LCBzdGF0ZSk7XHJcbiAgICAgICAgICAgIGlmICgndGVtcGVyYXR1cmUnIGluIHN0YXRlKSB7XHJcbiAgICAgICAgICAgICAgICBzdGF0ZS50ZW1wZXJhdHVyZSAqPSAxMDAuMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoJ3ByZXNzdXJlJyBpbiBzdGF0ZSkge1xyXG4gICAgICAgICAgICAgICAgc3RhdGUucHJlc3N1cmUgKj0gMjU2LjA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSgpKTtcclxuIiwiKGZ1bmN0aW9uICgpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBzZXJpYWxpemF0aW9uSGFuZGxlci4kaW5qZWN0ID0gW107XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ2ZseWJyaXhDb21tb24nKS5mYWN0b3J5KCdzZXJpYWxpemF0aW9uSGFuZGxlcicsIHNlcmlhbGl6YXRpb25IYW5kbGVyKTtcclxuXHJcbiAgICBmdW5jdGlvbiBzZXJpYWxpemF0aW9uSGFuZGxlcigpIHtcclxuICAgICAgICB2YXIgaGFuZGxlckNhY2hlID0ge307XHJcbiAgICAgICAgdmFyIHZlcnNpb24gPSAnVmVyc2lvbiA9IHsgbWFqb3I6IHU4LCBtaW5vcjogdTgsIHBhdGNoOiB1OCB9Oyc7XHJcbiAgICAgICAgdmFyIGNvbmZpZ0lkID0gJ0NvbmZpZ0lEID0gdTMyOyc7XHJcblxyXG4gICAgICAgIHZhciB2ZWN0b3IzZiA9ICdWZWN0b3IzZiA9IHsgeDogZjMyLCB5OiBmMzIsIHo6IGYzMiB9Oyc7XHJcblxyXG4gICAgICAgIHZhciBwY2JUcmFuc2Zvcm0gPSAnUGNiVHJhbnNmb3JtID0geyBvcmllbnRhdGlvbjogVmVjdG9yM2YsIHRyYW5zbGF0aW9uOiBWZWN0b3IzZiB9Oyc7XHJcbiAgICAgICAgdmFyIG1peFRhYmxlID0gJ01peFRhYmxlID0geyBmejogW2k4OjhdLCB0eDogW2k4OjhdLCB0eTogW2k4OjhdLCB0ejogW2k4OjhdIH07JztcclxuICAgICAgICB2YXIgbWFnQmlhcyA9ICdNYWdCaWFzID0geyBvZmZzZXQ6IFZlY3RvcjNmIH07JztcclxuICAgICAgICB2YXIgY2hhbm5lbFByb3BlcnRpZXMgPSAnQ2hhbm5lbFByb3BlcnRpZXMgPSB7JyArXHJcbiAgICAgICAgICAgICdhc3NpZ25tZW50OiBbdTg6Nl0sJyArXHJcbiAgICAgICAgICAgICdpbnZlcnNpb246IHU4LCcgK1xyXG4gICAgICAgICAgICAnbWlkcG9pbnQ6IFt1MTY6Nl0sJyArXHJcbiAgICAgICAgICAgICdkZWFkem9uZTogW3UxNjo2XSB9Oyc7XHJcblxyXG4gICAgICAgIHZhciBwaWRTZXR0aW5ncyA9ICdQSURTZXR0aW5ncyA9IHsnICtcclxuICAgICAgICAgICAgJ2twOiBmMzIsJyArXHJcbiAgICAgICAgICAgICdraTogZjMyLCcgK1xyXG4gICAgICAgICAgICAna2Q6IGYzMiwnICtcclxuICAgICAgICAgICAgJ2ludGVncmFsX3dpbmR1cF9ndWFyZDogZjMyLCcgK1xyXG4gICAgICAgICAgICAnZF9maWx0ZXJfdGltZTogZjMyLCcgK1xyXG4gICAgICAgICAgICAnc2V0cG9pbnRfZmlsdGVyX3RpbWU6IGYzMiwnICtcclxuICAgICAgICAgICAgJ2NvbW1hbmRfdG9fdmFsdWU6IGYzMiB9Oyc7XHJcbiAgICAgICAgdmFyIHBpZFBhcmFtZXRlcnMxNCA9ICdQSURQYXJhbWV0ZXJzID0geycgK1xyXG4gICAgICAgICAgICAndGhydXN0X21hc3RlcjogUElEU2V0dGluZ3MsJyArXHJcbiAgICAgICAgICAgICdwaXRjaF9tYXN0ZXI6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAncm9sbF9tYXN0ZXI6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAneWF3X21hc3RlcjogUElEU2V0dGluZ3MsJyArXHJcbiAgICAgICAgICAgICd0aHJ1c3Rfc2xhdmU6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAncGl0Y2hfc2xhdmU6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAncm9sbF9zbGF2ZTogUElEU2V0dGluZ3MsJyArXHJcbiAgICAgICAgICAgICd5YXdfc2xhdmU6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAncGlkX2J5cGFzczogdTggfTsnO1xyXG4gICAgICAgIHZhciBwaWRQYXJhbWV0ZXJzID0gJ1BJRFBhcmFtZXRlcnMgPSB7JyArXHJcbiAgICAgICAgICAgICd0aHJ1c3RfbWFzdGVyOiBQSURTZXR0aW5ncywnICtcclxuICAgICAgICAgICAgJ3BpdGNoX21hc3RlcjogUElEU2V0dGluZ3MsJyArXHJcbiAgICAgICAgICAgICdyb2xsX21hc3RlcjogUElEU2V0dGluZ3MsJyArXHJcbiAgICAgICAgICAgICd5YXdfbWFzdGVyOiBQSURTZXR0aW5ncywnICtcclxuICAgICAgICAgICAgJ3RocnVzdF9zbGF2ZTogUElEU2V0dGluZ3MsJyArXHJcbiAgICAgICAgICAgICdwaXRjaF9zbGF2ZTogUElEU2V0dGluZ3MsJyArXHJcbiAgICAgICAgICAgICdyb2xsX3NsYXZlOiBQSURTZXR0aW5ncywnICtcclxuICAgICAgICAgICAgJ3lhd19zbGF2ZTogUElEU2V0dGluZ3MsJyArXHJcbiAgICAgICAgICAgICd0aHJ1c3RfZ2FpbjogZjMyLCcgK1xyXG4gICAgICAgICAgICAncGl0Y2hfZ2FpbjogZjMyLCcgK1xyXG4gICAgICAgICAgICAncm9sbF9nYWluOiBmMzIsJyArXHJcbiAgICAgICAgICAgICd5YXdfZ2FpbjogZjMyLCcgK1xyXG4gICAgICAgICAgICAncGlkX2J5cGFzczogdTggfTsnO1xyXG5cclxuICAgICAgICB2YXIgc3RhdGVQYXJhbWV0ZXJzID0gJ1N0YXRlUGFyYW1ldGVycyA9IHsgc3RhdGVfZXN0aW1hdGlvbjogW2YzMjoyXSwgZW5hYmxlOiBbZjMyOjJdIH07JztcclxuXHJcbiAgICAgICAgdmFyIHN0YXR1c0ZsYWcxNDE1ID0gJ1N0YXR1c0ZsYWcgPSB7LzE2LycgK1xyXG4gICAgICAgICAgICAnYm9vdDogdm9pZCwnICtcclxuICAgICAgICAgICAgJ21wdV9mYWlsOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnYm1wX2ZhaWw6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdyeF9mYWlsOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnaWRsZTogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2VuYWJsaW5nOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnY2xlYXJfbXB1X2JpYXM6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdzZXRfbXB1X2JpYXM6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdmYWlsX3N0YWJpbGl0eTogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2ZhaWxfYW5nbGU6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdlbmFibGVkOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnYmF0dGVyeV9sb3c6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICd0ZW1wX3dhcm5pbmc6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdsb2dfZnVsbDogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2ZhaWxfb3RoZXI6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdvdmVycmlkZTogdm9pZCB9Oyc7XHJcblxyXG4gICAgICAgIHZhciBzdGF0dXNGbGFnID0gJ1N0YXR1c0ZsYWcgPSB7LzE2LycgK1xyXG4gICAgICAgICAgICAnXzA6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdfMTogdm9pZCwnICtcclxuICAgICAgICAgICAgJ18yOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnbm9fc2lnbmFsOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnaWRsZTogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2FybWluZzogdm9pZCwnICtcclxuICAgICAgICAgICAgJ3JlY29yZGluZ19zZDogdm9pZCwnICtcclxuICAgICAgICAgICAgJ183OiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnbG9vcF9zbG93OiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnXzk6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdhcm1lZDogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2JhdHRlcnlfbG93OiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnYmF0dGVyeV9jcml0aWNhbDogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2xvZ19mdWxsOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnY3Jhc2hfZGV0ZWN0ZWQ6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdvdmVycmlkZTogdm9pZCB9Oyc7XHJcblxyXG4gICAgICAgIHZhciBjb2xvciA9ICdDb2xvciA9IHsgcmVkOiB1OCwgZ3JlZW46IHU4LCBibHVlOiB1OCB9Oyc7XHJcbiAgICAgICAgdmFyIGxlZFN0YXRlQ2FzZSA9ICdMRURTdGF0ZUNhc2UgPSB7JyArXHJcbiAgICAgICAgICAgICdzdGF0dXM6IFN0YXR1c0ZsYWcsJyArXHJcbiAgICAgICAgICAgICdwYXR0ZXJuOiB1OCwnICtcclxuICAgICAgICAgICAgJ2NvbG9yX3JpZ2h0X2Zyb250OiBDb2xvciwnICtcclxuICAgICAgICAgICAgJ2NvbG9yX3JpZ2h0X2JhY2s6IENvbG9yLCcgK1xyXG4gICAgICAgICAgICAnY29sb3JfbGVmdF9mcm9udDogQ29sb3IsJyArXHJcbiAgICAgICAgICAgICdjb2xvcl9sZWZ0X2JhY2s6IENvbG9yLCcgK1xyXG4gICAgICAgICAgICAnaW5kaWNhdG9yX3JlZDogYm9vbCwnICtcclxuICAgICAgICAgICAgJ2luZGljYXRvcl9ncmVlbjogYm9vbCB9Oyc7XHJcbiAgICAgICAgdmFyIGxlZFN0YXRlcyA9ICdMRURTdGF0ZXMgPSBbLzE2L0xFRFN0YXRlQ2FzZToxNl07JztcclxuICAgICAgICB2YXIgbGVkU3RhdGVzRml4ZWQgPSAnTEVEU3RhdGVzRml4ZWQgPSBbTEVEU3RhdGVDYXNlOjE2XTsnO1xyXG5cclxuICAgICAgICB2YXIgZGV2aWNlTmFtZSA9ICdEZXZpY2VOYW1lID0gczk7JztcclxuXHJcbiAgICAgICAgdmFyIHZlbG9jaXR5UGlkUGFyYW1ldGVycyA9ICdWZWxvY2l0eVBJRFBhcmFtZXRlcnMgPSB7JyArXHJcbiAgICAgICAgICAgICdmb3J3YXJkX21hc3RlcjogUElEU2V0dGluZ3MsJyArXHJcbiAgICAgICAgICAgICdyaWdodF9tYXN0ZXI6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAndXBfbWFzdGVyOiBQSURTZXR0aW5ncywnICtcclxuICAgICAgICAgICAgJ2ZvcndhcmRfc2xhdmU6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAncmlnaHRfc2xhdmU6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAndXBfc2xhdmU6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAncGlkX2J5cGFzczogdTggfTsnO1xyXG5cclxuICAgICAgICB2YXIgaW5lcnRpYWxCaWFzID0gJ0luZXJ0aWFsQmlhcyA9IHsgYWNjZWw6IFZlY3RvcjNmLCBneXJvOiBWZWN0b3IzZiB9Oyc7XHJcblxyXG4gICAgICAgIHZhciBjb25maWcxNDE1ID0gJ0NvbmZpZ3VyYXRpb24gPSB7LzE2LycgK1xyXG4gICAgICAgICAgICAndmVyc2lvbjogVmVyc2lvbiwnICtcclxuICAgICAgICAgICAgJ2NvbmZpZ19pZDogQ29uZmlnSUQsJyArXHJcbiAgICAgICAgICAgICdwY2JfdHJhbnNmb3JtOiBQY2JUcmFuc2Zvcm0sJyArXHJcbiAgICAgICAgICAgICdtaXhfdGFibGU6IE1peFRhYmxlLCcgK1xyXG4gICAgICAgICAgICAnbWFnX2JpYXM6IE1hZ0JpYXMsJyArXHJcbiAgICAgICAgICAgICdjaGFubmVsOiBDaGFubmVsUHJvcGVydGllcywnICtcclxuICAgICAgICAgICAgJ3BpZF9wYXJhbWV0ZXJzOiBQSURQYXJhbWV0ZXJzLCcgK1xyXG4gICAgICAgICAgICAnc3RhdGVfcGFyYW1ldGVyczogU3RhdGVQYXJhbWV0ZXJzLCcgK1xyXG4gICAgICAgICAgICAnbGVkX3N0YXRlczogTEVEU3RhdGVzLCcgK1xyXG4gICAgICAgICAgICAnZGV2aWNlX25hbWU6IERldmljZU5hbWUgfTsnO1xyXG5cclxuICAgICAgICB2YXIgY29uZmlnRml4ZWQxNDE1ID0gJ0NvbmZpZ3VyYXRpb25GaXhlZCA9IHsnICtcclxuICAgICAgICAgICAgJ3ZlcnNpb246IFZlcnNpb24sJyArXHJcbiAgICAgICAgICAgICdjb25maWdfaWQ6IENvbmZpZ0lELCcgK1xyXG4gICAgICAgICAgICAncGNiX3RyYW5zZm9ybTogUGNiVHJhbnNmb3JtLCcgK1xyXG4gICAgICAgICAgICAnbWl4X3RhYmxlOiBNaXhUYWJsZSwnICtcclxuICAgICAgICAgICAgJ21hZ19iaWFzOiBNYWdCaWFzLCcgK1xyXG4gICAgICAgICAgICAnY2hhbm5lbDogQ2hhbm5lbFByb3BlcnRpZXMsJyArXHJcbiAgICAgICAgICAgICdwaWRfcGFyYW1ldGVyczogUElEUGFyYW1ldGVycywnICtcclxuICAgICAgICAgICAgJ3N0YXRlX3BhcmFtZXRlcnM6IFN0YXRlUGFyYW1ldGVycywnICtcclxuICAgICAgICAgICAgJ2xlZF9zdGF0ZXM6IExFRFN0YXRlc0ZpeGVkLCcgK1xyXG4gICAgICAgICAgICAnZGV2aWNlX25hbWU6IERldmljZU5hbWUgfTsnO1xyXG5cclxuICAgICAgICB2YXIgY29uZmlnID0gJ0NvbmZpZ3VyYXRpb24gPSB7LzE2LycgK1xyXG4gICAgICAgICAgICAndmVyc2lvbjogVmVyc2lvbiwnICtcclxuICAgICAgICAgICAgJ2NvbmZpZ19pZDogQ29uZmlnSUQsJyArXHJcbiAgICAgICAgICAgICdwY2JfdHJhbnNmb3JtOiBQY2JUcmFuc2Zvcm0sJyArXHJcbiAgICAgICAgICAgICdtaXhfdGFibGU6IE1peFRhYmxlLCcgK1xyXG4gICAgICAgICAgICAnbWFnX2JpYXM6IE1hZ0JpYXMsJyArXHJcbiAgICAgICAgICAgICdjaGFubmVsOiBDaGFubmVsUHJvcGVydGllcywnICtcclxuICAgICAgICAgICAgJ3BpZF9wYXJhbWV0ZXJzOiBQSURQYXJhbWV0ZXJzLCcgK1xyXG4gICAgICAgICAgICAnc3RhdGVfcGFyYW1ldGVyczogU3RhdGVQYXJhbWV0ZXJzLCcgK1xyXG4gICAgICAgICAgICAnbGVkX3N0YXRlczogTEVEU3RhdGVzLCcgK1xyXG4gICAgICAgICAgICAnZGV2aWNlX25hbWU6IERldmljZU5hbWUsJyArXHJcbiAgICAgICAgICAgICd2ZWxvY2l0eV9waWRfcGFyYW1ldGVyczogVmVsb2NpdHlQSURQYXJhbWV0ZXJzLCcgK1xyXG4gICAgICAgICAgICAnaW5lcnRpYWxfYmlhczogSW5lcnRpYWxCaWFzIH07JztcclxuXHJcbiAgICAgICAgdmFyIGNvbmZpZ0ZpeGVkID0gJ0NvbmZpZ3VyYXRpb25GaXhlZCA9IHsnICtcclxuICAgICAgICAgICAgJ3ZlcnNpb246IFZlcnNpb24sJyArXHJcbiAgICAgICAgICAgICdjb25maWdfaWQ6IENvbmZpZ0lELCcgK1xyXG4gICAgICAgICAgICAncGNiX3RyYW5zZm9ybTogUGNiVHJhbnNmb3JtLCcgK1xyXG4gICAgICAgICAgICAnbWl4X3RhYmxlOiBNaXhUYWJsZSwnICtcclxuICAgICAgICAgICAgJ21hZ19iaWFzOiBNYWdCaWFzLCcgK1xyXG4gICAgICAgICAgICAnY2hhbm5lbDogQ2hhbm5lbFByb3BlcnRpZXMsJyArXHJcbiAgICAgICAgICAgICdwaWRfcGFyYW1ldGVyczogUElEUGFyYW1ldGVycywnICtcclxuICAgICAgICAgICAgJ3N0YXRlX3BhcmFtZXRlcnM6IFN0YXRlUGFyYW1ldGVycywnICtcclxuICAgICAgICAgICAgJ2xlZF9zdGF0ZXM6IExFRFN0YXRlc0ZpeGVkLCcgK1xyXG4gICAgICAgICAgICAnZGV2aWNlX25hbWU6IERldmljZU5hbWUsJyArXHJcbiAgICAgICAgICAgICd2ZWxvY2l0eV9waWRfcGFyYW1ldGVyczogVmVsb2NpdHlQSURQYXJhbWV0ZXJzLCcgK1xyXG4gICAgICAgICAgICAnaW5lcnRpYWxfYmlhczogSW5lcnRpYWxCaWFzIH07JztcclxuXHJcbiAgICAgICAgdmFyIGNvbmZpZ0ZsYWcxNCA9ICdDb25maWd1cmF0aW9uRmxhZyA9IHsvMTYvJyArXHJcbiAgICAgICAgICAgICd2ZXJzaW9uOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnY29uZmlnX2lkOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAncGNiX3RyYW5zZm9ybTogdm9pZCwnICtcclxuICAgICAgICAgICAgJ21peF90YWJsZTogdm9pZCwnICtcclxuICAgICAgICAgICAgJ21hZ19iaWFzOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnY2hhbm5lbDogdm9pZCwnICtcclxuICAgICAgICAgICAgJ3BpZF9wYXJhbWV0ZXJzOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnc3RhdGVfcGFyYW1ldGVyczogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2xlZF9zdGF0ZXM6IFsvLyB2b2lkOjE2XSwnICtcclxuICAgICAgICAgICAgJ2RldmljZV9uYW1lOiB2b2lkfTsnO1xyXG5cclxuICAgICAgICB2YXIgY29uZmlnRmxhZyA9ICdDb25maWd1cmF0aW9uRmxhZyA9IHsvMTYvJyArXHJcbiAgICAgICAgICAgICd2ZXJzaW9uOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnY29uZmlnX2lkOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAncGNiX3RyYW5zZm9ybTogdm9pZCwnICtcclxuICAgICAgICAgICAgJ21peF90YWJsZTogdm9pZCwnICtcclxuICAgICAgICAgICAgJ21hZ19iaWFzOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnY2hhbm5lbDogdm9pZCwnICtcclxuICAgICAgICAgICAgJ3BpZF9wYXJhbWV0ZXJzOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnc3RhdGVfcGFyYW1ldGVyczogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2xlZF9zdGF0ZXM6IFsvLyB2b2lkOjE2XSwnICtcclxuICAgICAgICAgICAgJ2RldmljZV9uYW1lOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAndmVsb2NpdHlfcGlkX3BhcmFtZXRlcnM6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdpbmVydGlhbF9iaWFzOiB2b2lkIH07JztcclxuXHJcbiAgICAgICAgdmFyIGNvbmZpZ0Z1bGwxNCA9IHZlY3RvcjNmICsgcGlkU2V0dGluZ3MgKyB2ZXJzaW9uICsgY29uZmlnSWQgKyBwY2JUcmFuc2Zvcm0gK1xyXG4gICAgICAgICAgICBtaXhUYWJsZSArIG1hZ0JpYXMgKyBjaGFubmVsUHJvcGVydGllcyArIHBpZFBhcmFtZXRlcnMxNCArIHN0YXRlUGFyYW1ldGVycyArXHJcbiAgICAgICAgICAgIHN0YXR1c0ZsYWcxNDE1ICsgY29sb3IgKyBsZWRTdGF0ZUNhc2UgKyBsZWRTdGF0ZXMgKyBsZWRTdGF0ZXNGaXhlZCArIGRldmljZU5hbWUgK1xyXG4gICAgICAgICAgICBjb25maWcxNDE1ICsgY29uZmlnRml4ZWQxNDE1ICsgY29uZmlnRmxhZzE0O1xyXG4gICAgICAgIHZhciBjb25maWdGdWxsMTUgPSB2ZWN0b3IzZiArIHBpZFNldHRpbmdzICsgdmVyc2lvbiArIGNvbmZpZ0lkICsgcGNiVHJhbnNmb3JtICsgbWl4VGFibGUgK1xyXG4gICAgICAgICAgICBtYWdCaWFzICsgY2hhbm5lbFByb3BlcnRpZXMgKyBwaWRQYXJhbWV0ZXJzICsgc3RhdGVQYXJhbWV0ZXJzICtcclxuICAgICAgICAgICAgc3RhdHVzRmxhZzE0MTUgKyBjb2xvciArIGxlZFN0YXRlQ2FzZSArIGxlZFN0YXRlcyArIGxlZFN0YXRlc0ZpeGVkICsgZGV2aWNlTmFtZSArXHJcbiAgICAgICAgICAgIGNvbmZpZzE0MTUgKyBjb25maWdGaXhlZDE0MTUgKyBjb25maWdGbGFnO1xyXG4gICAgICAgIHZhciBjb25maWdGdWxsMTYgPSB2ZWN0b3IzZiArIHBpZFNldHRpbmdzICsgdmVyc2lvbiArIGNvbmZpZ0lkICsgcGNiVHJhbnNmb3JtICsgbWl4VGFibGUgK1xyXG4gICAgICAgICAgICBtYWdCaWFzICsgY2hhbm5lbFByb3BlcnRpZXMgKyBwaWRQYXJhbWV0ZXJzICsgc3RhdGVQYXJhbWV0ZXJzICtcclxuICAgICAgICAgICAgc3RhdHVzRmxhZyArIGNvbG9yICsgbGVkU3RhdGVDYXNlICsgbGVkU3RhdGVzICsgbGVkU3RhdGVzRml4ZWQgKyBkZXZpY2VOYW1lICtcclxuICAgICAgICAgICAgaW5lcnRpYWxCaWFzICsgdmVsb2NpdHlQaWRQYXJhbWV0ZXJzICtcclxuICAgICAgICAgICAgY29uZmlnICsgY29uZmlnRml4ZWQgKyBjb25maWdGbGFnO1xyXG5cclxuICAgICAgICB2YXIgc3RhdGUgPSAnUm90YXRpb24gPSB7IHBpdGNoOiBmMzIsIHJvbGw6IGYzMiwgeWF3OiBmMzIgfTsnICtcclxuICAgICAgICAgICAgJ1BJRFN0YXRlID0geycgK1xyXG4gICAgICAgICAgICAndGltZXN0YW1wX3VzOiB1MzIsJyArXHJcbiAgICAgICAgICAgICdpbnB1dDogZjMyLCcgK1xyXG4gICAgICAgICAgICAnc2V0cG9pbnQ6IGYzMiwnICtcclxuICAgICAgICAgICAgJ3BfdGVybTogZjMyLCcgK1xyXG4gICAgICAgICAgICAnaV90ZXJtOiBmMzIsJyArXHJcbiAgICAgICAgICAgICdkX3Rlcm06IGYzMiB9OycgK1xyXG4gICAgICAgICAgICAnUmNDb21tYW5kID0geyB0aHJvdHRsZTogaTE2LCBwaXRjaDogaTE2LCByb2xsOiBpMTYsIHlhdzogaTE2IH07JyArXHJcbiAgICAgICAgICAgICdTdGF0ZSA9IHsvMzIvJyArXHJcbiAgICAgICAgICAgICd0aW1lc3RhbXBfdXM6IHUzMiwnICtcclxuICAgICAgICAgICAgJ3N0YXR1czogU3RhdHVzRmxhZywnICtcclxuICAgICAgICAgICAgJ3YwX3JhdzogdTE2LCcgK1xyXG4gICAgICAgICAgICAnaTBfcmF3OiB1MTYsJyArXHJcbiAgICAgICAgICAgICdpMV9yYXc6IHUxNiwnICtcclxuICAgICAgICAgICAgJ2FjY2VsOiBWZWN0b3IzZiwnICtcclxuICAgICAgICAgICAgJ2d5cm86IFZlY3RvcjNmLCcgK1xyXG4gICAgICAgICAgICAnbWFnOiBWZWN0b3IzZiwnICtcclxuICAgICAgICAgICAgJ3RlbXBlcmF0dXJlOiB1MTYsJyArXHJcbiAgICAgICAgICAgICdwcmVzc3VyZTogdTMyLCcgK1xyXG4gICAgICAgICAgICAncHBtOiBbaTE2OjZdLCcgK1xyXG4gICAgICAgICAgICAnYXV4X2NoYW5fbWFzazogdTgsJyArXHJcbiAgICAgICAgICAgICdjb21tYW5kOiBSY0NvbW1hbmQsJyArXHJcbiAgICAgICAgICAgICdjb250cm9sOiB7IGZ6OiBmMzIsIHR4OiBmMzIsIHR5OiBmMzIsIHR6OiBmMzIgfSwnICtcclxuICAgICAgICAgICAgJ3BpZF9tYXN0ZXJfZno6IFBJRFN0YXRlLCcgK1xyXG4gICAgICAgICAgICAncGlkX21hc3Rlcl90eDogUElEU3RhdGUsJyArXHJcbiAgICAgICAgICAgICdwaWRfbWFzdGVyX3R5OiBQSURTdGF0ZSwnICtcclxuICAgICAgICAgICAgJ3BpZF9tYXN0ZXJfdHo6IFBJRFN0YXRlLCcgK1xyXG4gICAgICAgICAgICAncGlkX3NsYXZlX2Z6OiBQSURTdGF0ZSwnICtcclxuICAgICAgICAgICAgJ3BpZF9zbGF2ZV90eDogUElEU3RhdGUsJyArXHJcbiAgICAgICAgICAgICdwaWRfc2xhdmVfdHk6IFBJRFN0YXRlLCcgK1xyXG4gICAgICAgICAgICAncGlkX3NsYXZlX3R6OiBQSURTdGF0ZSwnICtcclxuICAgICAgICAgICAgJ21vdG9yX291dDogW2kxNjo4XSwnICtcclxuICAgICAgICAgICAgJ2tpbmVtYXRpY3NfYW5nbGU6IFJvdGF0aW9uLCcgK1xyXG4gICAgICAgICAgICAna2luZW1hdGljc19yYXRlOiBSb3RhdGlvbiwnICtcclxuICAgICAgICAgICAgJ2tpbmVtYXRpY3NfYWx0aXR1ZGU6IGYzMiwnICtcclxuICAgICAgICAgICAgJ2xvb3BfY291bnQ6IHUzMiB9OycgK1xyXG4gICAgICAgICAgICAnU3RhdGVGaWVsZHMgPSB7LzMyLycgK1xyXG4gICAgICAgICAgICAndGltZXN0YW1wX3VzOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnc3RhdHVzOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAndjBfcmF3OiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnaTBfcmF3OiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnaTFfcmF3OiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnYWNjZWw6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdneXJvOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnbWFnOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAndGVtcGVyYXR1cmU6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdwcmVzc3VyZTogdm9pZCwnICtcclxuICAgICAgICAgICAgJ3BwbTogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2F1eF9jaGFuX21hc2s6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdjb21tYW5kOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnY29udHJvbDogdm9pZCwnICtcclxuICAgICAgICAgICAgJ3BpZF9tYXN0ZXJfZno6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdwaWRfbWFzdGVyX3R4OiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAncGlkX21hc3Rlcl90eTogdm9pZCwnICtcclxuICAgICAgICAgICAgJ3BpZF9tYXN0ZXJfdHo6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdwaWRfc2xhdmVfZno6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdwaWRfc2xhdmVfdHg6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdwaWRfc2xhdmVfdHk6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdwaWRfc2xhdmVfdHo6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdtb3Rvcl9vdXQ6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdraW5lbWF0aWNzX2FuZ2xlOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAna2luZW1hdGljc19yYXRlOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAna2luZW1hdGljc19hbHRpdHVkZTogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2xvb3BfY291bnQ6IHZvaWQgfTsnO1xyXG5cclxuICAgICAgICB2YXIgYXV4TWFzayA9ICdBdXhNYXNrID0gey8vJyArXHJcbiAgICAgICAgICAgICdhdXgxX2xvdzogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2F1eDFfbWlkOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnYXV4MV9oaWdoOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnYXV4Ml9sb3c6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdhdXgyX21pZDogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2F1eDJfaGlnaDogdm9pZCB9Oyc7XHJcblxyXG4gICAgICAgIHZhciBjb21tYW5kcyA9IGF1eE1hc2sgKyAnQ29tbWFuZCA9IHsvMzIvJyArXHJcbiAgICAgICAgICAgICdyZXF1ZXN0X3Jlc3BvbnNlOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnc2V0X2VlcHJvbV9kYXRhOiBDb25maWd1cmF0aW9uRml4ZWQsJyArXHJcbiAgICAgICAgICAgICdyZWluaXRfZWVwcm9tX2RhdGE6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdyZXF1ZXN0X2VlcHJvbV9kYXRhOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAncmVxdWVzdF9lbmFibGVfaXRlcmF0aW9uOiB1OCwnICtcclxuICAgICAgICAgICAgJ21vdG9yX292ZXJyaWRlX3NwZWVkXzA6IHUxNiwnICtcclxuICAgICAgICAgICAgJ21vdG9yX292ZXJyaWRlX3NwZWVkXzE6IHUxNiwnICtcclxuICAgICAgICAgICAgJ21vdG9yX292ZXJyaWRlX3NwZWVkXzI6IHUxNiwnICtcclxuICAgICAgICAgICAgJ21vdG9yX292ZXJyaWRlX3NwZWVkXzM6IHUxNiwnICtcclxuICAgICAgICAgICAgJ21vdG9yX292ZXJyaWRlX3NwZWVkXzQ6IHUxNiwnICtcclxuICAgICAgICAgICAgJ21vdG9yX292ZXJyaWRlX3NwZWVkXzU6IHUxNiwnICtcclxuICAgICAgICAgICAgJ21vdG9yX292ZXJyaWRlX3NwZWVkXzY6IHUxNiwnICtcclxuICAgICAgICAgICAgJ21vdG9yX292ZXJyaWRlX3NwZWVkXzc6IHUxNiwnICtcclxuICAgICAgICAgICAgJ3NldF9jb21tYW5kX292ZXJyaWRlOiBib29sLCcgK1xyXG4gICAgICAgICAgICAnc2V0X3N0YXRlX21hc2s6IFN0YXRlRmllbGRzLCcgK1xyXG4gICAgICAgICAgICAnc2V0X3N0YXRlX2RlbGF5OiB1MTYsJyArXHJcbiAgICAgICAgICAgICdzZXRfc2Rfd3JpdGVfZGVsYXk6IHUxNiwnICtcclxuICAgICAgICAgICAgJ3NldF9sZWQ6IHsnICtcclxuICAgICAgICAgICAgJyAgcGF0dGVybjogdTgsJyArXHJcbiAgICAgICAgICAgICcgIGNvbG9yX3JpZ2h0OiBDb2xvciwnICtcclxuICAgICAgICAgICAgJyAgY29sb3JfbGVmdDogQ29sb3IsJyArXHJcbiAgICAgICAgICAgICcgIGluZGljYXRvcl9yZWQ6IGJvb2wsJyArXHJcbiAgICAgICAgICAgICcgIGluZGljYXRvcl9ncmVlbjogYm9vbCB9LCcgK1xyXG4gICAgICAgICAgICAnc2V0X3NlcmlhbF9yYzogeyBlbmFibGVkOiBib29sLCBjb21tYW5kOiBSY0NvbW1hbmQsIGF1eF9tYXNrOiBBdXhNYXNrIH0sJyArXHJcbiAgICAgICAgICAgICdzZXRfY2FyZF9yZWNvcmRpbmdfc3RhdGU6IHsvOC8gcmVjb3JkX3RvX2NhcmQ6IHZvaWQsIGxvY2tfcmVjb3JkaW5nX3N0YXRlOiB2b2lkIH0sJyArXHJcbiAgICAgICAgICAgICdzZXRfcGFydGlhbF9lZXByb21fZGF0YTogQ29uZmlndXJhdGlvbiwnICtcclxuICAgICAgICAgICAgJ3JlaW5pdF9wYXJ0aWFsX2VlcHJvbV9kYXRhOiBDb25maWd1cmF0aW9uRmxhZywnICtcclxuICAgICAgICAgICAgJ3JlcV9wYXJ0aWFsX2VlcHJvbV9kYXRhOiBDb25maWd1cmF0aW9uRmxhZywnICtcclxuICAgICAgICAgICAgJ3JlcV9jYXJkX3JlY29yZGluZ19zdGF0ZTogdm9pZCwnICtcclxuICAgICAgICAgICAgJ3NldF9wYXJ0aWFsX3RlbXBvcmFyeV9jb25maWc6IENvbmZpZ3VyYXRpb24sJyArXHJcbiAgICAgICAgICAgICdzZXRfY29tbWFuZF9zb3VyY2VzOiB7LzgvIHNlcmlhbDogdm9pZCwgcmFkaW86IHZvaWQgfSwnICtcclxuICAgICAgICAgICAgJ3NldF9jYWxpYnJhdGlvbjogeyBlbmFibGVkOiBib29sLCBtb2RlOiB1OCB9LCcgK1xyXG4gICAgICAgICAgICAnc2V0X2F1dG9waWxvdF9lbmFibGVkOiBib29sLCcgK1xyXG4gICAgICAgICAgICAnc2V0X3VzYl9tb2RlOiB1OH07JztcclxuXHJcbiAgICAgICAgdmFyIGRlYnVnU3RyaW5nID0gXCJEZWJ1Z1N0cmluZyA9IHsgZGVwcmVjYXRlZF9tYXNrOiB1MzIsIG1lc3NhZ2U6IHMgfTtcIjtcclxuICAgICAgICB2YXIgaGlzdG9yeURhdGEgPSBcIkhpc3RvcnlEYXRhID0gRGVidWdTdHJpbmc7XCI7XHJcbiAgICAgICAgdmFyIHJlc3BvbnNlID0gXCJSZXNwb25zZSA9IHsgbWFzazogdTMyLCBhY2s6IHUzMiB9O1wiO1xyXG4gICAgICAgIHZhciBwcm90b2NvbCA9IFwiUHJvdG9jb2xJbmZvID0geyB2ZXJzaW9uOiBWZXJzaW9uLCBzdHJ1Y3R1cmU6IHMgfTtcIiArXHJcbiAgICAgICAgICAgIFwiUHJvdG9jb2wgPSB7LzMyLyByZXF1ZXN0OiB2b2lkLCByZXNwb25zZTogUHJvdG9jb2xJbmZvIH07XCI7XHJcblxyXG4gICAgICAgIHZhciBoYW5kbGVyMTQgPSBjb25maWdGdWxsMTQgKyBzdGF0ZSArIGNvbW1hbmRzICsgZGVidWdTdHJpbmcgKyBoaXN0b3J5RGF0YSArIHJlc3BvbnNlICsgcHJvdG9jb2w7XHJcbiAgICAgICAgdmFyIGhhbmRsZXIxNSA9IGNvbmZpZ0Z1bGwxNSArIHN0YXRlICsgY29tbWFuZHMgKyBkZWJ1Z1N0cmluZyArIGhpc3RvcnlEYXRhICsgcmVzcG9uc2UgKyBwcm90b2NvbDtcclxuICAgICAgICB2YXIgaGFuZGxlcjE2ID0gY29uZmlnRnVsbDE2ICsgc3RhdGUgKyBjb21tYW5kcyArIGRlYnVnU3RyaW5nICsgaGlzdG9yeURhdGEgKyByZXNwb25zZSArIHByb3RvY29sO1xyXG5cclxuICAgICAgICBoYW5kbGVyQ2FjaGVbJzEuNC4wJ10gPSBGbHlicml4U2VyaWFsaXphdGlvbi5wYXJzZShoYW5kbGVyMTQpO1xyXG4gICAgICAgIGhhbmRsZXJDYWNoZVsnMS41LjAnXSA9IGhhbmRsZXJDYWNoZVsnMS41LjEnXSA9IEZseWJyaXhTZXJpYWxpemF0aW9uLnBhcnNlKGhhbmRsZXIxNSk7XHJcbiAgICAgICAgaGFuZGxlckNhY2hlWycxLjYuMCddID0gRmx5YnJpeFNlcmlhbGl6YXRpb24ucGFyc2UoaGFuZGxlcjE2KTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gdXBkYXRlRmllbGRzKHRhcmdldCwgc291cmNlKSB7XHJcbiAgICAgICAgICAgIGlmIChzb3VyY2UgaW5zdGFuY2VvZiBBcnJheSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHVwZGF0ZUZpZWxkc0FycmF5KHRhcmdldCwgc291cmNlKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChzb3VyY2UgaW5zdGFuY2VvZiBPYmplY3QpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB1cGRhdGVGaWVsZHNPYmplY3QodGFyZ2V0LCBzb3VyY2UpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIChzb3VyY2UgPT09IG51bGwgfHwgc291cmNlID09PSB1bmRlZmluZWQpID8gdGFyZ2V0IDogc291cmNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiB1cGRhdGVGaWVsZHNPYmplY3QodGFyZ2V0LCBzb3VyY2UpIHtcclxuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHt9O1xyXG4gICAgICAgICAgICBPYmplY3Qua2V5cyh0YXJnZXQpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0W2tleV0gPSB1cGRhdGVGaWVsZHModGFyZ2V0W2tleV0sIHNvdXJjZVtrZXldKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKHNvdXJjZSkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoa2V5IGluIHJlc3VsdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJlc3VsdFtrZXldID0gdXBkYXRlRmllbGRzKHRhcmdldFtrZXldLCBzb3VyY2Vba2V5XSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gdXBkYXRlRmllbGRzQXJyYXkodGFyZ2V0LCBzb3VyY2UpIHtcclxuICAgICAgICAgICAgdmFyIGxlbmd0aCA9IE1hdGgubWF4KHRhcmdldC5sZW5ndGgsIHNvdXJjZS5sZW5ndGgpO1xyXG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gW107XHJcbiAgICAgICAgICAgIGZvciAodmFyIGlkeCA9IDA7IGlkeCA8IGxlbmd0aDsgKytpZHgpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKHVwZGF0ZUZpZWxkcyh0YXJnZXRbaWR4XSwgc291cmNlW2lkeF0pKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgU2VyaWFsaXplcjogRmx5YnJpeFNlcmlhbGl6YXRpb24uU2VyaWFsaXplcixcclxuICAgICAgICAgICAgZ2V0SGFuZGxlcjogZnVuY3Rpb24gKGZpcm13YXJlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlckNhY2hlW2Zpcm13YXJlXTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgYWRkSGFuZGxlcjogZnVuY3Rpb24gKHZlcnNpb24sIHN0cnVjdHVyZSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHZlcnNpb25TdHJpbmcgPSB2ZXJzaW9uLm1ham9yLnRvU3RyaW5nKCkgKyAnLicgKyB2ZXJzaW9uLm1pbm9yLnRvU3RyaW5nKCkgKyB2ZXJzaW9uLnBhdGNoLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgICAgICBoYW5kbGVyQ2FjaGVbdmVyc2lvblN0cmluZ10gPSBGbHlicml4U2VyaWFsaXphdGlvbi5wYXJzZShzdHJ1Y3R1cmUpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB1cGRhdGVGaWVsZHM6IHVwZGF0ZUZpZWxkcyxcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxufSgpKTtcclxuIl19
