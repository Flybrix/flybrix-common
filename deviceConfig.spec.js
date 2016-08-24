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

    beforeEach(
        inject(
            function(
                _deviceConfig_, _serial_, _parser_, _cobs_, _commandLog_,
                _$timeout_, _$rootScope_) {
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
            expect(deviceConfig.getDesiredVersion()).toEqual([1, 3, 0]);
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
            expect(config.pidBypass).toEqual(0);
            expect(config.stateEstimationParameters).toEqual([0.0, 0.0]);
            expect(config.enableParameters).toEqual([0.0, 0.0]);
            expect(config.ledStates)
                .toEqual(Array.apply(null, Array(272)).map(function() {
                    return 0;
                }));
        });
    });

    describe('.request()', function() {
        it('exists', function() {
            expect(deviceConfig.request).toBeDefined();
        });

        it('requests EEPROM data', function(done) {
            backend.send = function(val) {
                var decoder = new cobs.Reader();
                decoder.AppendToBuffer(val, function(command, mask, data) {
                    expect(command).toBe(parser.MessageType.Command);
                    expect(mask).toBe(
                        parser.CommandFields.COM_REQ_EEPROM_DATA |
                        parser.CommandFields.COM_REQ_RESPONSE);
                    expect(new Uint8Array(data)).toEqual(new Uint8Array([]));
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
                (parser.CommandFields.COM_REQ_EEPROM_DATA |
                 parser.CommandFields.COM_REQ_RESPONSE)
            ];
            var call_case = 0;

            backend.send = function(val) {
                var decoder = new cobs.Reader();
                decoder.AppendToBuffer(val, function(command, mask, data) {
                    expect(command).toBe(parser.MessageType.Command);
                    expect(mask).toBe(masks[call_case]);
                    expect(new Uint8Array(data)).toEqual(new Uint8Array([]));
                    ++call_case;
                    if (call_case === 1) {
                        backend.onRead(
                            new Uint8Array(
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
                    backend.onRead(
                        new Uint8Array(
                            [4, 255, 255, 5, 1, 1, 2, 5, 1, 1, 1, 0]));
                });
            };
            deviceConfig.reinit();
            $timeout.flush();
        });
    });

    describe('.send()', function() {
        it('exists', function() {
            expect(deviceConfig.send).toBeDefined();
        });

        it('sends the present config by default', function(done) {
            backend.send = function(val) {
                var decoder = new cobs.Reader();
                decoder.AppendToBuffer(val, function(command, mask, data) {
                    expect(command).toBe(parser.MessageType.Command);
                    expect(mask).toBe(
                        parser.CommandFields.COM_SET_EEPROM_DATA |
                        parser.CommandFields.COM_REQ_RESPONSE);
                    expect(new Uint8Array(data))
                        .toEqual(
                            new Uint8Array(
                                Array.apply(null, Array(627)).map(function() {
                                    return 0;
                                })));
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
                        parser.CommandFields.COM_SET_EEPROM_DATA |
                        parser.CommandFields.COM_REQ_RESPONSE);
                    var expected_data = new Uint8Array(
                        Array.apply(null, Array(627)).map(function() {
                            return 0;
                        }));
                    expected_data[0] = 1;
                    expected_data[1] = 3;
                    expect(new Uint8Array(data)).toEqual(expected_data);
                    done();
                });
            };
            var config_copy =
                JSON.parse(JSON.stringify(deviceConfig.getConfig()));
            config_copy.version = [1, 3, 0];
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
                            parser.CommandFields.COM_SET_EEPROM_DATA |
                            parser.CommandFields.COM_REQ_RESPONSE);
                        expect(new Uint8Array(data))
                            .toEqual(
                                new Uint8Array(
                                    Array.apply(null, Array(627))
                                        .map(function() {
                                            return 0;
                                        })));
                        backend.onRead(
                            new Uint8Array(
                                [4, 254, 255, 3, 1, 1, 2, 2, 1, 1, 1, 0]));
                    } else if (counter === 1) {
                        expect(command).toBe(parser.MessageType.Command);
                        expect(mask).toBe(
                            parser.CommandFields.COM_REQ_EEPROM_DATA |
                            parser.CommandFields.COM_REQ_RESPONSE);
                        expect(new Uint8Array(data)).toEqual(new Uint8Array([
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
                new Uint8Array(Array.apply(null, Array(629)).map(function() {
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
                            'Configuration MAJOR or MINOR version mismatch!') !==
                        -1) {
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
                // We need the versions to match so we can send data without a
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
                    expect(config.pidBypass).toEqual(0);
                    expect(config.stateEstimationParameters).toEqual([
                        0.0, 0.0
                    ]);
                    expect(config.enableParameters).toEqual([0.0, 0.0]);
                    expect(config.ledStates)
                        .toEqual(Array.apply(null, Array(272)).map(function() {
                            return 0;
                        }));
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
                    expect(config.pidBypass).toEqual(0);
                    expect(config.stateEstimationParameters).toEqual([
                        0.0, 0.0
                    ]);
                    expect(config.enableParameters).toEqual([0.0, 0.0]);
                    expect(config.ledStates)
                        .toEqual(Array.apply(null, Array(272)).map(function() {
                            return 0;
                        }));
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
                    expect(config.pidBypass).toEqual(0);
                    expect(config.stateEstimationParameters).toEqual([
                        0.0, 0.0
                    ]);
                    expect(config.enableParameters).toEqual([0.0, 0.0]);
                    expect(config.ledStates)
                        .toEqual(Array.apply(null, Array(272)).map(function() {
                            return 0;
                        }));
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
                    expect(config.pidBypass).toEqual(0);
                    expect(config.stateEstimationParameters).toEqual([
                        0.0, 0.0
                    ]);
                    expect(config.enableParameters).toEqual([0.0, 0.0]);
                    expect(config.ledStates)
                        .toEqual(Array.apply(null, Array(272)).map(function() {
                            return 0;
                        }));
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
                    expect(config.pidBypass).toEqual(0);
                    expect(config.stateEstimationParameters).toEqual([
                        0.0, 0.0
                    ]);
                    expect(config.enableParameters).toEqual([0.0, 0.0]);
                    expect(config.ledStates)
                        .toEqual(Array.apply(null, Array(272)).map(function() {
                            return 0;
                        }));
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
                    expect(config.pidBypass).toEqual(4);
                    expect(config.stateEstimationParameters).toEqual([
                        0.0, 0.0
                    ]);
                    expect(config.enableParameters).toEqual([0.0, 0.0]);
                    expect(config.ledStates)
                        .toEqual(Array.apply(null, Array(272)).map(function() {
                            return 0;
                        }));
                    done();
                });
                var mask = deviceConfig.field.PID_PARAMETERS;
                full_config_data[6] = (mask & 0xFF);
                full_config_data[7] = ((mask >> 8) & 0xFF);
                Array.apply(null, Array(8 * 7 * 4 + 1))
                    .map(function(val, idx) {
                        if (idx === 8 * 7 * 4) {
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
                    full_config_data.slice(0, 8 + 8 * 7 * 4 + 1 + 1);
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
                    expect(config.pidBypass).toEqual(0);
                    expect(config.stateEstimationParameters).toEqual([
                        3.25, 1232.75
                    ]);
                    expect(config.enableParameters).toEqual([7.125, 323232.5]);
                    expect(config.ledStates)
                        .toEqual(Array.apply(null, Array(272)).map(function() {
                            return 0;
                        }));
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
                    expect(config.pidBypass).toEqual(0);
                    expect(config.stateEstimationParameters).toEqual([
                        0.0, 0.0
                    ]);
                    expect(config.enableParameters).toEqual([0.0, 0.0]);
                    expect(config.ledStates)
                        .toEqual(
                            Array.apply(null, Array(272))
                                .map(function(val, idx) {
                                    return (idx % 200);
                                }));
                    done();
                });
                var mask = deviceConfig.field.LED_STATES;
                full_config_data[6] = (mask & 0xFF);
                full_config_data[7] = ((mask >> 8) & 0xFF);
                full_config_data[8] = 0xFF;
                full_config_data[9] = 0xFF;
                Array.apply(null, Array(272))
                    .map(function(val, idx) {
                        return (idx % 200);
                    })
                    .forEach(function(val, idx) {
                        full_config_data[10 + idx] = val;
                    });
                full_config_data = full_config_data.slice(0, 283);
                recalcChecksum(full_config_data);
                backend.onRead(new Uint8Array(cobs.encode(full_config_data)));
            });

            describe('parsing partial LED states data', function() {


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
                        expect(config.pidBypass).toEqual(0);
                        expect(config.stateEstimationParameters).toEqual([
                            0.0, 0.0
                        ]);
                        expect(config.enableParameters).toEqual([0.0, 0.0]);
                        expect(config.ledStates)
                            .toEqual(
                                Array.apply(null, Array(272))
                                    .map(function(val, idx) {
                                        if (idx < 136) {
                                            return 0;
                                        }
                                        idx -= 136;
                                        return (idx % 200);
                                    }));
                        done();
                    });
                    var mask = deviceConfig.field.LED_STATES;
                    full_config_data[6] = (mask & 0xFF);
                    full_config_data[7] = ((mask >> 8) & 0xFF);
                    full_config_data[8] = 0x00;
                    full_config_data[9] = 0xFF;
                    Array.apply(null, Array(136))
                        .map(function(val, idx) {
                            return (idx % 200);
                        })
                        .forEach(function(val, idx) {
                            full_config_data[10 + idx] = val;
                        });
                    full_config_data = full_config_data.slice(0, 147);
                    recalcChecksum(full_config_data);
                    backend.onRead(
                        new Uint8Array(cobs.encode(full_config_data)));
                });

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
                        expect(config.pidBypass).toEqual(0);
                        expect(config.stateEstimationParameters).toEqual([
                            0.0, 0.0
                        ]);
                        expect(config.enableParameters).toEqual([0.0, 0.0]);
                        expect(config.ledStates)
                            .toEqual(
                                Array.apply(null, Array(272))
                                    .map(function(val, idx) {
                                        if (idx >= 136) {
                                            return 0;
                                        }
                                        return (idx % 200);
                                    }));
                        done();
                    });
                    var mask = deviceConfig.field.LED_STATES;
                    full_config_data[6] = (mask & 0xFF);
                    full_config_data[7] = ((mask >> 8) & 0xFF);
                    full_config_data[8] = 0xFF;
                    full_config_data[9] = 0x00;
                    Array.apply(null, Array(136))
                        .map(function(val, idx) {
                            return (idx % 200);
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
                        expect(config.pidBypass).toEqual(0);
                        expect(config.stateEstimationParameters).toEqual([
                            0.0, 0.0
                        ]);
                        expect(config.enableParameters).toEqual([0.0, 0.0]);
                        expect(config.ledStates)
                            .toEqual(
                                Array.apply(null, Array(272))
                                    .map(function(val, idx) {
                                        if (idx >= 68 && idx < 204) {
                                            return 0;
                                        }
                                        if (idx >= 204) {
                                            idx -= 136;
                                        }
                                        return (idx % 200);
                                    }));
                        done();
                    });
                    var mask = deviceConfig.field.LED_STATES;
                    full_config_data[6] = (mask & 0xFF);
                    full_config_data[7] = ((mask >> 8) & 0xFF);
                    full_config_data[8] = 0x0F;
                    full_config_data[9] = 0xF0;
                    Array.apply(null, Array(136))
                        .map(function(val, idx) {
                            return (idx % 200);
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
});
