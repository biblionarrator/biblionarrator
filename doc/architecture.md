General overview
================

There are three classes of object in Biblionarrator:

Record objects
-------------

The record viewer/editor interface is accessed at [GET] /record/{ID}, and various
formats can be accessed at [GET] /record/{ID}/{FORMAT}

Other than the default view being the interface, and having a path of /record/,
Record objects behave the same as Administrative objects.

Administrative objects
---------------------

Administrative objects include:

* Collection
* Field
* RecordType
* Style
* SystemSettings - *NOTE*: not yet normalized to use this API
* Template
* User
* UserSettings - *NOTE*: not yet normalized to use this API


Administrative objects are accessed at /resources/{OBJECT}, and have
the following methods:

* [GET] /resources/{OBJECT} (JSON request) - retrieve a JSON listing (suitable
  for direct ingestion by DataTable) of all objects of that type.
* [GET] /resources/{OBJECT} (regular request) - show the administration interface
  for the object type.
* [GET] /resources/{OBJECT}/{ID} (JSON request) - retrieve the object in JSON
  format
* [GET] /resources/{OBJECT}/{ID} (regular request) - show the administrative edit
  interface for the specified object.
* [POST] /resources/{OBJECT}/{ID} - save the specified object, or create a new
  object if {ID} is not set.
* [DELETE] /resources/{OBJECT}/{ID} - delete the specified object.

RecordList objects
-----------------

RecordList objects include:

* Search
* Bookmarks

RecordList objects are accessed at /{OBJECT}/, and have the following methods:

* [GET] /{OBJECT}/{FORMAT}/{TYPE} - retrieves the list
* [GET] /{OBJECT}/{FORMAT}/{TYPE} - retrieves the list (optionally as
  snippets, if {TYPE} is set to "snippet") in the specified format. If {FORMAT}
  is blank, retrieve the interface
