<?php

class Add_Templates {

	/**
	 * Make changes to the database.
	 *
	 * @return void
	 */
	public function up()
	{
        Schema::table('templates', function($table) {
            $table->create();
            $table->increments('id');
            $table->string('name');
            $table->text('data');
            $table->integer('owner')->unsigned();
            $table->foreign('owner')->references('id')->on('users');
            $table->integer('collection_id')->unsigned();
            $table->foreign('collection_id')->references('id')->on('collections');
            $table->timestamps();
            $table->engine = 'InnoDB';
        });
	}

	/**
	 * Revert the changes to the database.
	 *
	 * @return void
	 */
	public function down()
	{
        Schema::drop('templates');
	}

}
