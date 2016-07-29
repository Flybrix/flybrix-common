(function() {
    'use strict';

    angular.module('flybrixCommon').factory('serializer', serializer);

    function serializer() {
        return byteRef;
    }

    function byteRef() {
        this.index = 0;
    }

    byteRef.prototype.add = function(increment) {
        this.index += increment;
    };

    [['Float32', 4], ['Int16', 2], ['Int8', 1], ['Uint8', 1], ['Uint16', 2]]
        .forEach(function(v) {
            byteRef.prototype['parse' + v[0] + 'Array'] = function(
                view, destination) {
                parseWith(this, view, 'get' + v[0], v[1], destination);
            };

            byteRef.prototype['set' + v[0] + 'Array'] = function(view,
                                                                 destination) {
                setWith(this, view, 'set' + v[0], v[1], destination);
            };
        });

    function parseWith(parser, context, f, step, destination) {
        for (var i = 0; i < destination.length; i++) {
            destination[i] = context[f](parser.index, 1);
            parser.add(step);
        }
    }

    function setWith(setter, context, f, step, destination) {
        for (var i = 0; i < destination.length; i++) {
            context[f](setter.index, destination[i], 1);
            setter.add(step);
        }
    }
}());
