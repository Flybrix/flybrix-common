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
        var defaultDefaults = serializationHandler.getDefaults(desiredKey);
        var currentSerializationHandler = defaultSerializationHandler;
        var currentDefaults = defaultDefaults;

        return {
            set: function(value) {
                version = value;
                key = value.join('.');
                currentSerializationHandler = serializationHandler.getHandler(desiredKey) || defaultSerializationHandler;
                currentDefaults = serializationHandler.getDefaults(desiredKey) || defaultDefaults;
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
            defaults: function() {
                return currentDefaults;
            },
        };
    }

}());
