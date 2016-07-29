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
        parseWith(this, view, 'getFloat32', 4, destination);
    };

    byteRef.prototype.parseInt16Array = function(view, destination) {
        parseWith(this, view, 'getInt16', 2, destination);
    };

    byteRef.prototype.parseInt8Array = function(view, destination) {
        parseWith(this, view, 'getInt8', 1, destination);
    };

    byteRef.prototype.parseUint8Array = function(view, destination) {
        parseWith(this, view, 'getUint8', 1, destination);
    };

    byteRef.prototype.parseUint16Array = function(view, destination) {
        parseWith(this, view, 'getUint16', 2, destination);
    };

    byteRef.prototype.setFloat32Array = function(view, destination) {
        setWith(this, view, 'setFloat32', 4, destination);
    };

    byteRef.prototype.setInt8Array = function(view, destination) {
        setWith(this, view, 'setInt8', 1, destination);
    };

    byteRef.prototype.setUint8Array = function(view, destination) {
        setWith(this, view, 'setUint8', 1, destination);
    };

    byteRef.prototype.setUint16Array = function(view, destination) {
        setWith(this, view, 'setUint16', 2, destination);
    };

    byteRef.prototype.setInt16Array = function(view, destination) {
        setWith(this, view, 'setInt16', 2, destination);
    };

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
