const FileCollection = require('laravel-mix/src/FileCollection');
const Task = require('laravel-mix/src/tasks/Task');
const File = require('laravel-mix/src/File');
const fs = require('fs');

class CompilePostCssTask extends Task {
    constructor(resourcePath, publicPath, uniqueName, mix, plugin) {
        super();

        this.resourcePath = resourcePath;
        this.publicPath = publicPath;
        this.uniqueName = uniqueName;
        this.mix = mix;
        this.plugin = plugin;

        // Files to watch
        this.files = new FileCollection([this.resourcePath]);

        // Compiled Assets
        const file = new File(this.publicPath);
        this.assets = [
            file
        ];
    }

    run() {
        this.compile();
    }

    onChange(updatedFile) {
        this.compile();
    }

    compile() {
        const postcss = require('postcss');
        const prefixer = require('postcss-prefix-selector');
        const file = fs.readFileSync(this.resourcePath);

        const resultingCss = postcss()
            .use(prefixer({
                prefix: `[data-scoped-${this.uniqueName}]`,

                transform: function (prefix, selector, prefixedSelector) {
                    const rootNode = postcss.parse(file).first;

                    if (rootNode.type === 'comment' && rootNode.text.trim().toLowerCase() === '!allglobal') {
                        return selector;
                    } else {
                        return prefixedSelector;
                    }
                }
            }))
            .process(file)
            .css;

        fs.writeFileSync(this.publicPath, resultingCss);
    }
}

module.exports = (resourcePath, publicPath, uniqueName, mix, plugin) => {
    Mix.addTask(new CompilePostCssTask(resourcePath, publicPath, uniqueName, mix, plugin));
}
