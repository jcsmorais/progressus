let istanbul = require('browserify-istanbul');

module.exports = function (config) {
    config.set({
        frameworks: [
            'browserify',
            'mocha',
            'source-map-support',
        ],
        files: [
            'src/**/*.js',
            'test/**/*.js',
        ],
        reporters: [
            'spec',
            'coverage',
        ],
        preprocessors: {
            'src/**/*.js': ['browserify'],
            'test/**/*.js': ['browserify'],
        },
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        browsers: ['ChromeHeadless'],
        autoWatch: false,
        singleRun: true,
        browserify: {
            debug: true,
            transform: [istanbul]
        },
        coverageReporter: {
            reporters: [
                { type: 'text-summary' },
                { type: 'lcov' },
            ],
        }
    })
}
