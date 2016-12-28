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

        var keys = ['right_front', 'right_back', 'left_front', 'left_back'];
        var colors = {};

        keys.forEach(function(key) {
            colors[key] = {
                red: 0,
                green: 0,
                blue: 0,
            }
        });

        var ledState = {
            status: 65535,
            pattern: LedPatterns.SOLID,
            colors: colors,
            indicator_red: false,
            indicator_green: false,
        }

        var configPart = {ledStates: [ledState]};

        function set(
            color_rf, color_rb, color_lf, color_lb, pattern, red, green) {
            if (!(pattern > 0 && pattern < 6)) {
                pattern = LedPatterns.SOLID;
            }
            ledState.pattern = pattern;
            [color_rf, color_rb, color_lf, color_lb].forEach(function(
                color, idx) {
                if (!color) {
                    return;
                }
                var v = colors[keys[idx]];
                v.red = color.red;
                v.green = color.green;
                v.blue = color.blue;
            });
            if (red !== undefined) {
                ledState.indicator_red = red;
            }
            if (green !== undefined) {
                ledState.indicator_green = green;
            }

            apply();
        }

        function setSimple(red, green, blue) {
            var color = {red: red || 0, green: green || 0, blue: blue || 0};
            set(color, color, color, color, LedPatterns.SOLID);

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
            setSimple: setSimple,
            patterns: LedPatterns,
        };
    }

}());
