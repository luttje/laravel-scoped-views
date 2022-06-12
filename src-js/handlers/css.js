const fs = require('fs');

module.exports = (resourcePath, publicPath, uniqueName, mix, plugin) => {
    const postcss = require('postcss');
    const prefixer = require('postcss-prefix-selector');

    mix.postCss(
        resourcePath,
        publicPath,
        [
            prefixer({
                prefix: `[data-scoped-${uniqueName}]`,

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
}
