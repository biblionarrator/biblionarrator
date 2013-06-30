<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Simply tell Laravel the HTTP verbs and URIs it should respond to. It is a
| breeze to setup your application using Laravel's RESTful routing and it
| is perfectly suited for building large applications and simple APIs.
|
| Let's respond to a simple GET request to http://example.com/hello:
|
|		Route::get('hello', function()
|		{
|			return 'Hello World!';
|		});
|
| You can even respond to more than one URI:
|
|		Route::post(array('hello', 'world'), function()
|		{
|			return 'Hello World!';
|		});
|
| It's easy to allow URI wildcards using (:num) or (:any):
|
|		Route::put('hello/(:any)', function($name)
|		{
|			return "Welcome, $name.";
|		});
|
*/

Route::any('admin/settings/?(:any)?', 'resources.systemsettings@index');
Route::any('admin/(:any)/?(:any)?', function($controller,$params=null) {
    return Controller::call('resources.'.$controller.'@index', (array) $params);
});
Route::get('record/new/template/(:any)', 'record@fromtemplate');
Route::get('record/(:any)?/duplicate', 'record@duplicate');
Route::get('record/(:any)?/delete', 'record@delete');
Route::post('record/(:num)/image', 'record@image');
Route::get('record/(:any)?/?(:any)?', 'record@index');
Route::post('record/(:any)?', 'record@index');
Route::get('resources/field/(:any)/styles', 'resources.field@styles');
Route::post('resources/field/(:any)/styles', 'resources.field@styles');
Route::get('resources/field/(:any)?/?editor', 'resources.field@editor');
Route::get('resources/field/(:any)?/?tree', 'resources.field@tree');
Route::any('user/settings/?(:any)?', 'resources.usersettings@index');
Route::any('resources/(:any)/(:any)?', function($controller,$params=null) {
    return Controller::call('resources.'.$controller.'@index', (array) $params);
});
Route::any('bookmarks/(:num)', 'bookmarks@index');
Route::controller(Controller::detect());
Route::get('about', 'home@about');

/*
|--------------------------------------------------------------------------
| Application 404 & 500 Error Handlers
|--------------------------------------------------------------------------
|
| To centralize and simplify 404 handling, Laravel uses an awesome event
| system to retrieve the response. Feel free to modify this function to
| your tastes and the needs of your application.
|
| Similarly, we use an event to handle the display of 500 level errors
| within the application. These errors are fired when there is an
| uncaught exception thrown in the application.
|
*/

Event::listen('404', function()
{
	return Response::error('404');
});

Event::listen('500', function()
{
	return Response::error('500');
});

/*
|--------------------------------------------------------------------------
| Route Filters
|--------------------------------------------------------------------------
|
| Filters provide a convenient method for attaching functionality to your
| routes. The built-in before and after filters are called before and
| after every request to your application, and you may even create
| other filters that can be attached to individual routes.
|
| Let's walk through an example...
|
| First, define a filter:
|
|		Route::filter('filter', function()
|		{
|			return 'Filtered!';
|		});
|
| Next, attach the filter to a route:
|
|		Route::get('/', array('before' => 'filter', function()
|		{
|			return 'Hello World!';
|		}));
|
*/

Route::filter('before', function()
{
	// Do stuff before every request to your application...
});

Route::filter('after', function($response)
{
	// Do stuff after every request to your application...
});

Route::filter('csrf', function()
{
	if (Request::forged()) return Response::error('500');
});

Route::filter('auth', function($action, $resource, $object)
{
//	if (Auth::guest()) return Redirect::to('login');

    if (!Authority::can($action, $resource, $object)) {
        return Redirect::to('home');
    }
});
