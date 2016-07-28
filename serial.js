(function() {
    'use strict';

    angular.module('flybrixCommon').factory('serial', serial);

    serial.$inject = ['$q', 'parser'];

    function serial($q, parser) {
        var commandCallback = undefined;

        return {
            busy: busy,
            field: parser.CommandFields,
            send: send,
            setCommandCallback: setCommandCallback,
        };

        function send(command, data, log) {
            console.log(command, data, log);
            return $q.resolve();
        }

        function busy() {
            return false;
        }

        function setCommandCallback(callback) {
            commandCallback = callback;
        }
    }
}());
