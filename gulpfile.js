var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');
var templateCache = require('gulp-angular-templatecache');
var packageInfo = require('./package.json');

var htmlFileList = ['src/**/*.html'];
var jsFileList = ['src/**/*.js'];
var libraryFiles = ['src/module.js', 'dist/templates.js'].concat(jsFileList);
var watchedFileList = htmlFileList.concat(jsFileList);

gulp.task('templates', function() {
    return gulp.src(htmlFileList)
        .pipe(plumber())
        .pipe(templateCache('templates.js', {
            module: packageInfo.angularModuleName,
        }))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('build-nomin', ['templates'], function() {
    return gulp.src(libraryFiles)
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(concat(packageInfo.name + '.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./dist/'));
});

gulp.task('build-min', ['templates'], function() {
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
