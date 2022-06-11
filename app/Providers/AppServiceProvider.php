<?php

namespace App\Providers;

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
        $handledViews = [];

        function viewToCompiledPath($viewPath)
        {
            // + 1 to trim leading path seperator
            return substr($viewPath, strlen(resource_path()) + 1);
        }

        // Include script and css files adjecent to the view
        function getAssetIncludes($viewPath)
        {
            $includes = '';

            $scriptFile = viewToCompiledPath(str_replace('.blade.php', '.js', $viewPath));
            if (File::exists(public_path($scriptFile))) {
                $includes .= '<script src="' . asset($scriptFile) . '" defer></script>';
            }

            $styleFile = viewToCompiledPath(str_replace('.blade.php', '.css', $viewPath));
            if (File::exists(public_path($styleFile))) {
                $includes .= '<link rel="stylesheet" href="' . asset($styleFile) . '">';
            }

            return $includes;
        }

        View::composer('*', function ($view) use(&$handledViews) {
            $view->getEngine()->getCompiler()->precompiler(function ($value) use ($view, &$handledViews) {
                $viewName = $view->getName();

                if (!in_array($viewName, $handledViews)) {
                    $handledViews[] = $viewName;

                    $includes = getAssetIncludes($view->getPath());

                    return "$includes $value";
                } else {
                    return $value;
                }
            });
        });
    }
}
