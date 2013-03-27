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

class Resources_Collection_Controller extends Resource_Controller {

    public $interface_columns = array(
        'name' => array('type' => 'string', 'label' => 'Name', 'required' => true, 'sWidth' => '50%'),
        'security' => array('type' => 'string', 'label' => 'Security', 'required' => true, 'sWidth' => '20%'),
    );

    public $required_columns = array('name', 'security');
    public $resourceClass = 'Collection';

}

