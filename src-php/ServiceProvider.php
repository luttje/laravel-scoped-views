<?php

namespace Luttje\ScopedViews;

use Illuminate\Support\ServiceProvider as BaseServiceProvider;
use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\View;

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
            __DIR__.'/../config/scopedblade.php', 'scopedblade'
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
            __DIR__.'/../config/scopedblade.php' => config_path('scopedblade.php'),
        ]);

        $this->registerViewOverrides();
        $this->registerBladeDirectives();
    }

    protected function registerViewOverrides()
    {
        // To prevent double including css and js files
        $handledViews = [];

        function viewToCompiledPath($viewPath)
        {
            // Also trims leading path seperator
            return substr($viewPath, strlen(resource_path()) + 1);
        }

        // Include script and css files adjecent to the view
        function getAssetIncludes($path, $safePath)
        {
            $includes = '';

            $scriptFile = str_replace('.blade.php', '.js', $path);
            if (File::exists(public_path($scriptFile))) {
                $stackName = config('scopedblade.stack_name_js');
                $scriptFile = asset($scriptFile);
                $defer = config('scopedblade.defer_js') === true ? 'defer' : '';

                $includes .= "@push('$stackName', '<script src=\"$scriptFile\" $defer data-scope-parent=\"$safePath\"></script>')";
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
                    $includes .= "@push('$stackName') $cssComponent @endpush";
                } else {
                    $includes .= "@push('$stackName', '<link rel=\"stylesheet\" href=\"$styleFile\">')";
                }
            }

            return $includes;
        }

        View::composer('*', function ($view) use(&$handledViews) {
            $path = viewToCompiledPath($view->getPath());
            $safePath = substr($path, 0, -strlen('.blade.php'));
            $safePath = str_replace(['/', '\\'], '-', $safePath);
            $view->with('safeViewPath', $safePath);

            $view->getEngine()->getCompiler()->precompiler(function ($value) use ($view, $path, $safePath, &$handledViews) {
                $viewName = $view->getName();
                if (!in_array($viewName, $handledViews)) {
                    $handledViews[] = $viewName;
                    $includes = getAssetIncludes($path, $safePath);

                    return "$includes $value";
                } else {
                    return $value;
                }
            });
        });
    }

    protected function registerBladeDirectives()
    {
        Blade::directive('scope', function ($attributesJson = '{}') {
            $attributes = '';

            if($attributesJson) {
                $attributes = json_decode($attributesJson, true);
                $attributes = implode(' ', array_map(function ($key, $value) {
                    $value = str_replace('"', '\\"', $value);
                    return "$key=\"$value\"";
                }, array_keys($attributes), $attributes));
            }

            return <<<SCRIPT_ECHO
            <div data-scope="<?php echo \$safeViewPath; ?>" $attributes>
            SCRIPT_ECHO;
        });

        Blade::directive('endscope', function () {
            return <<<SCRIPT_ECHO
            </div> <!-- END OF data-scope="<?php echo \$safeViewPath; ?>" -->
            SCRIPT_ECHO;
        });
    }
}
