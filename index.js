let mix = require('laravel-mix');
let fs = require('fs');

class ScopedViewsPlugin {
    dependencies() {
        return ['postcss-prefix-selector'];
    }

    register(config) {
        this.config = {
            paths: {
                resources: (config?.paths?.resources || 'resources').replace(/\/$/, ''),
                public: (config?.paths?.public || 'public').replace(/\/$/, ''),
                views: (config?.paths?.views || 'views').replace(/\/$/, ''),
            },
            clearViewCache: config?.clearViewCache || true
        };

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
        const postcss = require('postcss');
        const prefixer = require('postcss-prefix-selector');

        let safePath = path.substring(0, path.lastIndexOf('.'));
        safePath = safePath.replace(/[\/\.]/g, '-');

        if (path.endsWith('.css')) {
            mix.postCss(
                this.resourcePath(path),
                this.publicPath(path),
                [
                    prefixer({
                        prefix: `[data-scoped-${safePath}]`,

                        transform: function (prefix, selector, prefixedSelector, file) {
                            const rootNode = postcss.parse(fs.readFileSync(file)).first;

                            if (rootNode.type === 'comment' && rootNode.text.trim().toLowerCase() === '!allglobal') {
                                return selector;
                            } else {
                                return prefixedSelector;
                            }
                        }
                    })
                ]
            );
        } else if (path.endsWith('.js')) {
            mix.js(this.resourcePath(path), this.publicPath(path));
        }
    }

    // Recursively iterate the views directory and copy all css and js files to the public directory
    includeResourcesFolder(directory) {
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
