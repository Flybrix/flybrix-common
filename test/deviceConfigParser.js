describe('Device configuration parser service', function () {
    var deviceConfigParser;

    beforeEach(angular.mock.module('flybrixCommon'));

    beforeEach(inject(function (_deviceConfigParser_) {
        deviceConfigParser = _deviceConfigParser_;
    }));

    it('exists', function () {
        expect(deviceConfigParser).toBeDefined();
    });

    it('loads basic json', function () {
        expect(deviceConfigParser.parse('{"a":null,"b":3,"c":["foo",{"d":6}]}')).toEqual({
            a: null,
            b: 3,
            c: [
                'foo',
                {d: 6},
            ],
        });
    });

    it('handles existing constants', function () {
        expect(deviceConfigParser.parse('{"a":"${PATTERN_flash}"}')).toEqual({
            a: 1,
        });
    });

    it('throws exception of missing constants', function () {
        expect(function () {
            deviceConfigParser.parse('{"a":"${PATTERN_foo}"}');
        }).toThrowError();
    });
});
