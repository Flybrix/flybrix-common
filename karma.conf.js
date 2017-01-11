// Karma configuration

module.exports = function(config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files,
        // exclude)
        basePath: '',


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine'],


        // list of files / patterns to load in the browser
        files: [
            './bower_components/angular/angular.js',
            './node_modules/angular-mocks/angular-mocks.js',
            './module.js',
            './cobs.js',
            './cobs.spec.js',
            './commandLog.js',
            './commandLog.spec.js',
            './configHandler.js',
            './configHandler.spec.js',
            './firmwareVersion.js',
            './deviceConfig.js',
            './deviceConfig.spec.js',
            './encodable.js',
            './encodable.spec.js',
            './led.js',
            './led.spec.js',
            './parser.js',
            './parser.spec.js',
            './presets.js',
            './presets.spec.js',
            './serial.js',
            './serial.spec.js',
            './rcData.js',
            './rcData.spec.js',
        ],


        // list of files to exclude
        exclude: [],


        // preprocess matching files before serving them to the browser
        // available preprocessors:
        // https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            './cobs.js': ['coverage'],
            './commandLog.js': ['coverage'],
            './configHandler.js': ['coverage'],
            './firmwareVersion.js': ['coverage'],
            './deviceConfig.js': ['coverage'],
            './encodable.js': ['coverage'],
            './led.js': ['coverage'],
            './parser.js': ['coverage'],
            './presets.js': ['coverage'],
            './serial.js': ['coverage'],
            './rcData.js': ['coverage'],
        },


        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['spec', 'coverage'],


        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR ||
        // config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file
        // changes
        autoWatch: true,


        // start these browsers
        // available browser launchers:
        // https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['Chrome'],


        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity
    })
}
