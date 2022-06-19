<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Artisan;
use Orchestra\Testbench\TestCase as BaseTestCase;

class TestCase extends BaseTestCase
{
    public function registerRoutes($router)
    {

    }

    public function executeMix($webpackConfig)
    {
        exec("npx mix --mix-config=\"{$webpackConfig}\"");
    }

    public function assertFilesAreEqual($file, $otherFile)
    {
        $fileContent = File::get($file);
        $otherFileContent = File::get($otherFile);

        $this->assertEquals($fileContent, $otherFileContent);
    }

    public function setUp(): void
    {
        $this->afterApplicationCreated(function () {
            $this->makeACleanSlate();
        });

        $this->beforeApplicationDestroyed(function () {
            $this->makeACleanSlate();
        });

        parent::setUp();
    }

    public function makeACleanSlate()
    {
        Artisan::call('view:clear');
    }

    protected function getPackageProviders($app)
    {
        return [
            \Luttje\ScopedViews\ServiceProvider::class,
        ];
    }

    protected function getEnvironmentSetUp($app)
    {
        $app['config']->set('view.paths', [
            __DIR__.'/_views',
            resource_path('views'),
        ]);

        $app['config']->set('app.debug', true);
        $app['config']->set('app.key', 'base64:ABj6V9lI3PvANrrfY4Bl4K8hr1P+p8/KA8QZrx4O4hI=');

        $app['config']->set('database.default', 'testbench');
        $app['config']->set('database.connections.testbench', [
            'driver'   => 'sqlite',
            'database' => ':memory:',
            'prefix'   => '',
        ]);

        $app['config']->set('auth.providers.users.model', User::class);

        $this->registerRoutes($app['router']);
    }
}
