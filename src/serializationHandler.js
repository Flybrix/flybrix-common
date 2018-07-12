(function () {
    'use strict';

    serializationHandler.$inject = ['descriptorsHandler'];

    angular.module('flybrixCommon').factory('serializationHandler', serializationHandler);

    function serializationHandler(descriptorsHandler) {
        var handlerCache = {};

        var newestVersion = { major: 0, minor: 0, patch: 0 };

        function isNewerVersion(version) {
            if (version.major !== newestVersion.major) {
                return version.major > newestVersion.major;
            }
            if (version.minor !== newestVersion.minor) {
                return version.minor > newestVersion.minor;
            }
            return version.patch > newestVersion.patch;
        }

        function versionToString(version) {
            return version.major.toString() + '.' + version.minor.toString() + '.' + version.patch.toString();
        }

        function stringToVersion(version) {
            var parts = version.split('.');
            return {
                major: parseInt(parts[0]),
                minor: parseInt(parts[1]),
                patch: parseInt(parts[2]),
            };
        }

        function addHandler(version, structure) {
            if (isNewerVersion(version)) {
                newestVersion = {
                    major: version.major,
                    minor: version.minor,
                    patch: version.patch,
                };
            }
            handlerCache[versionToString(version)] = FlybrixSerialization.parse(structure);
        }

        function copyHandler(version, srcVersion) {
            if (isNewerVersion(version)) {
                newestVersion = {
                    major: version.major,
                    minor: version.minor,
                    patch: version.patch,
                };
            }
            handlerCache[versionToString(version)] = handlerCache[versionToString(srcVersion)];
        }

        var descVersions = descriptorsHandler.versions;
        var descFiles = descriptorsHandler.files;
        var descReverseMap = {};
        Object.keys(descVersions).forEach(function(key) {
            var vers = stringToVersion(key);
            var filename = descVersions[key];
            if (filename in descReverseMap) {
                copyHandler(vers, descReverseMap[filename])
            } else {
                filename = descVersions[key];
                addHandler(vers, descFiles[filename]);
                descReverseMap[filename] = vers;
            }
        });

        function updateFields(target, source) {
            if (source instanceof Array) {
                return updateFieldsArray(target, source);
            } else if (source instanceof Object) {
                return updateFieldsObject(target, source);
            } else {
                return (source === null || source === undefined) ? target : source;
            }
        }

        function updateFieldsObject(target, source) {
            var result = {};
            Object.keys(target).forEach(function (key) {
                result[key] = updateFields(target[key], source[key]);
            });
            Object.keys(source).forEach(function (key) {
                if (key in result) {
                    return;
                }
                result[key] = updateFields(target[key], source[key]);
            });
            return result;
        }

        function updateFieldsArray(target, source) {
            var length = Math.max(target.length, source.length);
            var result = [];
            for (var idx = 0; idx < length; ++idx) {
                result.push(updateFields(target[idx], source[idx]));
            }
            return result;
        }

        return {
            Serializer: FlybrixSerialization.Serializer,
            getHandler: function (firmware) {
                return handlerCache[firmware];
            },
            getNewestVersion: function () {
                return newestVersion;
            },
            addHandler: addHandler,
            copyHandler: copyHandler,
            updateFields: updateFields,
        };
    }

}());
