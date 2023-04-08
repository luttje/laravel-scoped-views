const mix = require('laravel-mix');
require('../../../src/js/index');

mix.disableNotifications();
mix.webpackConfig({
    stats: 'errors-only',
})

mix.scoped({
    paths: {
        base: __dirname,
    },
    includeSass: true,
});
