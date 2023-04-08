<?php

namespace Tests\Browser;

use Facebook\WebDriver\Chrome\ChromeOptions;
use Facebook\WebDriver\Remote\RemoteWebDriver;
use Facebook\WebDriver\Remote\DesiredCapabilities;
use Orchestra\Testbench\Dusk\Options as DuskOptions;
use Tests\CommonTestCase;

class TestCase extends CommonTestCase
{
    use SupportsSafari;

    public static $useSafari = false;

    public function registerRoutes($router)
    {
        parent::registerRoutes($router);

        $router->get(
            '/test-inject-style-links',
            \Tests\Browser\inject\StyleController::class.'@test'
        )->middleware('web')->name('test-inject-style-links');
    }

    public function setUp(): void
    {
        parent::setUp();

        $webpackConfig = __DIR__.'/webpack.mix.js';
        $this->executeMix($webpackConfig);
    }

    protected function tearDown(): void
    {
        $this->removeApplicationTweaks();

        parent::tearDown();
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
