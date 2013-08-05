var opts = {
    engine: 'orient',
    titan: {
        'storage.keyspace': 'bntest',
        //'storage.index.search.directory': __dirname + '/data/titanes',
    },

    orient: {
        path: 'local:' + __dirname + '/data/orient',
    },

    tinker: {
        path: __dirname + '/data/tinker',
    },

    neo4j: {
        path: __dirname + '/data/neo4j',
    },
};

var expect = require('chai').expect,
    graphstore = require('../lib/graphstore'),
    g = graphstore(opts),
    fs = require('fs'),
    models = require('../models'),
    Record = require('../models/record');

describe('Record model', function () {
    var rec;
    var rec2;
    var rec3;
    var id;
    before(function () {
        rec = new Record({ 'data': JSON.stringify({ 'title': 'Great title', 'author': 'Good author' }), 'accno': 1001, 'type': 'book' });
        rec2 = new Record({ 'data': JSON.stringify({ 'title': 'Lousy title', 'author': 'Good author' }), 'accno': 1002, 'type': 'book' });
        rec3 = new Record({ 'data': JSON.stringify({ 'name': 'Good author' }), 'type': 'person' });
        rec2.save();
        rec3.save();
    });
    it('creation succeeds', function () {
        expect(rec.accno).to.equal(1001);
    });
    it('throws exception if transformed prior to save', function () {
        expect(rec.v).to.throw('record not saved');
    });
    it('saves successfully', function () {
        rec.save();
        expect(rec.id).to.be.defined;
        id = rec.id;
    });
    it('can be transformed after save', function () {
        expect(rec.v()).to.be.defined;
    });
    it('can be retrieved from graphstore directly', function () {
        expect(g.v(rec.id).toArray().length).to.equal(1);
    });
    it('can be by ID retrieved as a new model', function () {
        expect(Record.findOne({ id: id }).accno).to.equal(1001);
    });
    it('can be by filter retrieved as a new model', function () {
        expect(Record.findOne({ accno: 1001 }).accno).to.equal(1001);
    });
    it('list can be retrieved with a filter', function () {
        var books = Record.findAll({ type: 'book'});
        expect(books.length).to.equal(2);
    });
    it('is not found after being suppressed', function () {
        rec2 = Record.findOne({ id: rec2.id});
        rec2.suppress();
        expect(Record.findAll({'accno': 1002}).length).to.equal(0);
    });
    it('can be retrieved after deletion if specifically requested', function () {
        expect(Record.findOne({ id: rec2.id, deleted: 1}).accno).to.equal(1002);
        expect(Record.findOne({'accno': 1002, deleted: 1}).accno).to.equal(1002);
        expect(Record.findAll({'accno': 1002, deleted: 1}).length).to.equal(1);
    });
    it('is truly gone after being destroyed', function () {
        rec2 = Record.findOne({ id: rec2.id, deleted: 1});
        rec2.destroy();
        expect(g.V().toArray().length).to.equal(2);
    });
    it('does not explode when searching for a single nonexistent record', function () {
        rec2 = Record.findOne({ id: 1234});
        expect(rec2).to.not.be.defined;
    });
    it('does not explode when searching for multiple nonexistent records', function () {
        expect(Record.findAll({ accno: '9801234'}).length).to.equal(0);
    });
    it('can be linked to another record', function () {
        rec.link('by', rec3);
        expect(g.E().toArray().length).to.equal(1);
    });
    it('can be edited', function () {
        rec.accno = 1005;
        rec.save();
    });
    it('does not create extra records on editing', function () {
        expect(g.V().toArray().length).to.equal(2);
    });
});

rmdirR(__dirname + '/data/orient');
rmdirR(__dirname + '/data/tinker');
rmdirR(__dirname + '/data/neo4j');
rmdirR(__dirname + '/data/titanes');

function rmdirR(path) {
    if( fs.existsSync(path) ) {
        fs.readdirSync(path).forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.statSync(curPath).isDirectory()) { // recurse
                rmdirR(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};
