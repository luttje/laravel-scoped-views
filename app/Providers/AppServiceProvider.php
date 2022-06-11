<?php

namespace App\Providers;

use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        // To prevent double including css and js files
        $handledViews = [];

        function viewToCompiledPath($viewPath)
        {
            // Also trims leading path seperator
            return substr($viewPath, strlen(resource_path()) + 1);
        }

        // Include script and css files adjecent to the view
        function getAssetIncludes($path)
        {
            $includes = '';

            $scriptFile = str_replace('.blade.php', '.js', $path);
            if (File::exists(public_path($scriptFile))) {
                $includes .= '<script src="' . asset($scriptFile) . '" defer></script>';
            }

            $styleFile = str_replace('.blade.php', '.css', $path);
            if (File::exists(public_path($styleFile))) {
                $includes .= '<link rel="stylesheet" href="' . asset($styleFile) . '">';
            }

            return $includes;
        }

        View::composer('*', function ($view) use(&$handledViews) {
            $path = viewToCompiledPath($view->getPath());
            $safePath = substr($path, 0, -strlen('.blade.php'));
            $safePath = str_replace(['/', '\\'], '-', $safePath);
            $view->with('safeViewPath', $safePath);

            $view->getEngine()->getCompiler()->precompiler(function ($value) use ($view, $path, &$handledViews) {
                $viewName = $view->getName();
                if (!in_array($viewName, $handledViews)) {
                    $handledViews[] = $viewName;

                    $includes = getAssetIncludes($path);

                    return "$includes $value";
                } else {
                    return $value;
                }
            });
        });


        Blade::directive('scope', function () {
            return <<<SCRIPT_ECHO
            <div data-scoped-<?php echo \$safeViewPath; ?>>
            SCRIPT_ECHO;
        });
        Blade::directive('endscope', function () use (&$currentScriptId) {
            return <<<SCRIPT_ECHO
            </div> <!-- END OF data-scoped-<?php echo \$safeViewPath; ?> -->
            SCRIPT_ECHO;
        });
    }
}
