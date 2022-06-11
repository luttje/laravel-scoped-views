@scope({"x-data": "{ count: 0 }"})
    <h1>{{ $title }}</h1>
    <p>{{ $slot }}</p>
    <p>Alpine Count: <span x-text="count"></span></p>
    <button @click="count++">Increment</button>
@endscope
