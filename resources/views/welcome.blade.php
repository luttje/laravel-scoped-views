@extends('layouts.app')

@section('content')
<section>
    <p>
        Paragraph in component (scoped)
    </p>
</section>
<section>
    <x-simple title="test">
        This is a test component
    </x-simple>

    <x-other title="script test">
        content
    </x-other>
</section>
@endsection
