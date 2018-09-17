(function () {
    'use strict';

    angular.module('flybrixCommon').factory('led', led);

    led.$inject = ['$q', 'serial'];

    function led($q, serial) {
        var LedPatterns = {
            NO_OVERRIDE: 0,
            FLASH: 1,
            BEACON: 2,
            BREATHE: 3,
            ALTERNATE: 4,
            SOLID: 5,
        };

        var urgent = false;
        var black = {red: 0, green: 0, blue: 0};

        function set(right_front, right_back, left_front, left_back, pattern, red, green) {
            if (!urgent && serial.busy()) {
                return $q.reject('Serial connection is too busy');
            }
            urgent = false;

            pattern = pattern || LedPatterns.NO_OVERRIDE;
            if (pattern < 0) {
                pattern = LedPatterns.NO_OVERRIDE;
            } else if (pattern > 5) {
                pattern = LedPatterns.SOLID;
            }

            var setter_command = {
                pattern: pattern,
                color_right: right_front || black,
                color_left: left_front || black,
                color_right_front: right_front || black,
                color_left_front: left_front || black,
                color_right_back: right_back || black,
                color_left_back: left_back || black,
                indicator_red: red,
                indicator_green: green,
            };

            return serial.sendStructure('Command', {
                request_response: true,
                set_led: setter_command,
            }, false);
        }

        function setSimple(red, green, blue) {
            var color = {red: red || 0, green: green || 0, blue: blue || 0};
            return set(color, color, color, color, LedPatterns.SOLID);
        }

        function clear() {
            return set();
        }

        function forceNextSend() {
            urgent = true;
        }

        return {
            set: set,
            setSimple: setSimple,
            clear: clear,
            patterns: LedPatterns,
            forceNextSend: forceNextSend,
        };
    }

}());
