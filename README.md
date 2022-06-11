# Laravel Scoped Views

This is a **proof of concept** project to show how we can scope components using the pre-processing of (s)css files. Meaning that styles specified in a child component, won't leak out into the rest of the page. 

This is achieved by applying a unique attribute to each component and modifying all selectors in the css during compilation (using [this `postcss-prefix-selector` plugin](https://www.npmjs.com/package/postcss-prefix-selector)).

This is a different (and simpler) approach from my other recent experiment which uses Shadow DOM to achieve the same: https://github.com/luttje/laravel-scoped-components

![](.github/resulting-html.png)


## Basic Usage

1. `npm install TODO` (still TODO: I will upload this to npm tomorrow)
2. `composer install TODO` (still TODO)
3. In your project create a blade view, which can be a (Livewire) component.
4. Create a `.js` or `.css` with the same name (minus the .blade. part) next to it.
5. Run `npm run dev` to compile the scripts and styles to the `public/views/...` directory.
6. All views will check for the existence of these files when they're compiled and include them automatically.
8. In your layout view (e.g: [`layouts/app.blade.php`](resources/views/layouts/app.blade.php)) place `@stack('scoped-scripts')` and `@stack('scoped-styles')` to mark where scripts and styles (respectively) are placed.
9. You can accompany your layout view with a scoped `.css` and `.js` in the same way. But you probably don't want to scope the css in your layout, so put `/* !allGlobal */` at the top of your layout css file ([see example](resources/views/layouts/app.css)) to disable scoping.


## Configuration

- `php artisan vendor:publish --provider="Luttje\ScopedViews\ServiceProvider"`
- laravel mix config TODO

## Notes
- **You have to clear your view cache if you add .js and .css files**
To do this I added `php artisan view:clear` in the relevant `package.json` scripts. This means running `npm run dev` will automatically clear view cache.
- Javascript files are not scoped nor sandboxed in any way. They're simply automatically included when the view they belong to is used.
