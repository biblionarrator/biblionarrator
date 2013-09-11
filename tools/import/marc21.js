#!/usr/bin/env node
var JSONImporter = require('bn-importers/lib/json'),
    graphstore = require('../../src/node_modules/bngraphstore'),
    models = require('../../src/models'),
    Record = models.Record,
    RecordType = models.RecordType,
    marcformat = require('../../src/lib/formats').marc21;
var inspect = require('eyes').inspector({maxLength: false});

graphstore.autocommit = false;

var importer = new JSONImporter({
    files: [ process.argv[2] ]
});

var linkcount = 0;
var recordcount = 0;
var mainrecordcount = 0;

var linklookup = { };

importer.on('record', function (record, mypromise) {
    var rec = new Record({ format: 'marc21', data: record });
    rec.save();
    var links = marcformat.links(record);
    links.forEach(function (link) {
        var target = linklookup[link.key];
        if (typeof target === 'undefined') {
            target = Record.findOne({ key: link.key });
        }
        if (typeof target === 'undefined' && typeof link.vivify === 'object') {
            target = new Record(link.vivify);
            target.save();
            recordcount++;
        }
        if (typeof target !== 'undefined') {
            linklookup[link.key] = linklookup[link.key] || target.id;
            rec.link(link.link, target);
            linkcount++;
        }
    });
    mainrecordcount++;
    recordcount++;
    mypromise.resolve();
});

importer.on('commit', function (promise) {
    graphstore.getDB().commitSync();
    promise.resolve(true);
});

importer.on('done', function () {
    console.log('Processed ' + mainrecordcount + ' and created ' + recordcount + ' records/' + linkcount + ' links');
    process.exit();
});
