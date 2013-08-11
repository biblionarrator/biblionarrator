var opts = {
    engine: 'titan',
    titan: {
        'storage.keyspace': 'bntest',
        'storage.index.search.backend': 'lucene',
        'storage.index.search.directory': __dirname + '/data/titanft',
        'storage.index.search.client-only': false,
    },

    orient: {
        path: 'local:' + __dirname + '/data/orient',
    },

    tinker: {
        path: null,
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
    inspect = require('eyes').inspector({maxLength: false}),
    offload = require('../lib/graphoffloader');

describe('Graph offloader', function () {
    before(function () {
        require('../bin/gendata');
    });
    var list;
    it('successfully offloads a search', function (done) {
        this.timeout(5000);
        offload('search', { query: 'London', offset: 0, perpage: 20 }, function (results) {
            list = results.search.list;
            expect(results.search.count).to.equal(1);
            expect(results.search.records.length).to.equal(1);
            done();
        });
    });
    it('successfully offloads faceting', function (done) {
        offload('facet', list, function (facets) {
            expect(facets.facet['Record type']['place']).to.equal(1);
            done();
        });
    });
    it('successfully browses record links', function (done) {
        offload('linkbrowse', { id: list[0], offset: 0, perpage: 20 }, function (results) {
            expect(results.linkbrowse.count).to.equal(2);
            expect(results.linkbrowse.facets['*']['Is a']).to.equal(1);
            done();
        });
    });
});

g.V().remove();
