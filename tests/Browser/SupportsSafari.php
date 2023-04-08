<?php // Source: https://github.com/livewire/livewire/blob/3ce704ac3314fc8713f710ee1c4e865846569c19/tests/Browser/SupportsSafari.php

namespace Tests\Browser;

// Thanks to https://github.com/appstract/laravel-dusk-safari for most of this source.
trait SupportsSafari
{
    protected static $safariProcess;

    /** @beforeClass */
    public static function prepare()
    {
        if (static::$useSafari) {
            static::startSafariDriver();
        } else {
            static::startChromeDriver(['port' => 9515]);
        }
    }

    public function onlyRunOnChrome()
    {
        static::$useSafari && $this->markTestSkipped();
    }

    public static function startSafariDriver()
    {
        static::$safariProcess = new \Symfony\Component\Process\Process([
            '/usr/bin/safaridriver', '-p 9515',
        ]);

        static::$safariProcess->start();

        static::afterClass(function () {
            if (static::$safariProcess) {
                static::$safariProcess->stop();
            }
        });
    }
}
