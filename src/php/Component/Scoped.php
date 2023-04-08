<?php

namespace Luttje\ScopedViews\Components;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Facades\Route;
use \Illuminate\View\Component;

/**
 * Component to scope all related css and js files to this component.
 * Checks if the file this component any registered .css, .inline.css and .js files in the manifest.
 * If so, it will include them in the view.
 */
class Scoped extends Component
{
    // TODO: Check manifest, load related files

}
