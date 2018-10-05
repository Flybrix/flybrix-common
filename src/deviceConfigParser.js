(function () {
    'use strict';

    angular.module('flybrixCommon').factory('deviceConfigParser', deviceConfigParser);

    deviceConfigParser.$inject = [];

    function deviceConfigParser() {
        var constants = {};

        var patterns = {
            none: 0,
            solid: 5,
            flash: 1,
            breathe: 3,
            beacon: 2,
            alternate: 4,
        };

        Object.keys(patterns).forEach(function (key) {
            constants['PATTERN_' + key] = JSON.stringify(patterns[key]);
        });

        var color_palette = {
            Plaid: {red: 204, green: 85, blue: 51},
            DarkMagenta: {red: 139, green: 0, blue: 139},
            Red: {red: 255, green: 0, blue: 0},
            OrangeRed: {red: 255, green: 69, blue: 0},
            Orange: {red: 255, green: 165, blue: 0},
            Yellow: {red: 255, green: 255, blue: 0},
            White: {red: 255, green: 255, blue: 255},
            Black: {red: 0, green: 0, blue: 0},
            Blue: {red: 0, green: 0, blue: 255},
            LightSeaGreen: {red: 32, green: 178, blue: 170},
            Green: {red: 0, green: 128, blue: 0},
        };

        function uniformFadedColor(c) {
            var scale = (256.0 - 230.0) / 256.0; // matches fade function in firmware
            var r = Math.max(0, Math.min(255, Math.round(scale * c.red)));
            var g = Math.max(0, Math.min(255, Math.round(scale * c.green)));
            var b = Math.max(0, Math.min(255, Math.round(scale * c.blue)));
            return {
                right_front: {red: r, green: g, blue: b},
                right_back: {red: r, green: g, blue: b},
                left_front: {red: r, green: g, blue: b},
                left_back: {red: r, green: g, blue: b}
            };
        }

        Object.keys(color_palette).forEach(function (key) {
            constants['COLOR_' + key] = JSON.stringify(uniformFadedColor(color_palette[key]));
        });

        constants['LED_unused_mode'] = '{status:{},pattern:' + constants.PATTERN_none + ',colors:' + constants.COLOR_Black + 'indicator_red:false,indicator_green:false}';

        var regex = /"\${(\w+)}"/g;

        var const_filler = function (full_match, label) {
            if (label in constants) {
                return constants[label];
            }
            throw new Error('Constant "' + label + '" is not supported by this version of flybrix-common.');
        };

        var parse = function (data) {
            return JSON.parse(data.replace(regex, const_filler));
        };

        return {parse: parse};
    }
}());
