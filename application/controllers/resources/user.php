<?php

class Resources_User_Controller extends Resource_Controller {

    public $interface_columns = array(
        'name' => array('type' => 'string', 'label' => 'Name', 'required' => true, 'sWidth' => '30%'),
        'email' => array('type' => 'string', 'label' => 'Email', 'required' => true, 'sWidth' => '30%'),
        'collection' => array('type' => 'options', 'target' => 'collection_id', 'options' => 'collectionlist', 'label' => 'Collection', 'required' => false, 'sWidth' => '20%'),
    );
    public $required_columns = array('name', 'email', 'collection_id');
    public $resourceClass = 'User';

}

