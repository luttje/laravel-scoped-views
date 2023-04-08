const mix = require('laravel-mix');
const path = require('node:path');
require('../../src/js/index');

mix.disableNotifications();
mix.webpackConfig({
    stats: 'errors-only',
})

mix.scoped({
    paths: {
        base: path.join(__dirname, 'mock'),
    },
    includeSass: true,
});
