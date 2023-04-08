<?php

namespace Tests\Feature\Compile;

use Tests\Feature\TestCase;

class Test extends TestCase
{
    public function test_can_compile_sass()
    {
        $webpackConfig = __DIR__.'/webpack.mix.js';
        $this->executeMix($webpackConfig);
        $this->assertFilesAreEqual(
            __DIR__.'/public/views/can-compile-sass.css',
            __DIR__.'/expected/can-compile-sass.css',
        );
    }
}
