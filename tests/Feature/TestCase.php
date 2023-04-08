<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Artisan;
use Tests\CommonTestCase;

class TestCase extends CommonTestCase
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
}
