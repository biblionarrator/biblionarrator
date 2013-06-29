var expect = require('chai').expect,
    request = require('superagent').agent(),
    fs = require('fs'),
    marked = require('marked'),
    testhost = require('../server').testhost();


describe('install markdown document', function() {
    var res;
    before(function (done) {
        request.get(testhost + '/doc/install').end(function(r) {
            res = r;
            done();
        });
    });
    it('has content-type text/html', function() {
        expect(res.type).to.equal('text/html');
    });
    it('matches source data', function(done) {
        fs.readFile('doc/install.md', 'utf8', function(err, data) {
            expect(res.text).to.equal(marked(data));
            done();
        });
    });
});

describe('upgrades text document', function() {
    var res;
    before(function (done) {
        request.get(testhost + '/doc/upgrades').end(function(r) {
            res = r;
            done();
        });
    });
    it('has conte-type text/plain', function() {
        expect(res.type).to.equal('text/plain');
    });
    it('matches source data', function(done) {
        fs.readFile('doc/upgrades', 'utf8', function(err, data) {
            expect(res.text).to.equal(data);
            done();
        });
    });
});

describe('licensing html document', function() {
    var res;
    before(function (done) {
        request.get(testhost + '/doc/licensing').end(function(r) {
            res = r;
            done();
        });
    });
    it('has content-type text/html', function() {
        expect(res.type).to.equal('text/html');
    });
    it('matches source data', function(done) {
        fs.readFile('doc/licensing.html', 'utf8', function(err, data) {
            expect(res.text).to.equal(data);
            done();
        });
    });
});
