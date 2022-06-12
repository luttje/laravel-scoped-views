const FileCollection = require('laravel-mix/src/FileCollection');
const Task = require('laravel-mix/src/tasks/Task');
const File = require('laravel-mix/src/File');
const path = require('path');
const fs = require('fs');

class CompileSassTask extends Task {
    constructor(resourcePath, publicPath, uniqueName, mix, plugin) {
        super();

        const os = require('os');
        const pathWithoutExt = resourcePath.substring(0, resourcePath.lastIndexOf('.'));

        const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'luttje-scoped-views-'));
        this.outFile = path.join(outDir, `${pathWithoutExt}.css`);
        this.resourcePath = resourcePath;

        publicPath = publicPath.substring(0, publicPath.lastIndexOf('.'));
        this.publicPath = `${publicPath}.css`;

        this.uniqueName = uniqueName;
        this.mix = mix;
        this.plugin = plugin;

        fs.mkdirSync(path.dirname(this.outFile), { recursive: true }, (err) => {
            if (err) throw err;
        });
        // Create an empty file for the css handler to watch
        fs.writeFileSync(this.outFile, '');

        // Files to watch
        this.files = new FileCollection([this.resourcePath]);

        // Compiled Assets
        const file = new File(this.publicPath);
        this.assets = [
            file
        ];
    }

    run() {
        this.precompile()
    }

    onChange(updatedFile) {
        console.log(`Scoped views: SASS file changed, recompiling ${updatedFile}...`);

        setTimeout(() => {
            this.precompile();
        }, 100); // Delay after VSCode save, otherwise we get an exception...
    }

    precompile() {
        const sass = require('node-sass');

        const resultingCss = sass.renderSync({
            file: this.resourcePath,
            outFile: this.outFile,
        }).css;

        fs.writeFileSync(this.outFile, resultingCss);
    }
}

module.exports = (resourcePath, publicPath, uniqueName, mix, plugin) => {
    if (!plugin.config.includeSass) {
        console.warn(`${resourcePath} file was discovered, but Sass was not configured to be used.`);
        console.warn('Did you forget to configure `mix.scoped({ includeSass: true })`?');
        return;
    }

    const sassTask = new CompileSassTask(resourcePath, publicPath, uniqueName, mix, plugin);
    Mix.addTask(sassTask);

    require('./css')(sassTask.outFile, sassTask.publicPath, uniqueName, mix, plugin);
}
