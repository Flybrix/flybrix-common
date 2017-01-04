(function() {
    'use strict';

    angular.module('flybrixCommon').factory('rcData', rcData);

    rcData.$inject = ['serial', 'serializer', 'encodable'];

    function rcData(serial, serializer, encodable) {
        var AUX = {
            LOW: 0,
            MID: 1,
            HIGH: 2,
        };

        var throttle = -1;
        var pitch = 0;
        var roll = 0;
        var yaw = 0;
        // defaults to high -- low is enabling; high is disabling
        var aux1 = AUX.HIGH;
        // defaults to ?? -- need to check transmitter behavior
        var aux2 = AUX.HIGH;

        var urgent = true;

        var commandHandler = encodable.map([
            {key: 'throttle', element: encodable.Int16},
            {key: 'pitch', element: encodable.Int16},
            {key: 'roll', element: encodable.Int16},
            {key: 'yaw', element: encodable.Int16},
        ]);

        var rcHandler = encodable.map([
            {key: 'enabled', element: encodable.bool},
            {key: 'command', element: commandHandler},
            {key: 'auxcode', element: encodable.Uint8},
        ]);

        return {
            setThrottle: setThrottle,
            setPitch: setPitch,
            setRoll: setRoll,
            setYaw: setYaw,
            setAux1: setAux1,
            setAux2: setAux2,
            getThrottle: getThrottle,
            getPitch: getPitch,
            getRoll: getRoll,
            getYaw: getYaw,
            getAux1: getAux1,
            getAux2: getAux2,
            AUX: AUX,
            send: send,
            forceNextSend: forceNextSend,
        };

        function send() {
            if (!urgent && serial.busy()) {
                return;
            }
            urgent = false;

            // Set RC to enabled
            var response = {enabled: true};
            var command = {};

            // invert pitch and roll
            var throttle_threshold =
                -0.8;  // keep bottom 10% of throttle stick to mean 'off'
            command.throttle = constrain(
                (throttle - throttle_threshold) * 4095 /
                    (1 - throttle_threshold),
                0, 4095);
            command.pitch =
                constrain(-(applyDeadzone(pitch, 0.1)) * 4095 / 2, -2047, 2047);
            command.roll =
                constrain((applyDeadzone(roll, 0.1)) * 4095 / 2, -2047, 2047);
            command.yaw =
                constrain(-(applyDeadzone(yaw, 0.1)) * 4095 / 2, -2047, 2047);

            response.command = command;

            // aux format is
            // {AUX1_low, AUX1_mid, AUX1_high,
            //  AUX2_low, AUX2_mid, AUX2_high,
            //  x, x} (LSB-->MSB)
            response.auxcode = (1 << aux1) + (1 << (aux2 + 3));

            var data = new Uint8Array(10);
            rcHandler.encode(
                new DataView(data.buffer), new serializer(), response);
            return serial.send(serial.field.COM_SET_SERIAL_RC, data, false);
        }

        function setThrottle(v) {
            throttle = v;
        }

        function setPitch(v) {
            pitch = v;
        }

        function setRoll(v) {
            roll = v;
        }

        function setYaw(v) {
            yaw = v;
        }

        function setAux1(v) {
            aux1 = v;
        }

        function setAux2(v) {
            aux2 = v;
        }

        function getThrottle() {
            return throttle;
        }

        function getPitch() {
            return pitch;
        }

        function getRoll() {
            return roll;
        }

        function getYaw() {
            return yaw;
        }

        function getAux1() {
            return aux1;
        }

        function getAux2() {
            return aux2;
        }

        function forceNextSend() {
            urgent = true;
        }

        function constrain(x, xmin, xmax) {
            return Math.max(xmin, Math.min(x, xmax));
        }

        function applyDeadzone(value, deadzone) {
            if (value > deadzone) {
                return value - deadzone;
            }
            if (value < -deadzone) {
                return value + deadzone;
            }
            return 0;
        }
    }
}());
