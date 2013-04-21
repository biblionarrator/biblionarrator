<?php
/* Copyright (c) 2013 C & P Bibliography Services
 *
 * This file is part of Biblionarrator.
 *
 * Biblionarrator is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

class Resource_Controller extends Base_Controller {
    public $restful = true;

    public $safe_delete = false;
    public $interface_columns = array();
    public $required_columns = array();
    public $optional_columns = array();
    public $hashed_columns = array();
    public $fk_columns = array();
    public $resourceClass;
    public $admin_view;

    public function __construct()
    {
        parent::__construct();
        $this->filter('before', 'auth', array('manage', $this->resourceClass, call_user_func($this->resourceClass . '::find', Input::get('id'))));
    }

    public function get_index($id = null) {
        if (isset($id)) {
            $resource = call_user_func($this->resourceClass . '::find', $id);
            if (Request::accepts('application/json')) {
                return $this->_show($resource);
            } else {
                return $this->_edit($resource);
            }
        } else {
            if (Request::accepts('application/json')) {
                return $this->_index();
            } else {
                return $this->_admin();
            }
        }
    }

    public function post_index($id = null) {
        $json = $this->_update($id);
        if (Request::accepts('application/json')) {
            return $json;
        } else {
            return Redirect::to('/admin/' . strtolower($this->resourceClass));
        }
    }

    public function delete_index($id = null) {
        if (isset($id)) {
            $resource = call_user_func($this->resourceClass . '::find', $id);
            if (isset($resource)) {
                $json = $this->_delete($resource);
                if (Request::accepts('application/json')) {
                    return $json;
                }
            }
        }
        return Redirect::to('/admin/' . strtolower($this->resourceClass));
    }

    protected function _index() {
        $resourcelist = array();
        if (Auth::user()->has_role('administrator')) {
            $resources = call_user_func($this->resourceClass . '::all');
        } else if ($this->resourceClass === 'Collection') {
            $resources = array(Auth::user()->collection);
        } else {
            $resources = call_user_func(array(Auth::user()->collection, strtolower($this->resourceClass) . 's'))->get();
        }
        foreach ($resources as $resource)
        {
            array_push($resourcelist, $resource->to_array());
        }

        $resources = array( "iTotalRecords" => count($resourcelist),
        "iTotalDisplayRecords" => count($resourcelist),
        "aaData" => $resourcelist);

        return Response::json($resources);
    }

    protected function _show($resource) {
        if (isset($resource)) {
            return Response::json($resource->to_array());
        } else {
            return Response::error('404');
        }
    }

    protected function _update($id) {
        if (isset($id) && $id !== 'new' && $id !== 'undefined' && $id !== '') {
            $resource = call_user_func($this->resourceClass . '::find', $id);
            if (is_null($resource) || (property_exists($resource, 'deleted') && $resource->deleted)) {
                return 'Invalid ID';
            }
        } else {
            $resource = new $this->resourceClass;
        }
        foreach ($this->required_columns as $column) {
            if (Input::has($column)) {
                $resource->set_attribute($column, Input::get($column));
            }
            if (is_null($resource->get_attribute($column))) {
                return 'Missing data for ' . $column;
            }
        }
        foreach ($this->optional_columns as $column) {
            if (Input::has($column)) {
                $resource->set_attribute($column, Input::get($column));
            }
        }
        foreach ($this->hashed_columns as $column) {
            if (Input::has($column)) {
                $resource->set_attribute($column, Hash::make(Input::get($column)));
            }
        }
        foreach ($this->fk_columns as $column) {
            if (Input::has("$column.0")) {
                call_user_func(array(call_user_func(array($resource, $column . 's')), 'delete'));
                $ii = 0;
                while (Input::has("$column.$ii")) {
                    call_user_func(array(call_user_func(array($resource, $column . 's')), 'attach'), Input::get("$column.$ii"));
                    $ii++;
                }
            }
        }
        $resource->save();
        return Response::json($resource->to_array());
    }

    protected function _purge($resource) {
        if (isset($resource)) {
            foreach ($this->fk_columns as $fk) {
                $fk .= 's';
                $resource->$fk()->delete();
            }
            $resource->delete();
            return Response::json($resource->id);
        }
    }

    protected function _delete($resource) {
        if (isset($resource)) {
            if ($this->safe_delete) {
                $resource->deleted = true;
                $resource->save();
            } else {
                $this->_purge($resource);
            }
            return Response::json($resource->id);
        }
    }

    protected function _admin() {
        Asset::add('datatables-js', 'lib/js/jquery.dataTables.min.js');
        Asset::add('datatables-fnreloadajax', 'js/dataTables.fnReloadAjax.js');
        Asset::add('datatables-bootstrap-paging', 'js/dataTables.bootstrap-paging.js');
        Asset::add('jeditable', 'lib/js/jquery.jeditable.min.js');
        Asset::add('admin-table-js', 'js/admin-table.js');
        Asset::add('jstree', 'lib/js/jstree/jquery.jstree.js');
        Asset::add('styleEditor', 'js/styleEditor.js');
        Asset::add('admin-tree-js', 'js/admin-tree.js');

        Breadcrumbs::add('Manage ' . strtolower($this->resourceClass) . 's');
        if (is_null($this->admin_view)) {
            $this->admin_view = 'admin.' . strtolower($this->resourceClass) . 's';
        }

        return View::make($this->admin_view)->with('resourcetype', strtolower($this->resourceClass))->with('columns', json_encode($this->interface_columns));
    }

    protected function _edit($resource) {
        if (is_null($resource)) {
            return Redirect::to('/admin/' . strtolower($this->resourceClass));
        } else {
            return View::make('admin.edit.' . strtolower($this->resourceClass))->with('resource', $resource);
        }
    }
}
