const mix = require('laravel-mix');

class ScopedViewsPlugin {
    dependencies() {
        const dependencies = ['postcss', 'postcss-prefix-selector'];

        if (this.config.includeSass) {
            dependencies.push('sass-loader');
            dependencies.push('node-sass');
            dependencies.push('@csstools/postcss-sass');
        }

        return dependencies;
    }

    register(config) {
        const defaultConfig = {
            paths: {
                resources: 'resources',
                public: 'public',
                views: 'views',
                tmp: '.mix-tmp',
            },
            clearViewCache: true,
            includeSass: false,
            handlers: [
                [
                    /\.css$/,
                    require('./handlers/css')
                ],
                [
                    /\.s[ac]ss$/,
                    require('./handlers/sass')
                ],
                [
                    /\.js$/,
                    require('./handlers/js')
                ],
            ],
        };

        const mergeConfig = require('./utils/merge-deep');
        this.config = mergeConfig(defaultConfig, config);

        // Sanitize the config
        this.config.paths.resources = this.config.paths.resources.replace(/\/$/, '');
        this.config.paths.public = this.config.paths.public.replace(/\/$/, '');
        this.config.paths.views = this.config.paths.views.replace(/\/$/, '');
        this.config.paths.tmp = this.config.paths.tmp.replace(/\/$/, '');

        if (this.config.clearViewCache === true) {
            const { exec } = require('child_process');

            mix.after(() => {
                exec('php artisan view:clear');
            });
        }

        this.includeResourcesFolder(this.config.paths.views);
    }

    resourcePath(path) {
        return `${this.config.paths.resources}/${path}`;
    }

    publicPath(path) {
        return `${this.config.paths.public}/${path}`;
    }

    includeFile(path) {
        let uniqueName = path.substring(0, path.lastIndexOf('.'));
        uniqueName = uniqueName.replace(/[\/\.]/g, '-');

        this.config.handlers.forEach(handler => {
            if (handler[0].test(path)) {
                handler[1](
                    this.resourcePath(path),
                    this.publicPath(path),
                    uniqueName,
                    mix,
                    this);
            }
        });
    }

    // Recursively iterate the views directory and copy all css and js files to the public directory
    includeResourcesFolder(directory) {
        const fs = require('fs');
        const fileOrFolders = fs.readdirSync(this.resourcePath(directory));

        fileOrFolders.forEach(fileOrFolder => {
            const path = `${directory}/${fileOrFolder}`;

            // If it's a file, copy it to the public directory
            if (fs.lstatSync(this.resourcePath(path)).isFile()) {
                this.includeFile(path);
            } else {
                this.includeResourcesFolder(path);
            }
        });
    }
}

mix.extend('scoped', new ScopedViewsPlugin());
