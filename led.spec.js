describe('LED service', function() {
    var led;
    var $rootScope;

    beforeEach(angular.mock.module('flybrixCommon'));

    beforeEach(inject(function(_led_, _$rootScope_) {
        led = _led_;
    }));

    it('exists', function() {
        expect(led).toBeDefined();
    });

});
