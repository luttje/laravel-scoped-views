<?php // Based on: https://github.com/livewire/livewire/tree/master/tests/Browser

namespace Tests\Browser;

use Illuminate\Support\Facades\Artisan;
use Facebook\WebDriver\Chrome\ChromeOptions;
use Facebook\WebDriver\Remote\RemoteWebDriver;
use Facebook\WebDriver\Remote\DesiredCapabilities;
use Illuminate\Support\Facades\View;
use Orchestra\Testbench\Dusk\Options as DuskOptions;
use Orchestra\Testbench\Dusk\TestCase as BaseTestCase;

class TestCase extends BaseTestCase
{
    use SupportsSafari;

    public static $useSafari = false;

    public function registerRoutes($router)
    {
        $router->get(
            '/test-compile-sass',
            \Tests\Browser\Compile\SassController::class.'@test'
        )->middleware('web')->name('test-compile-sass');

        $router->get(
            '/test-inject-style-links',
            \Tests\Browser\inject\StyleController::class.'@test'
        )->middleware('web')->name('test-inject-style-links');
    }

    public function setUp(): void
    {
        if (isset($_SERVER['CI'])) {
            DuskOptions::withoutUI();
        }

        $this->afterApplicationCreated(function () {
            $this->makeACleanSlate();
        });

        $this->beforeApplicationDestroyed(function () {
            $this->makeACleanSlate();
        });

        parent::setUp();
    }

    protected function tearDown(): void
    {
        $this->removeApplicationTweaks();

        parent::tearDown();
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

    protected function driver(): RemoteWebDriver
    {
        $options = DuskOptions::getChromeOptions();

        return static::$useSafari
            ? RemoteWebDriver::create(
                'http://localhost:9515', DesiredCapabilities::safari()
            )
            : RemoteWebDriver::create(
                'http://localhost:9515',
                DesiredCapabilities::chrome()->setCapability(
                    ChromeOptions::CAPABILITY,
                    $options
                )
            );
    }
}
