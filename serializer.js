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
            var key = v[0];
            var step = v[1];

            byteRef.prototype['parse' + v[0] + 'Array'] = function(
                view, destination) {
                for (var i = 0; i < destination.length; i++) {
                    destination[i] = view['get' + key](this.index, 1);
                    this.add(step);
                }
            };

            byteRef.prototype['set' + v[0] + 'Array'] = function(view,
                                                                 destination) {
                for (var i = 0; i < destination.length; i++) {
                    view['set' + key](this.index, destination[i], 1);
                    this.add(step);
                }
            };
        });
}());
