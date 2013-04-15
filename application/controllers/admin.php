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

class Admin_Controller extends Base_Controller {

    public $restful = true;

    public function get_index() {
        Breadcrumbs::add('Administration');
        return View::make('admin.index');
    }

    public function get_templates()
    {
        Asset::add('fieldstyles', 'css/fields.css');
        Asset::add('datatables-js', 'js/jquery.dataTables.min.js');
        Asset::add('datatables-bootstrap-paging', 'js/dataTables.bootstrap-paging.js');
        return View::make('admin.templates')->with('templates', Template::all());
    }
}
