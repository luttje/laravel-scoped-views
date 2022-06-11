const mix = require('laravel-mix');
const fs = require('fs');

mix.js('resources/js/app.js', 'public/js')
    .postCss('resources/css/app.css', 'public/css', [
        //
    ]);

function resource(path) {
    return `resources/${path}`;
}

function public(path) {
    return `public/${path}`;
}

function includeFile(path) {
    if (path.endsWith('.css')) {
        mix.postCss(resource(path), public(path), [
            //
        ]);
    } else if (path.endsWith('.js')) {
        mix.js(resource(path), public(path));
    }
}

// Recursively iterate the views directory and copy all css and js files to the public directory
function includeResourcesFolder(directory) {
    const fileOrFolders = fs.readdirSync(resource(directory));

    fileOrFolders.forEach(fileOrFolder => {
        const path = `${directory}/${fileOrFolder}`;

        // If it's a file, copy it to the public directory
        if (fs.lstatSync(resource(path)).isFile()) {
            includeFile(path);
        } else {
            includeResourcesFolder(path);
        }
    });
}

includeResourcesFolder('views');
