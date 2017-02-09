describe('Config presets service', function() {
    var presets;

    beforeEach(angular.mock.module('flybrixCommon'));

    beforeEach(inject(function(_presets_) {
        presets = _presets_;
    }));

    it('exists', function() {
        expect(presets).toBeDefined();
    });

    describe('.get()', function() {
        it('exists', function() {
            expect(presets.get).toBeDefined();
        });

        // TODO: add more tests here
    });
});
