<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Defer CSS and JavaScript
    |--------------------------------------------------------------------------
    |
    | If true then scoped css/js files will be deferred if possible. If false
    | then they will be loaded immediately.
    | When JavaScript is not available, css will be loaded immediately.
    |
    */

    'defer_css' => env('DEFER_CSS', true),
    'defer_js' => env('DEFER_JS', true),

    /*
    |--------------------------------------------------------------------------
    | View Asset Stack Names
    |--------------------------------------------------------------------------
    |
    | CSS and JavaScript assets belonging to views will be placed in the stacks
    | defined here.
    |
    */

    'stack_name_css' => 'scoped-styles',
    'stack_name_js' => 'scoped-scripts',
];
