<?php

namespace Tests\Browser\Inject;

use Tests\Browser\TestCase;

class Test extends TestCase
{
    public function test_can_inject_style_links()
    {
        // TODO: Test if
        $this->browse(function ($browser) {
            $browser->visit(route('test-inject-style-links'))
                ->assertSee('Testing!');
        });
    }
}
