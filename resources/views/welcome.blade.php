@extends('layouts.app')

@section('content')
<section>
    <p>
        Unstyled paragraph in child view
    </p>
</section>
<section>
    <x-simple title="test">
        This is a test component who's styling is scoped to the component.
    </x-simple>

    <x-other title="script test">
        content with styling is scoped to the component.
    </x-other>
</section>
@endsection
