(function() {
    'use strict';

    angular.module('flybrixCommon').factory('firmwareVersion', firmwareVersion);

    firmwareVersion.$inject = ['configHandler', 'serializationHandler'];

    function firmwareVersion(configHandler, serializationHandler) {
        var version = [0, 0, 0];
        var key = '0.0.0';
        var supported = {
            '1.4.0': true,
            '1.5.0': true,
            '1.6.0': true,
        };

        var desired = [1, 6, 0];
        var desiredKey = '1.6.0';

        var defaultConfigHandler = configHandler[desiredKey];
        var currentConfigHandler = defaultConfigHandler;
        var defaultSerializationHandler = serializationHandler.getHandler(desiredKey);
        var currentSerializationHandler = defaultSerializationHandler;

        var fieldVersionMasks = {
            '1.4.0': 0x7FFFFFF,
            '1.5.0': 0x7FFFFFF,
            '1.6.0': 0x7FFFFFF,
        };
        var stateMask = 0xFFFFFFFF;

        return {
            set: function(value) {
                version = value;
                key = value.join('.');
                currentConfigHandler =
                    configHandler[key] || defaultConfigHandler;
                currentSerializationHandler =
                    serializationHandler.getHandler(desiredKey) || defaultSerializationHandler;
                stateMask = fieldVersionMasks[key] || 0xFFFFFFFF;
            },
            get: function() {
                return version;
            },
            key: function() {
                return key;
            },
            supported: function() {
                return supported[key] === true;
            },
            desired: function() {
                return desired;
            },
            desiredKey: function() {
                return desiredKey;
            },
            configHandler: function() {
                return currentConfigHandler;
            },
            serializationHandler: function() {
                return currentSerializationHandler;
            },
            stateMask: function() {
                return stateMask;
            }
        };
    }

}());
