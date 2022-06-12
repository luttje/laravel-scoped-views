# Laravel Scoped Views

This package can scope view/component styles by pre-processing (s)css files. With "to scope" we mean that styles specified in a child component won't leak out into the rest of the page. 

When Laravel Mix `npm run dev/watch/prod` is run a unique attribute is applied to each selector. The same attribute is added to the component.

![](.github/resulting-html.png)


## Installation

You need to install this package using both [composer](https://getcomposer.org/) and [npm](https://nodejs.org/en/download/):

1. `npm install TODO` (still TODO: I will upload this to npm soon)
2. `composer install TODO` (also still TODO)


## Basic Usage

1. Create a blade view (`x.blade.php`), with accompanying script (`x.js`) and style files (`x.css` OR `x.scss`) of the same name:
    ```html
    <!-- resources/views/components/example.blade.php -->
    @scope
    <p>
        Paragraphs in this component are blue.
    </p>
    @endscope
    ```
    ```scss
    // resources/views/components/example.scss
    p {
        color: blue;

        span {
            font-weight: bold;
        }
    }
    ```
    ```js
    // resources/views/components/example.js
    console.log('hello world!');
    ```
2. Add `@stack('scoped-scripts')` and `@stack('scoped-styles')` to your layout to mark where scoped scripts and styles (respectively) are to be placed:
    ```html
    <!-- resources/views/layouts/app.blade.php -->
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <!-- Links will be placed here -->
        @stack('scoped-styles')
    </head>
    <body>
        @yield('content')

        <!-- Scripts will be placed here -->
        @stack('scoped-scripts')
    </body>
    </html>
    ```
3. Modify `webpack.mix.js` to include a call to `mix.scoped()`:
    ```js
    // webpack.mix.js
    const mix = require('laravel-mix');
    require('laravel-scoped-views');

    mix.scoped({
        // @see README#configuration for more options
        includeSass: true,
    });
    ```
4. Run `npm run dev` (or `watch` or `prod`).

With this last step all `.js`, `.css` (or `.scss`) with the same names as views will be compiled to the `public/views` directory.

Blade views will check for the existence of these script and style files and include them automatically (once). This check happens when blade views are compiled the first time. Meaning the result is cached.


## Configuration

### Configuring Laravel Mix
The `mix.scoped()` function accepts a single object with configuration options:
```js
mix.scoped({
    // Directory paths (defaults will work for 99% of Laravel installations)
    paths: {
        resources: 'resources',
        views: 'views',
        public: 'public',
    },

    // Whether to automatically run `php artisan view:clear` after compilation
    clearViewCache: true,

    // Should Sass be compiled? (Enabling this will automatically install dependencies the first time Mix runs)
    includeSass: false,

    // Contains an array extensions to handle for each view. Check `src-js/handlers` for the defaults (js, css, scss).
    handlers: {
        text: [
            // If a file in resources matches this regex, the function will be called
            /.txt$/,
            // Function to be called. Should instruct Laravel Mix.
            (resourcePath, publicPath, uniqueName, mix, plugin) => {
                mix.copy(resourcePath, publicPath);
            }
        ],
    }
});
```
*If you do not specify an option, the defaults will be used. See [src-js/index.js](src-js/index.js) for the default configurations.*


### Configuring the Service Provider
You can configure css and js deferring, and the names of the stacks in `config/scopedblade.php`. 
Run `php artisan vendor:publish --provider="Luttje\ScopedViews\ServiceProvider"` to publish that config file to your project.


## Notes

### Global layout style
A layout view is treated exactly as a normal view. This means you can accompany a layout with `.js` and `.css` (or `.scss`) of the same name. However you likely don't want to scope the css to just your layout. Disable scoping by placing `/* !allGlobal */` on the first line of the css file.


### Clear your cache
- **You have to clear your view cache if you add .js and .css files**
By default running `npm run dev` will automatically clear view cache. If you disable this configuration (`mix.scoped({ clearViewCache: false }`) you have to run `php artisan view:clear` manually.


### Javascript scope
Javascript files are simply automatically included on the page (once) when the view they belong to is used. They are not scoped or sandboxed.

Use the script tag's `data-scope-parent` attribute if you want to get the scoped HTML element that belongs with your script.
```js
var myScopeAttribute = document.currentScript.getAttribute('data-scope-parent');
var myScopedElement = document.querySelector(`[data-scope="${myScopeAttribute}"]`);
console.log(myScopedElement);
```
