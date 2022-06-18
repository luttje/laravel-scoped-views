const FileCollection = require('laravel-mix/src/FileCollection');
const Task = require('laravel-mix/src/tasks/Task');
const File = require('laravel-mix/src/File');
const fs = require('fs');

class CompilePostCssTask extends Task {
    constructor(resourcePath, publicPath, uniqueName, mix, plugin) {
        super();

        this.resourcePath = resourcePath;
        this.publicPath = publicPath;
        this.publicInlinePath = publicPath.replace(/\.css$/, '.inline.css');
        this.uniqueName = uniqueName;
        this.mix = mix;
        this.plugin = plugin;

        // Files to watch
        this.files = new FileCollection([this.resourcePath]);

        // Compiled Assets
        const file = new File(this.publicPath);
        const inlineFile = new File(this.publicInlinePath);
        this.assets = [
            file,
            inlineFile
        ];
    }

    run() {
        this.compile();
    }

    onChange(updatedFile) {
        console.log(`Scoped views: CSS file changed, recompiling ${updatedFile}`);
        this.compile();
    }

    compile() {
        const postcss = require('postcss');
        const prefixer = require('postcss-prefix-selector');
        const file = fs.readFileSync(this.resourcePath);
        const inlineRoot = postcss.root();

        const tryRuleOverride = (prefix, selector, prefixedSelector, filePath, rule) => this.tryRuleOverride(prefix, selector, prefixedSelector, filePath, rule, inlineRoot);
        const tryGlobalOverride = (prefix, selector, prefixedSelector, filePath, rule) => this.tryGlobalOverride(prefix, selector, prefixedSelector, filePath, rule, inlineRoot);

        const resultingCss = postcss()
            .use(prefixer({
                prefix: `[data-scope="${this.uniqueName}"]`,

                transform: function (prefix, selector, prefixedSelector, filePath, rule) {
                    let ruleOverride = null;

                    if ((ruleOverride = tryRuleOverride(prefix, selector, prefixedSelector, filePath, rule)) && ruleOverride !== undefined){
                        return ruleOverride;
                    }

                    if ((ruleOverride = tryGlobalOverride(prefix, selector, prefixedSelector, filePath, rule)) && ruleOverride !== undefined)
                        return ruleOverride;

                    return prefixedSelector;
                }
            }))
            .process(file)
            .css;

        fs.writeFileSync(this.publicInlinePath, inlineRoot.toString());
        fs.writeFileSync(this.publicPath, resultingCss);
    }

    tryGlobalOverride(prefix, selector, prefixedSelector, filePath, rule, inlineRoot) {
        const root = rule.root();
        const firstNode = root.first;

        if (!firstNode)
            return;

        let annotations;
        const firstNodes = [firstNode, inlineRoot.first];

        firstNodes.forEach(node => {
            if (annotations !== undefined)
                return;

            if (node?.type !== 'comment')
                return;
            try {
                annotations = JSON.parse(node.text.trim());
            } catch (e) {
                // Ignore non-JSON annotations
            }
        });

        if (annotations === undefined)
            return;

        if (annotations.allInline) {
            if(firstNode !== inlineRoot.first)
                inlineRoot.append(firstNode);

            inlineRoot.append(rule);
        }

        if (annotations.allGlobal)
            return selector;
    }

    tryRuleOverride(prefix, selector, prefixedSelector, filePath, rule, inlineRoot) {
        const previousNode = rule.prev();

        if (!previousNode)
            return;

        if (previousNode?.type !== 'comment')
            return;

        try {
            const annotations = JSON.parse(previousNode.text.trim());

            if (annotations.inline) {
                // Move this rule and annotation to the inline document
                inlineRoot.append(previousNode);
                rule = inlineRoot.append(rule);
            }

            if (annotations.global)
                return selector;
        } catch (e) {
            // Ignore non-JSON annotations
        }
    }
}

module.exports = (resourcePath, publicPath, uniqueName, mix, plugin) => {
    Mix.addTask(new CompilePostCssTask(resourcePath, publicPath, uniqueName, mix, plugin));
}
