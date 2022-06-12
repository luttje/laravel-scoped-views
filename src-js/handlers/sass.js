module.exports = (resourcePath, publicPath, uniqueName, mix, plugin) => {
    if (!plugin.config.includeSass) {
        console.warn(`${resourcePath} file was discovered, but Sass was not configured to be used.`);
        console.warn('Did you forget to configure `mix.scoped({ includeSass: true })`?');
        return;
    }

    const fs = require('fs')
    const getDirName = require('path').dirname;
    const sass = require('node-sass');
    const pathWithoutExt = resourcePath.substring(0, resourcePath.lastIndexOf('.'));

    // Store to temporary file to be processed by postCss
    const tempFile = `${plugin.config.paths.tmp}/${pathWithoutExt}.tmp.css`;

    mix.before(() => {
        const resultingCss = sass.renderSync({
            file: resourcePath,
            outFile: tempFile,
        });

        fs.mkdirSync(getDirName(tempFile), { recursive: true }, (err) => {
            if (err) throw err;
        });

        fs.writeFileSync(tempFile, resultingCss.css);
    });

    publicPath = publicPath.substring(0, publicPath.lastIndexOf('.'));

    require('./css')(tempFile, `${publicPath}.css`, uniqueName, mix, plugin);

    mix.after(() => {
        fs.rmSync(plugin.config.paths.tmp, { recursive: true, force: true });
    });
}
