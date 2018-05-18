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
                mask = { set_partial_temporary_config: mask };
            } else {
                message.set_partial_eeprom_data = newConfig;
                mask = { set_partial_eeprom_data: mask };
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

        var newestVersion = serializationHandler.getNewestVersion();

        var desired = [newestVersion.major, newestVersion.minor, newestVersion.patch];
        var desiredKey = desired[0].toString() + '.' + desired[1].toString() + '.' + desired[2].toString();

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
                return !!serializationHandler.getHandler(key);
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
        var newestVersion = { major: 0, minor: 0, patch: 0 };
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

        function isNewerVersion(version) {
            if (version.major !== newestVersion.major) {
                return version.major > newestVersion.major;
            }
            if (version.minor !== newestVersion.minor) {
                return version.minor > newestVersion.minor;
            }
            return version.patch > newestVersion.patch;
        }

        function addHandler(version, structure) {
            if (isNewerVersion(version)) {
                newestVersion = {
                    major: version.major,
                    minor: version.minor,
                    patch: version.patch,
                };
            }
            var versionString = version.major.toString() + '.' + version.minor.toString() + '.' + version.patch.toString();
            handlerCache[versionString] = FlybrixSerialization.parse(structure);
        }

        addHandler({major: 1, minor: 4, patch: 0}, handler14);
        addHandler({major: 1, minor: 5, patch: 0}, handler15);
        addHandler({major: 1, minor: 5, patch: 1}, handler15);
        addHandler({major: 1, minor: 6, patch: 0}, handler16);

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
            getNewestVersion: function () {
                return newestVersion;
            },
            addHandler: addHandler,
            updateFields: updateFields,
        };
    }

}());

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZS5qcyIsImNhbGlicmF0aW9uLmpzIiwiY29icy5qcyIsImNvbW1hbmRMb2cuanMiLCJkZXZpY2VDb25maWcuanMiLCJmaXJtd2FyZVZlcnNpb24uanMiLCJsZWQuanMiLCJyY0RhdGEuanMiLCJzZXJpYWwuanMiLCJzZXJpYWxpemF0aW9uSGFuZGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZmx5YnJpeC1jb21tb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ2ZseWJyaXhDb21tb24nLCBbXSk7XHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgnZmx5YnJpeENvbW1vbicpLmZhY3RvcnkoJ2NhbGlicmF0aW9uJywgY2FsaWJyYXRpb24pO1xyXG5cclxuICAgIGNhbGlicmF0aW9uLiRpbmplY3QgPSBbJ2NvbW1hbmRMb2cnLCAnc2VyaWFsJ107XHJcblxyXG4gICAgZnVuY3Rpb24gY2FsaWJyYXRpb24oY29tbWFuZExvZywgc2VyaWFsKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgbWFnbmV0b21ldGVyOiBtYWduZXRvbWV0ZXIsXHJcbiAgICAgICAgICAgIGFjY2VsZXJvbWV0ZXI6IHtcclxuICAgICAgICAgICAgICAgIGZsYXQ6IGNhbGlicmF0ZUFjY2VsZXJvbWV0ZXIuYmluZChudWxsLCAnZmxhdCcsIDApLFxyXG4gICAgICAgICAgICAgICAgZm9yd2FyZDogY2FsaWJyYXRlQWNjZWxlcm9tZXRlci5iaW5kKG51bGwsICdsZWFuIGZvcndhcmQnLCAxKSxcclxuICAgICAgICAgICAgICAgIGJhY2s6IGNhbGlicmF0ZUFjY2VsZXJvbWV0ZXIuYmluZChudWxsLCAnbGVhbiBiYWNrJywgMiksXHJcbiAgICAgICAgICAgICAgICByaWdodDogY2FsaWJyYXRlQWNjZWxlcm9tZXRlci5iaW5kKG51bGwsICdsZWFuIHJpZ2h0JywgMyksXHJcbiAgICAgICAgICAgICAgICBsZWZ0OiBjYWxpYnJhdGVBY2NlbGVyb21ldGVyLmJpbmQobnVsbCwgJ2xlYW4gbGVmdCcsIDQpLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBmaW5pc2g6IGZpbmlzaCxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBtYWduZXRvbWV0ZXIoKSB7XHJcbiAgICAgICAgICAgIGNvbW1hbmRMb2coXCJDYWxpYnJhdGluZyBtYWduZXRvbWV0ZXIgYmlhc1wiKTtcclxuICAgICAgICAgICAgcmV0dXJuIHNlcmlhbC5zZW5kU3RydWN0dXJlKCdDb21tYW5kJywge1xyXG4gICAgICAgICAgICAgICAgcmVxdWVzdF9yZXNwb25zZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHNldF9jYWxpYnJhdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgIGVuYWJsZWQ6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgbW9kZTogMCxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0sIGZhbHNlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGNhbGlicmF0ZUFjY2VsZXJvbWV0ZXIocG9zZURlc2NyaXB0aW9uLCBwb3NlSWQpIHtcclxuICAgICAgICAgICAgY29tbWFuZExvZyhcIkNhbGlicmF0aW5nIGdyYXZpdHkgZm9yIHBvc2U6IFwiICsgcG9zZURlc2NyaXB0aW9uKTtcclxuICAgICAgICAgICAgcmV0dXJuIHNlcmlhbC5zZW5kU3RydWN0dXJlKCdDb21tYW5kJywge1xyXG4gICAgICAgICAgICAgICAgcmVxdWVzdF9yZXNwb25zZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHNldF9jYWxpYnJhdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgIGVuYWJsZWQ6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgbW9kZTogcG9zZUlkICsgMSxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0sIGZhbHNlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGZpbmlzaCgpIHtcclxuICAgICAgICAgICAgY29tbWFuZExvZyhcIkZpbmlzaGluZyBjYWxpYnJhdGlvblwiKTtcclxuICAgICAgICAgICAgcmV0dXJuIHNlcmlhbC5zZW5kU3RydWN0dXJlKCdDb21tYW5kJywge1xyXG4gICAgICAgICAgICAgICAgcmVxdWVzdF9yZXNwb25zZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHNldF9jYWxpYnJhdGlvbjoge1xyXG4gICAgICAgICAgICAgICAgICAgIGVuYWJsZWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgIG1vZGU6IDAsXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9LCBmYWxzZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KCkpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ2ZseWJyaXhDb21tb24nKS5mYWN0b3J5KCdjb2JzJywgY29icyk7XHJcblxyXG4gICAgZnVuY3Rpb24gY29icygpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBSZWFkZXI6IFJlYWRlcixcclxuICAgICAgICAgICAgZW5jb2RlOiBlbmNvZGUsXHJcbiAgICAgICAgfTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgZnVuY3Rpb24gUmVhZGVyKGNhcGFjaXR5KSB7XHJcbiAgICAgICAgaWYgKGNhcGFjaXR5ID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgY2FwYWNpdHkgPSAyMDAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLk4gPSBjYXBhY2l0eTtcclxuICAgICAgICB0aGlzLmJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KGNhcGFjaXR5KTtcclxuICAgICAgICB0aGlzLnJlYWR5X2Zvcl9uZXdfbWVzc2FnZSA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5idWZmZXJfbGVuZ3RoID0gMDtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBjb2JzRGVjb2RlKHJlYWRlcikge1xyXG4gICAgICAgIHZhciBzcmNfcHRyID0gMDtcclxuICAgICAgICB2YXIgZHN0X3B0ciA9IDA7XHJcbiAgICAgICAgdmFyIGxlZnRvdmVyX2xlbmd0aCA9IDA7XHJcbiAgICAgICAgdmFyIGFwcGVuZF96ZXJvID0gZmFsc2U7XHJcbiAgICAgICAgd2hpbGUgKHJlYWRlci5idWZmZXJbc3JjX3B0cl0pIHtcclxuICAgICAgICAgICAgaWYgKCFsZWZ0b3Zlcl9sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIGlmIChhcHBlbmRfemVybylcclxuICAgICAgICAgICAgICAgICAgICByZWFkZXIuYnVmZmVyW2RzdF9wdHIrK10gPSAwO1xyXG4gICAgICAgICAgICAgICAgbGVmdG92ZXJfbGVuZ3RoID0gcmVhZGVyLmJ1ZmZlcltzcmNfcHRyKytdIC0gMTtcclxuICAgICAgICAgICAgICAgIGFwcGVuZF96ZXJvID0gbGVmdG92ZXJfbGVuZ3RoIDwgMHhGRTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC0tbGVmdG92ZXJfbGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgcmVhZGVyLmJ1ZmZlcltkc3RfcHRyKytdID0gcmVhZGVyLmJ1ZmZlcltzcmNfcHRyKytdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gbGVmdG92ZXJfbGVuZ3RoID8gMCA6IGRzdF9wdHI7XHJcbiAgICB9XHJcblxyXG4gICAgUmVhZGVyLnByb3RvdHlwZS5yZWFkQnl0ZXMgPSBmdW5jdGlvbihkYXRhLCBvblN1Y2Nlc3MsIG9uRXJyb3IpIHtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdmFyIGMgPSBkYXRhW2ldO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5yZWFkeV9mb3JfbmV3X21lc3NhZ2UpIHtcclxuICAgICAgICAgICAgICAgIC8vIGZpcnN0IGJ5dGUgb2YgYSBuZXcgbWVzc2FnZVxyXG4gICAgICAgICAgICAgICAgdGhpcy5yZWFkeV9mb3JfbmV3X21lc3NhZ2UgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYnVmZmVyX2xlbmd0aCA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuYnVmZmVyW3RoaXMuYnVmZmVyX2xlbmd0aCsrXSA9IGM7XHJcblxyXG4gICAgICAgICAgICBpZiAoYykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYnVmZmVyX2xlbmd0aCA9PT0gdGhpcy5OKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gYnVmZmVyIG92ZXJmbG93LCBwcm9iYWJseSBkdWUgdG8gZXJyb3JzIGluIGRhdGFcclxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKCdvdmVyZmxvdycsICdidWZmZXIgb3ZlcmZsb3cgaW4gQ09CUyBkZWNvZGluZycpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVhZHlfZm9yX25ld19tZXNzYWdlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLmJ1ZmZlcl9sZW5ndGggPSBjb2JzRGVjb2RlKHRoaXMpO1xyXG4gICAgICAgICAgICB2YXIgZmFpbGVkX2RlY29kZSA9ICh0aGlzLmJ1ZmZlcl9sZW5ndGggPT09IDApO1xyXG4gICAgICAgICAgICBpZiAoZmFpbGVkX2RlY29kZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5idWZmZXJbMF0gPSAxO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciBqO1xyXG4gICAgICAgICAgICBmb3IgKGogPSAxOyBqIDwgdGhpcy5idWZmZXJfbGVuZ3RoOyArK2opIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYnVmZmVyWzBdIF49IHRoaXMuYnVmZmVyW2pdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmJ1ZmZlclswXSA9PT0gMCkgeyAgLy8gY2hlY2sgc3VtIGlzIGNvcnJlY3RcclxuICAgICAgICAgICAgICAgIHRoaXMucmVhZHlfZm9yX25ld19tZXNzYWdlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmJ1ZmZlcl9sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgb25TdWNjZXNzKHRoaXMuYnVmZmVyLnNsaWNlKDEsIHRoaXMuYnVmZmVyX2xlbmd0aCkpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKCdzaG9ydCcsICdUb28gc2hvcnQgcGFja2V0Jyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7ICAvLyBiYWQgY2hlY2tzdW1cclxuICAgICAgICAgICAgICAgIHRoaXMucmVhZHlfZm9yX25ld19tZXNzYWdlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHZhciBieXRlcyA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICB2YXIgbWVzc2FnZSA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICBmb3IgKGogPSAwOyBqIDwgdGhpcy5idWZmZXJfbGVuZ3RoOyBqKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBieXRlcyArPSB0aGlzLmJ1ZmZlcltqXSArIFwiLFwiO1xyXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UgKz0gU3RyaW5nLmZyb21DaGFyQ29kZSh0aGlzLmJ1ZmZlcltqXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoZmFpbGVkX2RlY29kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIG9uRXJyb3IoJ2ZyYW1lJywgJ1VuZXhwZWN0ZWQgZW5kaW5nIG9mIHBhY2tldCcpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbXNnID0gJ0JBRCBDSEVDS1NVTSAoJyArIHRoaXMuYnVmZmVyX2xlbmd0aCArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICcgYnl0ZXMpJyArIGJ5dGVzICsgbWVzc2FnZTtcclxuICAgICAgICAgICAgICAgICAgICBvbkVycm9yKCdjaGVja3N1bScsIG1zZyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIGZ1bmN0aW9uIGVuY29kZShidWYpIHtcclxuICAgICAgICB2YXIgcmV0dmFsID1cclxuICAgICAgICAgICAgbmV3IFVpbnQ4QXJyYXkoTWF0aC5mbG9vcigoYnVmLmJ5dGVMZW5ndGggKiAyNTUgKyA3NjEpIC8gMjU0KSk7XHJcbiAgICAgICAgdmFyIGxlbiA9IDE7XHJcbiAgICAgICAgdmFyIHBvc19jdHIgPSAwO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYnVmLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgIGlmIChyZXR2YWxbcG9zX2N0cl0gPT0gMHhGRSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dmFsW3Bvc19jdHJdID0gMHhGRjtcclxuICAgICAgICAgICAgICAgIHBvc19jdHIgPSBsZW4rKztcclxuICAgICAgICAgICAgICAgIHJldHZhbFtwb3NfY3RyXSA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIHZhbCA9IGJ1ZltpXTtcclxuICAgICAgICAgICAgKytyZXR2YWxbcG9zX2N0cl07XHJcbiAgICAgICAgICAgIGlmICh2YWwpIHtcclxuICAgICAgICAgICAgICAgIHJldHZhbFtsZW4rK10gPSB2YWw7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBwb3NfY3RyID0gbGVuKys7XHJcbiAgICAgICAgICAgICAgICByZXR2YWxbcG9zX2N0cl0gPSAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXR2YWwuc3ViYXJyYXkoMCwgbGVuKS5zbGljZSgpLmJ1ZmZlcjtcclxuICAgIH07XHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgnZmx5YnJpeENvbW1vbicpLmZhY3RvcnkoJ2NvbW1hbmRMb2cnLCBjb21tYW5kTG9nKTtcclxuXHJcbiAgICBjb21tYW5kTG9nLiRpbmplY3QgPSBbJyRxJ107XHJcblxyXG4gICAgZnVuY3Rpb24gY29tbWFuZExvZygkcSkge1xyXG4gICAgICAgIHZhciBtZXNzYWdlcyA9IFtdO1xyXG4gICAgICAgIHZhciByZXNwb25kZXIgPSAkcS5kZWZlcigpO1xyXG5cclxuICAgICAgICB2YXIgc2VydmljZSA9IGxvZztcclxuICAgICAgICBzZXJ2aWNlLmxvZyA9IGxvZztcclxuICAgICAgICBzZXJ2aWNlLmNsZWFyU3Vic2NyaWJlcnMgPSBjbGVhclN1YnNjcmliZXJzO1xyXG4gICAgICAgIHNlcnZpY2Uub25NZXNzYWdlID0gb25NZXNzYWdlO1xyXG4gICAgICAgIHNlcnZpY2UucmVhZCA9IHJlYWQ7XHJcblxyXG4gICAgICAgIHJldHVybiBzZXJ2aWNlO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBsb2cobWVzc2FnZSkge1xyXG4gICAgICAgICAgICBpZiAobWVzc2FnZSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICBtZXNzYWdlcy5wdXNoKG1lc3NhZ2UpO1xyXG4gICAgICAgICAgICAgICAgcmVzcG9uZGVyLm5vdGlmeShyZWFkKCkpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiByZWFkKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gbWVzc2FnZXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBjbGVhclN1YnNjcmliZXJzKCkge1xyXG4gICAgICAgICAgICByZXNwb25kZXIgPSAkcS5kZWZlcigpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gb25NZXNzYWdlKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXNwb25kZXIucHJvbWlzZS50aGVuKHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBjYWxsYmFjayk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KCkpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ2ZseWJyaXhDb21tb24nKS5mYWN0b3J5KCdkZXZpY2VDb25maWcnLCBkZXZpY2VDb25maWcpO1xyXG5cclxuICAgIGRldmljZUNvbmZpZy4kaW5qZWN0ID0gWydzZXJpYWwnLCAnY29tbWFuZExvZycsICdmaXJtd2FyZVZlcnNpb24nLCAnc2VyaWFsaXphdGlvbkhhbmRsZXInXTtcclxuXHJcbiAgICBmdW5jdGlvbiBkZXZpY2VDb25maWcoc2VyaWFsLCBjb21tYW5kTG9nLCBmaXJtd2FyZVZlcnNpb24sIHNlcmlhbGl6YXRpb25IYW5kbGVyKSB7XHJcbiAgICAgICAgdmFyIGNvbmZpZztcclxuXHJcbiAgICAgICAgdmFyIGNvbmZpZ0NhbGxiYWNrID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGNvbW1hbmRMb2coJ05vIGNhbGxiYWNrIGRlZmluZWQgZm9yIHJlY2VpdmluZyBjb25maWd1cmF0aW9ucyEnKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgbG9nZ2luZ0NhbGxiYWNrID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGNvbW1hbmRMb2coXHJcbiAgICAgICAgICAgICAgICAnTm8gY2FsbGJhY2sgZGVmaW5lZCBmb3IgcmVjZWl2aW5nIGxvZ2dpbmcgc3RhdGUhJyArXHJcbiAgICAgICAgICAgICAgICAnIENhbGxiYWNrIGFyZ3VtZW50czogKGlzTG9nZ2luZywgaXNMb2NrZWQsIGRlbGF5KScpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHNlcmlhbC5hZGRPblJlY2VpdmVDYWxsYmFjayhmdW5jdGlvbihtZXNzYWdlVHlwZSwgbWVzc2FnZSkge1xyXG4gICAgICAgICAgICBpZiAobWVzc2FnZVR5cGUgIT09ICdDb21tYW5kJykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICgnc2V0X2VlcHJvbV9kYXRhJyBpbiBtZXNzYWdlKSB7XHJcbiAgICAgICAgICAgICAgICB1cGRhdGVDb25maWdGcm9tUmVtb3RlRGF0YShtZXNzYWdlLnNldF9lZXByb21fZGF0YSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCdzZXRfcGFydGlhbF9lZXByb21fZGF0YScgaW4gbWVzc2FnZSkge1xyXG4gICAgICAgICAgICAgICAgdXBkYXRlQ29uZmlnRnJvbVJlbW90ZURhdGEobWVzc2FnZS5zZXRfcGFydGlhbF9lZXByb21fZGF0YSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCgnc2V0X2NhcmRfcmVjb3JkaW5nX3N0YXRlJyBpbiBtZXNzYWdlKSAmJiAoJ3NldF9zZF93cml0ZV9kZWxheScgaW4gbWVzc2FnZSkpIHtcclxuICAgICAgICAgICAgICAgIHZhciBjYXJkX3JlY19zdGF0ZSA9IG1lc3NhZ2Uuc2V0X2NhcmRfcmVjb3JkaW5nX3N0YXRlO1xyXG4gICAgICAgICAgICAgICAgdmFyIHNkX3dyaXRlX2RlbGF5ID0gbWVzc2FnZS5zZXRfc2Rfd3JpdGVfZGVsYXk7XHJcbiAgICAgICAgICAgICAgICBsb2dnaW5nQ2FsbGJhY2soY2FyZF9yZWNfc3RhdGUucmVjb3JkX3RvX2NhcmQsIGNhcmRfcmVjX3N0YXRlLmxvY2tfcmVjb3JkaW5nX3N0YXRlLCBzZF93cml0ZV9kZWxheSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0RGVzaXJlZFZlcnNpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmaXJtd2FyZVZlcnNpb24uZGVzaXJlZCgpO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHJlcXVlc3QoKSB7XHJcbiAgICAgICAgICAgIHZhciBoYW5kbGVycyA9IGZpcm13YXJlVmVyc2lvbi5zZXJpYWxpemF0aW9uSGFuZGxlcigpO1xyXG4gICAgICAgICAgICBjb21tYW5kTG9nKCdSZXF1ZXN0aW5nIGN1cnJlbnQgY29uZmlndXJhdGlvbiBkYXRhLi4uJyk7XHJcbiAgICAgICAgICAgIHJldHVybiBzZXJpYWwuc2VuZFN0cnVjdHVyZSgnQ29tbWFuZCcsIHtcclxuICAgICAgICAgICAgICAgIHJlcXVlc3RfcmVzcG9uc2U6IHRydWUsXHJcbiAgICAgICAgICAgICAgICByZXFfcGFydGlhbF9lZXByb21fZGF0YTogaGFuZGxlcnMuQ29uZmlndXJhdGlvbkZsYWcuZW1wdHkoKSxcclxuICAgICAgICAgICAgfSwgZmFsc2UpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gcmVpbml0KCkge1xyXG4gICAgICAgICAgICBjb21tYW5kTG9nKCdTZXR0aW5nIGZhY3RvcnkgZGVmYXVsdCBjb25maWd1cmF0aW9uIGRhdGEuLi4nKTtcclxuICAgICAgICAgICAgcmV0dXJuIHNlcmlhbC5zZW5kU3RydWN0dXJlKCdDb21tYW5kJywge1xyXG4gICAgICAgICAgICAgICAgcmVxdWVzdF9yZXNwb25zZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHJlaW5pdF9lZXByb21fZGF0YTogdHJ1ZSxcclxuICAgICAgICAgICAgfSwgZmFsc2UpXHJcbiAgICAgICAgICAgICAgICAudGhlbihcclxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlcXVlc3QoKTtcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKHJlYXNvbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb21tYW5kTG9nKFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ1JlcXVlc3QgZm9yIGZhY3RvcnkgcmVzZXQgZmFpbGVkOiAnICsgcmVhc29uKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNlbmQobmV3Q29uZmlnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzZW5kQ29uZmlnKHsgY29uZmlnOiBuZXdDb25maWcsIHRlbXBvcmFyeTogZmFsc2UsIHJlcXVlc3RVcGRhdGU6IHRydWUgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZW5kQ29uZmlnKHByb3BlcnRpZXMpIHtcclxuICAgICAgICAgICAgdmFyIGhhbmRsZXJzID0gZmlybXdhcmVWZXJzaW9uLnNlcmlhbGl6YXRpb25IYW5kbGVyKCk7XHJcbiAgICAgICAgICAgIHZhciBtYXNrID0gcHJvcGVydGllcy5tYXNrIHx8IGhhbmRsZXJzLkNvbmZpZ3VyYXRpb25GbGFnLmVtcHR5KCk7XHJcbiAgICAgICAgICAgIHZhciBuZXdDb25maWcgPSBwcm9wZXJ0aWVzLmNvbmZpZyB8fCBjb25maWc7XHJcbiAgICAgICAgICAgIHZhciByZXF1ZXN0VXBkYXRlID0gcHJvcGVydGllcy5yZXF1ZXN0VXBkYXRlIHx8IGZhbHNlO1xyXG4gICAgICAgICAgICB2YXIgbWVzc2FnZSA9IHtcclxuICAgICAgICAgICAgICAgIHJlcXVlc3RfcmVzcG9uc2U6IHRydWUsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGlmIChwcm9wZXJ0aWVzLnRlbXBvcmFyeSkge1xyXG4gICAgICAgICAgICAgICAgbWVzc2FnZS5zZXRfcGFydGlhbF90ZW1wb3JhcnlfY29uZmlnID0gbmV3Q29uZmlnO1xyXG4gICAgICAgICAgICAgICAgbWFzayA9IHsgc2V0X3BhcnRpYWxfdGVtcG9yYXJ5X2NvbmZpZzogbWFzayB9O1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgbWVzc2FnZS5zZXRfcGFydGlhbF9lZXByb21fZGF0YSA9IG5ld0NvbmZpZztcclxuICAgICAgICAgICAgICAgIG1hc2sgPSB7IHNldF9wYXJ0aWFsX2VlcHJvbV9kYXRhOiBtYXNrIH07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHNlcmlhbC5zZW5kU3RydWN0dXJlKCdDb21tYW5kJywgbWVzc2FnZSwgdHJ1ZSwgbWFzaykudGhlbihmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGlmIChyZXF1ZXN0VXBkYXRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVxdWVzdCgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHVwZGF0ZUNvbmZpZ0Zyb21SZW1vdGVEYXRhKGNvbmZpZ0NoYW5nZXMpIHtcclxuICAgICAgICAgICAgLy9jb21tYW5kTG9nKCdSZWNlaXZlZCBjb25maWchJyk7XHJcbiAgICAgICAgICAgIGNvbmZpZyA9IHNlcmlhbGl6YXRpb25IYW5kbGVyLnVwZGF0ZUZpZWxkcyhjb25maWcsIGNvbmZpZ0NoYW5nZXMpO1xyXG4gICAgICAgICAgICB2YXIgdmVyc2lvbiA9IFtjb25maWcudmVyc2lvbi5tYWpvciwgY29uZmlnLnZlcnNpb24ubWlub3IsIGNvbmZpZy52ZXJzaW9uLnBhdGNoXTtcclxuICAgICAgICAgICAgZmlybXdhcmVWZXJzaW9uLnNldCh2ZXJzaW9uKTtcclxuICAgICAgICAgICAgaWYgKCFmaXJtd2FyZVZlcnNpb24uc3VwcG9ydGVkKCkpIHtcclxuICAgICAgICAgICAgICAgIGNvbW1hbmRMb2coJ1JlY2VpdmVkIGFuIHVuc3VwcG9ydGVkIGNvbmZpZ3VyYXRpb24hJyk7XHJcbiAgICAgICAgICAgICAgICBjb21tYW5kTG9nKFxyXG4gICAgICAgICAgICAgICAgICAgICdGb3VuZCB2ZXJzaW9uOiAnICsgdmVyc2lvblswXSArICcuJyArIHZlcnNpb25bMV0gKyAnLicgKyB2ZXJzaW9uWzJdICArXHJcbiAgICAgICAgICAgICAgICAgICAgJyAtLS0gTmV3ZXN0IHZlcnNpb246ICcgK1xyXG4gICAgICAgICAgICAgICAgICAgIGZpcm13YXJlVmVyc2lvbi5kZXNpcmVkS2V5KCkgKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbW1hbmRMb2coXHJcbiAgICAgICAgICAgICAgICAgICAgJ1JlY2VpdmVkIGNvbmZpZ3VyYXRpb24gZGF0YSAodicgK1xyXG4gICAgICAgICAgICAgICAgICAgIHZlcnNpb25bMF0gKyAnLicgKyB2ZXJzaW9uWzFdICsgJy4nICsgdmVyc2lvblsyXSArJyknKTtcclxuICAgICAgICAgICAgICAgIGNvbmZpZ0NhbGxiYWNrKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNldENvbmZpZ0NhbGxiYWNrKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIGNvbmZpZ0NhbGxiYWNrID0gY2FsbGJhY2s7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZXRMb2dnaW5nQ2FsbGJhY2soY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgbG9nZ2luZ0NhbGxiYWNrID0gY2FsbGJhY2s7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRDb25maWcoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBjb25maWc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25maWcgPSBmaXJtd2FyZVZlcnNpb24uc2VyaWFsaXphdGlvbkhhbmRsZXIoKS5Db25maWd1cmF0aW9uLmVtcHR5KCk7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHJlcXVlc3Q6IHJlcXVlc3QsXHJcbiAgICAgICAgICAgIHJlaW5pdDogcmVpbml0LFxyXG4gICAgICAgICAgICBzZW5kOiBzZW5kLFxyXG4gICAgICAgICAgICBzZW5kQ29uZmlnOiBzZW5kQ29uZmlnLFxyXG4gICAgICAgICAgICBnZXRDb25maWc6IGdldENvbmZpZyxcclxuICAgICAgICAgICAgc2V0Q29uZmlnQ2FsbGJhY2s6IHNldENvbmZpZ0NhbGxiYWNrLFxyXG4gICAgICAgICAgICBzZXRMb2dnaW5nQ2FsbGJhY2s6IHNldExvZ2dpbmdDYWxsYmFjayxcclxuICAgICAgICAgICAgZ2V0RGVzaXJlZFZlcnNpb246IGdldERlc2lyZWRWZXJzaW9uLFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcbn0oKSk7XHJcbiIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBhbmd1bGFyLm1vZHVsZSgnZmx5YnJpeENvbW1vbicpLmZhY3RvcnkoJ2Zpcm13YXJlVmVyc2lvbicsIGZpcm13YXJlVmVyc2lvbik7XHJcblxyXG4gICAgZmlybXdhcmVWZXJzaW9uLiRpbmplY3QgPSBbJ3NlcmlhbGl6YXRpb25IYW5kbGVyJ107XHJcblxyXG4gICAgZnVuY3Rpb24gZmlybXdhcmVWZXJzaW9uKHNlcmlhbGl6YXRpb25IYW5kbGVyKSB7XHJcbiAgICAgICAgdmFyIHZlcnNpb24gPSBbMCwgMCwgMF07XHJcbiAgICAgICAgdmFyIGtleSA9ICcwLjAuMCc7XHJcblxyXG4gICAgICAgIHZhciBuZXdlc3RWZXJzaW9uID0gc2VyaWFsaXphdGlvbkhhbmRsZXIuZ2V0TmV3ZXN0VmVyc2lvbigpO1xyXG5cclxuICAgICAgICB2YXIgZGVzaXJlZCA9IFtuZXdlc3RWZXJzaW9uLm1ham9yLCBuZXdlc3RWZXJzaW9uLm1pbm9yLCBuZXdlc3RWZXJzaW9uLnBhdGNoXTtcclxuICAgICAgICB2YXIgZGVzaXJlZEtleSA9IGRlc2lyZWRbMF0udG9TdHJpbmcoKSArICcuJyArIGRlc2lyZWRbMV0udG9TdHJpbmcoKSArICcuJyArIGRlc2lyZWRbMl0udG9TdHJpbmcoKTtcclxuXHJcbiAgICAgICAgdmFyIGRlZmF1bHRTZXJpYWxpemF0aW9uSGFuZGxlciA9IHNlcmlhbGl6YXRpb25IYW5kbGVyLmdldEhhbmRsZXIoZGVzaXJlZEtleSk7XHJcbiAgICAgICAgdmFyIGN1cnJlbnRTZXJpYWxpemF0aW9uSGFuZGxlciA9IGRlZmF1bHRTZXJpYWxpemF0aW9uSGFuZGxlcjtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgdmVyc2lvbiA9IHZhbHVlO1xyXG4gICAgICAgICAgICAgICAga2V5ID0gdmFsdWUuam9pbignLicpO1xyXG4gICAgICAgICAgICAgICAgY3VycmVudFNlcmlhbGl6YXRpb25IYW5kbGVyID1cclxuICAgICAgICAgICAgICAgICAgICBzZXJpYWxpemF0aW9uSGFuZGxlci5nZXRIYW5kbGVyKGRlc2lyZWRLZXkpIHx8IGRlZmF1bHRTZXJpYWxpemF0aW9uSGFuZGxlcjtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB2ZXJzaW9uO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBrZXk6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGtleTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc3VwcG9ydGVkOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAhIXNlcmlhbGl6YXRpb25IYW5kbGVyLmdldEhhbmRsZXIoa2V5KTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZGVzaXJlZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZGVzaXJlZDtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZGVzaXJlZEtleTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZGVzaXJlZEtleTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc2VyaWFsaXphdGlvbkhhbmRsZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnRTZXJpYWxpemF0aW9uSGFuZGxlcjtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxufSgpKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdmbHlicml4Q29tbW9uJykuZmFjdG9yeSgnbGVkJywgbGVkKTtcclxuXHJcbiAgICBsZWQuJGluamVjdCA9IFsnZGV2aWNlQ29uZmlnJywgJ2Zpcm13YXJlVmVyc2lvbiddO1xyXG5cclxuICAgIGZ1bmN0aW9uIGxlZChkZXZpY2VDb25maWcsIGZpcm13YXJlVmVyc2lvbikge1xyXG4gICAgICAgIHZhciBMZWRQYXR0ZXJucyA9IHtcclxuICAgICAgICAgICAgTk9fT1ZFUlJJREU6IDAsXHJcbiAgICAgICAgICAgIEZMQVNIOiAxLFxyXG4gICAgICAgICAgICBCRUFDT046IDIsXHJcbiAgICAgICAgICAgIEJSRUFUSEU6IDMsXHJcbiAgICAgICAgICAgIEFMVEVSTkFURTogNCxcclxuICAgICAgICAgICAgU09MSUQ6IDUsXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdmFyIGtleXMgPSBbJ3JpZ2h0X2Zyb250JywgJ3JpZ2h0X2JhY2snLCAnbGVmdF9mcm9udCcsICdsZWZ0X2JhY2snXTtcclxuICAgICAgICB2YXIgY29sb3JzID0ge307XHJcblxyXG4gICAgICAgIGtleXMuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcclxuICAgICAgICAgICAgY29sb3JzW2tleV0gPSB7XHJcbiAgICAgICAgICAgICAgICByZWQ6IDAsXHJcbiAgICAgICAgICAgICAgICBncmVlbjogMCxcclxuICAgICAgICAgICAgICAgIGJsdWU6IDAsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdmFyIGxlZFN0YXRlID0ge1xyXG4gICAgICAgICAgICBzdGF0dXM6IDY1NTM1LFxyXG4gICAgICAgICAgICBwYXR0ZXJuOiBMZWRQYXR0ZXJucy5TT0xJRCxcclxuICAgICAgICAgICAgY29sb3JzOiBjb2xvcnMsXHJcbiAgICAgICAgICAgIGluZGljYXRvcl9yZWQ6IGZhbHNlLFxyXG4gICAgICAgICAgICBpbmRpY2F0b3JfZ3JlZW46IGZhbHNlLFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHZhciBjb25maWdQYXJ0ID0geyBsZWRfc3RhdGVzOiBbbGVkU3RhdGVdIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNldChcclxuICAgICAgICAgICAgY29sb3JfcmYsIGNvbG9yX3JiLCBjb2xvcl9sZiwgY29sb3JfbGIsIHBhdHRlcm4sIHJlZCwgZ3JlZW4pIHtcclxuICAgICAgICAgICAgbGVkU3RhdGUuc3RhdHVzID0gZmlybXdhcmVWZXJzaW9uLnNlcmlhbGl6YXRpb25IYW5kbGVyKCkuU3RhdHVzRmxhZy5lbXB0eSgpO1xyXG4gICAgICAgICAgICBpZiAocGF0dGVybiA+IDAgJiYgcGF0dGVybiA8IDYpIHtcclxuICAgICAgICAgICAgICAgIGxlZFN0YXRlLnBhdHRlcm4gPSBwYXR0ZXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFtjb2xvcl9yZiwgY29sb3JfcmIsIGNvbG9yX2xmLCBjb2xvcl9sYl0uZm9yRWFjaChmdW5jdGlvbihcclxuICAgICAgICAgICAgICAgIGNvbG9yLCBpZHgpIHtcclxuICAgICAgICAgICAgICAgIGlmICghY29sb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB2YXIgdiA9IGNvbG9yc1trZXlzW2lkeF1dO1xyXG4gICAgICAgICAgICAgICAgdi5yZWQgPSBjb2xvci5yZWQ7XHJcbiAgICAgICAgICAgICAgICB2LmdyZWVuID0gY29sb3IuZ3JlZW47XHJcbiAgICAgICAgICAgICAgICB2LmJsdWUgPSBjb2xvci5ibHVlO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgaWYgKHJlZCAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICBsZWRTdGF0ZS5pbmRpY2F0b3JfcmVkID0gcmVkO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChncmVlbiAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICBsZWRTdGF0ZS5pbmRpY2F0b3JfZ3JlZW4gPSBncmVlbjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgYXBwbHkoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNldFNpbXBsZShyZWQsIGdyZWVuLCBibHVlKSB7XHJcbiAgICAgICAgICAgIHZhciBjb2xvciA9IHtyZWQ6IHJlZCB8fCAwLCBncmVlbjogZ3JlZW4gfHwgMCwgYmx1ZTogYmx1ZSB8fCAwfTtcclxuICAgICAgICAgICAgc2V0KGNvbG9yLCBjb2xvciwgY29sb3IsIGNvbG9yLCBMZWRQYXR0ZXJucy5TT0xJRCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBhcHBseSgpIHtcclxuICAgICAgICAgICAgZGV2aWNlQ29uZmlnLnNlbmRDb25maWcoe1xyXG4gICAgICAgICAgICAgICAgY29uZmlnOiBjb25maWdQYXJ0LFxyXG4gICAgICAgICAgICAgICAgdGVtcG9yYXJ5OiB0cnVlLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHNldDogc2V0LFxyXG4gICAgICAgICAgICBzZXRTaW1wbGU6IHNldFNpbXBsZSxcclxuICAgICAgICAgICAgcGF0dGVybnM6IExlZFBhdHRlcm5zLFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG59KCkpO1xyXG4iLCIoZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ2ZseWJyaXhDb21tb24nKS5mYWN0b3J5KCdyY0RhdGEnLCByY0RhdGEpO1xyXG5cclxuICAgIHJjRGF0YS4kaW5qZWN0ID0gWydzZXJpYWwnXTtcclxuXHJcbiAgICBmdW5jdGlvbiByY0RhdGEoc2VyaWFsKSB7XHJcbiAgICAgICAgdmFyIEFVWCA9IHtcclxuICAgICAgICAgICAgTE9XOiAwLFxyXG4gICAgICAgICAgICBNSUQ6IDEsXHJcbiAgICAgICAgICAgIEhJR0g6IDIsXHJcbiAgICAgICAgfTtcclxuICAgICAgICB2YXIgYXV4TmFtZXMgPSBbJ2xvdycsICdtaWQnLCAnaGlnaCddO1xyXG5cclxuICAgICAgICB2YXIgdGhyb3R0bGUgPSAtMTtcclxuICAgICAgICB2YXIgcGl0Y2ggPSAwO1xyXG4gICAgICAgIHZhciByb2xsID0gMDtcclxuICAgICAgICB2YXIgeWF3ID0gMDtcclxuICAgICAgICAvLyBkZWZhdWx0cyB0byBoaWdoIC0tIGxvdyBpcyBlbmFibGluZzsgaGlnaCBpcyBkaXNhYmxpbmdcclxuICAgICAgICB2YXIgYXV4MSA9IEFVWC5ISUdIO1xyXG4gICAgICAgIC8vIGRlZmF1bHRzIHRvID8/IC0tIG5lZWQgdG8gY2hlY2sgdHJhbnNtaXR0ZXIgYmVoYXZpb3JcclxuICAgICAgICB2YXIgYXV4MiA9IEFVWC5ISUdIO1xyXG5cclxuICAgICAgICB2YXIgdXJnZW50ID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgc2V0VGhyb3R0bGU6IHNldFRocm90dGxlLFxyXG4gICAgICAgICAgICBzZXRQaXRjaDogc2V0UGl0Y2gsXHJcbiAgICAgICAgICAgIHNldFJvbGw6IHNldFJvbGwsXHJcbiAgICAgICAgICAgIHNldFlhdzogc2V0WWF3LFxyXG4gICAgICAgICAgICBzZXRBdXgxOiBzZXRBdXgxLFxyXG4gICAgICAgICAgICBzZXRBdXgyOiBzZXRBdXgyLFxyXG4gICAgICAgICAgICBnZXRUaHJvdHRsZTogZ2V0VGhyb3R0bGUsXHJcbiAgICAgICAgICAgIGdldFBpdGNoOiBnZXRQaXRjaCxcclxuICAgICAgICAgICAgZ2V0Um9sbDogZ2V0Um9sbCxcclxuICAgICAgICAgICAgZ2V0WWF3OiBnZXRZYXcsXHJcbiAgICAgICAgICAgIGdldEF1eDE6IGdldEF1eDEsXHJcbiAgICAgICAgICAgIGdldEF1eDI6IGdldEF1eDIsXHJcbiAgICAgICAgICAgIEFVWDogQVVYLFxyXG4gICAgICAgICAgICBzZW5kOiBzZW5kLFxyXG4gICAgICAgICAgICBmb3JjZU5leHRTZW5kOiBmb3JjZU5leHRTZW5kLFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNlbmQoKSB7XHJcbiAgICAgICAgICAgIGlmICghdXJnZW50ICYmIHNlcmlhbC5idXN5KCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB1cmdlbnQgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgIHZhciBjb21tYW5kID0ge307XHJcblxyXG4gICAgICAgICAgICAvLyBpbnZlcnQgcGl0Y2ggYW5kIHJvbGxcclxuICAgICAgICAgICAgdmFyIHRocm90dGxlX3RocmVzaG9sZCA9XHJcbiAgICAgICAgICAgICAgICAtMC44OyAgLy8ga2VlcCBib3R0b20gMTAlIG9mIHRocm90dGxlIHN0aWNrIHRvIG1lYW4gJ29mZidcclxuICAgICAgICAgICAgY29tbWFuZC50aHJvdHRsZSA9IGNvbnN0cmFpbihcclxuICAgICAgICAgICAgICAgICh0aHJvdHRsZSAtIHRocm90dGxlX3RocmVzaG9sZCkgKiA0MDk1IC9cclxuICAgICAgICAgICAgICAgICAgICAoMSAtIHRocm90dGxlX3RocmVzaG9sZCksXHJcbiAgICAgICAgICAgICAgICAwLCA0MDk1KTtcclxuICAgICAgICAgICAgY29tbWFuZC5waXRjaCA9XHJcbiAgICAgICAgICAgICAgICBjb25zdHJhaW4oLShhcHBseURlYWR6b25lKHBpdGNoLCAwLjEpKSAqIDQwOTUgLyAyLCAtMjA0NywgMjA0Nyk7XHJcbiAgICAgICAgICAgIGNvbW1hbmQucm9sbCA9XHJcbiAgICAgICAgICAgICAgICBjb25zdHJhaW4oKGFwcGx5RGVhZHpvbmUocm9sbCwgMC4xKSkgKiA0MDk1IC8gMiwgLTIwNDcsIDIwNDcpO1xyXG4gICAgICAgICAgICBjb21tYW5kLnlhdyA9XHJcbiAgICAgICAgICAgICAgICBjb25zdHJhaW4oLShhcHBseURlYWR6b25lKHlhdywgMC4xKSkgKiA0MDk1IC8gMiwgLTIwNDcsIDIwNDcpO1xyXG5cclxuICAgICAgICAgICAgdmFyIGF1eF9tYXNrID0ge307XHJcbiAgICAgICAgICAgIC8vIGF1eDFfbG93LCBhdXgxX21pZCwgYXV4MV9oaWdoLCBhbmQgc2FtZSB3aXRoIGF1eDJcclxuICAgICAgICAgICAgYXV4X21hc2tbJ2F1eDFfJyArIGF1eE5hbWVzW2F1eDFdXSA9IHRydWU7XHJcbiAgICAgICAgICAgIGF1eF9tYXNrWydhdXgyXycgKyBhdXhOYW1lc1thdXgyXV0gPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHNlcmlhbC5zZW5kU3RydWN0dXJlKCdDb21tYW5kJywge1xyXG4gICAgICAgICAgICAgICAgcmVxdWVzdF9yZXNwb25zZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHNldF9zZXJpYWxfcmM6IHtcclxuICAgICAgICAgICAgICAgICAgICBlbmFibGVkOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbW1hbmQ6IGNvbW1hbmQsXHJcbiAgICAgICAgICAgICAgICAgICAgYXV4X21hc2s6IGF1eF9tYXNrLFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSwgZmFsc2UpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2V0VGhyb3R0bGUodikge1xyXG4gICAgICAgICAgICB0aHJvdHRsZSA9IHY7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZXRQaXRjaCh2KSB7XHJcbiAgICAgICAgICAgIHBpdGNoID0gdjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNldFJvbGwodikge1xyXG4gICAgICAgICAgICByb2xsID0gdjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNldFlhdyh2KSB7XHJcbiAgICAgICAgICAgIHlhdyA9IHY7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZXRBdXgxKHYpIHtcclxuICAgICAgICAgICAgYXV4MSA9IE1hdGgubWF4KDAsIE1hdGgubWluKDIsIHYpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNldEF1eDIodikge1xyXG4gICAgICAgICAgICBhdXgyID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oMiwgdikpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0VGhyb3R0bGUoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aHJvdHRsZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdldFBpdGNoKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gcGl0Y2g7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRSb2xsKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gcm9sbDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdldFlhdygpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHlhdztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGdldEF1eDEoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBhdXgxO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0QXV4MigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGF1eDI7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBmb3JjZU5leHRTZW5kKCkge1xyXG4gICAgICAgICAgICB1cmdlbnQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gY29uc3RyYWluKHgsIHhtaW4sIHhtYXgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIE1hdGgubWF4KHhtaW4sIE1hdGgubWluKHgsIHhtYXgpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFwcGx5RGVhZHpvbmUodmFsdWUsIGRlYWR6b25lKSB7XHJcbiAgICAgICAgICAgIGlmICh2YWx1ZSA+IGRlYWR6b25lKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWUgLSBkZWFkem9uZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAodmFsdWUgPCAtZGVhZHpvbmUpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZSArIGRlYWR6b25lO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSgpKTtcclxuIiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGFuZ3VsYXIubW9kdWxlKCdmbHlicml4Q29tbW9uJykuZmFjdG9yeSgnc2VyaWFsJywgc2VyaWFsKTtcclxuXHJcbiAgICBzZXJpYWwuJGluamVjdCA9IFsnJHRpbWVvdXQnLCAnJHEnLCAnY29icycsICdjb21tYW5kTG9nJywgJ2Zpcm13YXJlVmVyc2lvbicsICdzZXJpYWxpemF0aW9uSGFuZGxlciddO1xyXG5cclxuICAgIGZ1bmN0aW9uIHNlcmlhbCgkdGltZW91dCwgJHEsIGNvYnMsIGNvbW1hbmRMb2csIGZpcm13YXJlVmVyc2lvbiwgc2VyaWFsaXphdGlvbkhhbmRsZXIpIHtcclxuICAgICAgICB2YXIgTWVzc2FnZVR5cGUgPSB7XHJcbiAgICAgICAgICAgIFN0YXRlOiAwLFxyXG4gICAgICAgICAgICBDb21tYW5kOiAxLFxyXG4gICAgICAgICAgICBEZWJ1Z1N0cmluZzogMyxcclxuICAgICAgICAgICAgSGlzdG9yeURhdGE6IDQsXHJcbiAgICAgICAgICAgIFByb3RvY29sOiAxMjgsXHJcbiAgICAgICAgICAgIFJlc3BvbnNlOiAyNTUsXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdmFyIGFja25vd2xlZGdlcyA9IFtdO1xyXG4gICAgICAgIHZhciBiYWNrZW5kID0gbmV3IEJhY2tlbmQoKTtcclxuXHJcbiAgICAgICAgdmFyIG9uUmVjZWl2ZUxpc3RlbmVycyA9IFtdO1xyXG5cclxuICAgICAgICB2YXIgY29ic1JlYWRlciA9IG5ldyBjb2JzLlJlYWRlcigxMDAwMCk7XHJcbiAgICAgICAgdmFyIGJ5dGVzSGFuZGxlciA9IHVuZGVmaW5lZDtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gQmFja2VuZCgpIHtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIEJhY2tlbmQucHJvdG90eXBlLmJ1c3kgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIEJhY2tlbmQucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICAgIGNvbW1hbmRMb2coJ05vIFwic2VuZFwiIGRlZmluZWQgZm9yIHNlcmlhbCBiYWNrZW5kJyk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgQmFja2VuZC5wcm90b3R5cGUub25SZWFkID0gZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICBjb21tYW5kTG9nKCdObyBcIm9uUmVhZFwiIGRlZmluZWQgZm9yIHNlcmlhbCBiYWNrZW5kJyk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdmFyIE1lc3NhZ2VUeXBlSW52ZXJzaW9uID0gW107XHJcbiAgICAgICAgT2JqZWN0LmtleXMoTWVzc2FnZVR5cGUpLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XHJcbiAgICAgICAgICAgIE1lc3NhZ2VUeXBlSW52ZXJzaW9uW01lc3NhZ2VUeXBlW2tleV1dID0ga2V5O1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBhZGRPblJlY2VpdmVDYWxsYmFjayhmdW5jdGlvbihtZXNzYWdlVHlwZSwgbWVzc2FnZSkge1xyXG4gICAgICAgICAgICBpZiAobWVzc2FnZVR5cGUgPT09ICdSZXNwb25zZScpIHtcclxuICAgICAgICAgICAgICAgIGFja25vd2xlZGdlKG1lc3NhZ2UubWFzaywgbWVzc2FnZS5hY2spO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKG1lc3NhZ2VUeXBlID09PSAnUHJvdG9jb2wnKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IG1lc3NhZ2UucmVzcG9uc2U7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlcmlhbGl6YXRpb25IYW5kbGVyLmFkZEhhbmRsZXIoZGF0YS52ZXJzaW9uLCBkYXRhLnN0cnVjdHVyZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgYnVzeTogYnVzeSxcclxuICAgICAgICAgICAgc2VuZFN0cnVjdHVyZTogc2VuZFN0cnVjdHVyZSxcclxuICAgICAgICAgICAgc2V0QmFja2VuZDogc2V0QmFja2VuZCxcclxuICAgICAgICAgICAgYWRkT25SZWNlaXZlQ2FsbGJhY2s6IGFkZE9uUmVjZWl2ZUNhbGxiYWNrLFxyXG4gICAgICAgICAgICByZW1vdmVPblJlY2VpdmVDYWxsYmFjazogcmVtb3ZlT25SZWNlaXZlQ2FsbGJhY2ssXHJcbiAgICAgICAgICAgIHNldEJ5dGVzSGFuZGxlcjogc2V0Qnl0ZXNIYW5kbGVyLFxyXG4gICAgICAgICAgICBoYW5kbGVQb3N0Q29ubmVjdDogaGFuZGxlUG9zdENvbm5lY3QsXHJcbiAgICAgICAgICAgIEJhY2tlbmQ6IEJhY2tlbmQsXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2V0QmFja2VuZCh2KSB7XHJcbiAgICAgICAgICAgIGJhY2tlbmQgPSB2O1xyXG4gICAgICAgICAgICBiYWNrZW5kLm9uUmVhZCA9IHJlYWQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBoYW5kbGVQb3N0Q29ubmVjdCgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlcXVlc3RGaXJtd2FyZVZlcnNpb24oKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHJlcXVlc3RGaXJtd2FyZVZlcnNpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzZW5kU3RydWN0dXJlKCdDb21tYW5kJywge1xyXG4gICAgICAgICAgICAgICAgcmVxdWVzdF9yZXNwb25zZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIHJlcV9wYXJ0aWFsX2VlcHJvbV9kYXRhOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmVyc2lvbjogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2VuZFN0cnVjdHVyZShtZXNzYWdlVHlwZSwgZGF0YSwgbG9nX3NlbmQsIGV4dHJhTWFzaykge1xyXG4gICAgICAgICAgICBpZiAobWVzc2FnZVR5cGUgPT09ICdTdGF0ZScpIHtcclxuICAgICAgICAgICAgICAgIGRhdGEgPSBwcm9jZXNzU3RhdGVPdXRwdXQoZGF0YSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIGhhbmRsZXJzID0gZmlybXdhcmVWZXJzaW9uLnNlcmlhbGl6YXRpb25IYW5kbGVyKCk7XHJcblxyXG4gICAgICAgICAgICB2YXIgcmVzcG9uc2UgPSAkcS5kZWZlcigpO1xyXG4gICAgICAgICAgICBpZiAoIShtZXNzYWdlVHlwZSBpbiBNZXNzYWdlVHlwZSkpIHtcclxuICAgICAgICAgICAgICAgIHJlc3BvbnNlLnJlamVjdCgnTWVzc2FnZSB0eXBlIFwiJyArIG1lc3NhZ2VUeXBlICtcclxuICAgICAgICAgICAgICAgICAgICAnXCIgbm90IHN1cHBvcnRlZCBieSBhcHAsIHN1cHBvcnRlZCBtZXNzYWdlIHR5cGVzIGFyZTonICtcclxuICAgICAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyhNZXNzYWdlVHlwZSkuam9pbignLCAnKSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UucHJvbWlzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoIShtZXNzYWdlVHlwZSBpbiBoYW5kbGVycykpIHtcclxuICAgICAgICAgICAgICAgIHJlc3BvbnNlLnJlamVjdCgnTWVzc2FnZSB0eXBlIFwiJyArIG1lc3NhZ2VUeXBlICtcclxuICAgICAgICAgICAgICAgICAgICAnXCIgbm90IHN1cHBvcnRlZCBieSBmaXJtd2FyZSwgc3VwcG9ydGVkIG1lc3NhZ2UgdHlwZXMgYXJlOicgK1xyXG4gICAgICAgICAgICAgICAgICAgIE9iamVjdC5rZXlzKGhhbmRsZXJzKS5qb2luKCcsICcpKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5wcm9taXNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciB0eXBlQ29kZSA9IE1lc3NhZ2VUeXBlW21lc3NhZ2VUeXBlXTtcclxuICAgICAgICAgICAgdmFyIGhhbmRsZXIgPSBoYW5kbGVyc1ttZXNzYWdlVHlwZV07XHJcblxyXG4gICAgICAgICAgICB2YXIgYnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoaGFuZGxlci5ieXRlQ291bnQpO1xyXG5cclxuICAgICAgICAgICAgdmFyIHNlcmlhbGl6ZXIgPSBuZXcgc2VyaWFsaXphdGlvbkhhbmRsZXIuU2VyaWFsaXplcihuZXcgRGF0YVZpZXcoYnVmZmVyLmJ1ZmZlcikpO1xyXG4gICAgICAgICAgICBoYW5kbGVyLmVuY29kZShzZXJpYWxpemVyLCBkYXRhLCBleHRyYU1hc2spO1xyXG4gICAgICAgICAgICB2YXIgbWFzayA9IGhhbmRsZXIubWFza0FycmF5KGRhdGEsIGV4dHJhTWFzayk7XHJcbiAgICAgICAgICAgIGlmIChtYXNrLmxlbmd0aCA8IDUpIHtcclxuICAgICAgICAgICAgICAgIG1hc2sgPSAobWFza1swXSA8PCAwKSB8IChtYXNrWzFdIDw8IDgpIHwgKG1hc2tbMl0gPDwgMTYpIHwgKG1hc2tbM10gPDwgMjQpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2YXIgZGF0YUxlbmd0aCA9IHNlcmlhbGl6ZXIuaW5kZXg7XHJcblxyXG4gICAgICAgICAgICB2YXIgb3V0cHV0ID0gbmV3IFVpbnQ4QXJyYXkoZGF0YUxlbmd0aCArIDMpO1xyXG4gICAgICAgICAgICBvdXRwdXRbMF0gPSBvdXRwdXRbMV0gPSB0eXBlQ29kZTtcclxuICAgICAgICAgICAgZm9yICh2YXIgaWR4ID0gMDsgaWR4IDwgZGF0YUxlbmd0aDsgKytpZHgpIHtcclxuICAgICAgICAgICAgICAgIG91dHB1dFswXSBePSBvdXRwdXRbaWR4ICsgMl0gPSBidWZmZXJbaWR4XTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBvdXRwdXRbZGF0YUxlbmd0aCArIDJdID0gMDtcclxuXHJcbiAgICAgICAgICAgIGFja25vd2xlZGdlcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIG1hc2s6IG1hc2ssXHJcbiAgICAgICAgICAgICAgICByZXNwb25zZTogcmVzcG9uc2UsXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBiYWNrZW5kLnNlbmQobmV3IFVpbnQ4QXJyYXkoY29icy5lbmNvZGUob3V0cHV0KSkpO1xyXG4gICAgICAgICAgICB9LCAwKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChsb2dfc2VuZCkge1xyXG4gICAgICAgICAgICAgICAgY29tbWFuZExvZygnU2VuZGluZyBjb21tYW5kICcgKyB0eXBlQ29kZSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5wcm9taXNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gYnVzeSgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGJhY2tlbmQuYnVzeSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2V0Qnl0ZXNIYW5kbGVyKGhhbmRsZXIpIHtcclxuICAgICAgICAgICAgYnl0ZXNIYW5kbGVyID0gaGFuZGxlcjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHJlYWQoZGF0YSkge1xyXG4gICAgICAgICAgICBpZiAoYnl0ZXNIYW5kbGVyKVxyXG4gICAgICAgICAgICAgICAgYnl0ZXNIYW5kbGVyKGRhdGEsIHByb2Nlc3NEYXRhKTtcclxuICAgICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICAgICAgY29ic1JlYWRlci5yZWFkQnl0ZXMoZGF0YSwgcHJvY2Vzc0RhdGEsIHJlcG9ydElzc3Vlcyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiByZXBvcnRJc3N1ZXMoaXNzdWUsIHRleHQpIHtcclxuICAgICAgICAgICAgY29tbWFuZExvZygnQ09CUyBkZWNvZGluZyBmYWlsZWQgKCcgKyBpc3N1ZSArICcpOiAnICsgdGV4dCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBhZGRPblJlY2VpdmVDYWxsYmFjayhjYWxsYmFjaykge1xyXG4gICAgICAgICAgICBvblJlY2VpdmVMaXN0ZW5lcnMgPSBvblJlY2VpdmVMaXN0ZW5lcnMuY29uY2F0KFtjYWxsYmFja10pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gcmVtb3ZlT25SZWNlaXZlQ2FsbGJhY2soY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgb25SZWNlaXZlTGlzdGVuZXJzID0gb25SZWNlaXZlTGlzdGVuZXJzLmZpbHRlcihmdW5jdGlvbihjYikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNiICE9PSBjYWxsYmFjaztcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBhY2tub3dsZWRnZShtYXNrLCB2YWx1ZSkge1xyXG4gICAgICAgICAgICB3aGlsZSAoYWNrbm93bGVkZ2VzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgIHZhciB2ID0gYWNrbm93bGVkZ2VzLnNoaWZ0KCk7XHJcbiAgICAgICAgICAgICAgICBpZiAodi5tYXNrIF4gbWFzaykge1xyXG4gICAgICAgICAgICAgICAgICAgIHYucmVzcG9uc2UucmVqZWN0KCdNaXNzaW5nIEFDSycpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdmFyIHJlbGF4ZWRNYXNrID0gbWFzaztcclxuICAgICAgICAgICAgICAgIHJlbGF4ZWRNYXNrICY9IH4xO1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlbGF4ZWRNYXNrIF4gdmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICB2LnJlc3BvbnNlLnJlamVjdCgnUmVxdWVzdCB3YXMgbm90IGZ1bGx5IHByb2Nlc3NlZCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdi5yZXNwb25zZS5yZXNvbHZlKCk7XHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gcHJvY2Vzc0RhdGEoYnl0ZXMpIHtcclxuICAgICAgICAgICAgdmFyIG1lc3NhZ2VUeXBlID0gTWVzc2FnZVR5cGVJbnZlcnNpb25bYnl0ZXNbMF1dO1xyXG4gICAgICAgICAgICB2YXIgaGFuZGxlciA9IGZpcm13YXJlVmVyc2lvbi5zZXJpYWxpemF0aW9uSGFuZGxlcigpW21lc3NhZ2VUeXBlXTtcclxuICAgICAgICAgICAgaWYgKCFtZXNzYWdlVHlwZSB8fCAhaGFuZGxlcikge1xyXG4gICAgICAgICAgICAgICAgY29tbWFuZExvZygnSWxsZWdhbCBtZXNzYWdlIHR5cGUgcGFzc2VkIGZyb20gZmlybXdhcmUnKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHNlcmlhbGl6ZXIgPSBuZXcgc2VyaWFsaXphdGlvbkhhbmRsZXIuU2VyaWFsaXplcihuZXcgRGF0YVZpZXcoYnl0ZXMuYnVmZmVyLCAxKSk7XHJcbiAgICAgICAgICAgICAgICB2YXIgbWVzc2FnZSA9IGhhbmRsZXIuZGVjb2RlKHNlcmlhbGl6ZXIpO1xyXG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICAgICAgICAgIGNvbW1hbmRMb2coJ1VucmVjb2duaXplZCBtZXNzYWdlIGZvcm1hdCByZWNlaXZlZCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChtZXNzYWdlVHlwZSA9PT0gJ1N0YXRlJykge1xyXG4gICAgICAgICAgICAgICAgbWVzc2FnZSA9IHByb2Nlc3NTdGF0ZUlucHV0KG1lc3NhZ2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG9uUmVjZWl2ZUxpc3RlbmVycy5mb3JFYWNoKGZ1bmN0aW9uKGxpc3RlbmVyKSB7XHJcbiAgICAgICAgICAgICAgICBsaXN0ZW5lcihtZXNzYWdlVHlwZSwgbWVzc2FnZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIGxhc3RfdGltZXN0YW1wX3VzID0gMDtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gcHJvY2Vzc1N0YXRlSW5wdXQoc3RhdGUpIHtcclxuICAgICAgICAgICAgc3RhdGUgPSBPYmplY3QuYXNzaWduKHt9LCBzdGF0ZSk7XHJcbiAgICAgICAgICAgIHZhciBzZXJpYWxfdXBkYXRlX3JhdGVfSHogPSAwO1xyXG5cclxuICAgICAgICAgICAgaWYgKCd0aW1lc3RhbXBfdXMnIGluIHN0YXRlKSB7XHJcbiAgICAgICAgICAgICAgICBzdGF0ZS5zZXJpYWxfdXBkYXRlX3JhdGVfZXN0aW1hdGUgPSAxMDAwMDAwIC8gKHN0YXRlLnRpbWVzdGFtcF91cyAtIGxhc3RfdGltZXN0YW1wX3VzKTtcclxuICAgICAgICAgICAgICAgIGxhc3RfdGltZXN0YW1wX3VzID0gc3RhdGUudGltZXN0YW1wX3VzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICgndGVtcGVyYXR1cmUnIGluIHN0YXRlKSB7XHJcbiAgICAgICAgICAgICAgICBzdGF0ZS50ZW1wZXJhdHVyZSAvPSAxMDAuMDsgIC8vIHRlbXBlcmF0dXJlIGdpdmVuIGluIENlbHNpdXMgKiAxMDBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoJ3ByZXNzdXJlJyBpbiBzdGF0ZSkge1xyXG4gICAgICAgICAgICAgICAgc3RhdGUucHJlc3N1cmUgLz0gMjU2LjA7ICAvLyBwcmVzc3VyZSBnaXZlbiBpbiAoUTI0LjgpIGZvcm1hdFxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBwcm9jZXNzU3RhdGVPdXRwdXQoc3RhdGUpIHtcclxuICAgICAgICAgICAgc3RhdGUgPSBPYmplY3QuYXNzaWduKHt9LCBzdGF0ZSk7XHJcbiAgICAgICAgICAgIGlmICgndGVtcGVyYXR1cmUnIGluIHN0YXRlKSB7XHJcbiAgICAgICAgICAgICAgICBzdGF0ZS50ZW1wZXJhdHVyZSAqPSAxMDAuMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoJ3ByZXNzdXJlJyBpbiBzdGF0ZSkge1xyXG4gICAgICAgICAgICAgICAgc3RhdGUucHJlc3N1cmUgKj0gMjU2LjA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHN0YXRlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSgpKTtcclxuIiwiKGZ1bmN0aW9uICgpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBzZXJpYWxpemF0aW9uSGFuZGxlci4kaW5qZWN0ID0gW107XHJcblxyXG4gICAgYW5ndWxhci5tb2R1bGUoJ2ZseWJyaXhDb21tb24nKS5mYWN0b3J5KCdzZXJpYWxpemF0aW9uSGFuZGxlcicsIHNlcmlhbGl6YXRpb25IYW5kbGVyKTtcclxuXHJcbiAgICBmdW5jdGlvbiBzZXJpYWxpemF0aW9uSGFuZGxlcigpIHtcclxuICAgICAgICB2YXIgaGFuZGxlckNhY2hlID0ge307XHJcbiAgICAgICAgdmFyIG5ld2VzdFZlcnNpb24gPSB7IG1ham9yOiAwLCBtaW5vcjogMCwgcGF0Y2g6IDAgfTtcclxuICAgICAgICB2YXIgdmVyc2lvbiA9ICdWZXJzaW9uID0geyBtYWpvcjogdTgsIG1pbm9yOiB1OCwgcGF0Y2g6IHU4IH07JztcclxuICAgICAgICB2YXIgY29uZmlnSWQgPSAnQ29uZmlnSUQgPSB1MzI7JztcclxuXHJcbiAgICAgICAgdmFyIHZlY3RvcjNmID0gJ1ZlY3RvcjNmID0geyB4OiBmMzIsIHk6IGYzMiwgejogZjMyIH07JztcclxuXHJcbiAgICAgICAgdmFyIHBjYlRyYW5zZm9ybSA9ICdQY2JUcmFuc2Zvcm0gPSB7IG9yaWVudGF0aW9uOiBWZWN0b3IzZiwgdHJhbnNsYXRpb246IFZlY3RvcjNmIH07JztcclxuICAgICAgICB2YXIgbWl4VGFibGUgPSAnTWl4VGFibGUgPSB7IGZ6OiBbaTg6OF0sIHR4OiBbaTg6OF0sIHR5OiBbaTg6OF0sIHR6OiBbaTg6OF0gfTsnO1xyXG4gICAgICAgIHZhciBtYWdCaWFzID0gJ01hZ0JpYXMgPSB7IG9mZnNldDogVmVjdG9yM2YgfTsnO1xyXG4gICAgICAgIHZhciBjaGFubmVsUHJvcGVydGllcyA9ICdDaGFubmVsUHJvcGVydGllcyA9IHsnICtcclxuICAgICAgICAgICAgJ2Fzc2lnbm1lbnQ6IHsgdGhydXN0OiB1OCwgcGl0Y2g6IHU4LCByb2xsOiB1OCwgeWF3OiB1OCwgYXV4MTogdTgsIGF1eDI6IHU4IH0sJyArXHJcbiAgICAgICAgICAgICdpbnZlcnNpb246IHsvOC8gdGhydXN0OiB2b2lkLCBwaXRjaDogdm9pZCwgcm9sbDogdm9pZCwgeWF3OiB2b2lkLCBhdXgxOiB2b2lkLCBhdXgyOiB2b2lkIH0sJyArXHJcbiAgICAgICAgICAgICdtaWRwb2ludDogW3UxNjo2XSwnICtcclxuICAgICAgICAgICAgJ2RlYWR6b25lOiBbdTE2OjZdIH07JztcclxuXHJcbiAgICAgICAgdmFyIHBpZFNldHRpbmdzID0gJ1BJRFNldHRpbmdzID0geycgK1xyXG4gICAgICAgICAgICAna3A6IGYzMiwnICtcclxuICAgICAgICAgICAgJ2tpOiBmMzIsJyArXHJcbiAgICAgICAgICAgICdrZDogZjMyLCcgK1xyXG4gICAgICAgICAgICAnaW50ZWdyYWxfd2luZHVwX2d1YXJkOiBmMzIsJyArXHJcbiAgICAgICAgICAgICdkX2ZpbHRlcl90aW1lOiBmMzIsJyArXHJcbiAgICAgICAgICAgICdzZXRwb2ludF9maWx0ZXJfdGltZTogZjMyLCcgK1xyXG4gICAgICAgICAgICAnY29tbWFuZF90b192YWx1ZTogZjMyIH07JztcclxuICAgICAgICB2YXIgcGlkQnlwYXNzID0gJ1BJREJ5cGFzcyA9IHsvOC8nICtcclxuICAgICAgICAgICAgJ3RocnVzdF9tYXN0ZXI6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdwaXRjaF9tYXN0ZXI6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdyb2xsX21hc3Rlcjogdm9pZCwnICtcclxuICAgICAgICAgICAgJ3lhd19tYXN0ZXI6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICd0aHJ1c3Rfc2xhdmU6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdwaXRjaF9zbGF2ZTogdm9pZCwnICtcclxuICAgICAgICAgICAgJ3JvbGxfc2xhdmU6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICd5YXdfc2xhdmU6IHZvaWR9Oyc7XHJcbiAgICAgICAgdmFyIHBpZFBhcmFtZXRlcnMxNCA9IHBpZEJ5cGFzcyArICdQSURQYXJhbWV0ZXJzID0geycgK1xyXG4gICAgICAgICAgICAndGhydXN0X21hc3RlcjogUElEU2V0dGluZ3MsJyArXHJcbiAgICAgICAgICAgICdwaXRjaF9tYXN0ZXI6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAncm9sbF9tYXN0ZXI6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAneWF3X21hc3RlcjogUElEU2V0dGluZ3MsJyArXHJcbiAgICAgICAgICAgICd0aHJ1c3Rfc2xhdmU6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAncGl0Y2hfc2xhdmU6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAncm9sbF9zbGF2ZTogUElEU2V0dGluZ3MsJyArXHJcbiAgICAgICAgICAgICd5YXdfc2xhdmU6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAncGlkX2J5cGFzczogUElEQnlwYXNzIH07JztcclxuICAgICAgICB2YXIgcGlkUGFyYW1ldGVycyA9IHBpZEJ5cGFzcyArICdQSURQYXJhbWV0ZXJzID0geycgK1xyXG4gICAgICAgICAgICAndGhydXN0X21hc3RlcjogUElEU2V0dGluZ3MsJyArXHJcbiAgICAgICAgICAgICdwaXRjaF9tYXN0ZXI6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAncm9sbF9tYXN0ZXI6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAneWF3X21hc3RlcjogUElEU2V0dGluZ3MsJyArXHJcbiAgICAgICAgICAgICd0aHJ1c3Rfc2xhdmU6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAncGl0Y2hfc2xhdmU6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAncm9sbF9zbGF2ZTogUElEU2V0dGluZ3MsJyArXHJcbiAgICAgICAgICAgICd5YXdfc2xhdmU6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAndGhydXN0X2dhaW46IGYzMiwnICtcclxuICAgICAgICAgICAgJ3BpdGNoX2dhaW46IGYzMiwnICtcclxuICAgICAgICAgICAgJ3JvbGxfZ2FpbjogZjMyLCcgK1xyXG4gICAgICAgICAgICAneWF3X2dhaW46IGYzMiwnICtcclxuICAgICAgICAgICAgJ3BpZF9ieXBhc3M6IFBJREJ5cGFzcyB9Oyc7XHJcblxyXG4gICAgICAgIHZhciBzdGF0ZVBhcmFtZXRlcnMgPSAnU3RhdGVQYXJhbWV0ZXJzID0geyBzdGF0ZV9lc3RpbWF0aW9uOiBbZjMyOjJdLCBlbmFibGU6IFtmMzI6Ml0gfTsnO1xyXG5cclxuICAgICAgICB2YXIgc3RhdHVzRmxhZzE0MTUgPSAnU3RhdHVzRmxhZyA9IHsvMTYvJyArXHJcbiAgICAgICAgICAgICdib290OiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnbXB1X2ZhaWw6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdibXBfZmFpbDogdm9pZCwnICtcclxuICAgICAgICAgICAgJ3J4X2ZhaWw6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdpZGxlOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnZW5hYmxpbmc6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdjbGVhcl9tcHVfYmlhczogdm9pZCwnICtcclxuICAgICAgICAgICAgJ3NldF9tcHVfYmlhczogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2ZhaWxfc3RhYmlsaXR5OiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnZmFpbF9hbmdsZTogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2VuYWJsZWQ6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdiYXR0ZXJ5X2xvdzogdm9pZCwnICtcclxuICAgICAgICAgICAgJ3RlbXBfd2FybmluZzogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2xvZ19mdWxsOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnZmFpbF9vdGhlcjogdm9pZCwnICtcclxuICAgICAgICAgICAgJ292ZXJyaWRlOiB2b2lkIH07JztcclxuXHJcbiAgICAgICAgdmFyIHN0YXR1c0ZsYWcgPSAnU3RhdHVzRmxhZyA9IHsvMTYvJyArXHJcbiAgICAgICAgICAgICdfMDogdm9pZCwnICtcclxuICAgICAgICAgICAgJ18xOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnXzI6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdub19zaWduYWw6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdpZGxlOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnYXJtaW5nOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAncmVjb3JkaW5nX3NkOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnXzc6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdsb29wX3Nsb3c6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdfOTogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2FybWVkOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnYmF0dGVyeV9sb3c6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdiYXR0ZXJ5X2NyaXRpY2FsOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnbG9nX2Z1bGw6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdjcmFzaF9kZXRlY3RlZDogdm9pZCwnICtcclxuICAgICAgICAgICAgJ292ZXJyaWRlOiB2b2lkIH07JztcclxuXHJcbiAgICAgICAgdmFyIGNvbG9yID0gJ0NvbG9yID0geyByZWQ6IHU4LCBncmVlbjogdTgsIGJsdWU6IHU4IH07JztcclxuICAgICAgICB2YXIgbGVkU3RhdGVDb2xvcnMgPSAnTEVEU3RhdGVDb2xvcnMgPSB7JyArXHJcbiAgICAgICAgICAgICdyaWdodF9mcm9udDogQ29sb3IsJyArXHJcbiAgICAgICAgICAgICdyaWdodF9iYWNrOiBDb2xvciwnICtcclxuICAgICAgICAgICAgJ2xlZnRfZnJvbnQ6IENvbG9yLCcgK1xyXG4gICAgICAgICAgICAnbGVmdF9iYWNrOiBDb2xvciB9Oyc7XHJcbiAgICAgICAgdmFyIGxlZFN0YXRlQ2FzZSA9IGxlZFN0YXRlQ29sb3JzICsgJ0xFRFN0YXRlQ2FzZSA9IHsnICtcclxuICAgICAgICAgICAgJ3N0YXR1czogU3RhdHVzRmxhZywnICtcclxuICAgICAgICAgICAgJ3BhdHRlcm46IHU4LCcgK1xyXG4gICAgICAgICAgICAnY29sb3JzOiBMRURTdGF0ZUNvbG9ycywnICtcclxuICAgICAgICAgICAgJ2luZGljYXRvcl9yZWQ6IGJvb2wsJyArXHJcbiAgICAgICAgICAgICdpbmRpY2F0b3JfZ3JlZW46IGJvb2wgfTsnO1xyXG4gICAgICAgIHZhciBsZWRTdGF0ZXMgPSAnTEVEU3RhdGVzID0gWy8xNi9MRURTdGF0ZUNhc2U6MTZdOyc7XHJcbiAgICAgICAgdmFyIGxlZFN0YXRlc0ZpeGVkID0gJ0xFRFN0YXRlc0ZpeGVkID0gW0xFRFN0YXRlQ2FzZToxNl07JztcclxuXHJcbiAgICAgICAgdmFyIGRldmljZU5hbWUgPSAnRGV2aWNlTmFtZSA9IHM5Oyc7XHJcblxyXG4gICAgICAgIHZhciB2ZWxvY2l0eVBpZEJ5cGFzcyA9ICdWZWxvY2l0eVBJREJ5cGFzcyA9IHsvOC8nICtcclxuICAgICAgICAgICAgJ2ZvcndhcmRfbWFzdGVyOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAncmlnaHRfbWFzdGVyOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAndXBfbWFzdGVyOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnX3VudXNlZF9tYXN0ZXI6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdmb3J3YXJkX3NsYXZlOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAncmlnaHRfc2xhdmU6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICd1cF9zbGF2ZTogdm9pZCwnICtcclxuICAgICAgICAgICAgJ191bnVzZWRfc2xhdmU6IHZvaWR9Oyc7XHJcblxyXG4gICAgICAgIHZhciB2ZWxvY2l0eVBpZFBhcmFtZXRlcnMgPSB2ZWxvY2l0eVBpZEJ5cGFzcyArICdWZWxvY2l0eVBJRFBhcmFtZXRlcnMgPSB7JyArXHJcbiAgICAgICAgICAgICdmb3J3YXJkX21hc3RlcjogUElEU2V0dGluZ3MsJyArXHJcbiAgICAgICAgICAgICdyaWdodF9tYXN0ZXI6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAndXBfbWFzdGVyOiBQSURTZXR0aW5ncywnICtcclxuICAgICAgICAgICAgJ2ZvcndhcmRfc2xhdmU6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAncmlnaHRfc2xhdmU6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAndXBfc2xhdmU6IFBJRFNldHRpbmdzLCcgK1xyXG4gICAgICAgICAgICAncGlkX2J5cGFzczogVmVsb2NpdHlQSURCeXBhc3MgfTsnO1xyXG5cclxuICAgICAgICB2YXIgaW5lcnRpYWxCaWFzID0gJ0luZXJ0aWFsQmlhcyA9IHsgYWNjZWw6IFZlY3RvcjNmLCBneXJvOiBWZWN0b3IzZiB9Oyc7XHJcblxyXG4gICAgICAgIHZhciBjb25maWcxNDE1ID0gJ0NvbmZpZ3VyYXRpb24gPSB7LzE2LycgK1xyXG4gICAgICAgICAgICAndmVyc2lvbjogVmVyc2lvbiwnICtcclxuICAgICAgICAgICAgJ2lkOiBDb25maWdJRCwnICtcclxuICAgICAgICAgICAgJ3BjYl90cmFuc2Zvcm06IFBjYlRyYW5zZm9ybSwnICtcclxuICAgICAgICAgICAgJ21peF90YWJsZTogTWl4VGFibGUsJyArXHJcbiAgICAgICAgICAgICdtYWdfYmlhczogTWFnQmlhcywnICtcclxuICAgICAgICAgICAgJ2NoYW5uZWw6IENoYW5uZWxQcm9wZXJ0aWVzLCcgK1xyXG4gICAgICAgICAgICAncGlkX3BhcmFtZXRlcnM6IFBJRFBhcmFtZXRlcnMsJyArXHJcbiAgICAgICAgICAgICdzdGF0ZV9wYXJhbWV0ZXJzOiBTdGF0ZVBhcmFtZXRlcnMsJyArXHJcbiAgICAgICAgICAgICdsZWRfc3RhdGVzOiBMRURTdGF0ZXMsJyArXHJcbiAgICAgICAgICAgICduYW1lOiBEZXZpY2VOYW1lIH07JztcclxuXHJcbiAgICAgICAgdmFyIGNvbmZpZ0ZpeGVkMTQxNSA9ICdDb25maWd1cmF0aW9uRml4ZWQgPSB7JyArXHJcbiAgICAgICAgICAgICd2ZXJzaW9uOiBWZXJzaW9uLCcgK1xyXG4gICAgICAgICAgICAnaWQ6IENvbmZpZ0lELCcgK1xyXG4gICAgICAgICAgICAncGNiX3RyYW5zZm9ybTogUGNiVHJhbnNmb3JtLCcgK1xyXG4gICAgICAgICAgICAnbWl4X3RhYmxlOiBNaXhUYWJsZSwnICtcclxuICAgICAgICAgICAgJ21hZ19iaWFzOiBNYWdCaWFzLCcgK1xyXG4gICAgICAgICAgICAnY2hhbm5lbDogQ2hhbm5lbFByb3BlcnRpZXMsJyArXHJcbiAgICAgICAgICAgICdwaWRfcGFyYW1ldGVyczogUElEUGFyYW1ldGVycywnICtcclxuICAgICAgICAgICAgJ3N0YXRlX3BhcmFtZXRlcnM6IFN0YXRlUGFyYW1ldGVycywnICtcclxuICAgICAgICAgICAgJ2xlZF9zdGF0ZXM6IExFRFN0YXRlc0ZpeGVkLCcgK1xyXG4gICAgICAgICAgICAnbmFtZTogRGV2aWNlTmFtZSB9Oyc7XHJcblxyXG4gICAgICAgIHZhciBjb25maWcgPSAnQ29uZmlndXJhdGlvbiA9IHsvMTYvJyArXHJcbiAgICAgICAgICAgICd2ZXJzaW9uOiBWZXJzaW9uLCcgK1xyXG4gICAgICAgICAgICAnaWQ6IENvbmZpZ0lELCcgK1xyXG4gICAgICAgICAgICAncGNiX3RyYW5zZm9ybTogUGNiVHJhbnNmb3JtLCcgK1xyXG4gICAgICAgICAgICAnbWl4X3RhYmxlOiBNaXhUYWJsZSwnICtcclxuICAgICAgICAgICAgJ21hZ19iaWFzOiBNYWdCaWFzLCcgK1xyXG4gICAgICAgICAgICAnY2hhbm5lbDogQ2hhbm5lbFByb3BlcnRpZXMsJyArXHJcbiAgICAgICAgICAgICdwaWRfcGFyYW1ldGVyczogUElEUGFyYW1ldGVycywnICtcclxuICAgICAgICAgICAgJ3N0YXRlX3BhcmFtZXRlcnM6IFN0YXRlUGFyYW1ldGVycywnICtcclxuICAgICAgICAgICAgJ2xlZF9zdGF0ZXM6IExFRFN0YXRlcywnICtcclxuICAgICAgICAgICAgJ25hbWU6IERldmljZU5hbWUsJyArXHJcbiAgICAgICAgICAgICd2ZWxvY2l0eV9waWRfcGFyYW1ldGVyczogVmVsb2NpdHlQSURQYXJhbWV0ZXJzLCcgK1xyXG4gICAgICAgICAgICAnaW5lcnRpYWxfYmlhczogSW5lcnRpYWxCaWFzIH07JztcclxuXHJcbiAgICAgICAgdmFyIGNvbmZpZ0ZpeGVkID0gJ0NvbmZpZ3VyYXRpb25GaXhlZCA9IHsnICtcclxuICAgICAgICAgICAgJ3ZlcnNpb246IFZlcnNpb24sJyArXHJcbiAgICAgICAgICAgICdpZDogQ29uZmlnSUQsJyArXHJcbiAgICAgICAgICAgICdwY2JfdHJhbnNmb3JtOiBQY2JUcmFuc2Zvcm0sJyArXHJcbiAgICAgICAgICAgICdtaXhfdGFibGU6IE1peFRhYmxlLCcgK1xyXG4gICAgICAgICAgICAnbWFnX2JpYXM6IE1hZ0JpYXMsJyArXHJcbiAgICAgICAgICAgICdjaGFubmVsOiBDaGFubmVsUHJvcGVydGllcywnICtcclxuICAgICAgICAgICAgJ3BpZF9wYXJhbWV0ZXJzOiBQSURQYXJhbWV0ZXJzLCcgK1xyXG4gICAgICAgICAgICAnc3RhdGVfcGFyYW1ldGVyczogU3RhdGVQYXJhbWV0ZXJzLCcgK1xyXG4gICAgICAgICAgICAnbGVkX3N0YXRlczogTEVEU3RhdGVzRml4ZWQsJyArXHJcbiAgICAgICAgICAgICduYW1lOiBEZXZpY2VOYW1lLCcgK1xyXG4gICAgICAgICAgICAndmVsb2NpdHlfcGlkX3BhcmFtZXRlcnM6IFZlbG9jaXR5UElEUGFyYW1ldGVycywnICtcclxuICAgICAgICAgICAgJ2luZXJ0aWFsX2JpYXM6IEluZXJ0aWFsQmlhcyB9Oyc7XHJcblxyXG4gICAgICAgIHZhciBjb25maWdGbGFnMTQgPSAnQ29uZmlndXJhdGlvbkZsYWcgPSB7LzE2LycgK1xyXG4gICAgICAgICAgICAndmVyc2lvbjogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2lkOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAncGNiX3RyYW5zZm9ybTogdm9pZCwnICtcclxuICAgICAgICAgICAgJ21peF90YWJsZTogdm9pZCwnICtcclxuICAgICAgICAgICAgJ21hZ19iaWFzOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnY2hhbm5lbDogdm9pZCwnICtcclxuICAgICAgICAgICAgJ3BpZF9wYXJhbWV0ZXJzOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnc3RhdGVfcGFyYW1ldGVyczogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2xlZF9zdGF0ZXM6IFsvLyB2b2lkOjE2XSwnICtcclxuICAgICAgICAgICAgJ25hbWU6IHZvaWR9Oyc7XHJcblxyXG4gICAgICAgIHZhciBjb25maWdGbGFnID0gJ0NvbmZpZ3VyYXRpb25GbGFnID0gey8xNi8nICtcclxuICAgICAgICAgICAgJ3ZlcnNpb246IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdpZDogdm9pZCwnICtcclxuICAgICAgICAgICAgJ3BjYl90cmFuc2Zvcm06IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdtaXhfdGFibGU6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdtYWdfYmlhczogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2NoYW5uZWw6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdwaWRfcGFyYW1ldGVyczogdm9pZCwnICtcclxuICAgICAgICAgICAgJ3N0YXRlX3BhcmFtZXRlcnM6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdsZWRfc3RhdGVzOiBbLy8gdm9pZDoxNl0sJyArXHJcbiAgICAgICAgICAgICduYW1lOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAndmVsb2NpdHlfcGlkX3BhcmFtZXRlcnM6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdpbmVydGlhbF9iaWFzOiB2b2lkIH07JztcclxuXHJcbiAgICAgICAgdmFyIGNvbmZpZ0Z1bGwxNCA9IHZlY3RvcjNmICsgcGlkU2V0dGluZ3MgKyB2ZXJzaW9uICsgY29uZmlnSWQgKyBwY2JUcmFuc2Zvcm0gK1xyXG4gICAgICAgICAgICBtaXhUYWJsZSArIG1hZ0JpYXMgKyBjaGFubmVsUHJvcGVydGllcyArIHBpZFBhcmFtZXRlcnMxNCArIHN0YXRlUGFyYW1ldGVycyArXHJcbiAgICAgICAgICAgIHN0YXR1c0ZsYWcxNDE1ICsgY29sb3IgKyBsZWRTdGF0ZUNhc2UgKyBsZWRTdGF0ZXMgKyBsZWRTdGF0ZXNGaXhlZCArIGRldmljZU5hbWUgK1xyXG4gICAgICAgICAgICBjb25maWcxNDE1ICsgY29uZmlnRml4ZWQxNDE1ICsgY29uZmlnRmxhZzE0O1xyXG4gICAgICAgIHZhciBjb25maWdGdWxsMTUgPSB2ZWN0b3IzZiArIHBpZFNldHRpbmdzICsgdmVyc2lvbiArIGNvbmZpZ0lkICsgcGNiVHJhbnNmb3JtICsgbWl4VGFibGUgK1xyXG4gICAgICAgICAgICBtYWdCaWFzICsgY2hhbm5lbFByb3BlcnRpZXMgKyBwaWRQYXJhbWV0ZXJzICsgc3RhdGVQYXJhbWV0ZXJzICtcclxuICAgICAgICAgICAgc3RhdHVzRmxhZzE0MTUgKyBjb2xvciArIGxlZFN0YXRlQ2FzZSArIGxlZFN0YXRlcyArIGxlZFN0YXRlc0ZpeGVkICsgZGV2aWNlTmFtZSArXHJcbiAgICAgICAgICAgIGNvbmZpZzE0MTUgKyBjb25maWdGaXhlZDE0MTUgKyBjb25maWdGbGFnO1xyXG4gICAgICAgIHZhciBjb25maWdGdWxsMTYgPSB2ZWN0b3IzZiArIHBpZFNldHRpbmdzICsgdmVyc2lvbiArIGNvbmZpZ0lkICsgcGNiVHJhbnNmb3JtICsgbWl4VGFibGUgK1xyXG4gICAgICAgICAgICBtYWdCaWFzICsgY2hhbm5lbFByb3BlcnRpZXMgKyBwaWRQYXJhbWV0ZXJzICsgc3RhdGVQYXJhbWV0ZXJzICtcclxuICAgICAgICAgICAgc3RhdHVzRmxhZyArIGNvbG9yICsgbGVkU3RhdGVDYXNlICsgbGVkU3RhdGVzICsgbGVkU3RhdGVzRml4ZWQgKyBkZXZpY2VOYW1lICtcclxuICAgICAgICAgICAgaW5lcnRpYWxCaWFzICsgdmVsb2NpdHlQaWRQYXJhbWV0ZXJzICtcclxuICAgICAgICAgICAgY29uZmlnICsgY29uZmlnRml4ZWQgKyBjb25maWdGbGFnO1xyXG5cclxuICAgICAgICB2YXIgc3RhdGUgPSAnUm90YXRpb24gPSB7IHBpdGNoOiBmMzIsIHJvbGw6IGYzMiwgeWF3OiBmMzIgfTsnICtcclxuICAgICAgICAgICAgJ1BJRFN0YXRlID0geycgK1xyXG4gICAgICAgICAgICAndGltZXN0YW1wX3VzOiB1MzIsJyArXHJcbiAgICAgICAgICAgICdpbnB1dDogZjMyLCcgK1xyXG4gICAgICAgICAgICAnc2V0cG9pbnQ6IGYzMiwnICtcclxuICAgICAgICAgICAgJ3BfdGVybTogZjMyLCcgK1xyXG4gICAgICAgICAgICAnaV90ZXJtOiBmMzIsJyArXHJcbiAgICAgICAgICAgICdkX3Rlcm06IGYzMiB9OycgK1xyXG4gICAgICAgICAgICAnUmNDb21tYW5kID0geyB0aHJvdHRsZTogaTE2LCBwaXRjaDogaTE2LCByb2xsOiBpMTYsIHlhdzogaTE2IH07JyArXHJcbiAgICAgICAgICAgICdTdGF0ZSA9IHsvMzIvJyArXHJcbiAgICAgICAgICAgICd0aW1lc3RhbXBfdXM6IHUzMiwnICtcclxuICAgICAgICAgICAgJ3N0YXR1czogU3RhdHVzRmxhZywnICtcclxuICAgICAgICAgICAgJ3YwX3JhdzogdTE2LCcgK1xyXG4gICAgICAgICAgICAnaTBfcmF3OiB1MTYsJyArXHJcbiAgICAgICAgICAgICdpMV9yYXc6IHUxNiwnICtcclxuICAgICAgICAgICAgJ2FjY2VsOiBWZWN0b3IzZiwnICtcclxuICAgICAgICAgICAgJ2d5cm86IFZlY3RvcjNmLCcgK1xyXG4gICAgICAgICAgICAnbWFnOiBWZWN0b3IzZiwnICtcclxuICAgICAgICAgICAgJ3RlbXBlcmF0dXJlOiB1MTYsJyArXHJcbiAgICAgICAgICAgICdwcmVzc3VyZTogdTMyLCcgK1xyXG4gICAgICAgICAgICAncHBtOiBbaTE2OjZdLCcgK1xyXG4gICAgICAgICAgICAnYXV4X2NoYW5fbWFzazogdTgsJyArXHJcbiAgICAgICAgICAgICdjb21tYW5kOiBSY0NvbW1hbmQsJyArXHJcbiAgICAgICAgICAgICdjb250cm9sOiB7IGZ6OiBmMzIsIHR4OiBmMzIsIHR5OiBmMzIsIHR6OiBmMzIgfSwnICtcclxuICAgICAgICAgICAgJ3BpZF9tYXN0ZXJfZno6IFBJRFN0YXRlLCcgK1xyXG4gICAgICAgICAgICAncGlkX21hc3Rlcl90eDogUElEU3RhdGUsJyArXHJcbiAgICAgICAgICAgICdwaWRfbWFzdGVyX3R5OiBQSURTdGF0ZSwnICtcclxuICAgICAgICAgICAgJ3BpZF9tYXN0ZXJfdHo6IFBJRFN0YXRlLCcgK1xyXG4gICAgICAgICAgICAncGlkX3NsYXZlX2Z6OiBQSURTdGF0ZSwnICtcclxuICAgICAgICAgICAgJ3BpZF9zbGF2ZV90eDogUElEU3RhdGUsJyArXHJcbiAgICAgICAgICAgICdwaWRfc2xhdmVfdHk6IFBJRFN0YXRlLCcgK1xyXG4gICAgICAgICAgICAncGlkX3NsYXZlX3R6OiBQSURTdGF0ZSwnICtcclxuICAgICAgICAgICAgJ21vdG9yX291dDogW2kxNjo4XSwnICtcclxuICAgICAgICAgICAgJ2tpbmVtYXRpY3NfYW5nbGU6IFJvdGF0aW9uLCcgK1xyXG4gICAgICAgICAgICAna2luZW1hdGljc19yYXRlOiBSb3RhdGlvbiwnICtcclxuICAgICAgICAgICAgJ2tpbmVtYXRpY3NfYWx0aXR1ZGU6IGYzMiwnICtcclxuICAgICAgICAgICAgJ2xvb3BfY291bnQ6IHUzMiB9OycgK1xyXG4gICAgICAgICAgICAnU3RhdGVGaWVsZHMgPSB7LzMyLycgK1xyXG4gICAgICAgICAgICAndGltZXN0YW1wX3VzOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnc3RhdHVzOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAndjBfcmF3OiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnaTBfcmF3OiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnaTFfcmF3OiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnYWNjZWw6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdneXJvOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnbWFnOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAndGVtcGVyYXR1cmU6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdwcmVzc3VyZTogdm9pZCwnICtcclxuICAgICAgICAgICAgJ3BwbTogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2F1eF9jaGFuX21hc2s6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdjb21tYW5kOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnY29udHJvbDogdm9pZCwnICtcclxuICAgICAgICAgICAgJ3BpZF9tYXN0ZXJfZno6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdwaWRfbWFzdGVyX3R4OiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAncGlkX21hc3Rlcl90eTogdm9pZCwnICtcclxuICAgICAgICAgICAgJ3BpZF9tYXN0ZXJfdHo6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdwaWRfc2xhdmVfZno6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdwaWRfc2xhdmVfdHg6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdwaWRfc2xhdmVfdHk6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdwaWRfc2xhdmVfdHo6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdtb3Rvcl9vdXQ6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdraW5lbWF0aWNzX2FuZ2xlOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAna2luZW1hdGljc19yYXRlOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAna2luZW1hdGljc19hbHRpdHVkZTogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2xvb3BfY291bnQ6IHZvaWQgfTsnO1xyXG5cclxuICAgICAgICB2YXIgYXV4TWFzayA9ICdBdXhNYXNrID0gey8vJyArXHJcbiAgICAgICAgICAgICdhdXgxX2xvdzogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2F1eDFfbWlkOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnYXV4MV9oaWdoOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnYXV4Ml9sb3c6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdhdXgyX21pZDogdm9pZCwnICtcclxuICAgICAgICAgICAgJ2F1eDJfaGlnaDogdm9pZCB9Oyc7XHJcblxyXG4gICAgICAgIHZhciBjb21tYW5kcyA9IGF1eE1hc2sgKyAnQ29tbWFuZCA9IHsvMzIvJyArXHJcbiAgICAgICAgICAgICdyZXF1ZXN0X3Jlc3BvbnNlOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAnc2V0X2VlcHJvbV9kYXRhOiBDb25maWd1cmF0aW9uRml4ZWQsJyArXHJcbiAgICAgICAgICAgICdyZWluaXRfZWVwcm9tX2RhdGE6IHZvaWQsJyArXHJcbiAgICAgICAgICAgICdyZXF1ZXN0X2VlcHJvbV9kYXRhOiB2b2lkLCcgK1xyXG4gICAgICAgICAgICAncmVxdWVzdF9lbmFibGVfaXRlcmF0aW9uOiB1OCwnICtcclxuICAgICAgICAgICAgJ21vdG9yX292ZXJyaWRlX3NwZWVkXzA6IHUxNiwnICtcclxuICAgICAgICAgICAgJ21vdG9yX292ZXJyaWRlX3NwZWVkXzE6IHUxNiwnICtcclxuICAgICAgICAgICAgJ21vdG9yX292ZXJyaWRlX3NwZWVkXzI6IHUxNiwnICtcclxuICAgICAgICAgICAgJ21vdG9yX292ZXJyaWRlX3NwZWVkXzM6IHUxNiwnICtcclxuICAgICAgICAgICAgJ21vdG9yX292ZXJyaWRlX3NwZWVkXzQ6IHUxNiwnICtcclxuICAgICAgICAgICAgJ21vdG9yX292ZXJyaWRlX3NwZWVkXzU6IHUxNiwnICtcclxuICAgICAgICAgICAgJ21vdG9yX292ZXJyaWRlX3NwZWVkXzY6IHUxNiwnICtcclxuICAgICAgICAgICAgJ21vdG9yX292ZXJyaWRlX3NwZWVkXzc6IHUxNiwnICtcclxuICAgICAgICAgICAgJ3NldF9jb21tYW5kX292ZXJyaWRlOiBib29sLCcgK1xyXG4gICAgICAgICAgICAnc2V0X3N0YXRlX21hc2s6IFN0YXRlRmllbGRzLCcgK1xyXG4gICAgICAgICAgICAnc2V0X3N0YXRlX2RlbGF5OiB1MTYsJyArXHJcbiAgICAgICAgICAgICdzZXRfc2Rfd3JpdGVfZGVsYXk6IHUxNiwnICtcclxuICAgICAgICAgICAgJ3NldF9sZWQ6IHsnICtcclxuICAgICAgICAgICAgJyAgcGF0dGVybjogdTgsJyArXHJcbiAgICAgICAgICAgICcgIGNvbG9yX3JpZ2h0OiBDb2xvciwnICtcclxuICAgICAgICAgICAgJyAgY29sb3JfbGVmdDogQ29sb3IsJyArXHJcbiAgICAgICAgICAgICcgIGluZGljYXRvcl9yZWQ6IGJvb2wsJyArXHJcbiAgICAgICAgICAgICcgIGluZGljYXRvcl9ncmVlbjogYm9vbCB9LCcgK1xyXG4gICAgICAgICAgICAnc2V0X3NlcmlhbF9yYzogeyBlbmFibGVkOiBib29sLCBjb21tYW5kOiBSY0NvbW1hbmQsIGF1eF9tYXNrOiBBdXhNYXNrIH0sJyArXHJcbiAgICAgICAgICAgICdzZXRfY2FyZF9yZWNvcmRpbmdfc3RhdGU6IHsvOC8gcmVjb3JkX3RvX2NhcmQ6IHZvaWQsIGxvY2tfcmVjb3JkaW5nX3N0YXRlOiB2b2lkIH0sJyArXHJcbiAgICAgICAgICAgICdzZXRfcGFydGlhbF9lZXByb21fZGF0YTogQ29uZmlndXJhdGlvbiwnICtcclxuICAgICAgICAgICAgJ3JlaW5pdF9wYXJ0aWFsX2VlcHJvbV9kYXRhOiBDb25maWd1cmF0aW9uRmxhZywnICtcclxuICAgICAgICAgICAgJ3JlcV9wYXJ0aWFsX2VlcHJvbV9kYXRhOiBDb25maWd1cmF0aW9uRmxhZywnICtcclxuICAgICAgICAgICAgJ3JlcV9jYXJkX3JlY29yZGluZ19zdGF0ZTogdm9pZCwnICtcclxuICAgICAgICAgICAgJ3NldF9wYXJ0aWFsX3RlbXBvcmFyeV9jb25maWc6IENvbmZpZ3VyYXRpb24sJyArXHJcbiAgICAgICAgICAgICdzZXRfY29tbWFuZF9zb3VyY2VzOiB7LzgvIHNlcmlhbDogdm9pZCwgcmFkaW86IHZvaWQgfSwnICtcclxuICAgICAgICAgICAgJ3NldF9jYWxpYnJhdGlvbjogeyBlbmFibGVkOiBib29sLCBtb2RlOiB1OCB9LCcgK1xyXG4gICAgICAgICAgICAnc2V0X2F1dG9waWxvdF9lbmFibGVkOiBib29sLCcgK1xyXG4gICAgICAgICAgICAnc2V0X3VzYl9tb2RlOiB1OH07JztcclxuXHJcbiAgICAgICAgdmFyIGRlYnVnU3RyaW5nID0gXCJEZWJ1Z1N0cmluZyA9IHsgZGVwcmVjYXRlZF9tYXNrOiB1MzIsIG1lc3NhZ2U6IHMgfTtcIjtcclxuICAgICAgICB2YXIgaGlzdG9yeURhdGEgPSBcIkhpc3RvcnlEYXRhID0gRGVidWdTdHJpbmc7XCI7XHJcbiAgICAgICAgdmFyIHJlc3BvbnNlID0gXCJSZXNwb25zZSA9IHsgbWFzazogdTMyLCBhY2s6IHUzMiB9O1wiO1xyXG4gICAgICAgIHZhciBwcm90b2NvbCA9IFwiUHJvdG9jb2xJbmZvID0geyB2ZXJzaW9uOiBWZXJzaW9uLCBzdHJ1Y3R1cmU6IHMgfTtcIiArXHJcbiAgICAgICAgICAgIFwiUHJvdG9jb2wgPSB7LzMyLyByZXF1ZXN0OiB2b2lkLCByZXNwb25zZTogUHJvdG9jb2xJbmZvIH07XCI7XHJcblxyXG4gICAgICAgIHZhciBoYW5kbGVyMTQgPSBjb25maWdGdWxsMTQgKyBzdGF0ZSArIGNvbW1hbmRzICsgZGVidWdTdHJpbmcgKyBoaXN0b3J5RGF0YSArIHJlc3BvbnNlICsgcHJvdG9jb2w7XHJcbiAgICAgICAgdmFyIGhhbmRsZXIxNSA9IGNvbmZpZ0Z1bGwxNSArIHN0YXRlICsgY29tbWFuZHMgKyBkZWJ1Z1N0cmluZyArIGhpc3RvcnlEYXRhICsgcmVzcG9uc2UgKyBwcm90b2NvbDtcclxuICAgICAgICB2YXIgaGFuZGxlcjE2ID0gY29uZmlnRnVsbDE2ICsgc3RhdGUgKyBjb21tYW5kcyArIGRlYnVnU3RyaW5nICsgaGlzdG9yeURhdGEgKyByZXNwb25zZSArIHByb3RvY29sO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBpc05ld2VyVmVyc2lvbih2ZXJzaW9uKSB7XHJcbiAgICAgICAgICAgIGlmICh2ZXJzaW9uLm1ham9yICE9PSBuZXdlc3RWZXJzaW9uLm1ham9yKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmVyc2lvbi5tYWpvciA+IG5ld2VzdFZlcnNpb24ubWFqb3I7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHZlcnNpb24ubWlub3IgIT09IG5ld2VzdFZlcnNpb24ubWlub3IpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB2ZXJzaW9uLm1pbm9yID4gbmV3ZXN0VmVyc2lvbi5taW5vcjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdmVyc2lvbi5wYXRjaCA+IG5ld2VzdFZlcnNpb24ucGF0Y2g7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBhZGRIYW5kbGVyKHZlcnNpb24sIHN0cnVjdHVyZSkge1xyXG4gICAgICAgICAgICBpZiAoaXNOZXdlclZlcnNpb24odmVyc2lvbikpIHtcclxuICAgICAgICAgICAgICAgIG5ld2VzdFZlcnNpb24gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbWFqb3I6IHZlcnNpb24ubWFqb3IsXHJcbiAgICAgICAgICAgICAgICAgICAgbWlub3I6IHZlcnNpb24ubWlub3IsXHJcbiAgICAgICAgICAgICAgICAgICAgcGF0Y2g6IHZlcnNpb24ucGF0Y2gsXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciB2ZXJzaW9uU3RyaW5nID0gdmVyc2lvbi5tYWpvci50b1N0cmluZygpICsgJy4nICsgdmVyc2lvbi5taW5vci50b1N0cmluZygpICsgJy4nICsgdmVyc2lvbi5wYXRjaC50b1N0cmluZygpO1xyXG4gICAgICAgICAgICBoYW5kbGVyQ2FjaGVbdmVyc2lvblN0cmluZ10gPSBGbHlicml4U2VyaWFsaXphdGlvbi5wYXJzZShzdHJ1Y3R1cmUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYWRkSGFuZGxlcih7bWFqb3I6IDEsIG1pbm9yOiA0LCBwYXRjaDogMH0sIGhhbmRsZXIxNCk7XHJcbiAgICAgICAgYWRkSGFuZGxlcih7bWFqb3I6IDEsIG1pbm9yOiA1LCBwYXRjaDogMH0sIGhhbmRsZXIxNSk7XHJcbiAgICAgICAgYWRkSGFuZGxlcih7bWFqb3I6IDEsIG1pbm9yOiA1LCBwYXRjaDogMX0sIGhhbmRsZXIxNSk7XHJcbiAgICAgICAgYWRkSGFuZGxlcih7bWFqb3I6IDEsIG1pbm9yOiA2LCBwYXRjaDogMH0sIGhhbmRsZXIxNik7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHVwZGF0ZUZpZWxkcyh0YXJnZXQsIHNvdXJjZSkge1xyXG4gICAgICAgICAgICBpZiAoc291cmNlIGluc3RhbmNlb2YgQXJyYXkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB1cGRhdGVGaWVsZHNBcnJheSh0YXJnZXQsIHNvdXJjZSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoc291cmNlIGluc3RhbmNlb2YgT2JqZWN0KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdXBkYXRlRmllbGRzT2JqZWN0KHRhcmdldCwgc291cmNlKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAoc291cmNlID09PSBudWxsIHx8IHNvdXJjZSA9PT0gdW5kZWZpbmVkKSA/IHRhcmdldCA6IHNvdXJjZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gdXBkYXRlRmllbGRzT2JqZWN0KHRhcmdldCwgc291cmNlKSB7XHJcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSB7fTtcclxuICAgICAgICAgICAgT2JqZWN0LmtleXModGFyZ2V0KS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcclxuICAgICAgICAgICAgICAgIHJlc3VsdFtrZXldID0gdXBkYXRlRmllbGRzKHRhcmdldFtrZXldLCBzb3VyY2Vba2V5XSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBPYmplY3Qua2V5cyhzb3VyY2UpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGtleSBpbiByZXN1bHQpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXN1bHRba2V5XSA9IHVwZGF0ZUZpZWxkcyh0YXJnZXRba2V5XSwgc291cmNlW2tleV0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHVwZGF0ZUZpZWxkc0FycmF5KHRhcmdldCwgc291cmNlKSB7XHJcbiAgICAgICAgICAgIHZhciBsZW5ndGggPSBNYXRoLm1heCh0YXJnZXQubGVuZ3RoLCBzb3VyY2UubGVuZ3RoKTtcclxuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpZHggPSAwOyBpZHggPCBsZW5ndGg7ICsraWR4KSB7XHJcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaCh1cGRhdGVGaWVsZHModGFyZ2V0W2lkeF0sIHNvdXJjZVtpZHhdKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIFNlcmlhbGl6ZXI6IEZseWJyaXhTZXJpYWxpemF0aW9uLlNlcmlhbGl6ZXIsXHJcbiAgICAgICAgICAgIGdldEhhbmRsZXI6IGZ1bmN0aW9uIChmaXJtd2FyZSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZXJDYWNoZVtmaXJtd2FyZV07XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGdldE5ld2VzdFZlcnNpb246IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXdlc3RWZXJzaW9uO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBhZGRIYW5kbGVyOiBhZGRIYW5kbGVyLFxyXG4gICAgICAgICAgICB1cGRhdGVGaWVsZHM6IHVwZGF0ZUZpZWxkcyxcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxufSgpKTtcclxuIl19
