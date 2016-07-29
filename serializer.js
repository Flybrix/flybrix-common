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
            var getKey = 'get' + key;
            var setKey = 'set' + key;

            byteRef.prototype['parse' + key + 'Array'] = function(view,
                                                                  destination) {
                for (var i = 0; i < destination.length; i++) {
                    destination[i] = view[getKey](this.index, 1);
                    this.add(step);
                }
            };

            byteRef.prototype['set' + key + 'Array'] = function(view,
                                                                destination) {
                for (var i = 0; i < destination.length; i++) {
                    view[setKey](this.index, destination[i], 1);
                    this.add(step);
                }
            };
        });
}());
