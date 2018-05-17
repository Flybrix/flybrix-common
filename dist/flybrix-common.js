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
                mask = { set_partial_temporary_config: { MASK: mask } };
            } else {
                message.set_partial_eeprom_data = newConfig;
                mask = { set_partial_eeprom_data: { MASK: mask } };
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
            'assignment: { thrust: u8, pitch: u8, roll: u8, yaw: u8, aux1: u8, aux2: u8 },' +
            'inversion: {/8/ thrust: void, pitch: void, roll: void, yaw: void, aux1: void, aux2: void },' +
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
        var pidBypass = 'PIDBypass = {/8/' +
            'thrust_master: void,' +
            'pitch_master: void,' +
            'roll_master: void,' +
            'yaw_master: void,' +
            'thrust_slave: void,' +
            'pitch_slave: void,' +
            'roll_slave: void,' +
            'yaw_slave: void};';
        var pidParameters14 = pidBypass + 'PIDParameters = {' +
            'thrust_master: PIDSettings,' +
            'pitch_master: PIDSettings,' +
            'roll_master: PIDSettings,' +
            'yaw_master: PIDSettings,' +
            'thrust_slave: PIDSettings,' +
            'pitch_slave: PIDSettings,' +
            'roll_slave: PIDSettings,' +
            'yaw_slave: PIDSettings,' +
            'pid_bypass: PIDBypass };';
        var pidParameters = pidBypass + 'PIDParameters = {' +
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
            'pid_bypass: PIDBypass };';

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
        var ledStateColors = 'LEDStateColors = {' +
            'right_front: Color,' +
            'right_back: Color,' +
            'left_front: Color,' +
            'left_back: Color };';
        var ledStateCase = ledStateColors + 'LEDStateCase = {' +
            'status: StatusFlag,' +
            'pattern: u8,' +
            'colors: LEDStateColors,' +
            'indicator_red: bool,' +
            'indicator_green: bool };';
        var ledStates = 'LEDStates = [/16/LEDStateCase:16];';
        var ledStatesFixed = 'LEDStatesFixed = [LEDStateCase:16];';

        var deviceName = 'DeviceName = s9;';

        var velocityPidBypass = 'VelocityPIDBypass = {/8/' +
            'forward_master: void,' +
            'right_master: void,' +
            'up_master: void,' +
            '_unused_master: void,' +
            'forward_slave: void,' +
            'right_slave: void,' +
            'up_slave: void,' +
            '_unused_slave: void};';

        var velocityPidParameters = velocityPidBypass + 'VelocityPIDParameters = {' +
            'forward_master: PIDSettings,' +
            'right_master: PIDSettings,' +
            'up_master: PIDSettings,' +
            'forward_slave: PIDSettings,' +
            'right_slave: PIDSettings,' +
            'up_slave: PIDSettings,' +
            'pid_bypass: VelocityPIDBypass };';

        var inertialBias = 'InertialBias = { accel: Vector3f, gyro: Vector3f };';

        var config1415 = 'Configuration = {/16/' +
            'version: Version,' +
            'id: ConfigID,' +
            'pcb_transform: PcbTransform,' +
            'mix_table: MixTable,' +
            'mag_bias: MagBias,' +
            'channel: ChannelProperties,' +
            'pid_parameters: PIDParameters,' +
            'state_parameters: StateParameters,' +
            'led_states: LEDStates,' +
            'name: DeviceName };';

        var configFixed1415 = 'ConfigurationFixed = {' +
            'version: Version,' +
            'id: ConfigID,' +
            'pcb_transform: PcbTransform,' +
            'mix_table: MixTable,' +
            'mag_bias: MagBias,' +
            'channel: ChannelProperties,' +
            'pid_parameters: PIDParameters,' +
            'state_parameters: StateParameters,' +
            'led_states: LEDStatesFixed,' +
            'name: DeviceName };';

        var config = 'Configuration = {/16/' +
            'version: Version,' +
            'id: ConfigID,' +
            'pcb_transform: PcbTransform,' +
            'mix_table: MixTable,' +
            'mag_bias: MagBias,' +
            'channel: ChannelProperties,' +
            'pid_parameters: PIDParameters,' +
            'state_parameters: StateParameters,' +
            'led_states: LEDStates,' +
            'name: DeviceName,' +
            'velocity_pid_parameters: VelocityPIDParameters,' +
            'inertial_bias: InertialBias };';

        var configFixed = 'ConfigurationFixed = {' +
            'version: Version,' +
            'id: ConfigID,' +
            'pcb_transform: PcbTransform,' +
            'mix_table: MixTable,' +
            'mag_bias: MagBias,' +
            'channel: ChannelProperties,' +
            'pid_parameters: PIDParameters,' +
            'state_parameters: StateParameters,' +
            'led_states: LEDStatesFixed,' +
            'name: DeviceName,' +
            'velocity_pid_parameters: VelocityPIDParameters,' +
            'inertial_bias: InertialBias };';

        var configFlag14 = 'ConfigurationFlag = {/16/' +
            'version: void,' +
            'id: void,' +
            'pcb_transform: void,' +
            'mix_table: void,' +
            'mag_bias: void,' +
            'channel: void,' +
            'pid_parameters: void,' +
            'state_parameters: void,' +
            'led_states: [// void:16],' +
            'name: void};';

        var configFlag = 'ConfigurationFlag = {/16/' +
            'version: void,' +
            'id: void,' +
            'pcb_transform: void,' +
            'mix_table: void,' +
            'mag_bias: void,' +
            'channel: void,' +
            'pid_parameters: void,' +
            'state_parameters: void,' +
            'led_states: [// void:16],' +
            'name: void,' +
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZS5qcyIsImNhbGlicmF0aW9uLmpzIiwiY29icy5qcyIsImNvbW1hbmRMb2cuanMiLCJkZXZpY2VDb25maWcuanMiLCJmaXJtd2FyZVZlcnNpb24uanMiLCJsZWQuanMiLCJyY0RhdGEuanMiLCJzZXJpYWwuanMiLCJzZXJpYWxpemF0aW9uSGFuZGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDalBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJmbHlicml4LWNvbW1vbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgnZmx5YnJpeENvbW1vbicsIFtdKTtcclxufSgpKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdmbHlicml4Q29tbW9uJykuZmFjdG9yeSgnY2FsaWJyYXRpb24nLCBjYWxpYnJhdGlvbik7XHJcblxyXG4gICAgY2FsaWJyYXRpb24uJGluamVjdCA9IFsnY29tbWFuZExvZycsICdzZXJpYWwnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBjYWxpYnJhdGlvbihjb21tYW5kTG9nLCBzZXJpYWwpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBtYWduZXRvbWV0ZXI6IG1hZ25ldG9tZXRlcixcclxuICAgICAgICAgICAgYWNjZWxlcm9tZXRlcjoge1xyXG4gICAgICAgICAgICAgICAgZmxhdDogY2FsaWJyYXRlQWNjZWxlcm9tZXRlci5iaW5kKG51bGwsICdmbGF0JywgMCksXHJcbiAgICAgICAgICAgICAgICBmb3J3YXJkOiBjYWxpYnJhdGVBY2NlbGVyb21ldGVyLmJpbmQobnVsbCwgJ2xlYW4gZm9yd2FyZCcsIDEpLFxyXG4gICAgICAgICAgICAgICAgYmFjazogY2FsaWJyYXRlQWNjZWxlcm9tZXRlci5iaW5kKG51bGwsICdsZWFuIGJhY2snLCAyKSxcclxuICAgICAgICAgICAgICAgIHJpZ2h0OiBjYWxpYnJhdGVBY2NlbGVyb21ldGVyLmJpbmQobnVsbCwgJ2xlYW4gcmlnaHQnLCAzKSxcclxuICAgICAgICAgICAgICAgIGxlZnQ6IGNhbGlicmF0ZUFjY2VsZXJvbWV0ZXIuYmluZChudWxsLCAnbGVhbiBsZWZ0JywgNCksXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGZpbmlzaDogZmluaXNoLFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIG1hZ25ldG9tZXRlcigpIHtcclxuICAgICAgICAgICAgY29tbWFuZExvZyhcIkNhbGlicmF0aW5nIG1hZ25ldG9tZXRlciBiaWFzXCIpO1xyXG4gICAgICAgICAgICByZXR1cm4gc2VyaWFsLnNlbmRTdHJ1Y3R1cmUoJ0NvbW1hbmQnLCB7XHJcbiAgICAgICAgICAgICAgICByZXF1ZXN0X3Jlc3BvbnNlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgc2V0X2NhbGlicmF0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZW5hYmxlZDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBtb2RlOiAwLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSwgZmFsc2UpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gY2FsaWJyYXRlQWNjZWxlcm9tZXRlcihwb3NlRGVzY3JpcHRpb24sIHBvc2VJZCkge1xyXG4gICAgICAgICAgICBjb21tYW5kTG9nKFwiQ2FsaWJyYXRpbmcgZ3Jhdml0eSBmb3IgcG9zZTogXCIgKyBwb3NlRGVzY3JpcHRpb24pO1xyXG4gICAgICAgICAgICByZXR1cm4gc2VyaWFsLnNlbmRTdHJ1Y3R1cmUoJ0NvbW1hbmQnLCB7XHJcbiAgICAgICAgICAgICAgICByZXF1ZXN0X3Jlc3BvbnNlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgc2V0X2NhbGlicmF0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZW5hYmxlZDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBtb2RlOiBwb3NlSWQgKyAxLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSwgZmFsc2UpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZmluaXNoKCkge1xyXG4gICAgICAgICAgICBjb21tYW5kTG9nKFwiRmluaXNoaW5nIGNhbGlicmF0aW9uXCIpO1xyXG4gICAgICAgICAgICByZXR1cm4gc2VyaWFsLnNlbmRTdHJ1Y3R1cmUoJ0NvbW1hbmQnLCB7XHJcbiAgICAgICAgICAgICAgICByZXF1ZXN0X3Jlc3BvbnNlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgc2V0X2NhbGlicmF0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgZW5hYmxlZDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgbW9kZTogMCxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0sIGZhbHNlKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgnZmx5YnJpeENvbW1vbicpLmZhY3RvcnkoJ2NvYnMnLCBjb2JzKTtcclxuXHJcbiAgICBmdW5jdGlvbiBjb2JzKCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIFJlYWRlcjogUmVhZGVyLFxyXG4gICAgICAgICAgICBlbmNvZGU6IGVuY29kZSxcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBmdW5jdGlvbiBSZWFkZXIoY2FwYWNpdHkpIHtcclxuICAgICAgICBpZiAoY2FwYWNpdHkgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBjYXBhY2l0eSA9IDIwMDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuTiA9IGNhcGFjaXR5O1xyXG4gICAgICAgIHRoaXMuYnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoY2FwYWNpdHkpO1xyXG4gICAgICAgIHRoaXMucmVhZHlfZm9yX25ld19tZXNzYWdlID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLmJ1ZmZlcl9sZW5ndGggPSAwO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNvYnNEZWNvZGUocmVhZGVyKSB7XHJcbiAgICAgICAgdmFyIHNyY19wdHIgPSAwO1xyXG4gICAgICAgIHZhciBkc3RfcHRyID0gMDtcclxuICAgICAgICB2YXIgbGVmdG92ZXJfbGVuZ3RoID0gMDtcclxuICAgICAgICB2YXIgYXBwZW5kX3plcm8gPSBmYWxzZTtcclxuICAgICAgICB3aGlsZSAocmVhZGVyLmJ1ZmZlcltzcmNfcHRyXSkge1xyXG4gICAgICAgICAgICBpZiAoIWxlZnRvdmVyX2xlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGFwcGVuZF96ZXJvKVxyXG4gICAgICAgICAgICAgICAgICAgIHJlYWRlci5idWZmZXJbZHN0X3B0cisrXSA9IDA7XHJcbiAgICAgICAgICAgICAgICBsZWZ0b3Zlcl9sZW5ndGggPSByZWFkZXIuYnVmZmVyW3NyY19wdHIrK10gLSAxO1xyXG4gICAgICAgICAgICAgICAgYXBwZW5kX3plcm8gPSBsZWZ0b3Zlcl9sZW5ndGggPCAweEZFO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgLS1sZWZ0b3Zlcl9sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICByZWFkZXIuYnVmZmVyW2RzdF9wdHIrK10gPSByZWFkZXIuYnVmZmVyW3NyY19wdHIrK107XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBsZWZ0b3Zlcl9sZW5ndGggPyAwIDogZHN0X3B0cjtcclxuICAgIH1cclxuXHJcbiAgICBSZWFkZXIucHJvdG90eXBlLnJlYWRCeXRlcyA9IGZ1bmN0aW9uKGRhdGEsIG9uU3VjY2Vzcywgb25FcnJvcikge1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB2YXIgYyA9IGRhdGFbaV07XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnJlYWR5X2Zvcl9uZXdfbWVzc2FnZSkge1xyXG4gICAgICAgICAgICAgICAgLy8gZmlyc3QgYnl0ZSBvZiBhIG5ldyBtZXNzYWdlXHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlYWR5X2Zvcl9uZXdfbWVzc2FnZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5idWZmZXJfbGVuZ3RoID0gMDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5idWZmZXJbdGhpcy5idWZmZXJfbGVuZ3RoKytdID0gYztcclxuXHJcbiAgICAgICAgICAgIGlmIChjKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5idWZmZXJfbGVuZ3RoID09PSB0aGlzLk4pIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBidWZmZXIgb3ZlcmZsb3csIHByb2JhYmx5IGR1ZSB0byBlcnJvcnMgaW4gZGF0YVxyXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IoJ292ZXJmbG93JywgJ2J1ZmZlciBvdmVyZmxvdyBpbiBDT0JTIGRlY29kaW5nJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWFkeV9mb3JfbmV3X21lc3NhZ2UgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuYnVmZmVyX2xlbmd0aCA9IGNvYnNEZWNvZGUodGhpcyk7XHJcbiAgICAgICAgICAgIHZhciBmYWlsZWRfZGVjb2RlID0gKHRoaXMuYnVmZmVyX2xlbmd0aCA9PT0gMCk7XHJcbiAgICAgICAgICAgIGlmIChmYWlsZWRfZGVjb2RlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmJ1ZmZlclswXSA9IDE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIGo7XHJcbiAgICAgICAgICAgIGZvciAoaiA9IDE7IGogPCB0aGlzLmJ1ZmZlcl9sZW5ndGg7ICsraikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5idWZmZXJbMF0gXj0gdGhpcy5idWZmZXJbal07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoaXMuYnVmZmVyWzBdID09PSAwKSB7ICAvLyBjaGVjayBzdW0gaXMgY29ycmVjdFxyXG4gICAgICAgICAgICAgICAgdGhpcy5yZWFkeV9mb3JfbmV3X21lc3NhZ2UgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYnVmZmVyX2xlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBvblN1Y2Nlc3ModGhpcy5idWZmZXIuc2xpY2UoMSwgdGhpcy5idWZmZXJfbGVuZ3RoKSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IoJ3Nob3J0JywgJ1RvbyBzaG9ydCBwYWNrZXQnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHsgIC8vIGJhZCBjaGVja3N1bVxyXG4gICAgICAgICAgICAgICAgdGhpcy5yZWFkeV9mb3JfbmV3X21lc3NhZ2UgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgdmFyIGJ5dGVzID0gXCJcIjtcclxuICAgICAgICAgICAgICAgIHZhciBtZXNzYWdlID0gXCJcIjtcclxuICAgICAgICAgICAgICAgIGZvciAoaiA9IDA7IGogPCB0aGlzLmJ1ZmZlcl9sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGJ5dGVzICs9IHRoaXMuYnVmZmVyW2pdICsgXCIsXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZSArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKHRoaXMuYnVmZmVyW2pdKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChmYWlsZWRfZGVjb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb25FcnJvcignZnJhbWUnLCAnVW5leHBlY3RlZCBlbmRpbmcgb2YgcGFja2V0Jyk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBtc2cgPSAnQkFEIENIRUNLU1VNICgnICsgdGhpcy5idWZmZXJfbGVuZ3RoICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJyBieXRlcyknICsgYnl0ZXMgKyBtZXNzYWdlO1xyXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IoJ2NoZWNrc3VtJywgbXNnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgZnVuY3Rpb24gZW5jb2RlKGJ1Zikge1xyXG4gICAgICAgIHZhciByZXR2YWwgPVxyXG4gICAgICAgICAgICBuZXcgVWludDhBcnJheShNYXRoLmZsb29yKChidWYuYnl0ZUxlbmd0aCAqIDI1NSArIDc2MSkgLyAyNTQpKTtcclxuICAgICAgICB2YXIgbGVuID0gMTtcclxuICAgICAgICB2YXIgcG9zX2N0ciA9IDA7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBidWYubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICAgICAgaWYgKHJldHZhbFtwb3NfY3RyXSA9PSAweEZFKSB7XHJcbiAgICAgICAgICAgICAgICByZXR2YWxbcG9zX2N0cl0gPSAweEZGO1xyXG4gICAgICAgICAgICAgICAgcG9zX2N0ciA9IGxlbisrO1xyXG4gICAgICAgICAgICAgICAgcmV0dmFsW3Bvc19jdHJdID0gMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgdmFsID0gYnVmW2ldO1xyXG4gICAgICAgICAgICArK3JldHZhbFtwb3NfY3RyXTtcclxuICAgICAgICAgICAgaWYgKHZhbCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dmFsW2xlbisrXSA9IHZhbDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHBvc19jdHIgPSBsZW4rKztcclxuICAgICAgICAgICAgICAgIHJldHZhbFtwb3NfY3RyXSA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJldHZhbC5zdWJhcnJheSgwLCBsZW4pLnNsaWNlKCkuYnVmZmVyO1xyXG4gICAgfTtcclxufSgpKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdmbHlicml4Q29tbW9uJykuZmFjdG9yeSgnY29tbWFuZExvZycsIGNvbW1hbmRMb2cpO1xyXG5cclxuICAgIGNvbW1hbmRMb2cuJGluamVjdCA9IFsnJHEnXTtcclxuXHJcbiAgICBmdW5jdGlvbiBjb21tYW5kTG9nKCRxKSB7XHJcbiAgICAgICAgdmFyIG1lc3NhZ2VzID0gW107XHJcbiAgICAgICAgdmFyIHJlc3BvbmRlciA9ICRxLmRlZmVyKCk7XHJcblxyXG4gICAgICAgIHZhciBzZXJ2aWNlID0gbG9nO1xyXG4gICAgICAgIHNlcnZpY2UubG9nID0gbG9nO1xyXG4gICAgICAgIHNlcnZpY2UuY2xlYXJTdWJzY3JpYmVycyA9IGNsZWFyU3Vic2NyaWJlcnM7XHJcbiAgICAgICAgc2VydmljZS5vbk1lc3NhZ2UgPSBvbk1lc3NhZ2U7XHJcbiAgICAgICAgc2VydmljZS5yZWFkID0gcmVhZDtcclxuXHJcbiAgICAgICAgcmV0dXJuIHNlcnZpY2U7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGxvZyhtZXNzYWdlKSB7XHJcbiAgICAgICAgICAgIGlmIChtZXNzYWdlICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIG1lc3NhZ2VzLnB1c2gobWVzc2FnZSk7XHJcbiAgICAgICAgICAgICAgICByZXNwb25kZXIubm90aWZ5KHJlYWQoKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHJlYWQoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBtZXNzYWdlcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGNsZWFyU3Vic2NyaWJlcnMoKSB7XHJcbiAgICAgICAgICAgIHJlc3BvbmRlciA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBvbk1lc3NhZ2UoY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbmRlci5wcm9taXNlLnRoZW4odW5kZWZpbmVkLCB1bmRlZmluZWQsIGNhbGxiYWNrKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgnZmx5YnJpeENvbW1vbicpLmZhY3RvcnkoJ2RldmljZUNvbmZpZycsIGRldmljZUNvbmZpZyk7XHJcblxyXG4gICAgZGV2aWNlQ29uZmlnLiRpbmplY3QgPSBbJ3NlcmlhbCcsICdjb21tYW5kTG9nJywgJ2Zpcm13YXJlVmVyc2lvbicsICdzZXJpYWxpemF0aW9uSGFuZGxlciddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGRldmljZUNvbmZpZyhzZXJpYWwsIGNvbW1hbmRMb2csIGZpcm13YXJlVmVyc2lvbiwgc2VyaWFsaXphdGlvbkhhbmRsZXIpIHtcclxuICAgICAgICB2YXIgY29uZmlnO1xyXG5cclxuICAgICAgICB2YXIgY29uZmlnQ2FsbGJhY2sgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgY29tbWFuZExvZygnTm8gY2FsbGJhY2sgZGVmaW5lZCBmb3IgcmVjZWl2aW5nIGNvbmZpZ3VyYXRpb25zIScpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHZhciBsb2dnaW5nQ2FsbGJhY2sgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgY29tbWFuZExvZyhcclxuICAgICAgICAgICAgICAgICdObyBjYWxsYmFjayBkZWZpbmVkIGZvciByZWNlaXZpbmcgbG9nZ2luZyBzdGF0ZSEnICtcclxuICAgICAgICAgICAgICAgICcgQ2FsbGJhY2sgYXJndW1lbnRzOiAoaXNMb2dnaW5nLCBpc0xvY2tlZCwgZGVsYXkpJyk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgc2VyaWFsLmFkZE9uUmVjZWl2ZUNhbGxiYWNrKGZ1bmN0aW9uKG1lc3NhZ2VUeXBlLCBtZXNzYWdlKSB7XHJcbiAgICAgICAgICAgIGlmIChtZXNzYWdlVHlwZSAhPT0gJ0NvbW1hbmQnKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCdzZXRfZWVwcm9tX2RhdGEnIGluIG1lc3NhZ2UpIHtcclxuICAgICAgICAgICAgICAgIHVwZGF0ZUNvbmZpZ0Zyb21SZW1vdGVEYXRhKG1lc3NhZ2Uuc2V0X2VlcHJvbV9kYXRhKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoJ3NldF9wYXJ0aWFsX2VlcHJvbV9kYXRhJyBpbiBtZXNzYWdlKSB7XHJcbiAgICAgICAgICAgICAgICB1cGRhdGVDb25maWdGcm9tUmVtb3RlRGF0YShtZXNzYWdlLnNldF9wYXJ0aWFsX2VlcHJvbV9kYXRhKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoKCdzZXRfY2FyZF9yZWNvcmRpbmdfc3RhdGUnIGluIG1lc3NhZ2UpICYmICgnc2V0X3NkX3dyaXRlX2RlbGF5JyBpbiBtZXNzYWdlKSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGNhcmRfcmVjX3N0YXRlID0gbWVzc2FnZS5zZXRfY2FyZF9yZWNvcmRpbmdfc3RhdGU7XHJcbiAgICAgICAgICAgICAgICB2YXIgc2Rfd3JpdGVfZGVsYXkgPSBtZXNzYWdlLnNldF9zZF93cml0ZV9kZWxheTtcclxuICAgICAgICAgICAgICAgIGxvZ2dpbmdDYWxsYmFjayhjYXJkX3JlY19zdGF0ZS5yZWNvcmRfdG9fY2FyZCwgY2FyZF9yZWNfc3RhdGUubG9ja19yZWNvcmRpbmdfc3RhdGUsIHNkX3dyaXRlX2RlbGF5KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXREZXNpcmVkVmVyc2lvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZpcm13YXJlVmVyc2lvbi5kZXNpcmVkKCk7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gcmVxdWVzdCgpIHtcclxuICAgICAgICAgICAgdmFyIGhhbmRsZXJzID0gZmlybXdhcmVWZXJzaW9uLnNlcmlhbGl6YXRpb25IYW5kbGVyKCk7XHJcbiAgICAgICAgICAgIGNvbW1hbmRMb2coJ1JlcXVlc3RpbmcgY3VycmVudCBjb25maWd1cmF0aW9uIGRhdGEuLi4nKTtcclxuICAgICAgICAgICAgcmV0dXJuIHNlcmlhbC5zZW5kU3RydWN0dXJlKCdDb21tYW5kJywge1xyXG4gICAgICAgICAgICAgICAgcmVxdWVzdF9yZXNwb25zZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHJlcV9wYXJ0aWFsX2VlcHJvbV9kYXRhOiBoYW5kbGVycy5Db25maWd1cmF0aW9uRmxhZy5lbXB0eSgpLFxyXG4gICAgICAgICAgICB9LCBmYWxzZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiByZWluaXQoKSB7XHJcbiAgICAgICAgICAgIGNvbW1hbmRMb2coJ1NldHRpbmcgZmFjdG9yeSBkZWZhdWx0IGNvbmZpZ3VyYXRpb24gZGF0YS4uLicpO1xyXG4gICAgICAgICAgICByZXR1cm4gc2VyaWFsLnNlbmRTdHJ1Y3R1cmUoJ0NvbW1hbmQnLCB7XHJcbiAgICAgICAgICAgICAgICByZXF1ZXN0X3Jlc3BvbnNlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgcmVpbml0X2VlcHJvbV9kYXRhOiB0cnVlLFxyXG4gICAgICAgICAgICB9LCBmYWxzZSlcclxuICAgICAgICAgICAgICAgIC50aGVuKFxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVxdWVzdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24ocmVhc29uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbW1hbmRMb2coXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnUmVxdWVzdCBmb3IgZmFjdG9yeSByZXNldCBmYWlsZWQ6ICcgKyByZWFzb24pO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2VuZChuZXdDb25maWcpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHNlbmRDb25maWcoeyBjb25maWc6IG5ld0NvbmZpZywgdGVtcG9yYXJ5OiBmYWxzZSwgcmVxdWVzdFVwZGF0ZTogdHJ1ZSB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNlbmRDb25maWcocHJvcGVydGllcykge1xyXG4gICAgICAgICAgICB2YXIgaGFuZGxlcnMgPSBmaXJtd2FyZVZlcnNpb24uc2VyaWFsaXphdGlvbkhhbmRsZXIoKTtcclxuICAgICAgICAgICAgdmFyIG1hc2sgPSBwcm9wZXJ0aWVzLm1hc2sgfHwgaGFuZGxlcnMuQ29uZmlndXJhdGlvbkZsYWcuZW1wdHkoKTtcclxuICAgICAgICAgICAgdmFyIG5ld0NvbmZpZyA9IHByb3BlcnRpZXMuY29uZmlnIHx8IGNvbmZpZztcclxuICAgICAgICAgICAgdmFyIHJlcXVlc3RVcGRhdGUgPSBwcm9wZXJ0aWVzLnJlcXVlc3RVcGRhdGUgfHwgZmFsc2U7XHJcbiAgICAgICAgICAgIHZhciBtZXNzYWdlID0ge1xyXG4gICAgICAgICAgICAgICAgcmVxdWVzdF9yZXNwb25zZTogdHJ1ZSxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgaWYgKHByb3BlcnRpZXMudGVtcG9yYXJ5KSB7XHJcbiAgICAgICAgICAgICAgICBtZXNzYWdlLnNldF9wYXJ0aWFsX3RlbXBvcmFyeV9jb25maWcgPSBuZXdDb25maWc7XHJcbiAgICAgICAgICAgICAgICBtYXNrID0geyBzZXRfcGFydGlhbF90ZW1wb3JhcnlfY29uZmlnOiB7IE1BU0s6IG1hc2sgfSB9O1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbWVzc2FnZS5zZXRfcGFydGlhbF9lZXByb21fZGF0YSA9IG5ld0NvbmZpZztcclxuICAgICAgICAgICAgICAgIG1hc2sgPSB7IHNldF9wYXJ0aWFsX2VlcHJvbV9kYXRhOiB7IE1BU0s6IG1hc2sgfSB9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBzZXJpYWwuc2VuZFN0cnVjdHVyZSgnQ29tbWFuZCcsIG1lc3NhZ2UsIHRydWUsIG1hc2spLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAocmVxdWVzdFVwZGF0ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcXVlc3QoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiB1cGRhdGVDb25maWdGcm9tUmVtb3RlRGF0YShjb25maWdDaGFuZ2VzKSB7XHJcbiAgICAgICAgICAgIC8vY29tbWFuZExvZygnUmVjZWl2ZWQgY29uZmlnIScpO1xyXG4gICAgICAgICAgICBjb25maWcgPSBzZXJpYWxpemF0aW9uSGFuZGxlci51cGRhdGVGaWVsZHMoY29uZmlnLCBjb25maWdDaGFuZ2VzKTtcclxuICAgICAgICAgICAgdmFyIHZlcnNpb24gPSBbY29uZmlnLnZlcnNpb24ubWFqb3IsIGNvbmZpZy52ZXJzaW9uLm1pbm9yLCBjb25maWcudmVyc2lvbi5wYXRjaF07XHJcbiAgICAgICAgICAgIGZpcm13YXJlVmVyc2lvbi5zZXQodmVyc2lvbik7XHJcbiAgICAgICAgICAgIGlmICghZmlybXdhcmVWZXJzaW9uLnN1cHBvcnRlZCgpKSB7XHJcbiAgICAgICAgICAgICAgICBjb21tYW5kTG9nKCdSZWNlaXZlZCBhbiB1bnN1cHBvcnRlZCBjb25maWd1cmF0aW9uIScpO1xyXG4gICAgICAgICAgICAgICAgY29tbWFuZExvZyhcclxuICAgICAgICAgICAgICAgICAgICAnRm91bmQgdmVyc2lvbjogJyArIHZlcnNpb25bMF0gKyAnLicgKyB2ZXJzaW9uWzFdICsgJy4nICsgdmVyc2lvblsyXSAgK1xyXG4gICAgICAgICAgICAgICAgICAgICcgLS0tIE5ld2VzdCB2ZXJzaW9uOiAnICtcclxuICAgICAgICAgICAgICAgICAgICBmaXJtd2FyZVZlcnNpb24uZGVzaXJlZEtleSgpICk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb21tYW5kTG9nKFxyXG4gICAgICAgICAgICAgICAgICAgICdSZWNlaXZlZCBjb25maWd1cmF0aW9uIGRhdGEgKHYnICtcclxuICAgICAgICAgICAgICAgICAgICB2ZXJzaW9uWzBdICsgJy4nICsgdmVyc2lvblsxXSArICcuJyArIHZlcnNpb25bMl0gKycpJyk7XHJcbiAgICAgICAgICAgICAgICBjb25maWdDYWxsYmFjaygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZXRDb25maWdDYWxsYmFjayhjYWxsYmFjaykge1xyXG4gICAgICAgICAgICBjb25maWdDYWxsYmFjayA9IGNhbGxiYWNrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2V0TG9nZ2luZ0NhbGxiYWNrKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIGxvZ2dpbmdDYWxsYmFjayA9IGNhbGxiYWNrO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0Q29uZmlnKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gY29uZmlnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uZmlnID0gZmlybXdhcmVWZXJzaW9uLnNlcmlhbGl6YXRpb25IYW5kbGVyKCkuQ29uZmlndXJhdGlvbi5lbXB0eSgpO1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICByZXF1ZXN0OiByZXF1ZXN0LFxyXG4gICAgICAgICAgICByZWluaXQ6IHJlaW5pdCxcclxuICAgICAgICAgICAgc2VuZDogc2VuZCxcclxuICAgICAgICAgICAgc2VuZENvbmZpZzogc2VuZENvbmZpZyxcclxuICAgICAgICAgICAgZ2V0Q29uZmlnOiBnZXRDb25maWcsXHJcbiAgICAgICAgICAgIHNldENvbmZpZ0NhbGxiYWNrOiBzZXRDb25maWdDYWxsYmFjayxcclxuICAgICAgICAgICAgc2V0TG9nZ2luZ0NhbGxiYWNrOiBzZXRMb2dnaW5nQ2FsbGJhY2ssXHJcbiAgICAgICAgICAgIGdldERlc2lyZWRWZXJzaW9uOiBnZXREZXNpcmVkVmVyc2lvbixcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG59KCkpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ2ZseWJyaXhDb21tb24nKS5mYWN0b3J5KCdmaXJtd2FyZVZlcnNpb24nLCBmaXJtd2FyZVZlcnNpb24pO1xyXG5cclxuICAgIGZpcm13YXJlVmVyc2lvbi4kaW5qZWN0ID0gWydzZXJpYWxpemF0aW9uSGFuZGxlciddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGZpcm13YXJlVmVyc2lvbihzZXJpYWxpemF0aW9uSGFuZGxlcikge1xyXG4gICAgICAgIHZhciB2ZXJzaW9uID0gWzAsIDAsIDBdO1xyXG4gICAgICAgIHZhciBrZXkgPSAnMC4wLjAnO1xyXG4gICAgICAgIHZhciBzdXBwb3J0ZWQgPSB7XHJcbiAgICAgICAgICAgICcxLjQuMCc6IHRydWUsXHJcbiAgICAgICAgICAgICcxLjUuMCc6IHRydWUsXHJcbiAgICAgICAgICAgICcxLjUuMSc6IHRydWUsXHJcbiAgICAgICAgICAgICcxLjYuMCc6IHRydWUsXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdmFyIGRlc2lyZWQgPSBbMSwgNiwgMF07XHJcbiAgICAgICAgdmFyIGRlc2lyZWRLZXkgPSAnMS42LjAnO1xyXG5cclxuICAgICAgICB2YXIgZGVmYXVsdFNlcmlhbGl6YXRpb25IYW5kbGVyID0gc2VyaWFsaXphdGlvbkhhbmRsZXIuZ2V0SGFuZGxlcihkZXNpcmVkS2V5KTtcclxuICAgICAgICB2YXIgY3VycmVudFNlcmlhbGl6YXRpb25IYW5kbGVyID0gZGVmYXVsdFNlcmlhbGl6YXRpb25IYW5kbGVyO1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICB2ZXJzaW9uID0gdmFsdWU7XHJcbiAgICAgICAgICAgICAgICBrZXkgPSB2YWx1ZS5qb2luKCcuJyk7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50U2VyaWFsaXphdGlvbkhhbmRsZXIgPVxyXG4gICAgICAgICAgICAgICAgICAgIHNlcmlhbGl6YXRpb25IYW5kbGVyLmdldEhhbmRsZXIoZGVzaXJlZEtleSkgfHwgZGVmYXVsdFNlcmlhbGl6YXRpb25IYW5kbGVyO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZlcnNpb247XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGtleTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4ga2V5O1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzdXBwb3J0ZWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHN1cHBvcnRlZFtrZXldID09PSB0cnVlO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBkZXNpcmVkOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBkZXNpcmVkO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBkZXNpcmVkS2V5OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBkZXNpcmVkS2V5O1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzZXJpYWxpemF0aW9uSGFuZGxlcjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY3VycmVudFNlcmlhbGl6YXRpb25IYW5kbGVyO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG59KCkpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ2ZseWJyaXhDb21tb24nKS5mYWN0b3J5KCdsZWQnLCBsZWQpO1xyXG5cclxuICAgIGxlZC4kaW5qZWN0ID0gWydkZXZpY2VDb25maWcnLCAnZmlybXdhcmVWZXJzaW9uJ107XHJcblxyXG4gICAgZnVuY3Rpb24gbGVkKGRldmljZUNvbmZpZywgZmlybXdhcmVWZXJzaW9uKSB7XHJcbiAgICAgICAgdmFyIExlZFBhdHRlcm5zID0ge1xyXG4gICAgICAgICAgICBOT19PVkVSUklERTogMCxcclxuICAgICAgICAgICAgRkxBU0g6IDEsXHJcbiAgICAgICAgICAgIEJFQUNPTjogMixcclxuICAgICAgICAgICAgQlJFQVRIRTogMyxcclxuICAgICAgICAgICAgQUxURVJOQVRFOiA0LFxyXG4gICAgICAgICAgICBTT0xJRDogNSxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIga2V5cyA9IFsncmlnaHRfZnJvbnQnLCAncmlnaHRfYmFjaycsICdsZWZ0X2Zyb250JywgJ2xlZnRfYmFjayddO1xyXG4gICAgICAgIHZhciBjb2xvcnMgPSB7fTtcclxuXHJcbiAgICAgICAga2V5cy5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xyXG4gICAgICAgICAgICBjb2xvcnNba2V5XSA9IHtcclxuICAgICAgICAgICAgICAgIHJlZDogMCxcclxuICAgICAgICAgICAgICAgIGdyZWVuOiAwLFxyXG4gICAgICAgICAgICAgICAgYmx1ZTogMCxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB2YXIgbGVkU3RhdGUgPSB7XHJcbiAgICAgICAgICAgIHN0YXR1czogNjU1MzUsXHJcbiAgICAgICAgICAgIHBhdHRlcm46IExlZFBhdHRlcm5zLlNPTElELFxyXG4gICAgICAgICAgICBjb2xvcnM6IGNvbG9ycyxcclxuICAgICAgICAgICAgaW5kaWNhdG9yX3JlZDogZmFsc2UsXHJcbiAgICAgICAgICAgIGluZGljYXRvcl9ncmVlbjogZmFsc2UsXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdmFyIGNvbmZpZ1BhcnQgPSB7IGxlZF9zdGF0ZXM6IFtsZWRTdGF0ZV0gfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2V0KFxyXG4gICAgICAgICAgICBjb2xvcl9yZiwgY29sb3JfcmIsIGNvbG9yX2xmLCBjb2xvcl9sYiwgcGF0dGVybiwgcmVkLCBncmVlbikge1xyXG4gICAgICAgICAgICBsZWRTdGF0ZS5zdGF0dXMgPSBmaXJtd2FyZVZlcnNpb24uc2VyaWFsaXphdGlvbkhhbmRsZXIoKS5TdGF0dXNGbGFnLmVtcHR5KCk7XHJcbiAgICAgICAgICAgIGlmIChwYXR0ZXJuID4gMCAmJiBwYXR0ZXJuIDwgNikge1xyXG4gICAgICAgICAgICAgICAgbGVkU3RhdGUucGF0dGVybiA9IHBhdHRlcm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgW2NvbG9yX3JmLCBjb2xvcl9yYiwgY29sb3JfbGYsIGNvbG9yX2xiXS5mb3JFYWNoKGZ1bmN0aW9uKFxyXG4gICAgICAgICAgICAgICAgY29sb3IsIGlkeCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFjb2xvcikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHZhciB2ID0gY29sb3JzW2tleXNbaWR4XV07XHJcbiAgICAgICAgICAgICAgICB2LnJlZCA9IGNvbG9yLnJlZDtcclxuICAgICAgICAgICAgICAgIHYuZ3JlZW4gPSBjb2xvci5ncmVlbjtcclxuICAgICAgICAgICAgICAgIHYuYmx1ZSA9IGNvbG9yLmJsdWU7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBpZiAocmVkICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIGxlZFN0YXRlLmluZGljYXRvcl9yZWQgPSByZWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGdyZWVuICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIGxlZFN0YXRlLmluZGljYXRvcl9ncmVlbiA9IGdyZWVuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBhcHBseSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2V0U2ltcGxlKHJlZCwgZ3JlZW4sIGJsdWUpIHtcclxuICAgICAgICAgICAgdmFyIGNvbG9yID0ge3JlZDogcmVkIHx8IDAsIGdyZWVuOiBncmVlbiB8fCAwLCBibHVlOiBibHVlIHx8IDB9O1xyXG4gICAgICAgICAgICBzZXQoY29sb3IsIGNvbG9yLCBjb2xvciwgY29sb3IsIExlZFBhdHRlcm5zLlNPTElEKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFwcGx5KCkge1xyXG4gICAgICAgICAgICBkZXZpY2VDb25maWcuc2VuZENvbmZpZyh7XHJcbiAgICAgICAgICAgICAgICBjb25maWc6IGNvbmZpZ1BhcnQsXHJcbiAgICAgICAgICAgICAgICB0ZW1wb3Jhcnk6IHRydWUsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgc2V0OiBzZXQsXHJcbiAgICAgICAgICAgIHNldFNpbXBsZTogc2V0U2ltcGxlLFxyXG4gICAgICAgICAgICBwYXR0ZXJuczogTGVkUGF0dGVybnMsXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgnZmx5YnJpeENvbW1vbicpLmZhY3RvcnkoJ3JjRGF0YScsIHJjRGF0YSk7XHJcblxyXG4gICAgcmNEYXRhLiRpbmplY3QgPSBbJ3NlcmlhbCddO1xyXG5cclxuICAgIGZ1bmN0aW9uIHJjRGF0YShzZXJpYWwpIHtcclxuICAgICAgICB2YXIgQVVYID0ge1xyXG4gICAgICAgICAgICBMT1c6IDAsXHJcbiAgICAgICAgICAgIE1JRDogMSxcclxuICAgICAgICAgICAgSElHSDogMixcclxuICAgICAgICB9O1xyXG4gICAgICAgIHZhciBhdXhOYW1lcyA9IFsnbG93JywgJ21pZCcsICdoaWdoJ107XHJcblxyXG4gICAgICAgIHZhciB0aHJvdHRsZSA9IC0xO1xyXG4gICAgICAgIHZhciBwaXRjaCA9IDA7XHJcbiAgICAgICAgdmFyIHJvbGwgPSAwO1xyXG4gICAgICAgIHZhciB5YXcgPSAwO1xyXG4gICAgICAgIC8vIGRlZmF1bHRzIHRvIGhpZ2ggLS0gbG93IGlzIGVuYWJsaW5nOyBoaWdoIGlzIGRpc2FibGluZ1xyXG4gICAgICAgIHZhciBhdXgxID0gQVVYLkhJR0g7XHJcbiAgICAgICAgLy8gZGVmYXVsdHMgdG8gPz8gLS0gbmVlZCB0byBjaGVjayB0cmFuc21pdHRlciBiZWhhdmlvclxyXG4gICAgICAgIHZhciBhdXgyID0gQVVYLkhJR0g7XHJcblxyXG4gICAgICAgIHZhciB1cmdlbnQgPSB0cnVlO1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBzZXRUaHJvdHRsZTogc2V0VGhyb3R0bGUsXHJcbiAgICAgICAgICAgIHNldFBpdGNoOiBzZXRQaXRjaCxcclxuICAgICAgICAgICAgc2V0Um9sbDogc2V0Um9sbCxcclxuICAgICAgICAgICAgc2V0WWF3OiBzZXRZYXcsXHJcbiAgICAgICAgICAgIHNldEF1eDE6IHNldEF1eDEsXHJcbiAgICAgICAgICAgIHNldEF1eDI6IHNldEF1eDIsXHJcbiAgICAgICAgICAgIGdldFRocm90dGxlOiBnZXRUaHJvdHRsZSxcclxuICAgICAgICAgICAgZ2V0UGl0Y2g6IGdldFBpdGNoLFxyXG4gICAgICAgICAgICBnZXRSb2xsOiBnZXRSb2xsLFxyXG4gICAgICAgICAgICBnZXRZYXc6IGdldFlhdyxcclxuICAgICAgICAgICAgZ2V0QXV4MTogZ2V0QXV4MSxcclxuICAgICAgICAgICAgZ2V0QXV4MjogZ2V0QXV4MixcclxuICAgICAgICAgICAgQVVYOiBBVVgsXHJcbiAgICAgICAgICAgIHNlbmQ6IHNlbmQsXHJcbiAgICAgICAgICAgIGZvcmNlTmV4dFNlbmQ6IGZvcmNlTmV4dFNlbmQsXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2VuZCgpIHtcclxuICAgICAgICAgICAgaWYgKCF1cmdlbnQgJiYgc2VyaWFsLmJ1c3koKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHVyZ2VudCA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgdmFyIGNvbW1hbmQgPSB7fTtcclxuXHJcbiAgICAgICAgICAgIC8vIGludmVydCBwaXRjaCBhbmQgcm9sbFxyXG4gICAgICAgICAgICB2YXIgdGhyb3R0bGVfdGhyZXNob2xkID1cclxuICAgICAgICAgICAgICAgIC0wLjg7ICAvLyBrZWVwIGJvdHRvbSAxMCUgb2YgdGhyb3R0bGUgc3RpY2sgdG8gbWVhbiAnb2ZmJ1xyXG4gICAgICAgICAgICBjb21tYW5kLnRocm90dGxlID0gY29uc3RyYWluKFxyXG4gICAgICAgICAgICAgICAgKHRocm90dGxlIC0gdGhyb3R0bGVfdGhyZXNob2xkKSAqIDQwOTUgL1xyXG4gICAgICAgICAgICAgICAgICAgICgxIC0gdGhyb3R0bGVfdGhyZXNob2xkKSxcclxuICAgICAgICAgICAgICAgIDAsIDQwOTUpO1xyXG4gICAgICAgICAgICBjb21tYW5kLnBpdGNoID1cclxuICAgICAgICAgICAgICAgIGNvbnN0cmFpbigtKGFwcGx5RGVhZHpvbmUocGl0Y2gsIDAuMSkpICogNDA5NSAvIDIsIC0yMDQ3LCAyMDQ3KTtcclxuICAgICAgICAgICAgY29tbWFuZC5yb2xsID1cclxuICAgICAgICAgICAgICAgIGNvbnN0cmFpbigoYXBwbHlEZWFkem9uZShyb2xsLCAwLjEpKSAqIDQwOTUgLyAyLCAtMjA0NywgMjA0Nyk7XHJcbiAgICAgICAgICAgIGNvbW1hbmQueWF3ID1cclxuICAgICAgICAgICAgICAgIGNvbnN0cmFpbigtKGFwcGx5RGVhZHpvbmUoeWF3LCAwLjEpKSAqIDQwOTUgLyAyLCAtMjA0NywgMjA0Nyk7XHJcblxyXG4gICAgICAgICAgICB2YXIgYXV4X21hc2sgPSB7fTtcclxuICAgICAgICAgICAgLy8gYXV4MV9sb3csIGF1eDFfbWlkLCBhdXgxX2hpZ2gsIGFuZCBzYW1lIHdpdGggYXV4MlxyXG4gICAgICAgICAgICBhdXhfbWFza1snYXV4MV8nICsgYXV4TmFtZXNbYXV4MV1dID0gdHJ1ZTtcclxuICAgICAgICAgICAgYXV4X21hc2tbJ2F1eDJfJyArIGF1eE5hbWVzW2F1eDJdXSA9IHRydWU7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gc2VyaWFsLnNlbmRTdHJ1Y3R1cmUoJ0NvbW1hbmQnLCB7XHJcbiAgICAgICAgICAgICAgICByZXF1ZXN0X3Jlc3BvbnNlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgc2V0X3NlcmlhbF9yYzoge1xyXG4gICAgICAgICAgICAgICAgICAgIGVuYWJsZWQ6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgY29tbWFuZDogY29tbWFuZCxcclxuICAgICAgICAgICAgICAgICAgICBhdXhfbWFzazogYXV4X21hc2ssXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9LCBmYWxzZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZXRUaHJvdHRsZSh2KSB7XHJcbiAgICAgICAgICAgIHRocm90dGxlID0gdjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNldFBpdGNoKHYpIHtcclxuICAgICAgICAgICAgcGl0Y2ggPSB2O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2V0Um9sbCh2KSB7XHJcbiAgICAgICAgICAgIHJvbGwgPSB2O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2V0WWF3KHYpIHtcclxuICAgICAgICAgICAgeWF3ID0gdjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNldEF1eDEodikge1xyXG4gICAgICAgICAgICBhdXgxID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oMiwgdikpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2V0QXV4Mih2KSB7XHJcbiAgICAgICAgICAgIGF1eDIgPSBNYXRoLm1heCgwLCBNYXRoLm1pbigyLCB2KSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRUaHJvdHRsZSgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRocm90dGxlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0UGl0Y2goKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBwaXRjaDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdldFJvbGwoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByb2xsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0WWF3KCkge1xyXG4gICAgICAgICAgICByZXR1cm4geWF3O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0QXV4MSgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGF1eDE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRBdXgyKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gYXV4MjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGZvcmNlTmV4dFNlbmQoKSB7XHJcbiAgICAgICAgICAgIHVyZ2VudCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBjb25zdHJhaW4oeCwgeG1pbiwgeG1heCkge1xyXG4gICAgICAgICAgICByZXR1cm4gTWF0aC5tYXgoeG1pbiwgTWF0aC5taW4oeCwgeG1heCkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYXBwbHlEZWFkem9uZSh2YWx1ZSwgZGVhZHpvbmUpIHtcclxuICAgICAgICAgICAgaWYgKHZhbHVlID4gZGVhZHpvbmUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSAtIGRlYWR6b25lO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh2YWx1ZSA8IC1kZWFkem9uZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlICsgZGVhZHpvbmU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KCkpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ2ZseWJyaXhDb21tb24nKS5mYWN0b3J5KCdzZXJpYWwnLCBzZXJpYWwpO1xyXG5cclxuICAgIHNlcmlhbC4kaW5qZWN0ID0gWyckdGltZW91dCcsICckcScsICdjb2JzJywgJ2NvbW1hbmRMb2cnLCAnZmlybXdhcmVWZXJzaW9uJywgJ3NlcmlhbGl6YXRpb25IYW5kbGVyJ107XHJcblxyXG4gICAgZnVuY3Rpb24gc2VyaWFsKCR0aW1lb3V0LCAkcSwgY29icywgY29tbWFuZExvZywgZmlybXdhcmVWZXJzaW9uLCBzZXJpYWxpemF0aW9uSGFuZGxlcikge1xyXG4gICAgICAgIHZhciBNZXNzYWdlVHlwZSA9IHtcclxuICAgICAgICAgICAgU3RhdGU6IDAsXHJcbiAgICAgICAgICAgIENvbW1hbmQ6IDEsXHJcbiAgICAgICAgICAgIERlYnVnU3RyaW5nOiAzLFxyXG4gICAgICAgICAgICBIaXN0b3J5RGF0YTogNCxcclxuICAgICAgICAgICAgUHJvdG9jb2w6IDEyOCxcclxuICAgICAgICAgICAgUmVzcG9uc2U6IDI1NSxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgYWNrbm93bGVkZ2VzID0gW107XHJcbiAgICAgICAgdmFyIGJhY2tlbmQgPSBuZXcgQmFja2VuZCgpO1xyXG5cclxuICAgICAgICB2YXIgb25SZWNlaXZlTGlzdGVuZXJzID0gW107XHJcblxyXG4gICAgICAgIHZhciBjb2JzUmVhZGVyID0gbmV3IGNvYnMuUmVhZGVyKDEwMDAwKTtcclxuICAgICAgICB2YXIgYnl0ZXNIYW5kbGVyID0gdW5kZWZpbmVkO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBCYWNrZW5kKCkge1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgQmFja2VuZC5wcm90b3R5cGUuYnVzeSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgQmFja2VuZC5wcm90b3R5cGUuc2VuZCA9IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgICAgY29tbWFuZExvZygnTm8gXCJzZW5kXCIgZGVmaW5lZCBmb3Igc2VyaWFsIGJhY2tlbmQnKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBCYWNrZW5kLnByb3RvdHlwZS5vblJlYWQgPSBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICAgIGNvbW1hbmRMb2coJ05vIFwib25SZWFkXCIgZGVmaW5lZCBmb3Igc2VyaWFsIGJhY2tlbmQnKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgTWVzc2FnZVR5cGVJbnZlcnNpb24gPSBbXTtcclxuICAgICAgICBPYmplY3Qua2V5cyhNZXNzYWdlVHlwZSkuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcclxuICAgICAgICAgICAgTWVzc2FnZVR5cGVJbnZlcnNpb25bTWVzc2FnZVR5cGVba2V5XV0gPSBrZXk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGFkZE9uUmVjZWl2ZUNhbGxiYWNrKGZ1bmN0aW9uKG1lc3NhZ2VUeXBlLCBtZXNzYWdlKSB7XHJcbiAgICAgICAgICAgIGlmIChtZXNzYWdlVHlwZSA9PT0gJ1Jlc3BvbnNlJykge1xyXG4gICAgICAgICAgICAgICAgYWNrbm93bGVkZ2UobWVzc2FnZS5tYXNrLCBtZXNzYWdlLmFjayk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAobWVzc2FnZVR5cGUgPT09ICdQcm90b2NvbCcpIHtcclxuICAgICAgICAgICAgICAgIHZhciBkYXRhID0gbWVzc2FnZS5yZXNwb25zZTtcclxuICAgICAgICAgICAgICAgIGlmIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VyaWFsaXphdGlvbkhhbmRsZXIuYWRkSGFuZGxlcihkYXRhLnZlcnNpb24sIGRhdGEuc3RydWN0dXJlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBidXN5OiBidXN5LFxyXG4gICAgICAgICAgICBzZW5kU3RydWN0dXJlOiBzZW5kU3RydWN0dXJlLFxyXG4gICAgICAgICAgICBzZXRCYWNrZW5kOiBzZXRCYWNrZW5kLFxyXG4gICAgICAgICAgICBhZGRPblJlY2VpdmVDYWxsYmFjazogYWRkT25SZWNlaXZlQ2FsbGJhY2ssXHJcbiAgICAgICAgICAgIHJlbW92ZU9uUmVjZWl2ZUNhbGxiYWNrOiByZW1vdmVPblJlY2VpdmVDYWxsYmFjayxcclxuICAgICAgICAgICAgc2V0Qnl0ZXNIYW5kbGVyOiBzZXRCeXRlc0hhbmRsZXIsXHJcbiAgICAgICAgICAgIGhhbmRsZVBvc3RDb25uZWN0OiBoYW5kbGVQb3N0Q29ubmVjdCxcclxuICAgICAgICAgICAgQmFja2VuZDogQmFja2VuZCxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZXRCYWNrZW5kKHYpIHtcclxuICAgICAgICAgICAgYmFja2VuZCA9IHY7XHJcbiAgICAgICAgICAgIGJhY2tlbmQub25SZWFkID0gcmVhZDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGhhbmRsZVBvc3RDb25uZWN0KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gcmVxdWVzdEZpcm13YXJlVmVyc2lvbigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gcmVxdWVzdEZpcm13YXJlVmVyc2lvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHNlbmRTdHJ1Y3R1cmUoJ0NvbW1hbmQnLCB7XHJcbiAgICAgICAgICAgICAgICByZXF1ZXN0X3Jlc3BvbnNlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgcmVxX3BhcnRpYWxfZWVwcm9tX2RhdGE6IHtcclxuICAgICAgICAgICAgICAgICAgICB2ZXJzaW9uOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZW5kU3RydWN0dXJlKG1lc3NhZ2VUeXBlLCBkYXRhLCBsb2dfc2VuZCwgZXh0cmFNYXNrKSB7XHJcbiAgICAgICAgICAgIGlmIChtZXNzYWdlVHlwZSA9PT0gJ1N0YXRlJykge1xyXG4gICAgICAgICAgICAgICAgZGF0YSA9IHByb2Nlc3NTdGF0ZU91dHB1dChkYXRhKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgaGFuZGxlcnMgPSBmaXJtd2FyZVZlcnNpb24uc2VyaWFsaXphdGlvbkhhbmRsZXIoKTtcclxuXHJcbiAgICAgICAgICAgIHZhciByZXNwb25zZSA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgICAgIGlmICghKG1lc3NhZ2VUeXBlIGluIE1lc3NhZ2VUeXBlKSkge1xyXG4gICAgICAgICAgICAgICAgcmVzcG9uc2UucmVqZWN0KCdNZXNzYWdlIHR5cGUgXCInICsgbWVzc2FnZVR5cGUgK1xyXG4gICAgICAgICAgICAgICAgICAgICdcIiBub3Qgc3VwcG9ydGVkIGJ5IGFwcCwgc3VwcG9ydGVkIG1lc3NhZ2UgdHlwZXMgYXJlOicgK1xyXG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKE1lc3NhZ2VUeXBlKS5qb2luKCcsICcpKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5wcm9taXNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghKG1lc3NhZ2VUeXBlIGluIGhhbmRsZXJzKSkge1xyXG4gICAgICAgICAgICAgICAgcmVzcG9uc2UucmVqZWN0KCdNZXNzYWdlIHR5cGUgXCInICsgbWVzc2FnZVR5cGUgK1xyXG4gICAgICAgICAgICAgICAgICAgICdcIiBub3Qgc3VwcG9ydGVkIGJ5IGZpcm13YXJlLCBzdXBwb3J0ZWQgbWVzc2FnZSB0eXBlcyBhcmU6JyArXHJcbiAgICAgICAgICAgICAgICAgICAgT2JqZWN0LmtleXMoaGFuZGxlcnMpLmpvaW4oJywgJykpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLnByb21pc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIHR5cGVDb2RlID0gTWVzc2FnZVR5cGVbbWVzc2FnZVR5cGVdO1xyXG4gICAgICAgICAgICB2YXIgaGFuZGxlciA9IGhhbmRsZXJzW21lc3NhZ2VUeXBlXTtcclxuXHJcbiAgICAgICAgICAgIHZhciBidWZmZXIgPSBuZXcgVWludDhBcnJheShoYW5kbGVyLmJ5dGVDb3VudCk7XHJcblxyXG4gICAgICAgICAgICB2YXIgc2VyaWFsaXplciA9IG5ldyBzZXJpYWxpemF0aW9uSGFuZGxlci5TZXJpYWxpemVyKG5ldyBEYXRhVmlldyhidWZmZXIuYnVmZmVyKSk7XHJcbiAgICAgICAgICAgIGhhbmRsZXIuZW5jb2RlKHNlcmlhbGl6ZXIsIGRhdGEsIGV4dHJhTWFzayk7XHJcbiAgICAgICAgICAgIHZhciBtYXNrID0gaGFuZGxlci5tYXNrQXJyYXkoZGF0YSwgZXh0cmFNYXNrKTtcclxuICAgICAgICAgICAgaWYgKG1hc2subGVuZ3RoIDwgNSkge1xyXG4gICAgICAgICAgICAgICAgbWFzayA9IChtYXNrWzBdIDw8IDApIHwgKG1hc2tbMV0gPDwgOCkgfCAobWFza1syXSA8PCAxNikgfCAobWFza1szXSA8PCAyNCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHZhciBkYXRhTGVuZ3RoID0gc2VyaWFsaXplci5pbmRleDtcclxuXHJcbiAgICAgICAgICAgIHZhciBvdXRwdXQgPSBuZXcgVWludDhBcnJheShkYXRhTGVuZ3RoICsgMyk7XHJcbiAgICAgICAgICAgIG91dHB1dFswXSA9IG91dHB1dFsxXSA9IHR5cGVDb2RlO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpZHggPSAwOyBpZHggPCBkYXRhTGVuZ3RoOyArK2lkeCkge1xyXG4gICAgICAgICAgICAgICAgb3V0cHV0WzBdIF49IG91dHB1dFtpZHggKyAyXSA9IGJ1ZmZlcltpZHhdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG91dHB1dFtkYXRhTGVuZ3RoICsgMl0gPSAwO1xyXG5cclxuICAgICAgICAgICAgYWNrbm93bGVkZ2VzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgbWFzazogbWFzayxcclxuICAgICAgICAgICAgICAgIHJlc3BvbnNlOiByZXNwb25zZSxcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAkdGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGJhY2tlbmQuc2VuZChuZXcgVWludDhBcnJheShjb2JzLmVuY29kZShvdXRwdXQpKSk7XHJcbiAgICAgICAgICAgIH0sIDApO1xyXG5cclxuICAgICAgICAgICAgaWYgKGxvZ19zZW5kKSB7XHJcbiAgICAgICAgICAgICAgICBjb21tYW5kTG9nKCdTZW5kaW5nIGNvbW1hbmQgJyArIHR5cGVDb2RlKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLnByb21pc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBidXN5KCkge1xyXG4gICAgICAgICAgICByZXR1cm4gYmFja2VuZC5idXN5KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZXRCeXRlc0hhbmRsZXIoaGFuZGxlcikge1xyXG4gICAgICAgICAgICBieXRlc0hhbmRsZXIgPSBoYW5kbGVyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gcmVhZChkYXRhKSB7XHJcbiAgICAgICAgICAgIGlmIChieXRlc0hhbmRsZXIpXHJcbiAgICAgICAgICAgICAgICBieXRlc0hhbmRsZXIoZGF0YSwgcHJvY2Vzc0RhdGEpO1xyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICBjb2JzUmVhZGVyLnJlYWRCeXRlcyhkYXRhLCBwcm9jZXNzRGF0YSwgcmVwb3J0SXNzdWVzKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHJlcG9ydElzc3Vlcyhpc3N1ZSwgdGV4dCkge1xyXG4gICAgICAgICAgICBjb21tYW5kTG9nKCdDT0JTIGRlY29kaW5nIGZhaWxlZCAoJyArIGlzc3VlICsgJyk6ICcgKyB0ZXh0KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFkZE9uUmVjZWl2ZUNhbGxiYWNrKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIG9uUmVjZWl2ZUxpc3RlbmVycyA9IG9uUmVjZWl2ZUxpc3RlbmVycy5jb25jYXQoW2NhbGxiYWNrXSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiByZW1vdmVPblJlY2VpdmVDYWxsYmFjayhjYWxsYmFjaykge1xyXG4gICAgICAgICAgICBvblJlY2VpdmVMaXN0ZW5lcnMgPSBvblJlY2VpdmVMaXN0ZW5lcnMuZmlsdGVyKGZ1bmN0aW9uKGNiKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY2IgIT09IGNhbGxiYWNrO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFja25vd2xlZGdlKG1hc2ssIHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHdoaWxlIChhY2tub3dsZWRnZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHYgPSBhY2tub3dsZWRnZXMuc2hpZnQoKTtcclxuICAgICAgICAgICAgICAgIGlmICh2Lm1hc2sgXiBtYXNrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdi5yZXNwb25zZS5yZWplY3QoJ01pc3NpbmcgQUNLJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB2YXIgcmVsYXhlZE1hc2sgPSBtYXNrO1xyXG4gICAgICAgICAgICAgICAgcmVsYXhlZE1hc2sgJj0gfjE7XHJcbiAgICAgICAgICAgICAgICBpZiAocmVsYXhlZE1hc2sgXiB2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHYucmVzcG9uc2UucmVqZWN0KCdSZXF1ZXN0IHdhcyBub3QgZnVsbHkgcHJvY2Vzc2VkJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB2LnJlc3BvbnNlLnJlc29sdmUoKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBwcm9jZXNzRGF0YShieXRlcykge1xyXG4gICAgICAgICAgICB2YXIgbWVzc2FnZVR5cGUgPSBNZXNzYWdlVHlwZUludmVyc2lvbltieXRlc1swXV07XHJcbiAgICAgICAgICAgIHZhciBoYW5kbGVyID0gZmlybXdhcmVWZXJzaW9uLnNlcmlhbGl6YXRpb25IYW5kbGVyKClbbWVzc2FnZVR5cGVdO1xyXG4gICAgICAgICAgICBpZiAoIW1lc3NhZ2VUeXBlIHx8ICFoYW5kbGVyKSB7XHJcbiAgICAgICAgICAgICAgICBjb21tYW5kTG9nKCdJbGxlZ2FsIG1lc3NhZ2UgdHlwZSBwYXNzZWQgZnJvbSBmaXJtd2FyZScpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgc2VyaWFsaXplciA9IG5ldyBzZXJpYWxpemF0aW9uSGFuZGxlci5TZXJpYWxpemVyKG5ldyBEYXRhVmlldyhieXRlcy5idWZmZXIsIDEpKTtcclxuICAgICAgICAgICAgICAgIHZhciBtZXNzYWdlID0gaGFuZGxlci5kZWNvZGUoc2VyaWFsaXplcik7XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICAgICAgICAgICAgY29tbWFuZExvZygnVW5yZWNvZ25pemVkIG1lc3NhZ2UgZm9ybWF0IHJlY2VpdmVkJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKG1lc3NhZ2VUeXBlID09PSAnU3RhdGUnKSB7XHJcbiAgICAgICAgICAgICAgICBtZXNzYWdlID0gcHJvY2Vzc1N0YXRlSW5wdXQobWVzc2FnZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgb25SZWNlaXZlTGlzdGVuZXJzLmZvckVhY2goZnVuY3Rpb24obGlzdGVuZXIpIHtcclxuICAgICAgICAgICAgICAgIGxpc3RlbmVyKG1lc3NhZ2VUeXBlLCBtZXNzYWdlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgbGFzdF90aW1lc3RhbXBfdXMgPSAwO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBwcm9jZXNzU3RhdGVJbnB1dChzdGF0ZSkge1xyXG4gICAgICAgICAgICBzdGF0ZSA9IE9iamVjdC5hc3NpZ24oe30sIHN0YXRlKTtcclxuICAgICAgICAgICAgdmFyIHNlcmlhbF91cGRhdGVfcmF0ZV9IeiA9IDA7XHJcblxyXG4gICAgICAgICAgICBpZiAoJ3RpbWVzdGFtcF91cycgaW4gc3RhdGUpIHtcclxuICAgICAgICAgICAgICAgIHN0YXRlLnNlcmlhbF91cGRhdGVfcmF0ZV9lc3RpbWF0ZSA9IDEwMDAwMDAgLyAoc3RhdGUudGltZXN0YW1wX3VzIC0gbGFzdF90aW1lc3RhbXBfdXMpO1xyXG4gICAgICAgICAgICAgICAgbGFzdF90aW1lc3RhbXBfdXMgPSBzdGF0ZS50aW1lc3RhbXBfdXM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCd0ZW1wZXJhdHVyZScgaW4gc3RhdGUpIHtcclxuICAgICAgICAgICAgICAgIHN0YXRlLnRlbXBlcmF0dXJlIC89IDEwMC4wOyAgLy8gdGVtcGVyYXR1cmUgZ2l2ZW4gaW4gQ2Vsc2l1cyAqIDEwMFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICgncHJlc3N1cmUnIGluIHN0YXRlKSB7XHJcbiAgICAgICAgICAgICAgICBzdGF0ZS5wcmVzc3VyZSAvPSAyNTYuMDsgIC8vIHByZXNzdXJlIGdpdmVuIGluIChRMjQuOCkgZm9ybWF0XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHByb2Nlc3NTdGF0ZU91dHB1dChzdGF0ZSkge1xyXG4gICAgICAgICAgICBzdGF0ZSA9IE9iamVjdC5hc3NpZ24oe30sIHN0YXRlKTtcclxuICAgICAgICAgICAgaWYgKCd0ZW1wZXJhdHVyZScgaW4gc3RhdGUpIHtcclxuICAgICAgICAgICAgICAgIHN0YXRlLnRlbXBlcmF0dXJlICo9IDEwMC4wO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICgncHJlc3N1cmUnIGluIHN0YXRlKSB7XHJcbiAgICAgICAgICAgICAgICBzdGF0ZS5wcmVzc3VyZSAqPSAyNTYuMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KCkpO1xyXG4iLCIoZnVuY3Rpb24gKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIHNlcmlhbGl6YXRpb25IYW5kbGVyLiRpbmplY3QgPSBbXTtcclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgnZmx5YnJpeENvbW1vbicpLmZhY3RvcnkoJ3NlcmlhbGl6YXRpb25IYW5kbGVyJywgc2VyaWFsaXphdGlvbkhhbmRsZXIpO1xyXG5cclxuICAgIGZ1bmN0aW9uIHNlcmlhbGl6YXRpb25IYW5kbGVyKCkge1xyXG4gICAgICAgIHZhciBoYW5kbGVyQ2FjaGUgPSB7fTtcclxuICAgICAgICB2YXIgdmVyc2lvbiA9ICdWZXJzaW9uID0geyBtYWpvcjogdTgsIG1pbm9yOiB1OCwgcGF0Y2g6IHU4IH07JztcclxuICAgICAgICB2YXIgY29uZmlnSWQgPSAnQ29uZmlnSUQgPSB1MzI7JztcclxuXHJcbiAgICAgICAgdmFyIHZlY3RvcjNmID0gJ1ZlY3RvcjNmID0geyB4OiBmMzIsIHk6IGYzMiwgejogZjMyIH07JztcclxuXHJcbiAgICAgICAgdmFyIHBjYlRyYW5zZm9ybSA9ICdQY2JUcmFuc2Zvcm0gPSB7IG9yaWVudGF0aW9uOiBWZWN0b3IzZiwgdHJhbnNsYXRpb246IFZlY3RvcjNmIH07JztcclxuICAgICAgICB2YXIgbWl4VGFibGUgPSAnTWl4VGFibGUgPSB7IGZ6OiBbaTg6OF0sIHR4OiBbaTg6OF0sIHR5OiBbaTg6OF0sIHR6OiBbaTg6OF0gfTsnO1xyXG4gICAgICAgIHZhciBtYWdCaWFzID0gJ01hZ0JpYXMgPSB7IG9mZnNldDogVmVjdG9yM2YgfTsnO1xyXG4gICAgICAgIHZhciBjaGFubmVsUHJvcGVydGllcyA9ICdDaGFubmVsUHJvcGVydGllcyA9IHsnICtcclxuICAgICAgICAgICAgJ2Fzc2lnbm1lbnQ6IHsgdGhydXN0OiB1OCwgcGl0Y2g6IHU4LCByb2xsOiB1OCwgeWF3OiB1OCwgYXV4MTogdTgsIGF1eDI6IHU4IH0sJyArXHJcbiAgICAgICAgICAgICdpbnZlcnNpb246IHsvOC8gdGhydXN0OiB2b2lkLCBwaXRjaDogdm9pZCwgcm9sbDogdm9pZCwgeWF3OiB2b2lkLCBhdXgxOiB2b2lkLCBhdXgyOiB2b2lkIH0sJyArXHJcbiAgICAgICAgICAgICdtaWRwb2ludDogW3UxNjo2XSwnICtcclxuICAgICAgICAgICAgJ2RlYWR6b25lOiBbdTE2OjZdIH07JztcclxuXHJcbiAgICAgICAgdmFyIHBpZFNldHRpbmdzID0gJ1BJRFNldHRpbmdzID0geycgK1xyXG4gICAgICAgICAgICAna3A6IGYzMiwnICtcclxuICAgICAgICAgICAgJ2tpOiBmMzIsJyArXHJcbiAgICAgICAgICAgICdrZDogZjMyLCcgK1xyXG4gICAgICAgICAgICAnaW50ZWdyYWxfd2luZHVwX2d1YXJkOiBmMzIsJyArXHJcbiAgICAgICAgICAgICdkX2ZpbHRlcl90aW1lOiBmMzIsJyArXHJcbiAgICAgICAgICAgICdzZXRwb2ludF9maWx0ZXJfdGltZTogZjMyLCcgK1xyXG4gICAgICAgICAgICAnY29tbWFuZF90b192YWx1ZTogZjMyIH07JztcclxuICAgICAgICB2YXIgcGlkQnlwYXNzID0gJ1BJREJ5cGFzcyA9IHsvOC8nICtcclxuICAgICAgICAgICAgJ3RocnVzdF9tYXN0ZXI6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdwaXRjaF9tYXN0ZXI6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdyb2xsX21hc3Rlcjogdm9pZCwnICtcclxuICAgICAgICAgICAgJ3lhd19tYXN0ZXI6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICd0aHJ1c3Rfc2xhdmU6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdwaXRjaF9zbGF2ZTogdm9pZCwnICtcclxuICAgICAgICAgICAgJ3JvbGxfc2xhdmU6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICd5YXdfc2xhdmU6IHZvaWR9Oyc7XHJcbiAgICAgICAgdmFyIHBpZFBhcmFtZXRlcnMxNCA9IHBpZEJ5cGFzcyArICdQSURQYXJhbWV0ZXJzID0geycgK1xyXG4gICAgICAgICAgICAndGhydXN0X21hc3RlcjogUElEU2V0dGluZ3MsJyArXHJcbiAgICAgICAgICAgICdwaXRjaF9tYXN0ZXI6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAncm9sbF9tYXN0ZXI6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAneWF3X21hc3RlcjogUElEU2V0dGluZ3MsJyArXHJcbiAgICAgICAgICAgICd0aHJ1c3Rfc2xhdmU6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAncGl0Y2hfc2xhdmU6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAncm9sbF9zbGF2ZTogUElEU2V0dGluZ3MsJyArXHJcbiAgICAgICAgICAgICd5YXdfc2xhdmU6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAncGlkX2J5cGFzczogUElEQnlwYXNzIH07JztcclxuICAgICAgICB2YXIgcGlkUGFyYW1ldGVycyA9IHBpZEJ5cGFzcyArICdQSURQYXJhbWV0ZXJzID0geycgK1xyXG4gICAgICAgICAgICAndGhydXN0X21hc3RlcjogUElEU2V0dGluZ3MsJyArXHJcbiAgICAgICAgICAgICdwaXRjaF9tYXN0ZXI6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAncm9sbF9tYXN0ZXI6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAneWF3X21hc3RlcjogUElEU2V0dGluZ3MsJyArXHJcbiAgICAgICAgICAgICd0aHJ1c3Rfc2xhdmU6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAncGl0Y2hfc2xhdmU6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAncm9sbF9zbGF2ZTogUElEU2V0dGluZ3MsJyArXHJcbiAgICAgICAgICAgICd5YXdfc2xhdmU6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAndGhydXN0X2dhaW46IGYzMiwnICtcclxuICAgICAgICAgICAgJ3BpdGNoX2dhaW46IGYzMiwnICtcclxuICAgICAgICAgICAgJ3JvbGxfZ2FpbjogZjMyLCcgK1xyXG4gICAgICAgICAgICAneWF3X2dhaW46IGYzMiwnICtcclxuICAgICAgICAgICAgJ3BpZF9ieXBhc3M6IFBJREJ5cGFzcyB9Oyc7XHJcblxyXG4gICAgICAgIHZhciBzdGF0ZVBhcmFtZXRlcnMgPSAnU3RhdGVQYXJhbWV0ZXJzID0geyBzdGF0ZV9lc3RpbWF0aW9uOiBbZjMyOjJdLCBlbmFibGU6IFtmMzI6Ml0gfTsnO1xyXG5cclxuICAgICAgICB2YXIgc3RhdHVzRmxhZzE0MTUgPSAnU3RhdHVzRmxhZyA9IHsvMTYvJyArXHJcbiAgICAgICAgICAgICdib290OiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnbXB1X2ZhaWw6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdibXBfZmFpbDogdm9pZCwnICtcclxuICAgICAgICAgICAgJ3J4X2ZhaWw6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdpZGxlOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnZW5hYmxpbmc6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdjbGVhcl9tcHVfYmlhczogdm9pZCwnICtcclxuICAgICAgICAgICAgJ3NldF9tcHVfYmlhczogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2ZhaWxfc3RhYmlsaXR5OiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnZmFpbF9hbmdsZTogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2VuYWJsZWQ6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdiYXR0ZXJ5X2xvdzogdm9pZCwnICtcclxuICAgICAgICAgICAgJ3RlbXBfd2FybmluZzogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2xvZ19mdWxsOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnZmFpbF9vdGhlcjogdm9pZCwnICtcclxuICAgICAgICAgICAgJ292ZXJyaWRlOiB2b2lkIH07JztcclxuXHJcbiAgICAgICAgdmFyIHN0YXR1c0ZsYWcgPSAnU3RhdHVzRmxhZyA9IHsvMTYvJyArXHJcbiAgICAgICAgICAgICdfMDogdm9pZCwnICtcclxuICAgICAgICAgICAgJ18xOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnXzI6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdub19zaWduYWw6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdpZGxlOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnYXJtaW5nOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAncmVjb3JkaW5nX3NkOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnXzc6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdsb29wX3Nsb3c6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdfOTogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2FybWVkOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnYmF0dGVyeV9sb3c6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdiYXR0ZXJ5X2NyaXRpY2FsOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnbG9nX2Z1bGw6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdjcmFzaF9kZXRlY3RlZDogdm9pZCwnICtcclxuICAgICAgICAgICAgJ292ZXJyaWRlOiB2b2lkIH07JztcclxuXHJcbiAgICAgICAgdmFyIGNvbG9yID0gJ0NvbG9yID0geyByZWQ6IHU4LCBncmVlbjogdTgsIGJsdWU6IHU4IH07JztcclxuICAgICAgICB2YXIgbGVkU3RhdGVDb2xvcnMgPSAnTEVEU3RhdGVDb2xvcnMgPSB7JyArXHJcbiAgICAgICAgICAgICdyaWdodF9mcm9udDogQ29sb3IsJyArXHJcbiAgICAgICAgICAgICdyaWdodF9iYWNrOiBDb2xvciwnICtcclxuICAgICAgICAgICAgJ2xlZnRfZnJvbnQ6IENvbG9yLCcgK1xyXG4gICAgICAgICAgICAnbGVmdF9iYWNrOiBDb2xvciB9Oyc7XHJcbiAgICAgICAgdmFyIGxlZFN0YXRlQ2FzZSA9IGxlZFN0YXRlQ29sb3JzICsgJ0xFRFN0YXRlQ2FzZSA9IHsnICtcclxuICAgICAgICAgICAgJ3N0YXR1czogU3RhdHVzRmxhZywnICtcclxuICAgICAgICAgICAgJ3BhdHRlcm46IHU4LCcgK1xyXG4gICAgICAgICAgICAnY29sb3JzOiBMRURTdGF0ZUNvbG9ycywnICtcclxuICAgICAgICAgICAgJ2luZGljYXRvcl9yZWQ6IGJvb2wsJyArXHJcbiAgICAgICAgICAgICdpbmRpY2F0b3JfZ3JlZW46IGJvb2wgfTsnO1xyXG4gICAgICAgIHZhciBsZWRTdGF0ZXMgPSAnTEVEU3RhdGVzID0gWy8xNi9MRURTdGF0ZUNhc2U6MTZdOyc7XHJcbiAgICAgICAgdmFyIGxlZFN0YXRlc0ZpeGVkID0gJ0xFRFN0YXRlc0ZpeGVkID0gW0xFRFN0YXRlQ2FzZToxNl07JztcclxuXHJcbiAgICAgICAgdmFyIGRldmljZU5hbWUgPSAnRGV2aWNlTmFtZSA9IHM5Oyc7XHJcblxyXG4gICAgICAgIHZhciB2ZWxvY2l0eVBpZEJ5cGFzcyA9ICdWZWxvY2l0eVBJREJ5cGFzcyA9IHsvOC8nICtcclxuICAgICAgICAgICAgJ2ZvcndhcmRfbWFzdGVyOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAncmlnaHRfbWFzdGVyOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAndXBfbWFzdGVyOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnX3VudXNlZF9tYXN0ZXI6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdmb3J3YXJkX3NsYXZlOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAncmlnaHRfc2xhdmU6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICd1cF9zbGF2ZTogdm9pZCwnICtcclxuICAgICAgICAgICAgJ191bnVzZWRfc2xhdmU6IHZvaWR9Oyc7XHJcblxyXG4gICAgICAgIHZhciB2ZWxvY2l0eVBpZFBhcmFtZXRlcnMgPSB2ZWxvY2l0eVBpZEJ5cGFzcyArICdWZWxvY2l0eVBJRFBhcmFtZXRlcnMgPSB7JyArXHJcbiAgICAgICAgICAgICdmb3J3YXJkX21hc3RlcjogUElEU2V0dGluZ3MsJyArXHJcbiAgICAgICAgICAgICdyaWdodF9tYXN0ZXI6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAndXBfbWFzdGVyOiBQSURTZXR0aW5ncywnICtcclxuICAgICAgICAgICAgJ2ZvcndhcmRfc2xhdmU6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAncmlnaHRfc2xhdmU6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAndXBfc2xhdmU6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAncGlkX2J5cGFzczogVmVsb2NpdHlQSURCeXBhc3MgfTsnO1xyXG5cclxuICAgICAgICB2YXIgaW5lcnRpYWxCaWFzID0gJ0luZXJ0aWFsQmlhcyA9IHsgYWNjZWw6IFZlY3RvcjNmLCBneXJvOiBWZWN0b3IzZiB9Oyc7XHJcblxyXG4gICAgICAgIHZhciBjb25maWcxNDE1ID0gJ0NvbmZpZ3VyYXRpb24gPSB7LzE2LycgK1xyXG4gICAgICAgICAgICAndmVyc2lvbjogVmVyc2lvbiwnICtcclxuICAgICAgICAgICAgJ2lkOiBDb25maWdJRCwnICtcclxuICAgICAgICAgICAgJ3BjYl90cmFuc2Zvcm06IFBjYlRyYW5zZm9ybSwnICtcclxuICAgICAgICAgICAgJ21peF90YWJsZTogTWl4VGFibGUsJyArXHJcbiAgICAgICAgICAgICdtYWdfYmlhczogTWFnQmlhcywnICtcclxuICAgICAgICAgICAgJ2NoYW5uZWw6IENoYW5uZWxQcm9wZXJ0aWVzLCcgK1xyXG4gICAgICAgICAgICAncGlkX3BhcmFtZXRlcnM6IFBJRFBhcmFtZXRlcnMsJyArXHJcbiAgICAgICAgICAgICdzdGF0ZV9wYXJhbWV0ZXJzOiBTdGF0ZVBhcmFtZXRlcnMsJyArXHJcbiAgICAgICAgICAgICdsZWRfc3RhdGVzOiBMRURTdGF0ZXMsJyArXHJcbiAgICAgICAgICAgICduYW1lOiBEZXZpY2VOYW1lIH07JztcclxuXHJcbiAgICAgICAgdmFyIGNvbmZpZ0ZpeGVkMTQxNSA9ICdDb25maWd1cmF0aW9uRml4ZWQgPSB7JyArXHJcbiAgICAgICAgICAgICd2ZXJzaW9uOiBWZXJzaW9uLCcgK1xyXG4gICAgICAgICAgICAnaWQ6IENvbmZpZ0lELCcgK1xyXG4gICAgICAgICAgICAncGNiX3RyYW5zZm9ybTogUGNiVHJhbnNmb3JtLCcgK1xyXG4gICAgICAgICAgICAnbWl4X3RhYmxlOiBNaXhUYWJsZSwnICtcclxuICAgICAgICAgICAgJ21hZ19iaWFzOiBNYWdCaWFzLCcgK1xyXG4gICAgICAgICAgICAnY2hhbm5lbDogQ2hhbm5lbFByb3BlcnRpZXMsJyArXHJcbiAgICAgICAgICAgICdwaWRfcGFyYW1ldGVyczogUElEUGFyYW1ldGVycywnICtcclxuICAgICAgICAgICAgJ3N0YXRlX3BhcmFtZXRlcnM6IFN0YXRlUGFyYW1ldGVycywnICtcclxuICAgICAgICAgICAgJ2xlZF9zdGF0ZXM6IExFRFN0YXRlc0ZpeGVkLCcgK1xyXG4gICAgICAgICAgICAnbmFtZTogRGV2aWNlTmFtZSB9Oyc7XHJcblxyXG4gICAgICAgIHZhciBjb25maWcgPSAnQ29uZmlndXJhdGlvbiA9IHsvMTYvJyArXHJcbiAgICAgICAgICAgICd2ZXJzaW9uOiBWZXJzaW9uLCcgK1xyXG4gICAgICAgICAgICAnaWQ6IENvbmZpZ0lELCcgK1xyXG4gICAgICAgICAgICAncGNiX3RyYW5zZm9ybTogUGNiVHJhbnNmb3JtLCcgK1xyXG4gICAgICAgICAgICAnbWl4X3RhYmxlOiBNaXhUYWJsZSwnICtcclxuICAgICAgICAgICAgJ21hZ19iaWFzOiBNYWdCaWFzLCcgK1xyXG4gICAgICAgICAgICAnY2hhbm5lbDogQ2hhbm5lbFByb3BlcnRpZXMsJyArXHJcbiAgICAgICAgICAgICdwaWRfcGFyYW1ldGVyczogUElEUGFyYW1ldGVycywnICtcclxuICAgICAgICAgICAgJ3N0YXRlX3BhcmFtZXRlcnM6IFN0YXRlUGFyYW1ldGVycywnICtcclxuICAgICAgICAgICAgJ2xlZF9zdGF0ZXM6IExFRFN0YXRlcywnICtcclxuICAgICAgICAgICAgJ25hbWU6IERldmljZU5hbWUsJyArXHJcbiAgICAgICAgICAgICd2ZWxvY2l0eV9waWRfcGFyYW1ldGVyczogVmVsb2NpdHlQSURQYXJhbWV0ZXJzLCcgK1xyXG4gICAgICAgICAgICAnaW5lcnRpYWxfYmlhczogSW5lcnRpYWxCaWFzIH07JztcclxuXHJcbiAgICAgICAgdmFyIGNvbmZpZ0ZpeGVkID0gJ0NvbmZpZ3VyYXRpb25GaXhlZCA9IHsnICtcclxuICAgICAgICAgICAgJ3ZlcnNpb246IFZlcnNpb24sJyArXHJcbiAgICAgICAgICAgICdpZDogQ29uZmlnSUQsJyArXHJcbiAgICAgICAgICAgICdwY2JfdHJhbnNmb3JtOiBQY2JUcmFuc2Zvcm0sJyArXHJcbiAgICAgICAgICAgICdtaXhfdGFibGU6IE1peFRhYmxlLCcgK1xyXG4gICAgICAgICAgICAnbWFnX2JpYXM6IE1hZ0JpYXMsJyArXHJcbiAgICAgICAgICAgICdjaGFubmVsOiBDaGFubmVsUHJvcGVydGllcywnICtcclxuICAgICAgICAgICAgJ3BpZF9wYXJhbWV0ZXJzOiBQSURQYXJhbWV0ZXJzLCcgK1xyXG4gICAgICAgICAgICAnc3RhdGVfcGFyYW1ldGVyczogU3RhdGVQYXJhbWV0ZXJzLCcgK1xyXG4gICAgICAgICAgICAnbGVkX3N0YXRlczogTEVEU3RhdGVzRml4ZWQsJyArXHJcbiAgICAgICAgICAgICduYW1lOiBEZXZpY2VOYW1lLCcgK1xyXG4gICAgICAgICAgICAndmVsb2NpdHlfcGlkX3BhcmFtZXRlcnM6IFZlbG9jaXR5UElEUGFyYW1ldGVycywnICtcclxuICAgICAgICAgICAgJ2luZXJ0aWFsX2JpYXM6IEluZXJ0aWFsQmlhcyB9Oyc7XHJcblxyXG4gICAgICAgIHZhciBjb25maWdGbGFnMTQgPSAnQ29uZmlndXJhdGlvbkZsYWcgPSB7LzE2LycgK1xyXG4gICAgICAgICAgICAndmVyc2lvbjogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2lkOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAncGNiX3RyYW5zZm9ybTogdm9pZCwnICtcclxuICAgICAgICAgICAgJ21peF90YWJsZTogdm9pZCwnICtcclxuICAgICAgICAgICAgJ21hZ19iaWFzOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnY2hhbm5lbDogdm9pZCwnICtcclxuICAgICAgICAgICAgJ3BpZF9wYXJhbWV0ZXJzOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnc3RhdGVfcGFyYW1ldGVyczogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2xlZF9zdGF0ZXM6IFsvLyB2b2lkOjE2XSwnICtcclxuICAgICAgICAgICAgJ25hbWU6IHZvaWR9Oyc7XHJcblxyXG4gICAgICAgIHZhciBjb25maWdGbGFnID0gJ0NvbmZpZ3VyYXRpb25GbGFnID0gey8xNi8nICtcclxuICAgICAgICAgICAgJ3ZlcnNpb246IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdpZDogdm9pZCwnICtcclxuICAgICAgICAgICAgJ3BjYl90cmFuc2Zvcm06IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdtaXhfdGFibGU6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdtYWdfYmlhczogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2NoYW5uZWw6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdwaWRfcGFyYW1ldGVyczogdm9pZCwnICtcclxuICAgICAgICAgICAgJ3N0YXRlX3BhcmFtZXRlcnM6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdsZWRfc3RhdGVzOiBbLy8gdm9pZDoxNl0sJyArXHJcbiAgICAgICAgICAgICduYW1lOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAndmVsb2NpdHlfcGlkX3BhcmFtZXRlcnM6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdpbmVydGlhbF9iaWFzOiB2b2lkIH07JztcclxuXHJcbiAgICAgICAgdmFyIGNvbmZpZ0Z1bGwxNCA9IHZlY3RvcjNmICsgcGlkU2V0dGluZ3MgKyB2ZXJzaW9uICsgY29uZmlnSWQgKyBwY2JUcmFuc2Zvcm0gK1xyXG4gICAgICAgICAgICBtaXhUYWJsZSArIG1hZ0JpYXMgKyBjaGFubmVsUHJvcGVydGllcyArIHBpZFBhcmFtZXRlcnMxNCArIHN0YXRlUGFyYW1ldGVycyArXHJcbiAgICAgICAgICAgIHN0YXR1c0ZsYWcxNDE1ICsgY29sb3IgKyBsZWRTdGF0ZUNhc2UgKyBsZWRTdGF0ZXMgKyBsZWRTdGF0ZXNGaXhlZCArIGRldmljZU5hbWUgK1xyXG4gICAgICAgICAgICBjb25maWcxNDE1ICsgY29uZmlnRml4ZWQxNDE1ICsgY29uZmlnRmxhZzE0O1xyXG4gICAgICAgIHZhciBjb25maWdGdWxsMTUgPSB2ZWN0b3IzZiArIHBpZFNldHRpbmdzICsgdmVyc2lvbiArIGNvbmZpZ0lkICsgcGNiVHJhbnNmb3JtICsgbWl4VGFibGUgK1xyXG4gICAgICAgICAgICBtYWdCaWFzICsgY2hhbm5lbFByb3BlcnRpZXMgKyBwaWRQYXJhbWV0ZXJzICsgc3RhdGVQYXJhbWV0ZXJzICtcclxuICAgICAgICAgICAgc3RhdHVzRmxhZzE0MTUgKyBjb2xvciArIGxlZFN0YXRlQ2FzZSArIGxlZFN0YXRlcyArIGxlZFN0YXRlc0ZpeGVkICsgZGV2aWNlTmFtZSArXHJcbiAgICAgICAgICAgIGNvbmZpZzE0MTUgKyBjb25maWdGaXhlZDE0MTUgKyBjb25maWdGbGFnO1xyXG4gICAgICAgIHZhciBjb25maWdGdWxsMTYgPSB2ZWN0b3IzZiArIHBpZFNldHRpbmdzICsgdmVyc2lvbiArIGNvbmZpZ0lkICsgcGNiVHJhbnNmb3JtICsgbWl4VGFibGUgK1xyXG4gICAgICAgICAgICBtYWdCaWFzICsgY2hhbm5lbFByb3BlcnRpZXMgKyBwaWRQYXJhbWV0ZXJzICsgc3RhdGVQYXJhbWV0ZXJzICtcclxuICAgICAgICAgICAgc3RhdHVzRmxhZyArIGNvbG9yICsgbGVkU3RhdGVDYXNlICsgbGVkU3RhdGVzICsgbGVkU3RhdGVzRml4ZWQgKyBkZXZpY2VOYW1lICtcclxuICAgICAgICAgICAgaW5lcnRpYWxCaWFzICsgdmVsb2NpdHlQaWRQYXJhbWV0ZXJzICtcclxuICAgICAgICAgICAgY29uZmlnICsgY29uZmlnRml4ZWQgKyBjb25maWdGbGFnO1xyXG5cclxuICAgICAgICB2YXIgc3RhdGUgPSAnUm90YXRpb24gPSB7IHBpdGNoOiBmMzIsIHJvbGw6IGYzMiwgeWF3OiBmMzIgfTsnICtcclxuICAgICAgICAgICAgJ1BJRFN0YXRlID0geycgK1xyXG4gICAgICAgICAgICAndGltZXN0YW1wX3VzOiB1MzIsJyArXHJcbiAgICAgICAgICAgICdpbnB1dDogZjMyLCcgK1xyXG4gICAgICAgICAgICAnc2V0cG9pbnQ6IGYzMiwnICtcclxuICAgICAgICAgICAgJ3BfdGVybTogZjMyLCcgK1xyXG4gICAgICAgICAgICAnaV90ZXJtOiBmMzIsJyArXHJcbiAgICAgICAgICAgICdkX3Rlcm06IGYzMiB9OycgK1xyXG4gICAgICAgICAgICAnUmNDb21tYW5kID0geyB0aHJvdHRsZTogaTE2LCBwaXRjaDogaTE2LCByb2xsOiBpMTYsIHlhdzogaTE2IH07JyArXHJcbiAgICAgICAgICAgICdTdGF0ZSA9IHsvMzIvJyArXHJcbiAgICAgICAgICAgICd0aW1lc3RhbXBfdXM6IHUzMiwnICtcclxuICAgICAgICAgICAgJ3N0YXR1czogU3RhdHVzRmxhZywnICtcclxuICAgICAgICAgICAgJ3YwX3JhdzogdTE2LCcgK1xyXG4gICAgICAgICAgICAnaTBfcmF3OiB1MTYsJyArXHJcbiAgICAgICAgICAgICdpMV9yYXc6IHUxNiwnICtcclxuICAgICAgICAgICAgJ2FjY2VsOiBWZWN0b3IzZiwnICtcclxuICAgICAgICAgICAgJ2d5cm86IFZlY3RvcjNmLCcgK1xyXG4gICAgICAgICAgICAnbWFnOiBWZWN0b3IzZiwnICtcclxuICAgICAgICAgICAgJ3RlbXBlcmF0dXJlOiB1MTYsJyArXHJcbiAgICAgICAgICAgICdwcmVzc3VyZTogdTMyLCcgK1xyXG4gICAgICAgICAgICAncHBtOiBbaTE2OjZdLCcgK1xyXG4gICAgICAgICAgICAnYXV4X2NoYW5fbWFzazogdTgsJyArXHJcbiAgICAgICAgICAgICdjb21tYW5kOiBSY0NvbW1hbmQsJyArXHJcbiAgICAgICAgICAgICdjb250cm9sOiB7IGZ6OiBmMzIsIHR4OiBmMzIsIHR5OiBmMzIsIHR6OiBmMzIgfSwnICtcclxuICAgICAgICAgICAgJ3BpZF9tYXN0ZXJfZno6IFBJRFN0YXRlLCcgK1xyXG4gICAgICAgICAgICAncGlkX21hc3Rlcl90eDogUElEU3RhdGUsJyArXHJcbiAgICAgICAgICAgICdwaWRfbWFzdGVyX3R5OiBQSURTdGF0ZSwnICtcclxuICAgICAgICAgICAgJ3BpZF9tYXN0ZXJfdHo6IFBJRFN0YXRlLCcgK1xyXG4gICAgICAgICAgICAncGlkX3NsYXZlX2Z6OiBQSURTdGF0ZSwnICtcclxuICAgICAgICAgICAgJ3BpZF9zbGF2ZV90eDogUElEU3RhdGUsJyArXHJcbiAgICAgICAgICAgICdwaWRfc2xhdmVfdHk6IFBJRFN0YXRlLCcgK1xyXG4gICAgICAgICAgICAncGlkX3NsYXZlX3R6OiBQSURTdGF0ZSwnICtcclxuICAgICAgICAgICAgJ21vdG9yX291dDogW2kxNjo4XSwnICtcclxuICAgICAgICAgICAgJ2tpbmVtYXRpY3NfYW5nbGU6IFJvdGF0aW9uLCcgK1xyXG4gICAgICAgICAgICAna2luZW1hdGljc19yYXRlOiBSb3RhdGlvbiwnICtcclxuICAgICAgICAgICAgJ2tpbmVtYXRpY3NfYWx0aXR1ZGU6IGYzMiwnICtcclxuICAgICAgICAgICAgJ2xvb3BfY291bnQ6IHUzMiB9OycgK1xyXG4gICAgICAgICAgICAnU3RhdGVGaWVsZHMgPSB7LzMyLycgK1xyXG4gICAgICAgICAgICAndGltZXN0YW1wX3VzOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnc3RhdHVzOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAndjBfcmF3OiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnaTBfcmF3OiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnaTFfcmF3OiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnYWNjZWw6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdneXJvOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnbWFnOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAndGVtcGVyYXR1cmU6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdwcmVzc3VyZTogdm9pZCwnICtcclxuICAgICAgICAgICAgJ3BwbTogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2F1eF9jaGFuX21hc2s6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdjb21tYW5kOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnY29udHJvbDogdm9pZCwnICtcclxuICAgICAgICAgICAgJ3BpZF9tYXN0ZXJfZno6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdwaWRfbWFzdGVyX3R4OiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAncGlkX21hc3Rlcl90eTogdm9pZCwnICtcclxuICAgICAgICAgICAgJ3BpZF9tYXN0ZXJfdHo6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdwaWRfc2xhdmVfZno6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdwaWRfc2xhdmVfdHg6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdwaWRfc2xhdmVfdHk6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdwaWRfc2xhdmVfdHo6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdtb3Rvcl9vdXQ6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdraW5lbWF0aWNzX2FuZ2xlOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAna2luZW1hdGljc19yYXRlOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAna2luZW1hdGljc19hbHRpdHVkZTogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2xvb3BfY291bnQ6IHZvaWQgfTsnO1xyXG5cclxuICAgICAgICB2YXIgYXV4TWFzayA9ICdBdXhNYXNrID0gey8vJyArXHJcbiAgICAgICAgICAgICdhdXgxX2xvdzogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2F1eDFfbWlkOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnYXV4MV9oaWdoOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnYXV4Ml9sb3c6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdhdXgyX21pZDogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2F1eDJfaGlnaDogdm9pZCB9Oyc7XHJcblxyXG4gICAgICAgIHZhciBjb21tYW5kcyA9IGF1eE1hc2sgKyAnQ29tbWFuZCA9IHsvMzIvJyArXHJcbiAgICAgICAgICAgICdyZXF1ZXN0X3Jlc3BvbnNlOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnc2V0X2VlcHJvbV9kYXRhOiBDb25maWd1cmF0aW9uRml4ZWQsJyArXHJcbiAgICAgICAgICAgICdyZWluaXRfZWVwcm9tX2RhdGE6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdyZXF1ZXN0X2VlcHJvbV9kYXRhOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAncmVxdWVzdF9lbmFibGVfaXRlcmF0aW9uOiB1OCwnICtcclxuICAgICAgICAgICAgJ21vdG9yX292ZXJyaWRlX3NwZWVkXzA6IHUxNiwnICtcclxuICAgICAgICAgICAgJ21vdG9yX292ZXJyaWRlX3NwZWVkXzE6IHUxNiwnICtcclxuICAgICAgICAgICAgJ21vdG9yX292ZXJyaWRlX3NwZWVkXzI6IHUxNiwnICtcclxuICAgICAgICAgICAgJ21vdG9yX292ZXJyaWRlX3NwZWVkXzM6IHUxNiwnICtcclxuICAgICAgICAgICAgJ21vdG9yX292ZXJyaWRlX3NwZWVkXzQ6IHUxNiwnICtcclxuICAgICAgICAgICAgJ21vdG9yX292ZXJyaWRlX3NwZWVkXzU6IHUxNiwnICtcclxuICAgICAgICAgICAgJ21vdG9yX292ZXJyaWRlX3NwZWVkXzY6IHUxNiwnICtcclxuICAgICAgICAgICAgJ21vdG9yX292ZXJyaWRlX3NwZWVkXzc6IHUxNiwnICtcclxuICAgICAgICAgICAgJ3NldF9jb21tYW5kX292ZXJyaWRlOiBib29sLCcgK1xyXG4gICAgICAgICAgICAnc2V0X3N0YXRlX21hc2s6IFN0YXRlRmllbGRzLCcgK1xyXG4gICAgICAgICAgICAnc2V0X3N0YXRlX2RlbGF5OiB1MTYsJyArXHJcbiAgICAgICAgICAgICdzZXRfc2Rfd3JpdGVfZGVsYXk6IHUxNiwnICtcclxuICAgICAgICAgICAgJ3NldF9sZWQ6IHsnICtcclxuICAgICAgICAgICAgJyAgcGF0dGVybjogdTgsJyArXHJcbiAgICAgICAgICAgICcgIGNvbG9yX3JpZ2h0OiBDb2xvciwnICtcclxuICAgICAgICAgICAgJyAgY29sb3JfbGVmdDogQ29sb3IsJyArXHJcbiAgICAgICAgICAgICcgIGluZGljYXRvcl9yZWQ6IGJvb2wsJyArXHJcbiAgICAgICAgICAgICcgIGluZGljYXRvcl9ncmVlbjogYm9vbCB9LCcgK1xyXG4gICAgICAgICAgICAnc2V0X3NlcmlhbF9yYzogeyBlbmFibGVkOiBib29sLCBjb21tYW5kOiBSY0NvbW1hbmQsIGF1eF9tYXNrOiBBdXhNYXNrIH0sJyArXHJcbiAgICAgICAgICAgICdzZXRfY2FyZF9yZWNvcmRpbmdfc3RhdGU6IHsvOC8gcmVjb3JkX3RvX2NhcmQ6IHZvaWQsIGxvY2tfcmVjb3JkaW5nX3N0YXRlOiB2b2lkIH0sJyArXHJcbiAgICAgICAgICAgICdzZXRfcGFydGlhbF9lZXByb21fZGF0YTogQ29uZmlndXJhdGlvbiwnICtcclxuICAgICAgICAgICAgJ3JlaW5pdF9wYXJ0aWFsX2VlcHJvbV9kYXRhOiBDb25maWd1cmF0aW9uRmxhZywnICtcclxuICAgICAgICAgICAgJ3JlcV9wYXJ0aWFsX2VlcHJvbV9kYXRhOiBDb25maWd1cmF0aW9uRmxhZywnICtcclxuICAgICAgICAgICAgJ3JlcV9jYXJkX3JlY29yZGluZ19zdGF0ZTogdm9pZCwnICtcclxuICAgICAgICAgICAgJ3NldF9wYXJ0aWFsX3RlbXBvcmFyeV9jb25maWc6IENvbmZpZ3VyYXRpb24sJyArXHJcbiAgICAgICAgICAgICdzZXRfY29tbWFuZF9zb3VyY2VzOiB7LzgvIHNlcmlhbDogdm9pZCwgcmFkaW86IHZvaWQgfSwnICtcclxuICAgICAgICAgICAgJ3NldF9jYWxpYnJhdGlvbjogeyBlbmFibGVkOiBib29sLCBtb2RlOiB1OCB9LCcgK1xyXG4gICAgICAgICAgICAnc2V0X2F1dG9waWxvdF9lbmFibGVkOiBib29sLCcgK1xyXG4gICAgICAgICAgICAnc2V0X3VzYl9tb2RlOiB1OH07JztcclxuXHJcbiAgICAgICAgdmFyIGRlYnVnU3RyaW5nID0gXCJEZWJ1Z1N0cmluZyA9IHsgZGVwcmVjYXRlZF9tYXNrOiB1MzIsIG1lc3NhZ2U6IHMgfTtcIjtcclxuICAgICAgICB2YXIgaGlzdG9yeURhdGEgPSBcIkhpc3RvcnlEYXRhID0gRGVidWdTdHJpbmc7XCI7XHJcbiAgICAgICAgdmFyIHJlc3BvbnNlID0gXCJSZXNwb25zZSA9IHsgbWFzazogdTMyLCBhY2s6IHUzMiB9O1wiO1xyXG4gICAgICAgIHZhciBwcm90b2NvbCA9IFwiUHJvdG9jb2xJbmZvID0geyB2ZXJzaW9uOiBWZXJzaW9uLCBzdHJ1Y3R1cmU6IHMgfTtcIiArXHJcbiAgICAgICAgICAgIFwiUHJvdG9jb2wgPSB7LzMyLyByZXF1ZXN0OiB2b2lkLCByZXNwb25zZTogUHJvdG9jb2xJbmZvIH07XCI7XHJcblxyXG4gICAgICAgIHZhciBoYW5kbGVyMTQgPSBjb25maWdGdWxsMTQgKyBzdGF0ZSArIGNvbW1hbmRzICsgZGVidWdTdHJpbmcgKyBoaXN0b3J5RGF0YSArIHJlc3BvbnNlICsgcHJvdG9jb2w7XHJcbiAgICAgICAgdmFyIGhhbmRsZXIxNSA9IGNvbmZpZ0Z1bGwxNSArIHN0YXRlICsgY29tbWFuZHMgKyBkZWJ1Z1N0cmluZyArIGhpc3RvcnlEYXRhICsgcmVzcG9uc2UgKyBwcm90b2NvbDtcclxuICAgICAgICB2YXIgaGFuZGxlcjE2ID0gY29uZmlnRnVsbDE2ICsgc3RhdGUgKyBjb21tYW5kcyArIGRlYnVnU3RyaW5nICsgaGlzdG9yeURhdGEgKyByZXNwb25zZSArIHByb3RvY29sO1xyXG5cclxuICAgICAgICBoYW5kbGVyQ2FjaGVbJzEuNC4wJ10gPSBGbHlicml4U2VyaWFsaXphdGlvbi5wYXJzZShoYW5kbGVyMTQpO1xyXG4gICAgICAgIGhhbmRsZXJDYWNoZVsnMS41LjAnXSA9IGhhbmRsZXJDYWNoZVsnMS41LjEnXSA9IEZseWJyaXhTZXJpYWxpemF0aW9uLnBhcnNlKGhhbmRsZXIxNSk7XHJcbiAgICAgICAgaGFuZGxlckNhY2hlWycxLjYuMCddID0gRmx5YnJpeFNlcmlhbGl6YXRpb24ucGFyc2UoaGFuZGxlcjE2KTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gdXBkYXRlRmllbGRzKHRhcmdldCwgc291cmNlKSB7XHJcbiAgICAgICAgICAgIGlmIChzb3VyY2UgaW5zdGFuY2VvZiBBcnJheSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHVwZGF0ZUZpZWxkc0FycmF5KHRhcmdldCwgc291cmNlKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChzb3VyY2UgaW5zdGFuY2VvZiBPYmplY3QpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB1cGRhdGVGaWVsZHNPYmplY3QodGFyZ2V0LCBzb3VyY2UpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIChzb3VyY2UgPT09IG51bGwgfHwgc291cmNlID09PSB1bmRlZmluZWQpID8gdGFyZ2V0IDogc291cmNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiB1cGRhdGVGaWVsZHNPYmplY3QodGFyZ2V0LCBzb3VyY2UpIHtcclxuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IHt9O1xyXG4gICAgICAgICAgICBPYmplY3Qua2V5cyh0YXJnZXQpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xyXG4gICAgICAgICAgICAgICAgcmVzdWx0W2tleV0gPSB1cGRhdGVGaWVsZHModGFyZ2V0W2tleV0sIHNvdXJjZVtrZXldKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKHNvdXJjZSkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoa2V5IGluIHJlc3VsdCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJlc3VsdFtrZXldID0gdXBkYXRlRmllbGRzKHRhcmdldFtrZXldLCBzb3VyY2Vba2V5XSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gdXBkYXRlRmllbGRzQXJyYXkodGFyZ2V0LCBzb3VyY2UpIHtcclxuICAgICAgICAgICAgdmFyIGxlbmd0aCA9IE1hdGgubWF4KHRhcmdldC5sZW5ndGgsIHNvdXJjZS5sZW5ndGgpO1xyXG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gW107XHJcbiAgICAgICAgICAgIGZvciAodmFyIGlkeCA9IDA7IGlkeCA8IGxlbmd0aDsgKytpZHgpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdC5wdXNoKHVwZGF0ZUZpZWxkcyh0YXJnZXRbaWR4XSwgc291cmNlW2lkeF0pKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgU2VyaWFsaXplcjogRmx5YnJpeFNlcmlhbGl6YXRpb24uU2VyaWFsaXplcixcclxuICAgICAgICAgICAgZ2V0SGFuZGxlcjogZnVuY3Rpb24gKGZpcm13YXJlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaGFuZGxlckNhY2hlW2Zpcm13YXJlXTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgYWRkSGFuZGxlcjogZnVuY3Rpb24gKHZlcnNpb24sIHN0cnVjdHVyZSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHZlcnNpb25TdHJpbmcgPSB2ZXJzaW9uLm1ham9yLnRvU3RyaW5nKCkgKyAnLicgKyB2ZXJzaW9uLm1pbm9yLnRvU3RyaW5nKCkgKyB2ZXJzaW9uLnBhdGNoLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgICAgICBoYW5kbGVyQ2FjaGVbdmVyc2lvblN0cmluZ10gPSBGbHlicml4U2VyaWFsaXphdGlvbi5wYXJzZShzdHJ1Y3R1cmUpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB1cGRhdGVGaWVsZHM6IHVwZGF0ZUZpZWxkcyxcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxufSgpKTtcclxuIl19
