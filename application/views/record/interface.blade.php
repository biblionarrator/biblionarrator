@layout('layouts/main')

@section('navigation')
@parent
@endsection

@section('controlbar')
    <li><a href="#" id="toggleTOC" data-target="#table-of-contents" data-toggle="cookie-view" data-cookie="show_toc">TOC</a></li>
    @if ($editor)
        <li><a href="#" id="toggleEditor" data-target="#editor-toolbar" data-toggle="cookie-view" data-cookie="show_editor">Editor</a></li>
    @endif
    <li class="active"><a href="#" id="toggleLinks" data-target="#linksPane" data-toggle="cookie-view" data-cookie="show_links">Links</a></li>
@if ($editor)
    <li class="divider-vertical"></li>
    </ul>
    <ul id="editor-toolbar" class="nav">
        <li><a href="#" id="toggle-tags" data-target="#recordContainer" data-toggle="cookie-view" data-cookie="show_tags" data-class="showtags">Show tags</a></li>
        <li><a href="#" id="new" data-toggle="confirm" data-confirm-label="{{ __('confirmations.newrecordtitle') }}" data-confirm-body="{{ __('confirmations.newrecordbody') }}" class="new-record caret-before">New</a></li>
        <li class="dropdown">
            <a href="#" id="dropdown-new" data-toggle="dropdown" class="caret-after dropdown-toggle"><b class="caret"></b></a>
            <ul class="dropdown-menu">
                <li><a href="#" id="new-blank" data-toggle="confirm" data-confirm-label="{{ __('confirmations.newrecordtitle') }}" data-confirm-body="{{ __('confirmations.newrecordbody') }}" class="new-record">Blank record</a></li>
                <li><a id="new-related">Related record</a></li>
                <li><a href="{{ URL::current() }}/duplicate" id="new-duplicate">Duplicate record</a></li>
            </ul>
        </li>
        <li><a href="#" id="save">Save</a></li>
        <li><a href="{{ URL::full() }}" id="record-reload" data-toggle="confirm" data-confirm-label="{{ __('confirmations.reloadrecordtitle') }}" data-confirm-body="{{ __('confirmations.reloadrecordbody') }}">Reload</a></li>
        <li><a href="{{ URL::current() }}/delete" id="record-delete" data-toggle="confirm" data-confirm-label="{{ __('confirmations.deleterecordtitle') }}" data-confirm-body="{{ __('confirmations.deleterecordbody') }}">Delete</a></li>
        <li class="divider-vertical"></li>
        <li><a href="#" id="tag">Tag</a></li>
        <li><a href="#" id="untag">Untag</a></li>
        <li class="divider-vertical"></li>
        <li data-toggle="dropdown-select">
            <select id="recordtype-select" title="Record type: ">
                @foreach (RecordType::all() as $rt)
                    <option
                    @if ($record->record_type && $rt->id == $record->record_type->id)
                    selected="selected"
                    @endif
                    value="{{ $rt->id }}">{{ $rt->name }}</option>
                @endforeach
            </select>
        </li>
@endif
@endsection

@section('sidebar')
    <div id="sidebarAffix">
        <div id="table-of-contents">
            <div id="toc-header">
                Table of Contents
            </div>
            <div id="fieldsTOC">
            </div>
        </div>
    </div>
@endsection

@section('content')
    <div class="row-fluid">
        <div class="span6">
            @if ($editor)
            <noscript>
            <div class="alert alert-error">
                <button type="button" class="close" data-dismiss="alert">&times;</button>
                The record editor does not work without Javascript. Please enable Javascript and reload the page.
            </div>
            </noscript>
            @endif
            <div itemscope id="recordContainer" class="recordtype_{{ $record->record_type ? $record->record_type->name : '' }}">
                @if ($record->format('html'))
                    {{ $record->format('html') }}
                @else
                    <article>
                        <header></header>
                        <section></section>
                    </article>
                @endif
            </div>
            @if ($editor)
            <div><button id="add-section" class="btn btn-link">Add section</button></div>
            @endif
            <div id="alerts"></div>
            <div class="instructions">
                <span class="instruction-label">Hint:</span>
                Use the first ("Citation") box for basic citation information that
                should show up directly in the search results. Use the other
                ("Expansion") boxes to enter additional information, grouping into
                paragraphs as you see fit. To tag text using the keyboard, use the
                shortcut Ctrl-J. To untag text, use the shortcut Ctrl-K.
            </div>
        </div>
        @include('components.linkpane')
    </div>
@endsection

@section('scripts')
<script type="text/javascript">
@if (isset($record->id))
var recordId = {{ $record->id }};
@else
var recordId;
@endif

var labeltofieldlookup = {
    @foreach (Field::all() as $field)
        '{{ $field->label }}': '{{ $field->schema }}_{{ $field->field }}',
    @endforeach
    };
var fieldlist = {
    @foreach (Field::all() as $field)
        '{{ $field->schema }}_{{ $field->field }}': {
            'label': '{{ $field->label }}',
            'link': {{ $field->link ? 'true' : 'false' }}
        },
    @endforeach
    };
var currentSelection;
$(document).ready(function() {
    @if ($editor)
        initializeEditor();
    @endif

    $('#table-of-contents').on('show hide click', function() {
        $(this).css('height', 'auto');
    });

    $('#recordContainer').on('mouseenter', 'span, a', null, function() {
        var fieldentry = $('#fieldsTOC .fieldEntry[data-match="' + $(this).attr('data-match') + '"]');
        $('#fieldsTOC').jstree('open_node', fieldentry);
        $('#fieldsTOC').jstree('select_node', fieldentry);
        return false;
     }).on('mouseleave', 'span, a', null, function() {
        $('#fieldsTOC').jstree('deselect_node', $('#fieldsTOC .fieldEntry[data-match="' + $(this).attr('data-match') + '"]'));
        return false;
     });

    updateFieldsTOCTree();
});

$(window).load(function() {
    shortcut.add('Ctrl+J', newTag);
    shortcut.add('Ctrl+K', closeTag);
    shortcut.add('Ctrl+Shift+J', closeAndOpenTag);
    shortcut.add('Ctrl+Shift+K', closeAllTags);
    shortcut.add('Ctrl+Return', saveRecord);
});

</script>
@endsection
