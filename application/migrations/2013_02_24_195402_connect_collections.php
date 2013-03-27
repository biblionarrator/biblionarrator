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

class Connect_Collections {

	/**
	 * Make changes to the database.
	 *
	 * @return void
	 */
	public function up()
	{
        Schema::table('users', function($table) {
            $table->integer('collection_id')->unsigned();
        });
        DB::table('users')->update(array('collection_id' => 1));
        Schema::table('users', function($table) {
            $table->foreign('collection_id')->references('id')->on('collections');
        });
        Schema::table('records', function($table) {
            $table->integer('collection_id')->unsigned();
        });
        DB::table('records')->update(array('collection_id' => 1));
        Schema::table('records', function($table) {
            $table->foreign('collection_id')->references('id')->on('collections');
        });
	}

	/**
	 * Revert the changes to the database.
	 *
	 * @return void
	 */
	public function down()
	{
        Schema::table('users', function($table) {
            $table->drop_column('collection_id');
        });
        Schema::table('records', function($table) {
            $table->drop_column('collection_id');
        });
	}

}
