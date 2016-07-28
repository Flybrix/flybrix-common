(function() {
    'use strict';

    angular.module('flybrixCommon').factory('rcData', rcData);

    rcData.$inject = ['serial', 'serializer'];

    function rcData(serial, serializer) {
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

            var b = new serializer();
            var dataBytes = new ArrayBuffer(10);
            var view = new DataView(dataBytes, 0);

            // Set RC to enabled
            view.setUint8(b.index, 1);
            b.add(1);

            // invert pitch and roll
            var throttle_threshold =
                -0.8;  // keep bottom 10% of throttle stick to mean 'off'
            var command_throttle =
                constrain((throttle - throttle_threshold) * 4095 /
                              (1 - throttle_threshold),
                          0, 4095);
            var command_pitch =
                constrain(-(applyDeadzone(pitch, 0.1)) * 4095 / 2, -2047, 2047);
            var command_roll =
                constrain(-(applyDeadzone(roll, 0.1)) * 4095 / 2, -2047, 2047);
            var command_yaw =
                constrain((applyDeadzone(yaw, 0.1)) * 4095 / 2, -2047, 2047);

            var command_vector =
                [command_throttle, command_pitch, command_roll, command_yaw];
            b.setInt16Array(view, command_vector);

            // aux format is
            // {AUX1_low, AUX1_mid, AUX1_high,
            //  AUX2_low, AUX2_mid, AUX2_high,
            //  x, x} (LSB-->MSB)
            var auxcode = (1 << aux1) + (1 << (aux2 + 3));
            view.setUint8(b.index, auxcode);
            serial.send(serial.field.COM_SET_SERIAL_RC,
                        new Uint8Array(dataBytes), false);
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
    };
}());
