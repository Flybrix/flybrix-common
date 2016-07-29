describe('Command log service', function() {

    var commandLog;
    var $rootScope;

    beforeEach(angular.mock.module('flybrixCommon'));

    beforeEach(inject(function(_commandLog_, _$rootScope_) {
        commandLog = _commandLog_;
        $rootScope = _$rootScope_;
    }));

    it('exists', function() {
        expect(commandLog).toBeDefined();
    });

    describe('.read()', function() {
        it('exists', function() {
            expect(commandLog.read).toBeDefined();
        });

        it('returns list', function() {
            expect(commandLog.read()).toEqual([]);
        });
    });

    describe('.log()', function() {
        it('exists', function() {
            expect(commandLog.log).toBeDefined();
        });

        it('adds strings to list', function() {
            commandLog.log('Entry 1');
            expect(commandLog.read()).toEqual(['Entry 1']);
        });

        it('is equivalent to service root', function() {
            commandLog('Entry 1');
            expect(commandLog.read()).toEqual(['Entry 1']);
        });

        it('accummulates', function() {
            commandLog('Entry A');
            expect(commandLog.read()).toEqual(['Entry A']);
            commandLog('Entry B');
            expect(commandLog.read()).toEqual(['Entry A', 'Entry B']);
            commandLog('E. C');
            expect(commandLog.read()).toEqual(['Entry A', 'Entry B', 'E. C']);
        });

        it('ignores empty messages', function() {
            commandLog('Entry A');
            expect(commandLog.read()).toEqual(['Entry A']);
            commandLog();
            expect(commandLog.read()).toEqual(['Entry A']);
            commandLog('Entry B');
            expect(commandLog.read()).toEqual(['Entry A', 'Entry B']);
        });
    });

    describe('.onMessage()', function() {
        it('exists', function() {
            expect(commandLog.onMessage).toBeDefined();
        });

        it('responds to a log message', function(done) {
            commandLog.onMessage(function(v) {
                expect(v).toEqual(['Entry 1']);
                done();
            });
            $rootScope.$digest();

            commandLog('Entry 1');
            $rootScope.$digest();
        });

        it('does not respond to a log message retroactively', function(done) {
            commandLog('Entry 1');
            $rootScope.$digest();

            commandLog.onMessage(function(v) {
                expect(v).toEqual(['Entry 1', 'Entry 2']);
                done();
            });
            $rootScope.$digest();

            commandLog('Entry 2');
            $rootScope.$digest();
        });

        it('responds to multiple messages', function(done) {
            var call_id = 0;
            commandLog.onMessage(function(v) {
                switch (call_id++) {
                    case 0:
                        expect(v).toEqual(['Entry 1']);
                        break;
                    case 1:
                        expect(v).toEqual(['Entry 1', 'Entry 2']);
                        break;
                    case 2:
                        expect(v).toEqual(['Entry 1', 'Entry 2', 'Entry 3']);
                        done();
                        break;
                    default:
                        fail('Impossible path to take')
                }
            });
            $rootScope.$digest();

            commandLog('Entry 1');
            $rootScope.$digest();

            commandLog('Entry 2');
            $rootScope.$digest();

            commandLog('Entry 3');
            $rootScope.$digest();
        });

        it('allows multiple callback handlers', function(done) {
            var called_a = false;
            var called_b = false;
            function finalizer() {
                if (called_a && called_b) {
                    done();
                }
            }

            commandLog.onMessage(function(v) {
                expect(v).toEqual(['Entry 1']);
                if (called_a) {
                    fail('Multiple calls to the first callback');
                }
                called_a = true;
                finalizer();
            });
            $rootScope.$digest();

            commandLog.onMessage(function(v) {
                expect(v).toEqual(['Entry 1']);
                if (called_b) {
                    fail('Multiple calls to the second callback');
                }
                called_b = true;
                finalizer();
            });
            $rootScope.$digest();

            commandLog('Entry 1');
            $rootScope.$digest();
        });
    });

    describe('.clearSubscribers()', function() {
        it('exists', function() {
            expect(commandLog.clearSubscribers).toBeDefined();
        });

        it('clears subscribers', function(done) {
            var called_a = false;
            var called_b = false;

            commandLog.onMessage(function(v) {
                if (called_a) {
                    fail('Multiple calls to the first callback');
                }
                expect(v).toEqual(['Entry 1']);
                called_a = true;
            });
            $rootScope.$digest();

            commandLog.onMessage(function(v) {
                if (called_b) {
                    fail('Multiple calls to the second callback');
                }
                expect(v).toEqual(['Entry 1']);
                called_b = true;
            });
            $rootScope.$digest();

            commandLog('Entry 1');
            $rootScope.$digest();

            commandLog.clearSubscribers();
            $rootScope.$digest();

            commandLog.onMessage(function(v) {
                expect(v).toEqual(['Entry 1', 'Entry 2']);
                if (called_a && called_b) {
                    done();
                }
            });
            $rootScope.$digest();
            commandLog('Entry 2');

            $rootScope.$digest();
        });
    });

    it('gives the same results in queries and callbacks', function(done) {
        var countdown = 5;
        commandLog.onMessage(function(v) {
            expect(v).toEqual(commandLog.read());
            if (--countdown === 0) {
                done();
            }
        });
        $rootScope.$digest();

        commandLog('Entry 1');
        $rootScope.$digest();

        commandLog('Entry 2');
        $rootScope.$digest();

        commandLog('Entry 3');
        $rootScope.$digest();

        commandLog('Entry 4');
        $rootScope.$digest();

        commandLog('Entry 5');
        $rootScope.$digest();
    });

});
