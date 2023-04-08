<?php

namespace Tests\Browser\Inject;

use Illuminate\Support\Facades\View;
use Tests\Browser\TestHelperTrait;

class StyleController
{
    use TestHelperTrait;

    public function test()
    {
        return View::file($this->getViewPath('/test-inject-style-links.blade.php'), [
            'title' => 'Test Inject Style Links',
        ]);
    }
}
