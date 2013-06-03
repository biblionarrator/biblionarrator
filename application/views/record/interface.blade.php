@layout('layouts/main')

@section('new-options')
    <li><a href="{{ URL::current() }}/duplicate" id="new-duplicate" class="self-url new-record">Duplicate record</a></li>
@endsection

@section('controlbar')
    <li><a href="#" id="toggleTOC" data-target="#table-of-contents" data-toggle="cookie-view" data-cookie="show_toc">TOC</a></li>
    @if (Authority::can('edit', 'Record'))
        <li><a href="#" id="toggleEditor" data-target="#editor-toolbar" data-toggle="cookie-view" data-cookie="show_editor">Editor</a></li>
    @endif
    <li><a href="#" id="toggle-tags" data-target="#recordContainer" data-toggle="cookie-view" data-cookie="show_tags" data-class="showtags">Show tags</a></li>
@if (Authority::can('edit', 'Record'))
    <li class="divider-vertical"></li>
    </ul>
    <ul id="editor-toolbar" class="nav">
        <li class="save-button"><a href="#" class="save-record caret-before">Save</a></li>
        <li class="save-button dropdown">
            <a href="#" id="dropdown-save" data-toggle="dropdown" class="caret-after dropdown-toggle"><b class="caret"></b></a>
            <ul class="dropdown-menu">
                <li><a href="#" class="save-record">Record</a></li>
                <li><a href="#" id="save-template" data-toggle="modal" data-target="#save-template-modal">As template</a></li>
            </ul>
        </li>
        <li class="dropdown">
            <a href="#" id="dropdown-options" data-toggle="dropdown" class="dropdown-toggle">Options <b class="caret"></b></a>
            <ul class="dropdown-menu">
                <li><a href="{{ URL::full() }}" id="record-reload" class="self-url" data-toggle="confirm" data-confirm-label="{{ __('confirmations.reloadrecordtitle') }}" data-confirm-body="{{ __('confirmations.reloadrecordbody') }}">Reload</a></li>
                <li class="divider"></li>
                <li><a href="#" id="upload-image" data-toggle="modal" data-target="#upload-image-modal">Upload image</a></li>
                <li class="divider"></li>
                <li><a target="_blank" href="{{ URL::merge(URL::current() . '/snippet', Input::all(), array('format' => 'htmlnolink')) }}" class="self-url" id="download-citations-html">Download citation (HTML)</a></li>
                <li><a target="_blank" href="{{ URL::merge(URL::current(), Input::all(), array('format' => 'htmlnolink')) }}" class="self-url" id="download-full-html">Download full record (HTML)</a></li>
                <li class="divider"></li>
                <li><a href="{{ URL::current() }}/delete" id="record-delete" data-toggle="confirm" data-confirm-label="{{ __('confirmations.deleterecordtitle') }}" data-confirm-body="{{ __('confirmations.deleterecordbody') }}" class="self-url">Delete</a></li>
            </ul>
        </li>
        <li class="divider-vertical"></li>
        <li id="tag-select" class="dropdown">
            <a href="#" id="tag" data-toggle="dropdown" class="dropdown-toggle">Tag <b class="caret"></b></a>
            <ul class="dropdown-menu">
                @foreach (Field::order_by('label', 'asc')->get() as $field)
                <li><a href="#">{{ $field->label }}</a></li>
                @endforeach
            </ul>
        </li>
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
            @if (Authority::can('edit', 'Record'))
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
            @if (Authority::can('edit', 'Record'))
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
        <div class="span6">
            <ul class="nav nav-tabs">
                <li class="active"><a href="#imagesPane" data-toggle="tab">Images</a></li>
                <li><a href="#linksPane" data-toggle="tab">Links</a></li>
            </ul>
            <div id="imagesPane" class="active image-gallery tab-pane">
                <ul class="image-gallery-thumbnails thumbnails">
                    @foreach ($record->images as $image)
                        <li data-id="{{ $image->id }}"><a class="thumbnail" href="{{ $image->location }}" data-id="{{ $image->id }}"><img src="{{ $image->location }}" title="{{ $image->description }}"/></a></li>
                    @endforeach
                </ul>
            </div>
            @include('components.linkpane')
        </div>
    </div>
@endsection

@section('form_modals')
@parent
<div id="save-template-modal" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="save-template-label" aria-hidden="true">
    <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
        <h3 id="save-template-label">Save as template</h3>
    </div>
    <div class="modal-body">
        @if (Auth::check())
        @foreach (Auth::user()->templates()->get() as $template)
        @endforeach
        @endif
        <label>Template name <input type="text" id="template-name"></input></label>
    </div>
    <div class="modal-footer">
        <button class="btn" data-dismiss="modal">Cancel</button>
        <button id="save-template-ok" class="btn btn-primary" data-dismiss="modal">Save</button>
    </div>
</div>
<div id="link-select" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="link-select-label" aria-hidden="true">
</div>
<div class="modal hide" id="upload-image-modal">
    <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal">&times;</button>
        <h3>Upload image</h3>
    </div>
    <div class="modal-body">
        <form method="POST" action="{{ URL::current() . '/image' }}" id="upload-image-modal-form" enctype="multipart/form-data">
            <label for="image">Image</label>
            <input type="file" placeholder="Choose an image to upload" name="image" id="image-image" />
            <label for="description">Description</label>
            <textarea placeholder="Describe your image in a few sentences" name="description" id="image-description" class="span5"></textarea>
        </form>
    </div>
    <div class="modal-footer">
        <button class="btn" data-dismiss="modal">Cancel</button>
        <button id="upload-image-ok" class="btn btn-primary" data-dismiss="modal">Upload</button>
    </div>
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
        "{{ $field->label }}": "{{ $field->schema }}_{{ $field->field }}",
    @endforeach
    };
var fieldlist = {
    @foreach (Field::all() as $field)
        "{{ $field->schema }}_{{ $field->field }}": {
            'label': "{{ $field->label }}",
            'link': {{ $field->link ? 'true' : 'false' }},
            'id': {{ $field->id }},
        },
    @endforeach
    };
var currentSelection;
$(document).ready(function() {
    @if (Authority::can('edit', 'Record'))
        initializeEditor();
        
        $('.new-record').click(function () {
            if ($('body').hasClass('unsaved-changes')) {
                $('#confirmLabel').text("{{ __('confirmations.newrecordtitle') }}");
                $('#confirmBody').text("{{ __('confirmations.newrecordbody') }}");
                $('#confirmOK').attr('data-callback', $(this).attr('id'));
                $('#confirm').modal('show');
            } else {
                $(this).trigger('confirmed');
            }
            return false;
        });
        $('.new-record').on('confirmed', function() {
            window.location = $(this).attr('href');
        });
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
