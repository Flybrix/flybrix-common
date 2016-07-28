(function() {
    'use strict';

    angular.module('flybrixCommon').factory('serial', serial);

    serial.$inject = ['parser'];

    function serial(parser) {
        return {
            busy: busy,
            field: parser.CommandFields,
            send: send,
        };

        function send(command, data, log) {
            console.log(command, data, log);
        }

        function busy() {
            return false;
        }
    }
}());
