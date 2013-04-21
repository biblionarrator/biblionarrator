Installing Biblionarrator
=========================

Requirements
------------

Biblionarrator requires a server with the following:

* Apache, nginx, or another web server that supports CGI, FastCGI, or
  other compatible technology
* MySQL
* PHP 5.3+
* Mcrypt, MySQL, Tidy, and XSL PHP5 extensions
* If you are setting up a development installation, you will also need
  git

Installation procedure
----------------------

1) Download Biblionarrator. You can download a zip file from GitHub at
   https://github.com/jcamins/biblionarrator/archive/master.zip or
   clone the git repo:

    git clone git://git.cpbibliography.com/biblionarrator.git
or

    git clone git://github.com/jcamins/biblionarrator.git

    cd biblionarrator

2) Copy the example environment configuration (this example assumes
   that you want to call it "collection"):

    cp -R application/config/example application/config/collection

3) Generate an application key for your environment:

    sed -i "s/'key' => ''/'key' => '`pwgen -1 32`'/" application/config/collection/application.php

4) Create a MySQL database and database user for Biblionarrator (this
   assumes a database and user both called "bn_collection" and a password
   "mypassword"):

    mysql -u root -p
    [enter password when prompted]

    > GRANT ALL PRIVILEGES ON bn_collection.* TO bn_collection@localhost IDENTIFIED BY 'mypassword';
    > CREATE DATABASE bn_collection;

5) Record the MySQL credentials you just created in the database configuration
   file for your environment (application/config/collection/database.php in
   this example):

		'mysql' => array(
			'driver'   => 'mysql',
			'host'     => '127.0.0.1',
			'database' => 'bn_collection',
			'username' => 'bn_collection',
			'password' => 'mypassword',
			'charset'  => 'utf8',
			'prefix'   => '',
		),

6) Copy paths.php.dist to paths.php:

    cp paths.php.dist paths.php

7) Edit paths.php to reflect the domain you want to access Biblionarrator on
   (in this example, we will be using "http://collection.mylibrary.com"):

    $environments = array(
	    'collection' => array('http://collection.mylibrary.com'),
    );

If you are planning on accessing your installation only by IP, you can use the
following configuration:

    $environments = array(
	    'collection' => array('http://*'),
    );

8) Run the laravel migration to initialize your database:

    php artisan migrate:install --env=collection
    php artisan migrate --env=collection

9) Set permissions (this example assumes that your web server user
   is www-data:www-data):

    sudo chown -R www-data:www-data *
    sudo chown -w *
    sudo chown +w storage

10) Install the web server configuration files:

For nginx + fpm (you'll need fpm installed for this):

    sudo cp conf/biblionarrator-nginx.conf.sample /etc/nginx/sites-available/biblionarrator.conf
    sudo cp conf/biblionarrator-fpm-pool.conf.sample /etc/php5/fpm/pool.d/biblionarrator.conf
    sudo ln -s /etc/nginx/sites-available/biblionarrator.conf /etc/nginx/sites-enabled/
    [edit /etc/nginx/sites-available/biblionarrator.conf and adjust server name to match your domain]
    sudo service php5-fpm restart
    sudo service nginx restart

For Apache2:

    sudo cp conf/biblionarrator-apache2.conf.sample /etc/apache2/sites-available/biblionarrator.conf
    sudo ln -s /etc/apache2/sites-available/biblionarrator.conf /etc/apache2/sites-enabled/
    [edit /etc/apache2/sites-available/biblionarrator.conf and adjust server name to match your domain]
    sudo apache2ctl restart

11) Navigate to your biblionarrator URL, and login using username: admin@domain.com and password "admin".

12) Change your login and password in the Users administration page.

13) Enjoy Biblionarrator
