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

    byteRef.prototype.parseFloat32Array = function(view, destination) {
        for (var i = 0; i < destination.length; i++) {
            destination[i] = view.getFloat32(this.index, 1);
            this.add(4);
        }
    };

    byteRef.prototype.parseInt16Array = function(view, destination) {
        for (var i = 0; i < destination.length; i++) {
            destination[i] = view.getInt16(this.index, 1);
            this.add(2);
        }
    };

    byteRef.prototype.parseInt8Array = function(view, destination) {
        for (var i = 0; i < destination.length; i++) {
            destination[i] = view.getInt8(this.index, 1);
            this.add(1);
        }
    };

    byteRef.prototype.parseUint8Array = function(view, destination) {
        for (var i = 0; i < destination.length; i++) {
            destination[i] = view.getUint8(this.index, 1);
            this.add(1);
        }
    };

    byteRef.prototype.parseUint16Array = function(view, destination) {
        for (var i = 0; i < destination.length; i++) {
            destination[i] = view.getUint16(this.index, 1);
            this.add(2);
        }
    };

    byteRef.prototype.setFloat32Array = function(view, destination) {
        for (var i = 0; i < destination.length; i++) {
            view.setFloat32(this.index, destination[i], 1);
            this.add(4);
        }
    };

    byteRef.prototype.setInt8Array = function(view, destination) {
        for (var i = 0; i < destination.length; i++) {
            view.setInt8(this.index, destination[i], 1);
            this.add(1);
        }
    };

    byteRef.prototype.setUint8Array = function(view, destination) {
        for (var i = 0; i < destination.length; i++) {
            view.setUint8(this.index, destination[i], 1);
            this.add(1);
        }
    };

    byteRef.prototype.setUint16Array = function(view, destination) {
        for (var i = 0; i < destination.length; i++) {
            view.setUint16(this.index, destination[i], 1);
            this.add(2);
        }
    };

    byteRef.prototype.setInt16Array = function(view, destination) {
        for (var i = 0; i < destination.length; i++) {
            view.setInt16(this.index, destination[i], 1);
            this.add(2);
        }
    };
}());
