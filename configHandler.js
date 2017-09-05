(function() {
    'use strict';

    angular.module('flybrixCommon').factory('configHandler', configHandler);

    configHandler.$inject = ['encodable'];

    function configHandler(encodable) {
        var handlers = {};

        var e = encodable;
        var ledColor = e.map([
            {key: 'red', element: e.Uint8},
            {key: 'green', element: e.Uint8},
            {key: 'blue', element: e.Uint8},
        ]);

        var ledState = e.map([
            {key: 'status', element: e.Uint16},
            {key: 'pattern', element: e.Uint8},
            {
              key: 'colors',
              element: e.map([
                  {key: 'right_front', element: ledColor},
                  {key: 'right_back', element: ledColor},
                  {key: 'left_front', element: ledColor},
                  {key: 'left_back', element: ledColor},
              ])
            },
            {key: 'indicator_red', element: e.bool},
            {key: 'indicator_green', element: e.bool},
        ]);

        var coord3d = e.array(3, e.Float32);

        var version = e.array(3, e.Uint8);
        var channelMapping = e.array(6, e.Uint8);
        var channelMark = e.array(6, e.Uint16);
        var pid = e.array(7, e.Float32);
        var stParam = e.array(2, e.Float32);

        var ledStates = e.array(16, ledState, 16);

        var name = e.string(9);

        var handlerArray = [
            {part: 0, key: 'version', element: e.array(3, e.Uint8)},
            {part: 1, key: 'id', element: e.Uint32},
            {part: 2, key: 'pcbOrientation', element: coord3d},
            {part: 2, key: 'pcbTranslation', element: coord3d},
            {part: 3, key: 'mixTableFz', element: e.array(8, e.Int8)},
            {part: 3, key: 'mixTableTx', element: e.array(8, e.Int8)},
            {part: 3, key: 'mixTableTy', element: e.array(8, e.Int8)},
            {part: 3, key: 'mixTableTz', element: e.array(8, e.Int8)},
            {part: 4, key: 'magBias', element: coord3d},
            {part: 5, key: 'assignedChannel', element: channelMapping},
            {part: 5, key: 'commandInversion', element: e.Uint8},
            {part: 5, key: 'channelMidpoint', element: channelMark},
            {part: 5, key: 'channelDeadzone', element: channelMark},
            {part: 6, key: 'thrustMasterPIDParameters', element: pid},
            {part: 6, key: 'pitchMasterPIDParameters', element: pid},
            {part: 6, key: 'rollMasterPIDParameters', element: pid},
            {part: 6, key: 'yawMasterPIDParameters', element: pid},
            {part: 6, key: 'thrustSlavePIDParameters', element: pid},
            {part: 6, key: 'pitchSlavePIDParameters', element: pid},
            {part: 6, key: 'rollSlavePIDParameters', element: pid},
            {part: 6, key: 'yawSlavePIDParameters', element: pid},
            {part: 6, key: 'pidBypass', element: e.Uint8},
            {part: 7, key: 'stateEstimationParameters', element: stParam},
            {part: 7, key: 'enableParameters', element: stParam},
            {part: 8, key: 'ledStates', element: ledStates},
            {part: 9, key: 'name', element: e.string(9)},
        ];

        handlers['1.4.0'] = e.map(handlerArray.slice(), 16);

        var gainHandlers = [
            {part: 6, key: 'thrustGain', element: e.Float32},
            {part: 6, key: 'pitchGain', element: e.Float32},
            {part: 6, key: 'rollGain', element: e.Float32},
            {part: 6, key: 'yawGain', element: e.Float32},
        ];

        handlerArray = handlerArray.slice(0, 21).concat(
            gainHandlers, handlerArray.slice(21));

        handlers['1.5.0'] = e.map(handlerArray.slice(), 16);

        var velocityPidHandlers = [
            {part: 10, key: 'vxPIDParameters', element: pid},
            {part: 10, key: 'vyPIDParameters', element: pid},
            {part: 10, key: 'vzPIDParameters', element: pid},
            {part: 10, key: 'velocityPidBypass', element: e.bool},
        ];

        handlerArray = handlerArray.concat(velocityPidHandlers);

        handlers['1.6.0'] = e.map(handlerArray.slice(), 16);

        return handlers;
    }

}());
