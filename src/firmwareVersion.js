(function() {
    'use strict';

    angular.module('flybrixCommon').factory('firmwareVersion', firmwareVersion);

    firmwareVersion.$inject = ['serializationHandler'];

    function firmwareVersion(serializationHandler) {
        var version = [0, 0, 0];
        var key = '0.0.0';

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
                return !!serializationHandler.getHandler(desiredKey);
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
