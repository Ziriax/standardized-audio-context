const { env } = require('process');

module.exports = (config) => {
    config.set({
        basePath: '../../',

        browserNoActivityTimeout: 240000,

        browsers:
            env.TARGET === 'chrome'
                ? ['ChromeBrowserStack']
                : env.TARGET === 'edge'
                ? ['EdgeBrowserStack']
                : env.TARGET === 'firefox'
                ? ['FirefoxBrowserStack']
                : env.TARGET === 'opera'
                ? ['OperaBrowserStack']
                : env.TARGET === 'safari'
                ? ['SafariBrowserStack']
                : ['ChromeBrowserStack', 'EdgeBrowserStack', 'FirefoxBrowserStack', 'OperaBrowserStack', 'SafariBrowserStack'],

        concurrency: 2,

        customLaunchers: {
            ChromeBrowserStack: {
                base: 'BrowserStack',
                browser: 'chrome',
                browser_version: '80', // eslint-disable-line camelcase
                os: 'OS X',
                os_version: 'High Sierra' // eslint-disable-line camelcase
            },
            EdgeBrowserStack: {
                base: 'BrowserStack',
                browser: 'edge',
                browser_version: '80', // eslint-disable-line camelcase
                os: 'Windows',
                os_version: '10' // eslint-disable-line camelcase
            },
            FirefoxBrowserStack: {
                base: 'BrowserStack',
                browser: 'firefox',
                browser_version: '69', // eslint-disable-line camelcase
                os: 'Windows',
                os_version: '10' // eslint-disable-line camelcase
            },
            OperaBrowserStack: {
                base: 'BrowserStack',
                browser: 'opera',
                browser_version: '67', // eslint-disable-line camelcase
                os: 'OS X',
                os_version: 'Mojave' // eslint-disable-line camelcase
            },
            SafariBrowserStack: {
                base: 'BrowserStack',
                browser: 'safari',
                browser_version: '11.1', // eslint-disable-line camelcase
                os: 'OS X',
                os_version: 'High Sierra' // eslint-disable-line camelcase
            }
        },

        files: [
            {
                included: false,
                pattern: 'src/**',
                served: false
            },
            'test/integration/**/*.js'
        ],

        frameworks: ['mocha', 'sinon-chai'],

        preprocessors: {
            'test/integration/**/*.js': 'webpack'
        },

        webpack: {
            mode: 'development',
            module: {
                rules: [
                    {
                        test: /\.ts?$/,
                        use: {
                            loader: 'ts-loader',
                            options: {
                                compilerOptions: {
                                    // @todo This is necessary to run the tests in Edge v18.
                                    target: 'es2017'
                                }
                            }
                        }
                    }
                ]
            },
            resolve: {
                extensions: ['.js', '.ts']
            }
        },

        webpackMiddleware: {
            noInfo: true
        }
    });

    if (env.TRAVIS) {
        config.set({
            browserStack: {
                accessKey: env.BROWSER_STACK_ACCESS_KEY,
                build: `${env.TRAVIS_REPO_SLUG}/${env.TRAVIS_JOB_NUMBER}/integration-${env.TARGET}`,
                username: env.BROWSER_STACK_USERNAME,
                video: false
            },

            captureTimeout: 120000
        });
    } else {
        const environment = require('../environment/local.json');

        config.set({
            browserStack: environment.browserStack
        });
    }
};
