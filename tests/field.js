var expect = require('chai').expect,
    config = require('./lib/config'),
    models = require('../src/models'),
    Field = models.Field,
    environment = require('../src/lib/environment'),
    datastore = environment.datastore;

describe('Field model', function () {
    var field;
    before(function (done) {
        environment.fields = [ ];
        datastore.namespace = 'test#';
        done();
    });
    it('retrieves no model when db is empty', function (done) {
        Field.all(function (err, results) {
            expect(err).to.equal(null);
            expect(results).to.deep.equal([]);
            done();
        });
    });
    it('retrieves nothing when invalid field is requested', function (done) {
        Field.findOne('nosuchfield', function (err, results) {
            expect(err).to.equal(null);
            expect(results).to.deep.equal(null);
            done();
        });
    });
    it('saves field successfully', function (done) {
        field = new Field({ schema: 'testschema', name: 'testfield', css: 'font-weight: bold;' });
        field.save();
        Field.findOne('testschema_testfield', function (err, results) {
            expect(results).to.deep.equal(field);
            done();
        });
    });
    it('deletes field successfully', function (done) {
        field.del();
        Field.all(function (err, results) {
            expect(err).to.equal(null);
            expect(results).to.deep.equal([]);
            done();
        });
    });
    it('loads multiple fields successfully', function (done) {
        field = new Field({ schema: 'testschema', name: 'testfield', css: 'font-weight: bold;' });
        field.save();
        field = new Field({ schema: 'testschema', name: 'testfield2', css: 'font-style: italic;' });
        field.save();
        Field.all(function (err, results) {
            expect(err).to.equal(null);
            expect(Object.keys(results).length).to.equal(2);
            for (var idx in results) {
                results[idx].del();
            }
            done();
        });
    });
    it('deletes all records from loop successfully', function (done) {
        Field.all(function (err, results) {
            expect(err).to.equal(null);
            expect(results).to.deep.equal([]);
            done();
        });
    });
});

