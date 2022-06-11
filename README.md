# (demo) Auto include scripts and styles in Blade

1. Create a blade view (or component)
2. Create a `.js` or `.css` with the same name (minus the .blade. part) next to it
3. Run `npm run dev` to compile the scripts and styles to the `public/views/...` directory
4. All views will check for the existence of these files when they're compiled and include them automatically.

**Take note that you may have to clear your view cache if you add these files!**
To do this I added `php artisan view:clear` in the relevant `package.json` scripts. So running `npm run dev` will automatically clear view cache.
