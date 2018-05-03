describe('Serialization Handler', function() {
    var serializationHandler;
    var $rootScope;

    beforeEach(angular.mock.module('flybrixCommon'));

    beforeEach(inject(function(_serializationHandler_, _$rootScope_) {
        serializationHandler = _serializationHandler_;
        $rootScope = _$rootScope_;
    }));

    it('exists', function() {
        expect(serializationHandler).toBeDefined();
    });
});
