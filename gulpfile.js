var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');

gulp.task('min', function() {
    var files = [
        'module.js',
        'encodable.js',
        'configHandler.js',
        'firmwareVersion.js',
        'calibration.js',
        'cobs.js',
        'commandLog.js',
        'parser.js',
        'presets.js',
        'serial.js',
        'deviceConfig.js',
        'led.js',
        'rcData.js',
    ];
    gulp.src(files)
        .pipe(concat('flybrix-common.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./dist/'));
});
