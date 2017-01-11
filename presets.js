(function() {
    'use strict';

    angular.module('flybrixCommon').factory('presets', presets);

    presets.$inject = ['firmwareVersion', 'parser'];

    function presets(firmwareVersion, parser) {
        var LedPatterns = {
            NO_OVERRIDE: 0,
            FLASH: 1,
            BEACON: 2,
            BREATHE: 3,
            ALTERNATE: 4,
            SOLID: 5,
        };

        var Color = {
            Black: 0x000000,
            Red: 0xff0000,
            Green: 0x008000,
            Orange: 0xffa500,
            Blue: 0x0000ff,
        };

        function makeLedCase(mask, pattern, color1, color2, red, green) {
            if (color2 === undefined) {
                color2 = color1;
            }
            red = red || false;
            green = green || false;
            return {
                status: mask,
                pattern: pattern,
                colors: {
                    right_front: color1,
                    right_back: color1,
                    left_front: color2,
                    left_back: color2,
                },
                indicator_red: red,
                indicator_green: green,
            };
        }

        function fade(color) {
            var r = (color >> 16) & 0xff;
            var g = (color >> 8) & 0xff;
            var b = color & 0xff;
            r *= 0.9;
            g *= 0.9;
            b *= 0.9;
            return (Math.floor(r) << 16) | (Math.floor(g) << 8) | Math.floor(b);
        }

        var ledStates = [
            makeLedCase(
                parser.StatusCodes.STATUS_MPU_FAIL, LedPatterns.SOLID,
                fade(Color.Black), fade(Color.Red), true),
            makeLedCase(
                parser.StatusCodes.STATUS_BMP_FAIL, LedPatterns.SOLID,
                fade(Color.Red), fade(Color.Black), true),
            makeLedCase(
                parser.StatusCodes.STATUS_BOOT, LedPatterns.SOLID,
                fade(Color.Green)),
            makeLedCase(
                parser.StatusCodes.STATUS_RX_FAIL, LedPatterns.FLASH,
                fade(Color.Orange)),
            makeLedCase(
                parser.StatusCodes.STATUS_FAIL_OTHER, LedPatterns.ALTERNATE,
                fade(Color.Blue)),
            makeLedCase(
                parser.StatusCodes.STATUS_FAIL_STABILITY, LedPatterns.FLASH,
                fade(Color.Black), fade(Color.Blue)),
            makeLedCase(
                parser.StatusCodes.STATUS_FAIL_ANGLE, LedPatterns.FLASH,
                fade(Color.Blue), fade(Color.Black)),
            makeLedCase(
                parser.StatusCodes.STATUS_OVERRIDE, LedPatterns.BEACON,
                fade(Color.Red)),
            makeLedCase(
                parser.StatusCodes.STATUS_TEMP_WARNING, LedPatterns.FLASH,
                fade(Color.Red)),
            makeLedCase(
                parser.StatusCodes.STATUS_BATTERY_LOW, LedPatterns.BEACON,
                fade(Color.Orange)),
            makeLedCase(
                parser.StatusCodes.STATUS_ENABLING, LedPatterns.FLASH,
                fade(Color.Blue)),
            makeLedCase(
                parser.StatusCodes.STATUS_ENABLED, LedPatterns.BEACON,
                fade(Color.Blue)),
            makeLedCase(
                parser.StatusCodes.STATUS_IDLE, LedPatterns.BEACON,
                fade(Color.Green)),
            makeLedCase(0, 0, 0),
            makeLedCase(0, 0, 0),
            makeLedCase(0, 0, 0),
        ];

        var template = {
            pcbOrientation: [0, 0, 0],
            pcbTranslation: [0, 0, 0],
            magBias: [0, 0, 0],
            assignedChannel: [2, 1, 0, 3, 4, 5],
            commandInversion: 6,
            channelMidpoint: [1515, 1515, 1500, 1520, 1500, 1500],
            channelDeadzone: [20, 20, 20, 40, 20, 20],
            thrustMasterPIDParameters: [1, 0, 0, 0, 0.005, 0.005, 1],
            pitchMasterPIDParameters: [10, 1, 0, 10, 0.005, 0.005, 10],
            rollMasterPIDParameters: [10, 1, 0, 10, 0.005, 0.005, 10],
            yawMasterPIDParameters: [5, 1, 0, 10, 0.005, 0.005, 180],
            thrustSlavePIDParameters: [1, 0, 0, 10, 0.001, 0.001, 0.3],
            pitchSlavePIDParameters: [10, 4, 0, 30, 0.001, 0.001, 30],
            rollSlavePIDParameters: [10, 4, 0, 30, 0.001, 0.001, 30],
            yawSlavePIDParameters: [30, 5, 0, 20, 0.001, 0.001, 240],
            pidBypass: 25,
            stateEstimationParameters: [1, 0.01],
            enableParameters: [0.001, 30],
            ledStates: ledStates,
            name: 'FLYBRIX',
        };

        return {
            get: get,
        }

        function get(id) {
            id = Math.floor(id);
            if (!(id >= 0 && id < 3)) {
                id = 0;
            }
            var handler = firmwareVersion.configHandler();
            var value = {};
            angular.copy(template);
            handler.children.forEach(function(child) {
                var key = child.key;
                value[key] = angular.copy(template[key]);
            });
            value.id = id;
            value.version = firmwareVersion.get().slice();
            switch (id) {
                case 0:
                    value.mixTableFz = [1, 1, 0, 0, 0, 0, 1, 1];
                    value.mixTableTx = [1, 1, 0, 0, 0, 0, -1, -1];
                    value.mixTableTy = [-1, 1, 0, 0, 0, 0, -1, 1];
                    value.mixTableTz = [1, -1, 0, 0, 0, 0, -1, 1];
                    break;
                case 1:
                    value.mixTableFz = [1, 1, 1, 1, 0, 0, 1, 1];
                    value.mixTableTx = [1, 1, 0, 0, 0, 0, -1, -1];
                    value.mixTableTy = [-1, 1, -1, 1, 0, 0, -1, 1];
                    value.mixTableTz = [1, -1, -1, 1, 0, 0, 1, -1];
                    break;
                case 2:
                    value.mixTableFz = [1, 1, 1, 1, 1, 1, 1, 1];
                    value.mixTableTx = [1, 1, 1, 1, -1, -1, -1, -1];
                    value.mixTableTy = [-1, 1, -1, 1, -1, 1, -1, 1];
                    value.mixTableTz = [1, -1, -1, 1, 1, -1, -1, 1];
                    break;
            }
            return value;
        }
    }

}());
