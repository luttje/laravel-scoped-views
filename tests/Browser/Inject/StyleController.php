<?php

namespace Tests\Browser\Inject;

use Illuminate\Support\Facades\View;

class StyleController
{
    public function test()
    {
        return View::file(__DIR__.'/test-inject-style-links.blade.php');
    }
}
