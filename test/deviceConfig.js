describe('Device configuration service', function() {
    var deviceConfig;
    var serial;
    var parser;
    var cobs;
    var commandLog;
    var $timeout;
    var $rootScope;
    var backend;

    beforeEach(angular.mock.module('flybrixCommon'));

    beforeEach(inject(function(
        _deviceConfig_, _serial_, _parser_, _cobs_, _commandLog_, _$timeout_,
        _$rootScope_) {
        deviceConfig = _deviceConfig_;
        serial = _serial_;
        parser = _parser_;
        cobs = _cobs_;
        commandLog = _commandLog_;
        $timeout = _$timeout_;
        $rootScope = _$rootScope_;
    }));

    beforeEach(function() {
        backend = new serial.Backend();
        serial.setBackend(backend);
    });

    it('exists', function() {
        expect(deviceConfig).toBeDefined();
    });

    describe('.getDesiredVersion()', function() {
        it('exists', function() {
            expect(deviceConfig.getDesiredVersion).toBeDefined();
        });

        it('equals newest firmware version', function() {
            expect(deviceConfig.getDesiredVersion()).toEqual([1, 6, 0]);
        });
    });

    describe('.getConfig()', function() {
        it('exists', function() {
            expect(deviceConfig.getConfig).toBeDefined();
        });

        it('defaults to zeros', function() {
            var config = deviceConfig.getConfig();
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
            expect(config.forwardMasterPIDParameters).toEqual([
                0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
            ]);
            expect(config.rightMasterPIDParameters).toEqual([
                0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
            ]);
            expect(config.upMasterPIDParameters).toEqual([
                0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
            ]);
            expect(config.forwardSlavePIDParameters).toEqual([
                0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
            ]);
            expect(config.rightSlavePIDParameters).toEqual([
                0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
            ]);
            expect(config.upSlavePIDParameters).toEqual([
                0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
            ]);
            expect(config.velocityPidBypass).toEqual(0);
            expect(config.inertialBiasAccel).toEqual([0.0, 0.0, 0.0]);
            expect(config.inertialBiasGyro).toEqual([0.0, 0.0, 0.0]);
        });
    });

    describe('.request()', function() {
        it('exists', function() {
            expect(deviceConfig.request).toBeDefined();
        });

        it('requests all fields EEPROM data', function(done) {
            backend.send = function(val) {
                var decoder = new cobs.Reader();
                decoder.AppendToBuffer(val, function(command, mask, data) {
                    expect(command).toBe(parser.MessageType.Command);
                    expect(mask).toBe(
                        parser.CommandFields.COM_REQ_PARTIAL_EEPROM_DATA |
                        parser.CommandFields.COM_REQ_RESPONSE);
                    expect(new Uint8Array(data)).toEqual(new Uint8Array([255, 15, 255, 255]));
                    done();
                });
            };
            deviceConfig.request();
            $timeout.flush();
        });
    });

    describe('.reinit()', function() {
        it('exists', function() {
            expect(deviceConfig.request).toBeDefined();
        });

        it('reinits EEPROM data', function(done) {
            backend.send = function(val) {
                var decoder = new cobs.Reader();
                decoder.AppendToBuffer(val, function(command, mask, data) {
                    expect(command).toBe(parser.MessageType.Command);
                    expect(mask).toBe(
                        parser.CommandFields.COM_REINIT_EEPROM_DATA |
                        parser.CommandFields.COM_REQ_RESPONSE);
                    expect(new Uint8Array(data)).toEqual(new Uint8Array([]));
                    done();
                });
            };
            deviceConfig.reinit();
            $timeout.flush();
        });

        it('requests new EEPROM data upon confirmation', function(done) {
            var masks = [
                (parser.CommandFields.COM_REINIT_EEPROM_DATA |
                 parser.CommandFields.COM_REQ_RESPONSE),
                (parser.CommandFields.COM_REQ_PARTIAL_EEPROM_DATA |
                 parser.CommandFields.COM_REQ_RESPONSE)
            ];
            var datas = [
                [],
                [255, 15, 255, 255]
            ];
            var call_case = 0;

            backend.send = function(val) {
                var decoder = new cobs.Reader();
                decoder.AppendToBuffer(val, function(command, mask, data) {
                    expect(command).toBe(parser.MessageType.Command);
                    expect(mask).toBe(masks[call_case]);
                    expect(new Uint8Array(data)).toEqual(new Uint8Array(datas[call_case]));
                    ++call_case;
                    if (call_case === 1) {
                        backend.onRead(new Uint8Array(
                            [4, 254, 255, 5, 1, 1, 2, 4, 1, 1, 1, 0]));
                    } else if (call_case === 2) {
                        done();
                    }
                });
            };
            deviceConfig.reinit();
            $timeout.flush();
        });

        it('reports failure', function(done) {
            backend.send = function(val) {
                var decoder = new cobs.Reader();
                decoder.AppendToBuffer(val, function(command, mask, data) {
                    expect(command).toBe(parser.MessageType.Command);
                    expect(mask).toBe(
                        parser.CommandFields.COM_REINIT_EEPROM_DATA |
                        parser.CommandFields.COM_REQ_RESPONSE);
                    expect(new Uint8Array(data)).toEqual(new Uint8Array([]));
                    commandLog.onMessage(function(messages) {
                        expect(messages.length).toBe(2);
                        expect(messages[1])
                            .toEqual(
                                'Request for factory reset failed: ' +
                                'Request was not fully processed');
                        done();
                    });
                    backend.onRead(new Uint8Array(
                        [4, 255, 255, 5, 1, 1, 2, 5, 1, 1, 1, 0]));
                });
            };
            deviceConfig.reinit();
            $timeout.flush();
        });
    });

    describe('.send()', function() {
        var empty_config = Array.apply(null, Array(841)).map(function() {
            return 0;
        });
        empty_config[0] = empty_config[1] = 255;
        empty_config[365] = empty_config[366] = 255;

        it('exists', function() {
            expect(deviceConfig.send).toBeDefined();
        });

        it('sends the present config by default', function(done) {
            backend.send = function(val) {
                var decoder = new cobs.Reader();
                decoder.AppendToBuffer(val, function(command, mask, data) {
                    expect(command).toBe(parser.MessageType.Command);
                    expect(mask).toBe(
                        parser.CommandFields.COM_SET_PARTIAL_EEPROM_DATA |
                        parser.CommandFields.COM_REQ_RESPONSE);
                    expect(new Uint8Array(data))
                        .toEqual(new Uint8Array(empty_config));
                    done();
                });
            };
            deviceConfig.send();
            $timeout.flush();
        });

        it('sends a new config when defined', function(done) {
            backend.send = function(val) {
                var decoder = new cobs.Reader();
                decoder.AppendToBuffer(val, function(command, mask, data) {
                    expect(command).toBe(parser.MessageType.Command);
                    expect(mask).toBe(
                        parser.CommandFields.COM_SET_PARTIAL_EEPROM_DATA |
                        parser.CommandFields.COM_REQ_RESPONSE);
                    var expected_data = new Uint8Array(empty_config.slice());
                    expected_data[2] = 1;
                    expected_data[3] = 5;
                    expect(new Uint8Array(data)).toEqual(expected_data);
                    done();
                });
            };
            var config_copy =
                JSON.parse(JSON.stringify(deviceConfig.getConfig()));
            config_copy.version = [1, 5, 0];
            deviceConfig.send(config_copy);
            $timeout.flush();
        });


        it('requests new config upon response', function(done) {
            var counter = 0;
            backend.send = function(val) {
                var decoder = new cobs.Reader();
                decoder.AppendToBuffer(val, function(command, mask, data) {
                    if (counter === 0) {
                        expect(command).toBe(parser.MessageType.Command);
                        expect(mask).toBe(
                            parser.CommandFields.COM_SET_PARTIAL_EEPROM_DATA |
                            parser.CommandFields.COM_REQ_RESPONSE);
                        expect(new Uint8Array(data))
                            .toEqual(new Uint8Array(empty_config));
                        backend.onRead(new Uint8Array(
                            [4, 254, 255, 1, 2, 16, 1, 1, 2, 16, 1, 0]));
                    } else if (counter === 1) {
                        expect(command).toBe(parser.MessageType.Command);
                        expect(mask).toBe(
                            parser.CommandFields.COM_REQ_PARTIAL_EEPROM_DATA |
                            parser.CommandFields.COM_REQ_RESPONSE);
                        expect(new Uint8Array(data)).toEqual(new Uint8Array([
                            255, 15, 255, 255
                        ]));
                        done();
                    }
                    ++counter;
                });
            };
            deviceConfig.send();
            $timeout.flush();
        });
    });

    describe('.sendPartial()', function() {
        var config;

        beforeEach(function() {
            config = {
                version: [1, 5, 0],
                id: 0x12345678,
                pcbOrientation: [3.25, 1232.75, 7.125],
                pcbTranslation: [323232.5, 77.5, 1.0],
                mixTableFz: [0, 1, 2, 3, 4, 5, 6, 7],
                mixTableTx: [8, 9, 10, 11, 12, 13, 14, 15],
                mixTableTy: [16, 17, 18, 19, 20, 21, 22, 23],
                mixTableTz: [24, 25, 26, 27, 28, 29, 30, 31],
                magBias: [3.25, 1232.75, 7.125],
                assignedChannel: [0, 1, 2, 3, 4, 5],
                commandInversion: 6,
                channelMidpoint:
                    [0x0807, 0x0a09, 0x0c0b, 0x0e0d, 0x100f, 0x1211],
                channelDeadzone:
                    [0x1413, 0x1615, 0x1817, 0x1a19, 0x1c1b, 0x1e1d],
                thrustMasterPIDParameters:
                    [0.125, 0.125, 0.125, 0.125, 0.125, 0.125, 0.125],
                pitchMasterPIDParameters: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
                rollMasterPIDParameters: [2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0],
                yawMasterPIDParameters: [8.0, 8.0, 8.0, 8.0, 8.0, 8.0, 8.0],
                thrustSlavePIDParameters:
                    [32.0, 32.0, 32.0, 32.0, 32.0, 32.0, 32.0],
                pitchSlavePIDParameters:
                    [128.0, 128.0, 128.0, 128.0, 128.0, 128.0, 128.0],
                rollSlavePIDParameters:
                    [512.0, 512.0, 512.0, 512.0, 512.0, 512.0, 512.0],
                yawSlavePIDParameters:
                    [2048.0, 2048.0, 2048.0, 2048.0, 2048.0, 2048.0, 2048.0],
                thrustGain: 0.5,
                pitchGain: 2.0,
                rollGain: 8.0,
                yawGain: 32.0,
                pidBypass: 4,
                stateEstimationParameters: [3.25, 1232.75],
                enableParameters: [7.125, 323232.5],
                ledStates: [],
                name: 'AbcD',
                forwardMasterPIDParameters:
                    [0.125, 0.125, 0.125, 0.125, 0.125, 0.125, 0.125],
                rightMasterPIDParameters: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
                upMasterPIDParameters: [2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0],
                forwardSlavePIDParameters: [8.0, 8.0, 8.0, 8.0, 8.0, 8.0, 8.0],
                rightSlavePIDParameters:
                    [32.0, 32.0, 32.0, 32.0, 32.0, 32.0, 32.0],
                upSlavePIDParameters:
                    [128.0, 128.0, 128.0, 128.0, 128.0, 128.0, 128.0],
                velocityPidBypass: 4,
            };
            for (var i = 0; i < 16; ++i) {
                var v = {
                    status: 256 + 257 * i,
                    pattern: 2 + i,
                    colors: {
                        right_front: {
                            red: 3 + i,
                            green: 4 + i,
                            blue: 5 + i,
                        },
                        right_back: {
                            red: 6 + i,
                            green: 7 + i,
                            blue: 8 + i,
                        },
                        left_front: {
                            red: 9 + i,
                            green: 10 + i,
                            blue: 11 + i,
                        },
                        left_back: {
                            red: 12 + i,
                            green: 13 + i,
                            blue: 14 + i,
                        },
                    },
                    indicator_red: i % 2 === 0,
                    indicator_green: i % 2 === 1,
                };
                config.ledStates.push(v);
            }
        });

        it('exists', function() {
            expect(deviceConfig.sendPartial).toBeDefined();
        });

        it('sends empty mask by default', function(done) {
            backend.send = function(val) {
                var decoder = new cobs.Reader();
                decoder.AppendToBuffer(val, function(command, mask, data) {
                    expect(command).toBe(parser.MessageType.Command);
                    expect(mask).toBe(
                        parser.CommandFields.COM_SET_PARTIAL_EEPROM_DATA |
                        parser.CommandFields.COM_REQ_RESPONSE);
                    expect(new Uint8Array(data)).toEqual(new Uint8Array([
                        0, 0
                    ]));
                    done();
                });
            };
            deviceConfig.sendPartial();
            $timeout.flush();
        });

        it('sends version', function(done) {
            backend.send = function(val) {
                var decoder = new cobs.Reader();
                decoder.AppendToBuffer(val, function(command, mask, data) {
                    expect(command).toBe(parser.MessageType.Command);
                    expect(mask).toBe(
                        parser.CommandFields.COM_SET_PARTIAL_EEPROM_DATA |
                        parser.CommandFields.COM_REQ_RESPONSE);
                    expect(new Uint8Array(data)).toEqual(new Uint8Array([
                        1, 0, 1, 5, 0
                    ]));
                    done();
                });
            };
            deviceConfig.sendPartial(deviceConfig.field.VERSION, 0, config);
            $timeout.flush();
        });

        it('sends ID', function(done) {
            backend.send = function(val) {
                var decoder = new cobs.Reader();
                decoder.AppendToBuffer(val, function(command, mask, data) {
                    expect(command).toBe(parser.MessageType.Command);
                    expect(mask).toBe(
                        parser.CommandFields.COM_SET_PARTIAL_EEPROM_DATA |
                        parser.CommandFields.COM_REQ_RESPONSE);
                    expect(new Uint8Array(data)).toEqual(new Uint8Array([
                        2, 0, 0x78, 0x56, 0x34, 0x12
                    ]));
                    done();
                });
            };
            deviceConfig.sendPartial(deviceConfig.field.ID, 0, config);
            $timeout.flush();
        });

        it('sends PCB data', function(done) {
            backend.send = function(val) {
                var decoder = new cobs.Reader();
                decoder.AppendToBuffer(val, function(command, mask, data) {
                    expect(command).toBe(parser.MessageType.Command);
                    expect(mask).toBe(
                        parser.CommandFields.COM_SET_PARTIAL_EEPROM_DATA |
                        parser.CommandFields.COM_REQ_RESPONSE);
                    expect(new Uint8Array(data)).toEqual(new Uint8Array([
                        4,    0, 0,    0,    0x50, 0x40, 0,    0x18, 0x9a,
                        0x44, 0, 0,    0xe4, 0x40, 0x10, 0xd4, 0x9d, 0x48,
                        0,    0, 0x9b, 0x42, 0,    0,    0x80, 0x3f
                    ]));
                    done();
                });
            };
            deviceConfig.sendPartial(deviceConfig.field.PCB, 0, config);
            $timeout.flush();
        });

        it('sends mix table', function(done) {
            backend.send = function(val) {
                var decoder = new cobs.Reader();
                decoder.AppendToBuffer(val, function(command, mask, data) {
                    expect(command).toBe(parser.MessageType.Command);
                    expect(mask).toBe(
                        parser.CommandFields.COM_SET_PARTIAL_EEPROM_DATA |
                        parser.CommandFields.COM_REQ_RESPONSE);
                    var full_config_data = new Uint8Array(34);
                    full_config_data[0] = 8;
                    full_config_data[1] = 0;
                    Array.apply(null, Array(32))
                        .map(function(val, idx) {
                            return (idx % 200);
                        })
                        .forEach(function(val, idx) {
                            full_config_data[2 + idx] = val;
                        });
                    expect(new Uint8Array(data)).toEqual(full_config_data);
                    done();
                });
            };
            deviceConfig.sendPartial(deviceConfig.field.MIX_TABLE, 0, config);
            $timeout.flush();
        });

        it('sends magnetic bias', function(done) {
            backend.send = function(val) {
                var decoder = new cobs.Reader();
                decoder.AppendToBuffer(val, function(command, mask, data) {
                    expect(command).toBe(parser.MessageType.Command);
                    expect(mask).toBe(
                        parser.CommandFields.COM_SET_PARTIAL_EEPROM_DATA |
                        parser.CommandFields.COM_REQ_RESPONSE);
                    expect(new Uint8Array(data)).toEqual(new Uint8Array([
                        16, 0, 0, 0, 0x50, 0x40, 0, 0x18, 0x9a, 0x44, 0, 0,
                        0xe4, 0x40
                    ]));
                    done();
                });
            };
            deviceConfig.sendPartial(deviceConfig.field.MAG_BIAS, 0, config);
            $timeout.flush();
        });

        it('sends channel data', function(done) {
            backend.send = function(val) {
                var decoder = new cobs.Reader();
                decoder.AppendToBuffer(val, function(command, mask, data) {
                    expect(command).toBe(parser.MessageType.Command);
                    expect(mask).toBe(
                        parser.CommandFields.COM_SET_PARTIAL_EEPROM_DATA |
                        parser.CommandFields.COM_REQ_RESPONSE);
                    var full_config_data = new Uint8Array(33);
                    full_config_data[0] = 32;
                    full_config_data[1] = 0;
                    Array.apply(null, Array(31))
                        .map(function(val, idx) {
                            return (idx % 200);
                        })
                        .forEach(function(val, idx) {
                            full_config_data[2 + idx] = val;
                        });
                    expect(new Uint8Array(data)).toEqual(full_config_data);
                    done();
                });
            };
            deviceConfig.sendPartial(deviceConfig.field.CHANNEL, 0, config);
            $timeout.flush();
        });

        it('sends PID parameters data', function(done) {
            backend.send = function(val) {
                var decoder = new cobs.Reader();
                decoder.AppendToBuffer(val, function(command, mask, data) {
                    expect(command).toBe(parser.MessageType.Command);
                    expect(mask).toBe(
                        parser.CommandFields.COM_SET_PARTIAL_EEPROM_DATA |
                        parser.CommandFields.COM_REQ_RESPONSE);
                    var full_config_data =
                        new Uint8Array(8 * 7 * 4 + 4 * 4 + 3);
                    full_config_data[0] = 64;
                    full_config_data[1] = 0;
                    Array.apply(null, Array(8 * 7 * 4 + 4 * 4 + 1))
                        .map(function(val, idx) {
                            if (idx === 8 * 7 * 4 + 4 * 4) {
                                // PID bypass flags
                                return 4;
                            }
                            // other items, type Float32
                            if (idx % 4 !== 3) {
                                return 0;
                            }
                            if (idx >= 8 * 7 * 4) {
                                return (0x3e + 1 + Math.floor(idx / 4 - 8 * 7));
                            }
                            return (0x3e + Math.floor(idx / 28));
                        })
                        .forEach(function(val, idx) {
                            full_config_data[2 + idx] = val;
                        });
                    expect(new Uint8Array(data)).toEqual(full_config_data);
                    done();
                });
            };
            deviceConfig.sendPartial(
                deviceConfig.field.PID_PARAMETERS, 0, config);
            $timeout.flush();
        });

        it('sends STATE parameters data', function(done) {
            backend.send = function(val) {
                var decoder = new cobs.Reader();
                decoder.AppendToBuffer(val, function(command, mask, data) {
                    expect(command).toBe(parser.MessageType.Command);
                    expect(mask).toBe(
                        parser.CommandFields.COM_SET_PARTIAL_EEPROM_DATA |
                        parser.CommandFields.COM_REQ_RESPONSE);
                    expect(new Uint8Array(data)).toEqual(new Uint8Array([
                        128, 0, 0, 0, 0x50, 0x40, 0, 0x18, 0x9a, 0x44, 0, 0,
                        0xe4, 0x40, 0x10, 0xd4, 0x9d, 0x48
                    ]));
                    done();
                });
            };
            deviceConfig.sendPartial(
                deviceConfig.field.STATE_PARAMETERS, 0, config);
            $timeout.flush();
        });

        it('sends LED states data', function(done) {
            backend.send = function(val) {
                var decoder = new cobs.Reader();
                decoder.AppendToBuffer(val, function(command, mask, data) {
                    expect(command).toBe(parser.MessageType.Command);
                    expect(mask).toBe(
                        parser.CommandFields.COM_SET_PARTIAL_EEPROM_DATA |
                        parser.CommandFields.COM_REQ_RESPONSE);
                    var full_config_data = new Uint8Array(276);
                    full_config_data[0] = 0;
                    full_config_data[1] = 1;
                    full_config_data[2] = 255;
                    full_config_data[3] = 255;
                    Array.apply(null, Array(272))
                        .map(function(val, idx) {
                            var id = idx / 17;
                            var m = idx % 17;
                            if (m < 15) {
                                return m + id;
                            } else {
                                return (m + id) % 2;
                            }
                        })
                        .forEach(function(val, idx) {
                            full_config_data[4 + idx] = val;
                        });
                    expect(new Uint8Array(data)).toEqual(full_config_data);
                    done();
                });
            };
            deviceConfig.sendPartial(
                deviceConfig.field.LED_STATES, 256 * 256 - 1, config);
            $timeout.flush();
        });

        it('sends first half of LED states data', function(done) {
            backend.send = function(val) {
                var decoder = new cobs.Reader();
                decoder.AppendToBuffer(val, function(command, mask, data) {
                    expect(command).toBe(parser.MessageType.Command);
                    expect(mask).toBe(
                        parser.CommandFields.COM_SET_PARTIAL_EEPROM_DATA |
                        parser.CommandFields.COM_REQ_RESPONSE);
                    var full_config_data = new Uint8Array(140);
                    full_config_data[0] = 0;
                    full_config_data[1] = 1;
                    full_config_data[2] = 255;
                    full_config_data[3] = 0;
                    Array.apply(null, Array(136))
                        .map(function(val, idx) {
                            var id = idx / 17;
                            var m = idx % 17;
                            if (m < 15) {
                                return m + id;
                            } else {
                                return (m + id) % 2;
                            }
                        })
                        .forEach(function(val, idx) {
                            full_config_data[4 + idx] = val;
                        });
                    expect(new Uint8Array(data)).toEqual(full_config_data);
                    done();
                });
            };
            deviceConfig.sendPartial(
                deviceConfig.field.LED_STATES, 255, config);
            $timeout.flush();
        });

        it('sends second half of LED states data', function(done) {
            backend.send = function(val) {
                var decoder = new cobs.Reader();
                decoder.AppendToBuffer(val, function(command, mask, data) {
                    expect(command).toBe(parser.MessageType.Command);
                    expect(mask).toBe(
                        parser.CommandFields.COM_SET_PARTIAL_EEPROM_DATA |
                        parser.CommandFields.COM_REQ_RESPONSE);
                    var full_config_data = new Uint8Array(140);
                    full_config_data[0] = 0;
                    full_config_data[1] = 1;
                    full_config_data[2] = 0;
                    full_config_data[3] = 255;
                    Array.apply(null, Array(136))
                        .map(function(val, idx) {
                            idx += 136;
                            var id = idx / 17;
                            var m = idx % 17;
                            if (m < 15) {
                                return m + id;
                            } else {
                                return (m + id) % 2;
                            }
                        })
                        .forEach(function(val, idx) {
                            full_config_data[4 + idx] = val;
                        });
                    expect(new Uint8Array(data)).toEqual(full_config_data);
                    done();
                });
            };
            deviceConfig.sendPartial(
                deviceConfig.field.LED_STATES, 255 * 256, config);
            $timeout.flush();
        });

        it('sends device name', function(done) {
            backend.send = function(val) {
                var decoder = new cobs.Reader();
                decoder.AppendToBuffer(val, function(command, mask, data) {
                    expect(command).toBe(parser.MessageType.Command);
                    expect(mask).toBe(
                        parser.CommandFields.COM_SET_PARTIAL_EEPROM_DATA |
                        parser.CommandFields.COM_REQ_RESPONSE);
                    expect(new Uint8Array(data)).toEqual(new Uint8Array([
                        0, 2, 65, 98, 99, 68, 0, 0, 0, 0, 0
                    ]));
                    done();
                });
            };
            deviceConfig.sendPartial(deviceConfig.field.DEVICE_NAME, 0, config);
            $timeout.flush();
        });

        it('sends temporary configuration', function(done) {
            backend.send = function(val) {
                var decoder = new cobs.Reader();
                decoder.AppendToBuffer(val, function(command, mask, data) {
                    expect(command).toBe(parser.MessageType.Command);
                    expect(mask).toBe(
                        parser.CommandFields.COM_SET_PARTIAL_TEMPORARY_CONFIG |
                        parser.CommandFields.COM_REQ_RESPONSE);
                    expect(new Uint8Array(data)).toEqual(new Uint8Array([
                        0, 2, 65, 98, 99, 68, 0, 0, 0, 0, 0
                    ]));
                    done();
                });
            };
            deviceConfig.sendPartial(
                deviceConfig.field.DEVICE_NAME, 0, config, true);
            $timeout.flush();
        });

        it('asks for confirmation', function(done) {
            var counter = 0;
            backend.send = function(val) {
                var decoder = new cobs.Reader();
                decoder.AppendToBuffer(val, function(command, mask, data) {
                    if (counter === 0) {
                        expect(command).toBe(parser.MessageType.Command);
                        expect(mask).toBe(
                            parser.CommandFields.COM_SET_PARTIAL_EEPROM_DATA |
                            parser.CommandFields.COM_REQ_RESPONSE);
                        expect(new Uint8Array(data)).toEqual(new Uint8Array([
                            0, 2, 65, 98, 99, 68, 0, 0, 0, 0, 0
                        ]));
                        backend.onRead(new Uint8Array(
                            [4, 254, 255, 1, 2, 16, 1, 1, 2, 16, 1, 0]));
                    } else if (counter === 1) {
                        expect(command).toBe(parser.MessageType.Command);
                        expect(mask).toBe(
                            parser.CommandFields.COM_REQ_PARTIAL_EEPROM_DATA |
                            parser.CommandFields.COM_REQ_RESPONSE);
                        expect(new Uint8Array(data)).toEqual(new Uint8Array([
                            255, 15, 255, 255
                        ]));
                        done();
                    }
                    ++counter;
                });
            };
            deviceConfig.sendPartial(
                deviceConfig.field.DEVICE_NAME, 0, config, false, true);
            $timeout.flush();
        });
    });

    describe('.setConfigCallback()', function() {
        var full_config_data;
        function recalcChecksum(v) {
            v[0] = 0;
            for (var i = 0; i < v.length; ++i) {
                v[0] ^= v[i];
            }
        }
        beforeEach(function() {
            full_config_data =
                new Uint8Array(Array.apply(null, Array(858)).map(function() {
                    return 0;
                }));
            full_config_data[1] = parser.MessageType.Command;
            var command = parser.CommandFields.COM_SET_EEPROM_DATA;
            for (var i = 0; i < 4; ++i) {
                full_config_data[i + 2] = ((command >> (i * 8)) & 0xFF);
            }
            for (var i = 0; i < 3; ++i) {
                full_config_data[i + 6] = deviceConfig.getDesiredVersion()[i];
            }
            recalcChecksum(full_config_data);
        });

        it('exists', function() {
            expect(deviceConfig.setConfigCallback).toBeDefined();
        });

        it('warns in the command log by default', function(done) {
            commandLog.onMessage(function name(val) {
                if (val.indexOf(
                        'No callback defined for receiving configurations!') !==
                    -1) {
                    done();
                }
            });
            backend.onRead(new Uint8Array(cobs.encode(full_config_data)));
            $rootScope.$digest();
        });

        it('receives full config', function(done) {
            deviceConfig.setConfigCallback(done);
            backend.onRead(new Uint8Array(cobs.encode(full_config_data)));
        });

        it('rejects mismatched config versions', function(done) {
            deviceConfig.setConfigCallback(done);
            full_config_data[7] = 2;
            recalcChecksum(full_config_data);
            commandLog.onMessage(function(messages) {
                messages.forEach(function(val) {
                    if (val.indexOf(
                        'Received an unsupported configuration!') !== -1) {
                        done();
                    }
                });
            });
            backend.onRead(new Uint8Array(cobs.encode(full_config_data)));
            $rootScope.$digest();
        });

        it('receives partial config', function(done) {
            var leftover = 3;
            deviceConfig.setConfigCallback(function() {
                if (!--leftover) {
                    done();
                }
            });
            var command = parser.CommandFields.COM_SET_PARTIAL_EEPROM_DATA;
            for (var i = 0; i < 4; ++i) {
                full_config_data[i + 2] = ((command >> (i * 8)) & 0xFF);
            }
            for (var i = 0; i < 3; ++i) {
                full_config_data[i + 8] = deviceConfig.getDesiredVersion()[i];
            }

            var mask = deviceConfig.field.VERSION | deviceConfig.field.PCB |
                deviceConfig.field.MIX_TABLE | deviceConfig.field.MAG_BIAS;
            full_config_data[6] = (mask & 0xFF);
            full_config_data[7] = ((mask >> 8) & 0xFF);
            recalcChecksum(full_config_data);
            backend.onRead(new Uint8Array(cobs.encode(full_config_data)));

            var mask = deviceConfig.field.VERSION | deviceConfig.field.CHANNEL |
                deviceConfig.field.PID_PARAMETERS |
                deviceConfig.field.STATE_PARAMETERS;
            full_config_data[6] = (mask & 0xFF);
            full_config_data[7] = ((mask >> 8) & 0xFF);
            recalcChecksum(full_config_data);
            backend.onRead(new Uint8Array(cobs.encode(full_config_data)));

            var mask = deviceConfig.field.LED_STATES;
            full_config_data[6] = (mask & 0xFF);
            full_config_data[7] = ((mask >> 8) & 0xFF);
            full_config_data[8] = 0;
            full_config_data[9] = 255;
            recalcChecksum(full_config_data);
            backend.onRead(new Uint8Array(cobs.encode(full_config_data)));
        });

        it('receives version alone', function(done) {
            deviceConfig.setConfigCallback(function() {
                done();
            });
            var command = parser.CommandFields.COM_SET_PARTIAL_EEPROM_DATA;
            for (var i = 0; i < 4; ++i) {
                full_config_data[i + 2] = ((command >> (i * 8)) & 0xFF);
            }
            for (var i = 0; i < 3; ++i) {
                full_config_data[i + 8] = deviceConfig.getDesiredVersion()[i];
            }

            var mask = deviceConfig.field.VERSION;
            full_config_data[6] = (mask & 0xFF);
            full_config_data[7] = ((mask >> 8) & 0xFF);
            full_config_data = full_config_data.slice(0, 12);
            recalcChecksum(full_config_data);
            backend.onRead(new Uint8Array(cobs.encode(full_config_data)));
        });

        describe('receiving partial config', function() {
            beforeEach(function() {
                // We need the versions to match so we can send data without
                // a
                // version included
                backend.onRead(new Uint8Array(cobs.encode(full_config_data)));

                var command = parser.CommandFields.COM_SET_PARTIAL_EEPROM_DATA;
                for (var i = 0; i < 4; ++i) {
                    full_config_data[i + 2] = ((command >> (i * 8)) & 0xFF);
                }
            });

            it('parses configuration ID data', function(done) {
                deviceConfig.setConfigCallback(function() {
                    var config = deviceConfig.getConfig();
                    expect(config.version)
                        .toEqual(deviceConfig.getDesiredVersion());
                    expect(config.id).toEqual(0x12345678);
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
                    expect(config.stateEstimationParameters).toEqual([
                        0.0, 0.0
                    ]);
                    expect(config.enableParameters).toEqual([0.0, 0.0]);
                    for (var i = 0; i < 16; ++i) {
                        var state = config.ledStates[i];
                        expect(state.status).toEqual(0);
                        expect(state.pattern).toEqual(0);
                        expect(state.colors.right_front.red).toEqual(0);
                        expect(state.colors.right_front.green).toEqual(0);
                        expect(state.colors.right_front.blue).toEqual(0);
                        expect(state.colors.right_back.red).toEqual(0);
                        expect(state.colors.right_back.green).toEqual(0);
                        expect(state.colors.right_back.blue).toEqual(0);
                        expect(state.colors.left_front.red).toEqual(0);
                        expect(state.colors.left_front.green).toEqual(0);
                        expect(state.colors.left_front.blue).toEqual(0);
                        expect(state.colors.left_back.red).toEqual(0);
                        expect(state.colors.left_back.green).toEqual(0);
                        expect(state.colors.left_back.blue).toEqual(0);
                        expect(state.indicator_red).toEqual(false);
                        expect(state.indicator_green).toEqual(false);
                    }
                    expect(config.name).toEqual('');
                    expect(config.forwardMasterPIDParameters).toEqual([
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                    ]);
                    expect(config.rightMasterPIDParameters).toEqual([
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                    ]);
                    expect(config.upMasterPIDParameters).toEqual([
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                    ]);
                    expect(config.forwardSlavePIDParameters).toEqual([
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                    ]);
                    expect(config.rightSlavePIDParameters).toEqual([
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                    ]);
                    expect(config.upSlavePIDParameters).toEqual([
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                    ]);
                    expect(config.velocityPidBypass).toEqual(0);
                    expect(config.inertialBiasAccel).toEqual([0.0, 0.0, 0.0]);
                    expect(config.inertialBiasGyro).toEqual([0.0, 0.0, 0.0]);
                    done();
                });
                var mask = deviceConfig.field.ID;
                full_config_data[6] = (mask & 0xFF);
                full_config_data[7] = ((mask >> 8) & 0xFF);
                [0x78, 0x56, 0x34, 0x12].forEach(function(val, idx) {
                    full_config_data[8 + idx] = val;
                });
                full_config_data = full_config_data.slice(0, 13);
                recalcChecksum(full_config_data);
                backend.onRead(new Uint8Array(cobs.encode(full_config_data)));
            });

            it('parses PCB data', function(done) {
                deviceConfig.setConfigCallback(function() {
                    var config = deviceConfig.getConfig();
                    expect(config.version)
                        .toEqual(deviceConfig.getDesiredVersion());
                    expect(config.id).toEqual(0);
                    expect(config.pcbOrientation).toEqual([
                        3.25, 1232.75, 7.125
                    ]);
                    expect(config.pcbTranslation).toEqual([
                        323232.5, 77.5, 1.0
                    ]);
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
                    expect(config.stateEstimationParameters).toEqual([
                        0.0, 0.0
                    ]);
                    expect(config.enableParameters).toEqual([0.0, 0.0]);
                    for (var i = 0; i < 16; ++i) {
                        var state = config.ledStates[i];
                        expect(state.status).toEqual(0);
                        expect(state.pattern).toEqual(0);
                        expect(state.colors.right_front.red).toEqual(0);
                        expect(state.colors.right_front.green).toEqual(0);
                        expect(state.colors.right_front.blue).toEqual(0);
                        expect(state.colors.right_back.red).toEqual(0);
                        expect(state.colors.right_back.green).toEqual(0);
                        expect(state.colors.right_back.blue).toEqual(0);
                        expect(state.colors.left_front.red).toEqual(0);
                        expect(state.colors.left_front.green).toEqual(0);
                        expect(state.colors.left_front.blue).toEqual(0);
                        expect(state.colors.left_back.red).toEqual(0);
                        expect(state.colors.left_back.green).toEqual(0);
                        expect(state.colors.left_back.blue).toEqual(0);
                        expect(state.indicator_red).toEqual(false);
                        expect(state.indicator_green).toEqual(false);
                    }
                    expect(config.name).toEqual('');
                    expect(config.forwardMasterPIDParameters).toEqual([
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                    ]);
                    expect(config.rightMasterPIDParameters).toEqual([
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                    ]);
                    expect(config.upMasterPIDParameters).toEqual([
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                    ]);
                    expect(config.forwardSlavePIDParameters).toEqual([
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                    ]);
                    expect(config.rightSlavePIDParameters).toEqual([
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                    ]);
                    expect(config.upSlavePIDParameters).toEqual([
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                    ]);
                    expect(config.velocityPidBypass).toEqual(0);
                    expect(config.inertialBiasAccel).toEqual([0.0, 0.0, 0.0]);
                    expect(config.inertialBiasGyro).toEqual([0.0, 0.0, 0.0]);
                    done();
                });
                var mask = deviceConfig.field.PCB;
                full_config_data[6] = (mask & 0xFF);
                full_config_data[7] = ((mask >> 8) & 0xFF);
                [0, 0, 0x50, 0x40, 0, 0x18, 0x9a, 0x44, 0, 0, 0xe4, 0x40, 0x10,
                 0xd4, 0x9d, 0x48, 0, 0, 0x9b, 0x42, 0, 0, 0x80, 0x3f]
                    .forEach(function(val, idx) {
                        full_config_data[8 + idx] = val;
                    });
                full_config_data = full_config_data.slice(0, 33);
                recalcChecksum(full_config_data);
                backend.onRead(new Uint8Array(cobs.encode(full_config_data)));
            });

            it('parses mix table', function(done) {
                deviceConfig.setConfigCallback(function() {
                    var config = deviceConfig.getConfig();
                    expect(config.version)
                        .toEqual(deviceConfig.getDesiredVersion());
                    expect(config.id).toEqual(0);
                    expect(config.pcbOrientation).toEqual([0.0, 0.0, 0.0]);
                    expect(config.pcbTranslation).toEqual([0.0, 0.0, 0.0]);
                    expect(config.mixTableFz).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
                    expect(config.mixTableTx).toEqual([
                        8, 9, 10, 11, 12, 13, 14, 15
                    ]);
                    expect(config.mixTableTy).toEqual([
                        16, 17, 18, 19, 20, 21, 22, 23
                    ]);
                    expect(config.mixTableTz).toEqual([
                        24, 25, 26, 27, 28, 29, 30, 31
                    ]);
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
                    expect(config.stateEstimationParameters).toEqual([
                        0.0, 0.0
                    ]);
                    expect(config.enableParameters).toEqual([0.0, 0.0]);
                    for (var i = 0; i < 16; ++i) {
                        var state = config.ledStates[i];
                        expect(state.status).toEqual(0);
                        expect(state.pattern).toEqual(0);
                        expect(state.colors.right_front.red).toEqual(0);
                        expect(state.colors.right_front.green).toEqual(0);
                        expect(state.colors.right_front.blue).toEqual(0);
                        expect(state.colors.right_back.red).toEqual(0);
                        expect(state.colors.right_back.green).toEqual(0);
                        expect(state.colors.right_back.blue).toEqual(0);
                        expect(state.colors.left_front.red).toEqual(0);
                        expect(state.colors.left_front.green).toEqual(0);
                        expect(state.colors.left_front.blue).toEqual(0);
                        expect(state.colors.left_back.red).toEqual(0);
                        expect(state.colors.left_back.green).toEqual(0);
                        expect(state.colors.left_back.blue).toEqual(0);
                        expect(state.indicator_red).toEqual(false);
                        expect(state.indicator_green).toEqual(false);
                    }
                    expect(config.name).toEqual('');
                    expect(config.forwardMasterPIDParameters).toEqual([
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                    ]);
                    expect(config.rightMasterPIDParameters).toEqual([
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                    ]);
                    expect(config.upMasterPIDParameters).toEqual([
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                    ]);
                    expect(config.forwardSlavePIDParameters).toEqual([
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                    ]);
                    expect(config.rightSlavePIDParameters).toEqual([
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                    ]);
                    expect(config.upSlavePIDParameters).toEqual([
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                    ]);
                    expect(config.velocityPidBypass).toEqual(0);
                    expect(config.inertialBiasAccel).toEqual([0.0, 0.0, 0.0]);
                    expect(config.inertialBiasGyro).toEqual([0.0, 0.0, 0.0]);
                    done();
                });
                var mask = deviceConfig.field.MIX_TABLE;
                full_config_data[6] = (mask & 0xFF);
                full_config_data[7] = ((mask >> 8) & 0xFF);
                Array.apply(null, Array(32))
                    .map(function(val, idx) {
                        return (idx % 200);
                    })
                    .forEach(function(val, idx) {
                        full_config_data[8 + idx] = val;
                    });
                full_config_data = full_config_data.slice(0, 41);
                recalcChecksum(full_config_data);
                backend.onRead(new Uint8Array(cobs.encode(full_config_data)));
            });

            it('parses magnetic bias data', function(done) {
                deviceConfig.setConfigCallback(function() {
                    var config = deviceConfig.getConfig();
                    expect(config.version)
                        .toEqual(deviceConfig.getDesiredVersion());
                    expect(config.id).toEqual(0);
                    expect(config.pcbOrientation).toEqual([0.0, 0.0, 0.0]);
                    expect(config.pcbTranslation).toEqual([0.0, 0.0, 0.0]);
                    expect(config.mixTableFz).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
                    expect(config.mixTableTx).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
                    expect(config.mixTableTy).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
                    expect(config.mixTableTz).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
                    expect(config.magBias).toEqual([3.25, 1232.75, 7.125]);
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
                    expect(config.stateEstimationParameters).toEqual([
                        0.0, 0.0
                    ]);
                    expect(config.enableParameters).toEqual([0.0, 0.0]);
                    for (var i = 0; i < 16; ++i) {
                        var state = config.ledStates[i];
                        expect(state.status).toEqual(0);
                        expect(state.pattern).toEqual(0);
                        expect(state.colors.right_front.red).toEqual(0);
                        expect(state.colors.right_front.green).toEqual(0);
                        expect(state.colors.right_front.blue).toEqual(0);
                        expect(state.colors.right_back.red).toEqual(0);
                        expect(state.colors.right_back.green).toEqual(0);
                        expect(state.colors.right_back.blue).toEqual(0);
                        expect(state.colors.left_front.red).toEqual(0);
                        expect(state.colors.left_front.green).toEqual(0);
                        expect(state.colors.left_front.blue).toEqual(0);
                        expect(state.colors.left_back.red).toEqual(0);
                        expect(state.colors.left_back.green).toEqual(0);
                        expect(state.colors.left_back.blue).toEqual(0);
                        expect(state.indicator_red).toEqual(false);
                        expect(state.indicator_green).toEqual(false);
                    }
                    expect(config.name).toEqual('');
                    expect(config.forwardMasterPIDParameters).toEqual([
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                    ]);
                    expect(config.rightMasterPIDParameters).toEqual([
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                    ]);
                    expect(config.upMasterPIDParameters).toEqual([
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                    ]);
                    expect(config.forwardSlavePIDParameters).toEqual([
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                    ]);
                    expect(config.rightSlavePIDParameters).toEqual([
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                    ]);
                    expect(config.upSlavePIDParameters).toEqual([
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                    ]);
                    expect(config.velocityPidBypass).toEqual(0);
                    expect(config.inertialBiasAccel).toEqual([0.0, 0.0, 0.0]);
                    expect(config.inertialBiasGyro).toEqual([0.0, 0.0, 0.0]);
                    done();
                });
                var mask = deviceConfig.field.MAG_BIAS;
                full_config_data[6] = (mask & 0xFF);
                full_config_data[7] = ((mask >> 8) & 0xFF);
                [0, 0, 0x50, 0x40, 0, 0x18, 0x9a, 0x44, 0, 0, 0xe4, 0x40]
                    .forEach(function(val, idx) {
                        full_config_data[8 + idx] = val;
                    });
                full_config_data = full_config_data.slice(0, 33);
                recalcChecksum(full_config_data);
                backend.onRead(new Uint8Array(cobs.encode(full_config_data)));
            });

            it('parses channel data', function(done) {
                deviceConfig.setConfigCallback(function() {
                    var config = deviceConfig.getConfig();
                    expect(config.version)
                        .toEqual(deviceConfig.getDesiredVersion());
                    expect(config.id).toEqual(0);
                    expect(config.pcbOrientation).toEqual([0.0, 0.0, 0.0]);
                    expect(config.pcbTranslation).toEqual([0.0, 0.0, 0.0]);
                    expect(config.mixTableFz).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
                    expect(config.mixTableTx).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
                    expect(config.mixTableTy).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
                    expect(config.mixTableTz).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
                    expect(config.magBias).toEqual([0.0, 0.0, 0.0]);
                    expect(config.assignedChannel).toEqual([0, 1, 2, 3, 4, 5]);
                    expect(config.commandInversion).toEqual(6);
                    expect(config.channelMidpoint).toEqual([
                        0x0807, 0x0a09, 0x0c0b, 0x0e0d, 0x100f, 0x1211
                    ]);
                    expect(config.channelDeadzone).toEqual([
                        0x1413, 0x1615, 0x1817, 0x1a19, 0x1c1b, 0x1e1d
                    ]);
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
                    expect(config.stateEstimationParameters).toEqual([
                        0.0, 0.0
                    ]);
                    expect(config.enableParameters).toEqual([0.0, 0.0]);
                    for (var i = 0; i < 16; ++i) {
                        var state = config.ledStates[i];
                        expect(state.status).toEqual(0);
                        expect(state.pattern).toEqual(0);
                        expect(state.colors.right_front.red).toEqual(0);
                        expect(state.colors.right_front.green).toEqual(0);
                        expect(state.colors.right_front.blue).toEqual(0);
                        expect(state.colors.right_back.red).toEqual(0);
                        expect(state.colors.right_back.green).toEqual(0);
                        expect(state.colors.right_back.blue).toEqual(0);
                        expect(state.colors.left_front.red).toEqual(0);
                        expect(state.colors.left_front.green).toEqual(0);
                        expect(state.colors.left_front.blue).toEqual(0);
                        expect(state.colors.left_back.red).toEqual(0);
                        expect(state.colors.left_back.green).toEqual(0);
                        expect(state.colors.left_back.blue).toEqual(0);
                        expect(state.indicator_red).toEqual(false);
                        expect(state.indicator_green).toEqual(false);
                    }
                    expect(config.name).toEqual('');
                    expect(config.forwardMasterPIDParameters).toEqual([
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                    ]);
                    expect(config.rightMasterPIDParameters).toEqual([
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                    ]);
                    expect(config.upMasterPIDParameters).toEqual([
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                    ]);
                    expect(config.forwardSlavePIDParameters).toEqual([
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                    ]);
                    expect(config.rightSlavePIDParameters).toEqual([
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                    ]);
                    expect(config.upSlavePIDParameters).toEqual([
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                    ]);
                    expect(config.velocityPidBypass).toEqual(0);
                    expect(config.inertialBiasAccel).toEqual([0.0, 0.0, 0.0]);
                    expect(config.inertialBiasGyro).toEqual([0.0, 0.0, 0.0]);
                    done();
                });
                var mask = deviceConfig.field.CHANNEL;
                full_config_data[6] = (mask & 0xFF);
                full_config_data[7] = ((mask >> 8) & 0xFF);
                Array.apply(null, Array(31))
                    .map(function(val, idx) {
                        return (idx % 200);
                    })
                    .forEach(function(val, idx) {
                        full_config_data[8 + idx] = val;
                    });
                full_config_data = full_config_data.slice(0, 40);
                recalcChecksum(full_config_data);
                backend.onRead(new Uint8Array(cobs.encode(full_config_data)));
            });

            it('parses PID parameters data', function(done) {
                deviceConfig.setConfigCallback(function() {
                    var config = deviceConfig.getConfig();
                    expect(config.version)
                        .toEqual(deviceConfig.getDesiredVersion());
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
                        0.125, 0.125, 0.125, 0.125, 0.125, 0.125, 0.125
                    ]);
                    expect(config.pitchMasterPIDParameters).toEqual([
                        0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5
                    ]);
                    expect(config.rollMasterPIDParameters).toEqual([
                        2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0
                    ]);
                    expect(config.yawMasterPIDParameters).toEqual([
                        8.0, 8.0, 8.0, 8.0, 8.0, 8.0, 8.0
                    ]);
                    expect(config.thrustSlavePIDParameters).toEqual([
                        32.0, 32.0, 32.0, 32.0, 32.0, 32.0, 32.0
                    ]);
                    expect(config.pitchSlavePIDParameters).toEqual([
                        128.0, 128.0, 128.0, 128.0, 128.0, 128.0, 128.0
                    ]);
                    expect(config.rollSlavePIDParameters).toEqual([
                        512.0, 512.0, 512.0, 512.0, 512.0, 512.0, 512.0
                    ]);
                    expect(config.yawSlavePIDParameters).toEqual([
                        2048.0, 2048.0, 2048.0, 2048.0, 2048.0, 2048.0, 2048.0
                    ]);
                    expect(config.thrustGain).toBe(0.5);
                    expect(config.pitchGain).toBe(2.0);
                    expect(config.rollGain).toBe(8.0);
                    expect(config.yawGain).toBe(32.0);
                    expect(config.pidBypass).toEqual(4);
                    expect(config.stateEstimationParameters).toEqual([
                        0.0, 0.0
                    ]);
                    expect(config.enableParameters).toEqual([0.0, 0.0]);
                    for (var i = 0; i < 16; ++i) {
                        var state = config.ledStates[i];
                        expect(state.status).toEqual(0);
                        expect(state.pattern).toEqual(0);
                        expect(state.colors.right_front.red).toEqual(0);
                        expect(state.colors.right_front.green).toEqual(0);
                        expect(state.colors.right_front.blue).toEqual(0);
                        expect(state.colors.right_back.red).toEqual(0);
                        expect(state.colors.right_back.green).toEqual(0);
                        expect(state.colors.right_back.blue).toEqual(0);
                        expect(state.colors.left_front.red).toEqual(0);
                        expect(state.colors.left_front.green).toEqual(0);
                        expect(state.colors.left_front.blue).toEqual(0);
                        expect(state.colors.left_back.red).toEqual(0);
                        expect(state.colors.left_back.green).toEqual(0);
                        expect(state.colors.left_back.blue).toEqual(0);
                        expect(state.indicator_red).toEqual(false);
                        expect(state.indicator_green).toEqual(false);
                    }
                    expect(config.name).toEqual('');
                    expect(config.forwardMasterPIDParameters).toEqual([
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                    ]);
                    expect(config.rightMasterPIDParameters).toEqual([
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                    ]);
                    expect(config.upMasterPIDParameters).toEqual([
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                    ]);
                    expect(config.forwardSlavePIDParameters).toEqual([
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                    ]);
                    expect(config.rightSlavePIDParameters).toEqual([
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                    ]);
                    expect(config.upSlavePIDParameters).toEqual([
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                    ]);
                    expect(config.velocityPidBypass).toEqual(0);
                    expect(config.inertialBiasAccel).toEqual([0.0, 0.0, 0.0]);
                    expect(config.inertialBiasGyro).toEqual([0.0, 0.0, 0.0]);
                    done();
                });
                var mask = deviceConfig.field.PID_PARAMETERS;
                full_config_data[6] = (mask & 0xFF);
                full_config_data[7] = ((mask >> 8) & 0xFF);
                Array.apply(null, Array(8 * 7 * 4 + 4 * 4 + 1))
                    .map(function(val, idx) {
                        if (idx === 8 * 7 * 4 + 4 * 4) {
                            // PID bypass flags
                            return 4;
                        }
                        // other items, type Float32
                        if (idx % 4 !== 3) {
                            return 0;
                        }
                        if (idx >= 8 * 7 * 4) {
                            return (0x3e + 1 + Math.floor(idx / 4 - 8 * 7));
                        }
                        return (0x3e + Math.floor(idx / 28));
                    })
                    .forEach(function(val, idx) {
                        full_config_data[8 + idx] = val;
                    });
                full_config_data =
                    full_config_data.slice(0, 8 + 8 * 7 * 4 + 4 * 4 + 1 + 1);
                recalcChecksum(full_config_data);
                backend.onRead(new Uint8Array(cobs.encode(full_config_data)));
            });

            it('parses STATE parameters data', function(done) {
                deviceConfig.setConfigCallback(function() {
                    var config = deviceConfig.getConfig();
                    expect(config.version)
                        .toEqual(deviceConfig.getDesiredVersion());
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
                    expect(config.stateEstimationParameters).toEqual([
                        3.25, 1232.75
                    ]);
                    expect(config.enableParameters).toEqual([7.125, 323232.5]);
                    for (var i = 0; i < 16; ++i) {
                        var state = config.ledStates[i];
                        expect(state.status).toEqual(0);
                        expect(state.pattern).toEqual(0);
                        expect(state.colors.right_front.red).toEqual(0);
                        expect(state.colors.right_front.green).toEqual(0);
                        expect(state.colors.right_front.blue).toEqual(0);
                        expect(state.colors.right_back.red).toEqual(0);
                        expect(state.colors.right_back.green).toEqual(0);
                        expect(state.colors.right_back.blue).toEqual(0);
                        expect(state.colors.left_front.red).toEqual(0);
                        expect(state.colors.left_front.green).toEqual(0);
                        expect(state.colors.left_front.blue).toEqual(0);
                        expect(state.colors.left_back.red).toEqual(0);
                        expect(state.colors.left_back.green).toEqual(0);
                        expect(state.colors.left_back.blue).toEqual(0);
                        expect(state.indicator_red).toEqual(false);
                        expect(state.indicator_green).toEqual(false);
                    }
                    expect(config.name).toEqual('');
                    expect(config.forwardMasterPIDParameters).toEqual([
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                    ]);
                    expect(config.rightMasterPIDParameters).toEqual([
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                    ]);
                    expect(config.upMasterPIDParameters).toEqual([
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                    ]);
                    expect(config.forwardSlavePIDParameters).toEqual([
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                    ]);
                    expect(config.rightSlavePIDParameters).toEqual([
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                    ]);
                    expect(config.upSlavePIDParameters).toEqual([
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                    ]);
                    expect(config.velocityPidBypass).toEqual(0);
                    expect(config.inertialBiasAccel).toEqual([0.0, 0.0, 0.0]);
                    expect(config.inertialBiasGyro).toEqual([0.0, 0.0, 0.0]);
                    done();
                });
                var mask = deviceConfig.field.STATE_PARAMETERS;
                full_config_data[6] = (mask & 0xFF);
                full_config_data[7] = ((mask >> 8) & 0xFF);
                [0, 0, 0x50, 0x40, 0, 0x18, 0x9a, 0x44, 0, 0, 0xe4, 0x40, 0x10,
                 0xd4, 0x9d, 0x48]
                    .forEach(function(val, idx) {
                        full_config_data[8 + idx] = val;
                    });
                full_config_data = full_config_data.slice(0, 33);
                recalcChecksum(full_config_data);
                backend.onRead(new Uint8Array(cobs.encode(full_config_data)));
            });

            it('parses LED states data', function(done) {
                deviceConfig.setConfigCallback(function() {
                    var config = deviceConfig.getConfig();
                    expect(config.version)
                        .toEqual(deviceConfig.getDesiredVersion());
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
                    expect(config.stateEstimationParameters).toEqual([
                        0.0, 0.0
                    ]);
                    expect(config.enableParameters).toEqual([0.0, 0.0]);
                    for (var i = 0; i < 16; ++i) {
                        var state = config.ledStates[i];
                        expect(state.status).toEqual(256 + 257 * i);
                        expect(state.pattern).toEqual(2 + i);
                        expect(state.colors.right_front.red).toEqual(3 + i);
                        expect(state.colors.right_front.green).toEqual(4 + i);
                        expect(state.colors.right_front.blue).toEqual(5 + i);
                        expect(state.colors.right_back.red).toEqual(6 + i);
                        expect(state.colors.right_back.green).toEqual(7 + i);
                        expect(state.colors.right_back.blue).toEqual(8 + i);
                        expect(state.colors.left_front.red).toEqual(9 + i);
                        expect(state.colors.left_front.green).toEqual(10 + i);
                        expect(state.colors.left_front.blue).toEqual(11 + i);
                        expect(state.colors.left_back.red).toEqual(12 + i);
                        expect(state.colors.left_back.green).toEqual(13 + i);
                        expect(state.colors.left_back.blue).toEqual(14 + i);
                        expect(state.indicator_red).toEqual(i % 2 === 0);
                        expect(state.indicator_green).toEqual(i % 2 === 1);
                    }
                    expect(config.name).toEqual('');
                    expect(config.forwardMasterPIDParameters).toEqual([
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                    ]);
                    expect(config.rightMasterPIDParameters).toEqual([
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                    ]);
                    expect(config.upMasterPIDParameters).toEqual([
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                    ]);
                    expect(config.forwardSlavePIDParameters).toEqual([
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                    ]);
                    expect(config.rightSlavePIDParameters).toEqual([
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                    ]);
                    expect(config.upSlavePIDParameters).toEqual([
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                    ]);
                    expect(config.velocityPidBypass).toEqual(0);
                    expect(config.inertialBiasAccel).toEqual([0.0, 0.0, 0.0]);
                    expect(config.inertialBiasGyro).toEqual([0.0, 0.0, 0.0]);
                    done();
                });
                var mask = deviceConfig.field.LED_STATES;
                full_config_data[6] = (mask & 0xFF);
                full_config_data[7] = ((mask >> 8) & 0xFF);
                full_config_data[8] = 0xFF;
                full_config_data[9] = 0xFF;
                Array.apply(null, Array(272))
                    .map(function(val, idx) {
                        var id = idx / 17;
                        var m = idx % 17;
                        if (m < 15) {
                            return m + id;
                        } else {
                            return (m + id) % 2;
                        }
                    })
                    .forEach(function(val, idx) {
                        full_config_data[10 + idx] = val;
                    });
                full_config_data = full_config_data.slice(0, 283);
                recalcChecksum(full_config_data);
                backend.onRead(new Uint8Array(cobs.encode(full_config_data)));
            });

            it('parses device name', function(done) {
                deviceConfig.setConfigCallback(function() {
                    var config = deviceConfig.getConfig();
                    expect(config.version)
                        .toEqual(deviceConfig.getDesiredVersion());
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
                    expect(config.stateEstimationParameters).toEqual([
                        0.0, 0.0
                    ]);
                    expect(config.enableParameters).toEqual([0.0, 0.0]);
                    for (var i = 0; i < 16; ++i) {
                        var state = config.ledStates[i];
                        expect(state.status).toEqual(0);
                        expect(state.pattern).toEqual(0);
                        expect(state.colors.right_front.red).toEqual(0);
                        expect(state.colors.right_front.green).toEqual(0);
                        expect(state.colors.right_front.blue).toEqual(0);
                        expect(state.colors.right_back.red).toEqual(0);
                        expect(state.colors.right_back.green).toEqual(0);
                        expect(state.colors.right_back.blue).toEqual(0);
                        expect(state.colors.left_front.red).toEqual(0);
                        expect(state.colors.left_front.green).toEqual(0);
                        expect(state.colors.left_front.blue).toEqual(0);
                        expect(state.colors.left_back.red).toEqual(0);
                        expect(state.colors.left_back.green).toEqual(0);
                        expect(state.colors.left_back.blue).toEqual(0);
                        expect(state.indicator_red).toEqual(false);
                        expect(state.indicator_green).toEqual(false);
                    }
                    expect(config.name).toEqual('AbcD');
                    expect(config.forwardMasterPIDParameters).toEqual([
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                    ]);
                    expect(config.rightMasterPIDParameters).toEqual([
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                    ]);
                    expect(config.upMasterPIDParameters).toEqual([
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                    ]);
                    expect(config.forwardSlavePIDParameters).toEqual([
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                    ]);
                    expect(config.rightSlavePIDParameters).toEqual([
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                    ]);
                    expect(config.upSlavePIDParameters).toEqual([
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                    ]);
                    expect(config.velocityPidBypass).toEqual(0);
                    expect(config.inertialBiasAccel).toEqual([0.0, 0.0, 0.0]);
                    expect(config.inertialBiasGyro).toEqual([0.0, 0.0, 0.0]);
                    done();
                });
                var mask = deviceConfig.field.DEVICE_NAME;
                full_config_data[6] = (mask & 0xFF);
                full_config_data[7] = ((mask >> 8) & 0xFF);
                [65, 98, 99, 68, 0, 0, 0, 0, 0].forEach(function(val, idx) {
                    full_config_data[8 + idx] = val;
                });
                full_config_data = full_config_data.slice(0, 30);
                recalcChecksum(full_config_data);
                backend.onRead(new Uint8Array(cobs.encode(full_config_data)));
            });

            it('parses velocity PID parameters data', function(done) {
                deviceConfig.setConfigCallback(function() {
                    var config = deviceConfig.getConfig();
                    expect(config.version)
                        .toEqual(deviceConfig.getDesiredVersion());
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
                    expect(config.stateEstimationParameters).toEqual([
                        0.0, 0.0
                    ]);
                    expect(config.enableParameters).toEqual([0.0, 0.0]);
                    for (var i = 0; i < 16; ++i) {
                        var state = config.ledStates[i];
                        expect(state.status).toEqual(0);
                        expect(state.pattern).toEqual(0);
                        expect(state.colors.right_front.red).toEqual(0);
                        expect(state.colors.right_front.green).toEqual(0);
                        expect(state.colors.right_front.blue).toEqual(0);
                        expect(state.colors.right_back.red).toEqual(0);
                        expect(state.colors.right_back.green).toEqual(0);
                        expect(state.colors.right_back.blue).toEqual(0);
                        expect(state.colors.left_front.red).toEqual(0);
                        expect(state.colors.left_front.green).toEqual(0);
                        expect(state.colors.left_front.blue).toEqual(0);
                        expect(state.colors.left_back.red).toEqual(0);
                        expect(state.colors.left_back.green).toEqual(0);
                        expect(state.colors.left_back.blue).toEqual(0);
                        expect(state.indicator_red).toEqual(false);
                        expect(state.indicator_green).toEqual(false);
                    }
                    expect(config.name).toEqual('');
                    expect(config.forwardMasterPIDParameters).toEqual([
                        0.125, 0.125, 0.125, 0.125, 0.125, 0.125, 0.125
                    ]);
                    expect(config.rightMasterPIDParameters).toEqual([
                        0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5
                    ]);
                    expect(config.upMasterPIDParameters).toEqual([
                        2.0, 2.0, 2.0, 2.0, 2.0, 2.0, 2.0
                    ]);
                    expect(config.forwardSlavePIDParameters).toEqual([
                        8.0, 8.0, 8.0, 8.0, 8.0, 8.0, 8.0
                    ]);
                    expect(config.rightSlavePIDParameters).toEqual([
                        32.0, 32.0, 32.0, 32.0, 32.0, 32.0, 32.0
                    ]);
                    expect(config.upSlavePIDParameters).toEqual([
                        128.0, 128.0, 128.0, 128.0, 128.0, 128.0, 128.0
                    ]);
                    expect(config.velocityPidBypass).toEqual(4);
                    expect(config.inertialBiasAccel).toEqual([0.0, 0.0, 0.0]);
                    expect(config.inertialBiasGyro).toEqual([0.0, 0.0, 0.0]);
                    done();
                });
                var mask = deviceConfig.field.VELOCITY_PID_PARAMETERS;
                full_config_data[6] = (mask & 0xFF);
                full_config_data[7] = ((mask >> 8) & 0xFF);
                Array.apply(null, Array(3 * 7 * 8 + 1))
                    .map(function(val, idx) {
                        if (idx === 3 * 7 * 8) {
                            // PID bypass flags
                            return 4;
                        }
                        // other items, type Float32
                        if (idx % 4 !== 3) {
                            return 0;
                        }
                        return (0x3e + Math.floor(idx / 28));
                    })
                    .forEach(function(val, idx) {
                        full_config_data[8 + idx] = val;
                    });
                full_config_data =
                    full_config_data.slice(0, 8 + 3 * 7 * 8 + 1 + 1);
                recalcChecksum(full_config_data);
                backend.onRead(new Uint8Array(cobs.encode(full_config_data)));
            });

            it('parses inertial bias data', function(done) {
                deviceConfig.setConfigCallback(function() {
                    var config = deviceConfig.getConfig();
                    expect(config.version)
                        .toEqual(deviceConfig.getDesiredVersion());
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
                    expect(config.stateEstimationParameters).toEqual([
                        0.0, 0.0
                    ]);
                    expect(config.enableParameters).toEqual([0.0, 0.0]);
                    for (var i = 0; i < 16; ++i) {
                        var state = config.ledStates[i];
                        expect(state.status).toEqual(0);
                        expect(state.pattern).toEqual(0);
                        expect(state.colors.right_front.red).toEqual(0);
                        expect(state.colors.right_front.green).toEqual(0);
                        expect(state.colors.right_front.blue).toEqual(0);
                        expect(state.colors.right_back.red).toEqual(0);
                        expect(state.colors.right_back.green).toEqual(0);
                        expect(state.colors.right_back.blue).toEqual(0);
                        expect(state.colors.left_front.red).toEqual(0);
                        expect(state.colors.left_front.green).toEqual(0);
                        expect(state.colors.left_front.blue).toEqual(0);
                        expect(state.colors.left_back.red).toEqual(0);
                        expect(state.colors.left_back.green).toEqual(0);
                        expect(state.colors.left_back.blue).toEqual(0);
                        expect(state.indicator_red).toEqual(false);
                        expect(state.indicator_green).toEqual(false);
                    }
                    expect(config.name).toEqual('');
                    expect(config.forwardMasterPIDParameters).toEqual([
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                    ]);
                    expect(config.rightMasterPIDParameters).toEqual([
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                    ]);
                    expect(config.upMasterPIDParameters).toEqual([
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                    ]);
                    expect(config.forwardSlavePIDParameters).toEqual([
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                    ]);
                    expect(config.rightSlavePIDParameters).toEqual([
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                    ]);
                    expect(config.upSlavePIDParameters).toEqual([
                        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                    ]);
                    expect(config.velocityPidBypass).toEqual(0);
                    expect(config.inertialBiasAccel).toEqual([
                        3.25, 1232.75, 7.125
                    ]);
                    expect(config.inertialBiasGyro).toEqual([
                        323232.5, 77.5, 1.0
                    ]);
                    done();
                });
                var mask = deviceConfig.field.INERTIAL_BIAS;
                full_config_data[6] = (mask & 0xFF);
                full_config_data[7] = ((mask >> 8) & 0xFF);
                [0, 0, 0x50, 0x40, 0, 0x18, 0x9a, 0x44, 0, 0, 0xe4, 0x40, 0x10,
                 0xd4, 0x9d, 0x48, 0, 0, 0x9b, 0x42, 0, 0, 0x80, 0x3f]
                    .forEach(function(val, idx) {
                        full_config_data[8 + idx] = val;
                    });
                full_config_data = full_config_data.slice(0, 33);
                recalcChecksum(full_config_data);
                backend.onRead(new Uint8Array(cobs.encode(full_config_data)));
            });

            describe('parsing partial LED states data', function() {

                it('parses second half', function(done) {
                    deviceConfig.setConfigCallback(function() {
                        var config = deviceConfig.getConfig();
                        expect(config.version)
                            .toEqual(deviceConfig.getDesiredVersion());
                        expect(config.id).toEqual(0);
                        expect(config.pcbOrientation).toEqual([0.0, 0.0, 0.0]);
                        expect(config.pcbTranslation).toEqual([0.0, 0.0, 0.0]);
                        expect(config.mixTableFz).toEqual([
                            0, 0, 0, 0, 0, 0, 0, 0
                        ]);
                        expect(config.mixTableTx).toEqual([
                            0, 0, 0, 0, 0, 0, 0, 0
                        ]);
                        expect(config.mixTableTy).toEqual([
                            0, 0, 0, 0, 0, 0, 0, 0
                        ]);
                        expect(config.mixTableTz).toEqual([
                            0, 0, 0, 0, 0, 0, 0, 0
                        ]);
                        expect(config.magBias).toEqual([0.0, 0.0, 0.0]);
                        expect(config.assignedChannel).toEqual([
                            0, 0, 0, 0, 0, 0
                        ]);
                        expect(config.commandInversion).toEqual(0);
                        expect(config.channelMidpoint).toEqual([
                            0, 0, 0, 0, 0, 0
                        ]);
                        expect(config.channelDeadzone).toEqual([
                            0, 0, 0, 0, 0, 0
                        ]);
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
                        expect(config.stateEstimationParameters).toEqual([
                            0.0, 0.0
                        ]);
                        expect(config.enableParameters).toEqual([0.0, 0.0]);
                        for (var j = 0; j < 16; ++j) {
                            var state = config.ledStates[j];
                            if (j < 8) {
                                expect(state.status).toEqual(0);
                                expect(state.pattern).toEqual(0);
                                expect(state.colors.right_front.red).toEqual(0);
                                expect(state.colors.right_front.green)
                                    .toEqual(0);
                                expect(state.colors.right_front.blue)
                                    .toEqual(0);
                                expect(state.colors.right_back.red).toEqual(0);
                                expect(state.colors.right_back.green)
                                    .toEqual(0);
                                expect(state.colors.right_back.blue).toEqual(0);
                                expect(state.colors.left_front.red).toEqual(0);
                                expect(state.colors.left_front.green)
                                    .toEqual(0);
                                expect(state.colors.left_front.blue).toEqual(0);
                                expect(state.colors.left_back.red).toEqual(0);
                                expect(state.colors.left_back.green).toEqual(0);
                                expect(state.colors.left_back.blue).toEqual(0);
                                expect(state.indicator_red).toEqual(false);
                                expect(state.indicator_green).toEqual(false);
                            } else {
                                var i = j - 8;
                                expect(state.status).toEqual(256 + 257 * i);
                                expect(state.pattern).toEqual(2 + i);
                                expect(state.colors.right_front.red)
                                    .toEqual(3 + i);
                                expect(state.colors.right_front.green)
                                    .toEqual(4 + i);
                                expect(state.colors.right_front.blue)
                                    .toEqual(5 + i);
                                expect(state.colors.right_back.red)
                                    .toEqual(6 + i);
                                expect(state.colors.right_back.green)
                                    .toEqual(7 + i);
                                expect(state.colors.right_back.blue)
                                    .toEqual(8 + i);
                                expect(state.colors.left_front.red)
                                    .toEqual(9 + i);
                                expect(state.colors.left_front.green)
                                    .toEqual(10 + i);
                                expect(state.colors.left_front.blue)
                                    .toEqual(11 + i);
                                expect(state.colors.left_back.red)
                                    .toEqual(12 + i);
                                expect(state.colors.left_back.green)
                                    .toEqual(13 + i);
                                expect(state.colors.left_back.blue)
                                    .toEqual(14 + i);
                                expect(state.indicator_red)
                                    .toEqual(i % 2 === 0);
                                expect(state.indicator_green)
                                    .toEqual(i % 2 === 1);
                            }
                        }
                        expect(config.name).toEqual('');
                        expect(config.forwardMasterPIDParameters).toEqual([
                            0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                        ]);
                        expect(config.rightMasterPIDParameters).toEqual([
                            0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                        ]);
                        expect(config.upMasterPIDParameters).toEqual([
                            0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                        ]);
                        expect(config.forwardSlavePIDParameters).toEqual([
                            0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                        ]);
                        expect(config.rightSlavePIDParameters).toEqual([
                            0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                        ]);
                        expect(config.upSlavePIDParameters).toEqual([
                            0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                        ]);
                        expect(config.velocityPidBypass).toEqual(0);
                        expect(config.inertialBiasAccel).toEqual([0.0, 0.0, 0.0]);
                        expect(config.inertialBiasGyro).toEqual([0.0, 0.0, 0.0]);
                        done();
                    });
                    var mask = deviceConfig.field.LED_STATES;
                    full_config_data[6] = (mask & 0xFF);
                    full_config_data[7] = ((mask >> 8) & 0xFF);
                    full_config_data[8] = 0x00;
                    full_config_data[9] = 0xFF;
                    Array.apply(null, Array(136))
                        .map(function(val, idx) {
                            var id = idx / 17;
                            var m = idx % 17;
                            if (m < 15) {
                                return m + id;
                            } else {
                                return (m + id) % 2;
                            }
                        })
                        .forEach(function(val, idx) {
                            full_config_data[10 + idx] = val;
                        });
                    full_config_data = full_config_data.slice(0, 147);
                    recalcChecksum(full_config_data);
                    backend.onRead(
                        new Uint8Array(cobs.encode(full_config_data)));
                });

                it('parses first half', function(done) {
                    deviceConfig.setConfigCallback(function() {
                        var config = deviceConfig.getConfig();
                        expect(config.version)
                            .toEqual(deviceConfig.getDesiredVersion());
                        expect(config.id).toEqual(0);
                        expect(config.pcbOrientation).toEqual([0.0, 0.0, 0.0]);
                        expect(config.pcbTranslation).toEqual([0.0, 0.0, 0.0]);
                        expect(config.mixTableFz).toEqual([
                            0, 0, 0, 0, 0, 0, 0, 0
                        ]);
                        expect(config.mixTableTx).toEqual([
                            0, 0, 0, 0, 0, 0, 0, 0
                        ]);
                        expect(config.mixTableTy).toEqual([
                            0, 0, 0, 0, 0, 0, 0, 0
                        ]);
                        expect(config.mixTableTz).toEqual([
                            0, 0, 0, 0, 0, 0, 0, 0
                        ]);
                        expect(config.magBias).toEqual([0.0, 0.0, 0.0]);
                        expect(config.assignedChannel).toEqual([
                            0, 0, 0, 0, 0, 0
                        ]);
                        expect(config.commandInversion).toEqual(0);
                        expect(config.channelMidpoint).toEqual([
                            0, 0, 0, 0, 0, 0
                        ]);
                        expect(config.channelDeadzone).toEqual([
                            0, 0, 0, 0, 0, 0
                        ]);
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
                        expect(config.stateEstimationParameters).toEqual([
                            0.0, 0.0
                        ]);
                        expect(config.enableParameters).toEqual([0.0, 0.0]);
                        for (var j = 0; j < 16; ++j) {
                            var state = config.ledStates[j];
                            if (j > 7) {
                                expect(state.status).toEqual(0);
                                expect(state.pattern).toEqual(0);
                                expect(state.colors.right_front.red).toEqual(0);
                                expect(state.colors.right_front.green)
                                    .toEqual(0);
                                expect(state.colors.right_front.blue)
                                    .toEqual(0);
                                expect(state.colors.right_back.red).toEqual(0);
                                expect(state.colors.right_back.green)
                                    .toEqual(0);
                                expect(state.colors.right_back.blue).toEqual(0);
                                expect(state.colors.left_front.red).toEqual(0);
                                expect(state.colors.left_front.green)
                                    .toEqual(0);
                                expect(state.colors.left_front.blue).toEqual(0);
                                expect(state.colors.left_back.red).toEqual(0);
                                expect(state.colors.left_back.green).toEqual(0);
                                expect(state.colors.left_back.blue).toEqual(0);
                                expect(state.indicator_red).toEqual(false);
                                expect(state.indicator_green).toEqual(false);
                            } else {
                                var i = j;
                                expect(state.status).toEqual(256 + 257 * i);
                                expect(state.pattern).toEqual(2 + i);
                                expect(state.colors.right_front.red)
                                    .toEqual(3 + i);
                                expect(state.colors.right_front.green)
                                    .toEqual(4 + i);
                                expect(state.colors.right_front.blue)
                                    .toEqual(5 + i);
                                expect(state.colors.right_back.red)
                                    .toEqual(6 + i);
                                expect(state.colors.right_back.green)
                                    .toEqual(7 + i);
                                expect(state.colors.right_back.blue)
                                    .toEqual(8 + i);
                                expect(state.colors.left_front.red)
                                    .toEqual(9 + i);
                                expect(state.colors.left_front.green)
                                    .toEqual(10 + i);
                                expect(state.colors.left_front.blue)
                                    .toEqual(11 + i);
                                expect(state.colors.left_back.red)
                                    .toEqual(12 + i);
                                expect(state.colors.left_back.green)
                                    .toEqual(13 + i);
                                expect(state.colors.left_back.blue)
                                    .toEqual(14 + i);
                                expect(state.indicator_red)
                                    .toEqual(i % 2 === 0);
                                expect(state.indicator_green)
                                    .toEqual(i % 2 === 1);
                            }
                        }
                        expect(config.name).toEqual('');
                        expect(config.forwardMasterPIDParameters).toEqual([
                            0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                        ]);
                        expect(config.rightMasterPIDParameters).toEqual([
                            0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                        ]);
                        expect(config.upMasterPIDParameters).toEqual([
                            0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                        ]);
                        expect(config.forwardSlavePIDParameters).toEqual([
                            0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                        ]);
                        expect(config.rightSlavePIDParameters).toEqual([
                            0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                        ]);
                        expect(config.upSlavePIDParameters).toEqual([
                            0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                        ]);
                        expect(config.velocityPidBypass).toEqual(0);
                        expect(config.inertialBiasAccel).toEqual([0.0, 0.0, 0.0]);
                        expect(config.inertialBiasGyro).toEqual([0.0, 0.0, 0.0]);
                        done();
                    });
                    var mask = deviceConfig.field.LED_STATES;
                    full_config_data[6] = (mask & 0xFF);
                    full_config_data[7] = ((mask >> 8) & 0xFF);
                    full_config_data[8] = 0xFF;
                    full_config_data[9] = 0x00;
                    Array.apply(null, Array(136))
                        .map(function(val, idx) {
                            var id = idx / 17;
                            var m = idx % 17;
                            if (m < 15) {
                                return m + id;
                            } else {
                                return (m + id) % 2;
                            }
                        })
                        .forEach(function(val, idx) {
                            full_config_data[10 + idx] = val;
                        });
                    full_config_data = full_config_data.slice(0, 147);
                    recalcChecksum(full_config_data);
                    backend.onRead(
                        new Uint8Array(cobs.encode(full_config_data)));
                });

                it('parses arbitrary parts', function(done) {
                    deviceConfig.setConfigCallback(function() {
                        var config = deviceConfig.getConfig();
                        expect(config.version)
                            .toEqual(deviceConfig.getDesiredVersion());
                        expect(config.id).toEqual(0);
                        expect(config.pcbOrientation).toEqual([0.0, 0.0, 0.0]);
                        expect(config.pcbTranslation).toEqual([0.0, 0.0, 0.0]);
                        expect(config.mixTableFz).toEqual([
                            0, 0, 0, 0, 0, 0, 0, 0
                        ]);
                        expect(config.mixTableTx).toEqual([
                            0, 0, 0, 0, 0, 0, 0, 0
                        ]);
                        expect(config.mixTableTy).toEqual([
                            0, 0, 0, 0, 0, 0, 0, 0
                        ]);
                        expect(config.mixTableTz).toEqual([
                            0, 0, 0, 0, 0, 0, 0, 0
                        ]);
                        expect(config.magBias).toEqual([0.0, 0.0, 0.0]);
                        expect(config.assignedChannel).toEqual([
                            0, 0, 0, 0, 0, 0
                        ]);
                        expect(config.commandInversion).toEqual(0);
                        expect(config.channelMidpoint).toEqual([
                            0, 0, 0, 0, 0, 0
                        ]);
                        expect(config.channelDeadzone).toEqual([
                            0, 0, 0, 0, 0, 0
                        ]);
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
                        expect(config.stateEstimationParameters).toEqual([
                            0.0, 0.0
                        ]);
                        expect(config.enableParameters).toEqual([0.0, 0.0]);
                        for (var j = 0; j < 16; ++j) {
                            var state = config.ledStates[j];
                            if (j > 3 && j < 12) {
                                expect(state.status).toEqual(0);
                                expect(state.pattern).toEqual(0);
                                expect(state.colors.right_front.red).toEqual(0);
                                expect(state.colors.right_front.green)
                                    .toEqual(0);
                                expect(state.colors.right_front.blue)
                                    .toEqual(0);
                                expect(state.colors.right_back.red).toEqual(0);
                                expect(state.colors.right_back.green)
                                    .toEqual(0);
                                expect(state.colors.right_back.blue).toEqual(0);
                                expect(state.colors.left_front.red).toEqual(0);
                                expect(state.colors.left_front.green)
                                    .toEqual(0);
                                expect(state.colors.left_front.blue).toEqual(0);
                                expect(state.colors.left_back.red).toEqual(0);
                                expect(state.colors.left_back.green).toEqual(0);
                                expect(state.colors.left_back.blue).toEqual(0);
                                expect(state.indicator_red).toEqual(false);
                                expect(state.indicator_green).toEqual(false);
                            } else {
                                var i = j;
                                if (i > 8) {
                                    i -= 8;
                                }
                                expect(state.status).toEqual(256 + 257 * i);
                                expect(state.pattern).toEqual(2 + i);
                                expect(state.colors.right_front.red)
                                    .toEqual(3 + i);
                                expect(state.colors.right_front.green)
                                    .toEqual(4 + i);
                                expect(state.colors.right_front.blue)
                                    .toEqual(5 + i);
                                expect(state.colors.right_back.red)
                                    .toEqual(6 + i);
                                expect(state.colors.right_back.green)
                                    .toEqual(7 + i);
                                expect(state.colors.right_back.blue)
                                    .toEqual(8 + i);
                                expect(state.colors.left_front.red)
                                    .toEqual(9 + i);
                                expect(state.colors.left_front.green)
                                    .toEqual(10 + i);
                                expect(state.colors.left_front.blue)
                                    .toEqual(11 + i);
                                expect(state.colors.left_back.red)
                                    .toEqual(12 + i);
                                expect(state.colors.left_back.green)
                                    .toEqual(13 + i);
                                expect(state.colors.left_back.blue)
                                    .toEqual(14 + i);
                                expect(state.indicator_red)
                                    .toEqual(i % 2 === 0);
                                expect(state.indicator_green)
                                    .toEqual(i % 2 === 1);
                            }
                        }
                        expect(config.name).toEqual('');
                        expect(config.forwardMasterPIDParameters).toEqual([
                            0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                        ]);
                        expect(config.rightMasterPIDParameters).toEqual([
                            0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                        ]);
                        expect(config.upMasterPIDParameters).toEqual([
                            0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                        ]);
                        expect(config.forwardSlavePIDParameters).toEqual([
                            0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                        ]);
                        expect(config.rightSlavePIDParameters).toEqual([
                            0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                        ]);
                        expect(config.upSlavePIDParameters).toEqual([
                            0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                        ]);
                        expect(config.velocityPidBypass).toEqual(0);
                        expect(config.inertialBiasAccel).toEqual([0.0, 0.0, 0.0]);
                        expect(config.inertialBiasGyro).toEqual([0.0, 0.0, 0.0]);
                        done();
                    });
                    var mask = deviceConfig.field.LED_STATES;
                    full_config_data[6] = (mask & 0xFF);
                    full_config_data[7] = ((mask >> 8) & 0xFF);
                    full_config_data[8] = 0x0F;
                    full_config_data[9] = 0xF0;
                    Array.apply(null, Array(136))
                        .map(function(val, idx) {
                            var id = idx / 17;
                            var m = idx % 17;
                            if (m < 15) {
                                return m + id;
                            } else {
                                return (m + id) % 2;
                            }
                        })
                        .forEach(function(val, idx) {
                            full_config_data[10 + idx] = val;
                        });
                    full_config_data = full_config_data.slice(0, 147);
                    recalcChecksum(full_config_data);
                    backend.onRead(
                        new Uint8Array(cobs.encode(full_config_data)));
                });
            });
        });
    });

    describe('.setLoggingCallback()', function() {
        function recalcChecksum(v) {
            v[0] = 0;
            for (var i = 0; i < v.length; ++i) {
                v[0] ^= v[i];
            }
        }
        function generateDataFor(v, delay) {
            full_message_data =
                new Uint8Array(Array.apply(null, Array(10)).map(function() {
                    return 0;
                }));
            full_message_data[1] = parser.MessageType.Command;
            var command = parser.CommandFields.COM_SET_CARD_RECORDING |
                parser.CommandFields.COM_SET_SD_WRITE_DELAY;
            for (var i = 0; i < 4; ++i) {
                full_message_data[i + 2] = ((command >> (i * 8)) & 0xFF);
            }
            full_message_data[6] = delay & 0xFF;
            full_message_data[7] = (delay >> 8) & 0xFF;
            full_message_data[8] = v;
            recalcChecksum(full_message_data);
            return full_message_data;
        }

        it('exists', function() {
            expect(deviceConfig.setLoggingCallback).toBeDefined();
        });

        it('warns in the command log by default', function(done) {
            commandLog.onMessage(function name(val) {
                if (val.indexOf(
                        'No callback defined for receiving logging state!' +
                        ' Callback arguments: (isLogging, isLocked, delay)') !==
                    -1) {
                    done();
                }
            });
            backend.onRead(new Uint8Array(cobs.encode(generateDataFor(0))));
            $rootScope.$digest();
        });

        it('responds to logging data', function(done) {
            deviceConfig.setLoggingCallback(function() {
                done();
            });
            backend.onRead(new Uint8Array(cobs.encode(generateDataFor(0))));
            $rootScope.$digest();
        });

        it('properly decodes no logging with no lock', function(done) {
            deviceConfig.setLoggingCallback(function(isLogging, isLocked) {
                if (!isLogging && !isLocked) {
                    done();
                }
            });
            backend.onRead(new Uint8Array(cobs.encode(generateDataFor(0))));
            $rootScope.$digest();
        });

        it('properly decodes logging with no lock', function(done) {
            deviceConfig.setLoggingCallback(function(isLogging, isLocked) {
                if (isLogging && !isLocked) {
                    done();
                }
            });
            backend.onRead(new Uint8Array(cobs.encode(generateDataFor(1))));
            $rootScope.$digest();
        });

        it('properly decodes no logging with lock', function(done) {
            deviceConfig.setLoggingCallback(function(isLogging, isLocked) {
                if (!isLogging && isLocked) {
                    done();
                }
            });
            backend.onRead(new Uint8Array(cobs.encode(generateDataFor(2))));
            $rootScope.$digest();
        });

        it('properly decodes logging with lock', function(done) {
            deviceConfig.setLoggingCallback(function(isLogging, isLocked) {
                if (isLogging && isLocked) {
                    done();
                }
            });
            backend.onRead(new Uint8Array(cobs.encode(generateDataFor(3))));
            $rootScope.$digest();
        });

        it('properly decodes delay', function(done) {
            deviceConfig.setLoggingCallback(function(
                isLogging, isLocked, delay) {
                if (delay === 738) {
                    done();
                }
            });
            backend.onRead(
                new Uint8Array(cobs.encode(generateDataFor(0, 738))));
            $rootScope.$digest();
        });

        it('rejects truncated data', function(done) {
            commandLog.onMessage(function name(val) {
                if (val.indexOf('Bad data given for logging info') !== -1) {
                    done();
                }
            });
            var data = generateDataFor(0);
            data = data.slice(0, data.length - 1);
            backend.onRead(new Uint8Array(cobs.encode(data)));
            $rootScope.$digest();
        });
    });
});
