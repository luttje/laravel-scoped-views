<?php

namespace Tests\Browser;

trait TestHelperTrait
{
    public function getViewPath($viewPath)
    {
        return __DIR__.'/mock/resources/views/'.$viewPath;
    }
}
