var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');
var templateCache = require('gulp-angular-templatecache');
var fs = require('fs');
var packageInfo = require('./package.json');
var descriptors = require('./descriptors/versions.json');

var htmlFileList = ['src/**/*.html'];
var jsFileList = ['src/**/*.js'];
var libraryFiles = ['src/module.js', 'dist/descriptors.js', 'dist/templates.js'].concat(jsFileList);
var watchedFileList = htmlFileList.concat(jsFileList);

gulp.task('templates', function() {
    return gulp.src(htmlFileList)
        .pipe(plumber())
        .pipe(templateCache('templates.js', {
            module: packageInfo.angularModuleName,
        }))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('descriptors', function() {
    var files = {};
    Object.keys(descriptors).forEach(function(key) {
        var file = descriptors[key];
        if (file in files) {
            return;
        }
        files[file] = fs.readFileSync('./descriptors/' + file, 'utf8').replace(/\s/g,'');
        var defaults = file + '.json';
        files[defaults] = fs.readFileSync('./descriptors/' + defaults, 'utf8').replace(/\s/g,'');
    });
    var fileContents = "(function () {\n" +
        "    'use strict';\n" +
        "    descriptorsHandler.$inject = [];\n" +
        "    angular.module('flybrixCommon').factory('descriptorsHandler', descriptorsHandler);\n" +
        "    function descriptorsHandler() {\n" +
        "        var versions = " + JSON.stringify(descriptors) + ";\n" +
        "        var files = " + JSON.stringify(files) + ";\n" +
        "        return { versions: versions, files: files };\n" +
        "    }\n" +
        "}());";
    fs.writeFileSync('dist/descriptors.js', fileContents);
});

gulp.task('build-nomin', ['descriptors', 'templates'], function() {
    return gulp.src(libraryFiles)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(concat(packageInfo.name + '.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./dist/'));
});

gulp.task('build-min', ['descriptors', 'templates'], function() {
    return gulp.src(libraryFiles)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(concat(packageInfo.name + '.min.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./dist/'));
});

gulp.task('build', ['build-nomin', 'build-min']);

gulp.task('watch', ['build'], function() {
    return gulp.watch(watchedFileList, ['build']);
});

gulp.task('default', ['watch']);
