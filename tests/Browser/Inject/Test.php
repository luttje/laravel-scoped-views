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
            ->script('console.error(document.documentElement.innerHTML)')
                ->assertSee('Test Inject Style Links')
                ->assertSee('test-inject-style-links.css')
                ->assertSee('test-inject-style-links.js');
        });
    }
}
