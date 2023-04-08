const Task = require('laravel-mix/src/tasks/Task');

class Handler extends Task {
    constructor(resourcePath, publicPath, uniqueName, mix, plugin) {
        super(resourcePath, publicPath, uniqueName, mix, plugin);
    }

    getTransformedName(name) {
        return name;
    }
}

module.exports = Handler
