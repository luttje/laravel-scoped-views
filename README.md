# Laravel Scoped Views

This is a **proof of concept** project to show how we can scope components using the pre-processing of (s)css files. Meaning that styles specified in a child component, won't leak out into the rest of the page. 

This is achieved by applying a unique attribute to each component and modifying all selectors in the css during compilation (using [this `postcss-prefix-selector` plugin](https://www.npmjs.com/package/postcss-prefix-selector)).

This is a different (and simpler) approach from my other recent experiment which uses Shadow DOM to achieve the same: https://github.com/luttje/laravel-scoped-components

![](.github/resulting-html.png)


## Basic Usage

1. Create a blade view (or component)
2. Create a `.js` or `.css` with the same name (minus the .blade. part) next to it
3. Run `npm run dev` to compile the scripts and styles to the `public/views/...` directory
4. All views will check for the existence of these files when they're compiled and include them automatically.


## Notes
- **You have to clear your view cache if you add .js and .css files**
To do this I added `php artisan view:clear` in the relevant `package.json` scripts. This means running `npm run dev` will automatically clear view cache.
- Javascript files are not scoped nor sandboxed in any way. They're simply automatically included.
