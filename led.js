(function() {
    'use strict';

    angular.module('flybrixCommon').factory('led', led);

    led.$inject = ['deviceConfig'];

    function led(deviceConfig) {
        var LedPatterns = {
            NO_OVERRIDE: 0,
            FLASH: 1,
            BEACON: 2,
            BREATHE: 3,
            ALTERNATE: 4,
            SOLID: 5,
        };

        var colors = [0, 0, 0, 0].map(function() {
            return {
                red: 0,
                green: 0,
                blue: 0,
            };
        });

        var ledState = {
            status: 65535,
            pattern: LedPatterns.SOLID,
            colors: colors,
            indicator_red: false,
            indicator_green: false,
        }

        var configPart = {ledStates: [ledState]};

        function set(red, green, blue) {
            colors.forEach(function(v) {
                v.red = red;
                v.green = green;
                v.blue = blue;
            });

            apply();
        }

        function apply(arg) {
            deviceConfig.sendPartial(
                deviceConfig.field.LED_STATES,  // Set LED state part
                1,           // more specifically, the first state 2^0 = 1
                configPart,  // to our partial configuration
                true  // and set the "temporary" flag, not changing EEPROM
                );
        }

        return {
            set: set,
            patterns: LedPatterns,
        };
    }

}());
