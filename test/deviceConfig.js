describe('Device configuration service', function() {
    var deviceConfig;
    var serial;
    var cobs;
    var commandLog;
    var firmwareVersion;
    var $timeout;
    var $rootScope;
    var backend;

    beforeEach(angular.mock.module('flybrixCommon'));

    beforeEach(inject(function(_deviceConfig_, _serial_, _cobs_, _commandLog_, _firmwareVersion_, _$timeout_, _$rootScope_) {
        firmwareVersion = _firmwareVersion_;
        deviceConfig = _deviceConfig_;
        serial = _serial_;
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
            expect(deviceConfig.getConfig()).toEqual(firmwareVersion.serializationHandler().Configuration.empty());
        });
    });

    describe('.request()', function() {
        it('exists', function() {
            expect(deviceConfig.request).toBeDefined();
        });

        it('requests all fields EEPROM data', function(done) {
            backend.send = function(val) {
                var decoder = new cobs.Reader();
                decoder.readBytes(val, function(data) {
                    expect(data).toEqual(new Uint8Array([1, 1, 0, 64, 0, 255, 15, 255, 255]));
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
                decoder.readBytes(val, function(data) {
                    expect(data).toEqual(new Uint8Array([1, 5, 0, 0, 0]));
                    done();
                });
            };
            deviceConfig.reinit();
            $timeout.flush();
        });

        it('requests new EEPROM data upon confirmation', function(done) {
            var datas = [
                [1, 5, 0, 0, 0],
                [1, 1, 0, 64, 0, 255, 15, 255, 255]
            ];
            var call_case = 0;

            backend.send = function(val) {
                var decoder = new cobs.Reader();
                decoder.readBytes(val, function(data) {
                    expect(data).toEqual(new Uint8Array(datas[call_case]));
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
                decoder.readBytes(val, function(data) {
                    expect(data).toEqual(new Uint8Array([1, 5, 0, 0, 0]));
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
        empty_config[0] = 255;
        empty_config[1] = 15;
        empty_config[365] = empty_config[366] = 255;
        for (var idx = 0; idx < 16; ++idx) {
            empty_config[367 + idx * 17] = empty_config[368 + idx * 17] = 255;
        }

        it('exists', function() {
            expect(deviceConfig.send).toBeDefined();
        });

        it('sends the present config by default', function(done) {
            backend.send = function(val) {
                var decoder = new cobs.Reader();
                decoder.readBytes(val, function(data) {
                    expect(data.subarray(0, 5)).toEqual(new Uint8Array([1, 1, 0, 16, 0]));
                    expect(data.subarray(5)).toEqual(new Uint8Array(empty_config));
                    done();
                });
            };
            deviceConfig.send();
            $timeout.flush();
        });

        it('sends a new config when defined', function(done) {
            backend.send = function(val) {
                var decoder = new cobs.Reader();
                decoder.readBytes(val, function(data) {
                    var expected_data = new Uint8Array(empty_config.slice());
                    expected_data[2] = 1;
                    expected_data[3] = 5;
                    expect(data.subarray(0, 5)).toEqual(new Uint8Array([1, 1, 0, 16, 0]));
                    expect(data.subarray(5)).toEqual(expected_data);
                    done();
                });
            };
            var config_copy =
                JSON.parse(JSON.stringify(deviceConfig.getConfig()));
            config_copy.version = {
                major: 1,
                minor: 5,
                patch: 0,
            };
            deviceConfig.send(config_copy);
            $timeout.flush();
        });


        it('requests new config upon response', function(done) {
            var counter = 0;
            backend.send = function(val) {
                var decoder = new cobs.Reader();
                decoder.readBytes(val, function(data) {
                    if (counter === 0) {
                        expect(data.subarray(0, 5)).toEqual(new Uint8Array([1, 1, 0, 16, 0]));
                        expect(data.subarray(5)).toEqual(new Uint8Array(empty_config));
                        backend.onRead(new Uint8Array(
                            [4, 254, 255, 1, 2, 16, 1, 1, 2, 16, 1, 0]));
                    } else if (counter === 1) {
                        expect(data).toEqual(new Uint8Array([
                            1, 1, 0, 64, 0, 255, 15, 255, 255
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
            full_message_data[1] = 1;
            var command = (1 << 19) | (1 << 16);
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
    });
});
