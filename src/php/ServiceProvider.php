<?php

namespace Luttje\ScopedViews;

use Illuminate\Support\ServiceProvider as BaseServiceProvider;
use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Facades\Route;
use Luttje\ScopedViews\Components\Scoped;

class ServiceProvider extends BaseServiceProvider
{
    /**
     * Register services.
     *
     * @return void
     */
    public function register()
    {
        $this->mergeConfigFrom(
            __DIR__ . '/../../config/scopedblade.php',
            'scopedblade'
        );
    }

    /**
     * Bootstrap services.
     *
     * @return void
     */
    public function boot()
    {
        $this->publishes([
            __DIR__ . '/../../config/scopedblade.php' => config_path('scopedblade.php'),
        ]);

        $this->registerRoutes();
        $this->registerViewOverrides();
        $this->registerBladeComponents();
    }

    // To prevent double including css and js files, store which views have been processed
    private $handledViews = [];

    private function viewToCompiledPath($viewPath)
    {
        $resourcePath = resource_path();

        if (str_starts_with($viewPath, $resourcePath)) {
            // Also trims leading path seperator (+1)
            return substr($viewPath, strlen($resourcePath) + 1);
        }

        return basename($viewPath);
    }

    // Include script and css files adjecent to the view
    private function getAssetIncludes($path, $safePath)
    {
        $includes = '';

        /*
        TODO: Replace File::exists with public_path for a check in the manifest. Let the route server the file.

        We do this because Orchestra has an internal laravel installation, we shouldnt rely on the public folder being anywhere relatively.
        */

        $scriptFile = str_replace('.blade.php', '.js', $path);
        if (File::exists(public_path($scriptFile))) {
            $stackName = config('scopedblade.stack_name_js');
            $scriptFile = asset($scriptFile);
            $defer = config('scopedblade.defer_js') === true ? 'defer' : '';

            $includes .= "@push('$stackName', '<script src=\"$scriptFile\" $defer data-scope-parent=\"$safePath\"></script>')\n";
        }

        $styleFile = str_replace('.blade.php', '.css', $path);
        if (File::exists(public_path($styleFile))) {
            $stackName = config('scopedblade.stack_name_css');
            $styleFile = asset($styleFile);

            if (config('scopedblade.defer_css') === true) {
                $cssComponent = <<<CSS_COMPONENT_STRING
                <link rel="preload" href="$styleFile" as="style" onload="this.onload=null;this.rel='stylesheet'">
                <noscript><link rel="stylesheet" href="$styleFile"></noscript>
                CSS_COMPONENT_STRING;
                $includes .= "@push('$stackName') $cssComponent @endpush\n";
            } else {
                $includes .= "@push('$stackName', '<link rel=\"stylesheet\" href=\"$styleFile\">')\n";
            }
        }

        $inlineStyleFile = str_replace('.blade.php', '.inline.css', $path);
        if (File::exists(public_path($inlineStyleFile))) {
            $stackName = config('scopedblade.stack_name_css');
            $inlineStyleFileContents = File::get(public_path($inlineStyleFile));

            if (!empty($inlineStyleFileContents)) {
                $cssComponent = <<<CSS_COMPONENT_STRING
                <style>
                    $inlineStyleFileContents
                </style>
                CSS_COMPONENT_STRING;
                $includes .= "@push('$stackName') $cssComponent @endpush\n";
            }
        }

        return $includes;
    }

    protected function registerViewOverrides()
    {
        $handledViews = &$this->handledViews;
        View::composer('*', function ($view) use (&$handledViews) {
            $path = $this->viewToCompiledPath($view->getPath());
            $safePath = substr($path, 0, -strlen('.blade.php'));
            $safePath = str_replace(['/', '\\'], '-', $safePath);
            $view->with('safeViewPath', $safePath);

            $view->getEngine()->getCompiler()->precompiler(function ($value) use ($view, $path, $safePath, &$handledViews) {
                $viewName = $view->getName();
                if (!in_array($viewName, $handledViews)) {
                    $handledViews[] = $viewName;
                    $includes = $this->getAssetIncludes($path, $safePath);

                    return "$includes $value";
                } else {
                    return $value;
                }
            });
        });
    }

    protected function registerBladeComponents()
    {
        Blade::component('scoped', Scoped::class);
    }

    protected function registerRoutes()
    {
        Route::get('/scopedviews/{filename}', function ($filename) {
            // TODO: Make path configurable and identical in both Laravel mix and PHP
            $manifest = json_decode(File::get(public_path('views/scopedviews-manifest.json')), true);

            if (!array_key_exists($filename, $manifest)) {
                abort(404);
            }

            return File::get($manifest[$filename]);
        })->name('scopedviews');
    }
}
