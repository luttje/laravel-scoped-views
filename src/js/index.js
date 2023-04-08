const mix = require('laravel-mix');
const path = require('node:path');

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
                base: null,
                compiledViews: 'storage/app/scoped-views',
                views: 'resources/views',
            },
            clearViewCache: true,
            includeSass: false,
            handlers: {
                js: {
                    match: /\.js$/,
                    func: require('./handlers/js')
                },
                css: {
                    match: /\.css$/,
                    class: require('./handlers/css')
                },
                sass: {
                    match: /\.s[ac]ss$/,
                    class: require('./handlers/sass')
                },
            },
        };

        const mergeConfig = require('./utils/merge-deep');
        this.config = mergeConfig(defaultConfig, config);

        // Sanitize the config by removing trailing slashes
        this.config.paths.compiledViews = this.config.paths.compiledViews.replace(/\/$/, '');
        this.config.paths.views = this.config.paths.views.replace(/\/$/, '');

        if(this.config.paths.base !== null)
            this.config.paths.base = this.config.paths.base.replace(/\/$/, '') + '/';

        if (this.config.clearViewCache === true) {
            const { exec } = require('child_process');

            mix.after(() => {
                exec('php artisan view:clear');
            });
        }

        const fs = require('node:fs');
        if (!fs.existsSync(this.basePath(this.config.paths.compiledViews))) {
            fs.mkdirSync(this.basePath(this.config.paths.compiledViews), { recursive: true });
        }

        const resultingFiles = this.includeViewsFolder(this.config.paths.views);

        // Write JSON manifest with all the files that were copied and their original view
        fs.writeFileSync(
            this.basePath(this.config.paths.compiledViews + '/scopedviews-manifest.json'),
            JSON.stringify(resultingFiles, null, 4)
        );
    }

    basePath(filePath) {
        return path.join(this.config.paths.base, filePath);
    }

    publicPath(filePath) {
        return path.join(this.basePath(this.config.paths.compiledViews), filePath);
    }

    includeFile(filePath) {
        let uniqueName = filePath.substring(0, filePath.lastIndexOf('.'));
        uniqueName = uniqueName.replace(/[\/\.]/g, '-');

        for (const handlerName in this.config.handlers) {
            const handler = this.config.handlers[handlerName];

            if (handler.match.test(filePath)) {
                const publicFilePath = this.publicPath(filePath.substring(this.config.paths.views.length));

                if (typeof handler.func === 'function') {
                    handler.func(
                        this.basePath(filePath),
                        publicFilePath,
                        uniqueName,
                        mix,
                        this);

                    return publicFilePath;
                } else {
                    const handlerInstance = new handler.class(
                        this.basePath(filePath),
                        publicFilePath,
                        uniqueName,
                        mix,
                        this);

                    return handlerInstance.getTransformedName(publicFilePath);
                }
            }
        }
    }

    // Recursively iterate the views directory and copy all css and js files to the public directory
    includeViewsFolder(directory) {
        const fs = require('fs');
        const fileOrFolders = fs.readdirSync(this.basePath(directory));
        let resultingFiles = {};

        for (const fileOrFolder of fileOrFolders) {
            const filePath = `${directory}/${fileOrFolder}`;

            // If it's a file, copy it to the public directory
            if (fs.lstatSync(this.basePath(filePath)).isFile()) {
                const file = this.includeFile(filePath);

                if (file !== undefined)
                    resultingFiles[filePath] = file;
            } else {
                const files = this.includeViewsFolder(filePath);

                resultingFiles = {
                    ...resultingFiles,
                    ...files,
                };
            }
        }

        return resultingFiles;
    }
}

mix.extend('scoped', new ScopedViewsPlugin());
