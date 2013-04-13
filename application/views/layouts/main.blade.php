<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{{ $title }}</title>
        <script src="/js/html5shiv.js"></script>
        <script src="/js/html5shiv-printshiv.js"></script>
        <!--[if lt IE 9]>
            <link rel="stylesheet" type="text/css" href="/css/style-ie.css" />
        <![endif]-->

        {{ Asset::styles() }}
        @section('styles')
        @yield_section
    </head>

    <body>
        <nav class="navbar navbar-fixed-top">
            <div class="navbar-inner">
                <div class="container-fluid">
                    <a class="brand" href="/">Biblionarrator</a>
                    <div class="navbar-controls">
                        <ul class="nav pull-left">
                            @section('navigation')
                            @yield_section
                            <li class=""><a href="/record">Record</a></li>
                            <li class=""><a class="caret-before" href="/search">Search</a></li>
                            <li class="hidden-phone dropdown">
                                <a href="#" class="dropdown-toggle caret-after" data-toggle="dropdown"><b class="caret"></b></a>
                                <ul class="dropdown-menu">
                                    <li><span>Saved searches</span></li>
                                </ul>
                            </li>
                            <li class="divider-vertical"></li>
                            <li class="visible-desktop visible-tablet"><form class="navbar-search" action="/search" method="get" accept-charset="UTF-8">
                                <input type="text" class="search-query" name="q" placeholder="Quick search" value="@if (isset($query)){{ $query }}@endif"></input><button class="search-button" type="submit"><i class="icon-search"></i></button>
                            </form></li>
                        </ul>
                        <ul class="nav pull-right">
                            <li class="dropdown visible-desktop"><a href="/bookmarks"><i class="icon-bookmark"></i><span class="bookmark-count">{{ Bookmarks::make()->size() > 0 ? Bookmarks::make()->size() : ''}}</span></a>
                            <ul id="bookmark-dropdown" class="dropdown-menu"><li><span id="bookmark-message"></span></li></ul>
                            </li>
                            <li class="dropdown">
                                <a href="/user/login" class="hidden-desktop"><i class="icon-user"></i></a>
                                <a href="#" class="dropdown-toggle visible-desktop" data-toggle="dropdown">
                                    <i class="icon-user"></i><b class="caret"></b>
                                </a>
                                <ul class="dropdown-menu">
                                    @if ( Auth::guest() )
                                        <form id="navbarLogin" action="/user/login" method="post" accept-charset="UTF-8">
                                            <input id="navbarLoginUser" type="text" name="username" placeholder="Username"></input>
                                            <input id="navbarLoginPassword" type="password" name="password" placeholder="Password"></input>
                                            <input type="hidden" name="redirect" value="{{ URI::current() }}"></input>
                                            <button id="navbarLoginSubmit" class="btn btn-primary btn-small" type="submit">Sign in</button>
                                        </form>
                                    @else
                                    <li><span>{{ Auth::user()->email }}</span></li>
                                    <li><a href="/user/preferences">Preferences</a></li>
                                    <li class="divider"></li>
                                    <li><a href="/user/logout">Sign out</a></li>
                                    @endif
                                </ul>
                            </li>
                            @if ( Auth::check() )
                            <li class="dropdown visible-desktop">
                                <a href="#" class="dropdown-toggle" data-toggle="dropdown"><i class="icon-wrench"></i><b class="caret"></b></a>
                                <ul class="dropdown-menu">
                                    <li><a href="/admin">Home</a></li>
                                    @if ( Authority::can('manage', 'Field') )
                                    <li><a href="/admin/field">Fields</a></li>
                                    @endif
                                    @if ( Authority::can('manage', 'User') )
                                    <li><a href="/admin/user">Users</a></li>
                                    @endif
                                    @if ( Authority::can('manage', 'Collection') )
                                    <li><a href="/admin/collection">Collections</a></li>
                                    @endif
                                    @if ( Authority::can('manage', 'RecordType') )
                                    <li><a href="/admin/recordtype">Record types</a></li>
                                    @endif
                                </ul>
                            </li>
                            @endif
                            <li class="dropdown visible-desktop">
                                <a href="#" class="dropdown-toggle" data-toggle="dropdown"><i class="icon-question-sign"></i><b class="caret"></b></a>
                                <ul class="dropdown-menu">
                                    <li><label class="checkbox"><input type="checkbox" id="show-help" data-toggle="cookie-view" data-cookie="show_help" data-class="show-help" data-target="body">Show help</input></label></li>
                                    <li><a href="/home/about">About</a></li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div id="controlbar" class="navbar-inner">
                <div class="container-fluid">
                    <ul class="nav">
                        @section('controlbar')
                        @yield_section
                    </ul>
                </div>
            </div>
        </nav>

        <div id="content" class="container-fluid">
            @section('headbar')
                <div class="row-fluid toolbar-row">
                    <div class="span10 pull-right">
                        @yield('toolbar')
                    </div>
                    <div class="span2 pull-left">
                        @yield('sidetoolbar')
                    </div>
                </div>
            @yield_section
            @section('main')
                <div class="row-fluid">
                    <div class="span10 pull-right">
                        @yield('content')
                    </div>
                    <div class="span2 pull-left">
                        @yield('sidebar')
                    </div>
                </div>
            @yield_section
            @section('footbar')
                <div class="row-fluid footbar-row">
                    <div class="span10 pull-right">
                        @yield('contentfootbar')
                    </div>
                    <div class="span2 pull-left">
                        @yield('sidefootbar')
                    </div>
                </div>
            @yield_section
        </div> <!-- /container -->
        <nav class="navbar navbar-fixed-bottom hidden-desktop">
            <div class="navbar-inner">
            <ul class="nav">
                <li><a href="/bookmarks">Bookmarks
                    <span class="bookmark-count"><?php strlen(Session::get('bookmarks')) > 0 ? count(explode(',', Session::get('bookmarks'))) : '' ?></span></a></li>

                <li><a href="/user">
                @if (Auth::guest())
                    Log in
                @else
                    User preferences
                @endif
                </a></li>
                @if (Auth::check())
                <li><a href="/admin">System administration</a></li>
                @endif
                <li><a href="/help">Help</a></li>
            </ul>
            </div>
        </nav>
        <footer>
        {{ $breadcrumb }}
        <p class="copyright">&copy; C &amp; P Bibliography Services 2013</p>    
        </footer>
        @section('form_modals')
            <div id="confirm" data-autoclose="true" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="confirmLabel" aria-hidden="true">
                <div class="modal-header">
                    <h3 id="confirmLabel"> confirmation</h3>
                </div>
                <div id="confirmBody" class="modal-body">
                </div>
                <div class="modal-footer">
                    <button id="confirmCancel" class="btn" data-dismiss="modal" aria-hidden="true">No</button>
                    <button id="confirmOK" class="btn btn-primary btn-ok">Yes</button>
                </div>
            </div>
        @yield_section
        
        {{ Asset::scripts() }}
        @section('scripts')
        @yield_section
    </body>
</html>
