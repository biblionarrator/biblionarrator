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

class Svc_Controller extends Base_Controller {
    public $restful = true;

    public function get_fields() {
        return Response::json(Field::structured_list());
    }

    public function get_styles() {
        return Response::json(Style::structured_list());
    }

    public function get_bndb_initializer_js() {
        return Response::make(View::make('svc.bndb_initializer_js', array( 'styles' => json_encode(Style::structured_list()), 'fields' => json_encode(Field::structured_list()) ))->render(), 200, array('Content-Type' => 'text/javascript'));
    }
}

