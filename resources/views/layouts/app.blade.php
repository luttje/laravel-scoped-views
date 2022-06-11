<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>{{ config('app.name') }}</title>

    <style>
        body {
            font-family: 'Arial', sans-serif;
        }
    </style>

    @livewireStyles
</head>
<body>
    <p>
        Paragraph in layout (global)
    </p>

    @yield('content')

    @livewireScripts
</body>
</html>
