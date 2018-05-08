(function() {
    'use strict';

    angular.module('flybrixCommon').factory('cobs', cobs);

    function cobs() {
        return {
            Reader: Reader,
            encode: encode,
        };
    }


    function Reader(capacity) {
        if (capacity === undefined) {
            capacity = 2000;
        }
        this.N = capacity;
        this.buffer = new Uint8Array(capacity);
        this.ready_for_new_message = true;
        this.buffer_length = 0;
    }

    function cobsDecode(reader) {
        var src_ptr = 0;
        var dst_ptr = 0;
        var leftover_length = 0;
        var append_zero = false;
        while (reader.buffer[src_ptr]) {
            if (!leftover_length) {
                if (append_zero)
                    reader.buffer[dst_ptr++] = 0;
                leftover_length = reader.buffer[src_ptr++] - 1;
                append_zero = leftover_length < 0xFE;
            } else {
                --leftover_length;
                reader.buffer[dst_ptr++] = reader.buffer[src_ptr++];
            }
        }

        return leftover_length ? 0 : dst_ptr;
    }

    Reader.prototype.readBytes = function(data, onSuccess, onError) {
        for (var i = 0; i < data.length; i++) {
            var c = data[i];
            if (this.ready_for_new_message) {
                // first byte of a new message
                this.ready_for_new_message = false;
                this.buffer_length = 0;
            }

            this.buffer[this.buffer_length++] = c;

            if (c) {
                if (this.buffer_length === this.N) {
                    // buffer overflow, probably due to errors in data
                    onError('overflow', 'buffer overflow in COBS decoding');
                    this.ready_for_new_message = true;
                }
                continue;
            }

            this.buffer_length = cobsDecode(this);
            var failed_decode = (this.buffer_length === 0);
            if (failed_decode) {
                this.buffer[0] = 1;
            }
            var j;
            for (j = 1; j < this.buffer_length; ++j) {
                this.buffer[0] ^= this.buffer[j];
            }
            if (this.buffer[0] === 0) {  // check sum is correct
                this.ready_for_new_message = true;
                if (this.buffer_length > 0) {
                    onSuccess(this.buffer.slice(1, this.buffer_length));
                } else {
                    onError('short', 'Too short packet');
                }
            } else {  // bad checksum
                this.ready_for_new_message = true;
                var bytes = "";
                var message = "";
                for (j = 0; j < this.buffer_length; j++) {
                    bytes += this.buffer[j] + ",";
                    message += String.fromCharCode(this.buffer[j]);
                }
                if (failed_decode) {
                    onError('frame', 'Unexpected ending of packet');
                } else {
                    var msg = 'BAD CHECKSUM (' + this.buffer_length +
                        ' bytes)' + bytes + message;
                    onError('checksum', msg);
                }
            }
        }
    };

    Reader.prototype.AppendToBuffer = function(data, callback, onError) {
        console.warn('Depricated AppendToBuffer, please use readBytes');
        this.readBytes(data, function(buffer) {
            if (buffer.length < 5) {
                onError('short', 'Too short packet');
                return;
            }
            var command = buffer[0];
            var mask = 0;
            for (var k = 0; k < 4; ++k) {
                mask |= buffer[k + 1] << (k * 8);
            }
            callback(command, mask, buffer.slice(5).buffer);
        }, onError);
    };

    function encode(buf) {
        var retval =
            new Uint8Array(Math.floor((buf.byteLength * 255 + 761) / 254));
        var len = 1;
        var pos_ctr = 0;
        for (var i = 0; i < buf.length; ++i) {
            if (retval[pos_ctr] == 0xFE) {
                retval[pos_ctr] = 0xFF;
                pos_ctr = len++;
                retval[pos_ctr] = 0;
            }
            var val = buf[i];
            ++retval[pos_ctr];
            if (val) {
                retval[len++] = val;
            } else {
                pos_ctr = len++;
                retval[pos_ctr] = 0;
            }
        }
        return retval.subarray(0, len).slice().buffer;
    };
}());
