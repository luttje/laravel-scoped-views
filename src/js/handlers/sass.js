const FileCollection = require('laravel-mix/src/FileCollection');
const File = require('laravel-mix/src/File');
const Handler = require('./handler');
const path = require('path');
const fs = require('fs');

class CompileSassTask extends Handler {
    constructor(resourcePath, publicPath, uniqueName, mix, plugin) {
        if (!plugin.config.includeSass) {
            console.warn(`${resourcePath} file was discovered, but Sass was not configured to be used.`);
            console.warn('Did you forget to configure `mix.scoped({ includeSass: true })`?');
            return;
        }

        super(resourcePath, publicPath, uniqueName, mix, plugin);

        const os = require('os');
        const pathWithoutExt = resourcePath.substring(0, resourcePath.lastIndexOf('.'));

        const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'luttje-scoped-views-'));
        // remove drive colon from path
        this.outFile = path.join(outDir, `${pathWithoutExt.replace(/:/g, '')}.css`);
        this.resourcePath = resourcePath;

        this.publicPath = this.getTransformedName(publicPath)

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

        Mix.addTask(this);

        const cls = require('./css');
        new cls(this.outFile, this.publicPath, uniqueName, mix, plugin);
    }

    getTransformedName(name) {
        name = name.substring(0, name.lastIndexOf('.'));
        return  `${name}.css`;
    }

    run() {
        this.precompile()
    }

    onChange(updatedFile) {
        console.log(`Scoped views: SASS file changed, recompiling ${updatedFile}`);

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

module.exports = CompileSassTask
