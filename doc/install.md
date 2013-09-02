Installing Biblionarrator
=========================

Requirements
------------

Biblionarrator requires a server with the following:

* Node.js 0.8+
* npm (node package manager)
* grunt
* Redis

These instructions assume you will be using Titan with Apache Cassandra
and ElasticSearch 0.90+. However, depending on your desired configuration, you
may not need one or both of them.

If you are setting up a development environment, you will also need git.

Installation procedure
----------------------

0) Install Java 6 or Java 7 from Oracle following the procedure appropriate to
   your operating system.

1) Install Node.js from http://nodejs.org/

   A PPA is available for Debian/Ubuntu, and Node.js is available for
   Fedora/CentOS/RHEL from the EPEL repository.

2) Install Cassandra by following the instructions at http://www.datastax.com/documentation/gettingstarted/index.html

3) Install ElasticSearch from http://www.elasticsearch.org/overview/#installation

4) Install redis from http://redis.io/
   
   On Debian/Ubuntu:

    sudo apt-get install redis-server

   Redis is available for Fedora/CentOS/RHEL from the EPEL repository.

5) Install grunt by running:

    sudo npm install -g grunt-cli

6) Download Biblionarrator. You can download a zip file from GitHub at
   https://github.com/biblionarrator/biblionarrator/archive/master.zip or
   clone the git repo:

    git clone git://github.com/biblionarrator/biblionarrator.git

    cd biblionarrator

7) Install Biblionarrator's dependencies using npm

    npm install

8) Configure Biblionarrator with grunt

    grunt

   The above command will run all the unit tests, check the code for violations,
   and generate API documentation. If you do not want to do those three things
   in addition to the regular build, you can use:

    grunt build

9) Run the grunt-based installer and answer the questions based on your planned
   configuration

    grunt install

   Make any further changes your configuration requires to the configuration files
   in config/

10) Start Biblionarrator
    
    node bin/start.js

11) Enjoy Biblionarrator
