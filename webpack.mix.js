const mix = require('laravel-mix');
const fs = require('fs');
const { exec } = require('child_process');
const postcss = require('postcss');
const prefixer = require('postcss-prefix-selector');

function resourcePath(path) {
    return `resources/${path}`;
}

function publicPath(path) {
    return `public/${path}`;
}

function includeFile(path) {
    let safePath = path.substring(0, path.lastIndexOf('.'));
    safePath = safePath.replace(/[\/\.]/g, '-');

    if (path.endsWith('.css')) {
        mix.postCss(
            resourcePath(path),
            publicPath(path),
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
        mix.js(resourcePath(path), publicPath(path));
    }
}

// Recursively iterate the views directory and copy all css and js files to the public directory
function includeResourcesFolder(directory) {
    const fileOrFolders = fs.readdirSync(resourcePath(directory));

    fileOrFolders.forEach(fileOrFolder => {
        const path = `${directory}/${fileOrFolder}`;

        // If it's a file, copy it to the public directory
        if (fs.lstatSync(resourcePath(path)).isFile()) {
            includeFile(path);
        } else {
            includeResourcesFolder(path);
        }
    });
}

includeResourcesFolder('views');

mix.after(() => {
    exec('php artisan view:clear');
});
