"use strict";
var ElasticSearchClient = require('elasticsearchclient');
var async = require('async');

function ESClient(config) {
    var self = this;
    var client;

    if (config.graphconf.engine === 'titan' && config.graphconf.titan["storage.index.search.backend"] === "elasticsearch") {
        self.inuse = true;
        self.hosts = config.graphconf.titan["storage.index.search.hostname"].split(',');
        client = new ElasticSearchClient({
            host: self.hosts[0],
            port: 9200,
            secure: false
        });
        self.indexname = config.graphconf.titan["storage.index.search.index-name"] || 'titan';
    }

    self.search = function (indexname, type, query, callback) {
        console.log(query);
        if (query.query.query_string) {
            config.graphstore.g.graph.indexQuerySync("search", query.query.query_string.query).vertices(function (err, recs) {
                var it = recs.iteratorSync();
                var list = new config.graphstore.g.ArrayList();
                var count = 0;
                async.whilst(function () { return (count++ < query.size && it.hasNextSync()); },
                function (cb) {
                    it.next(function (err, val) {
                        val.getElement(function (err, el) {
                            list.add(el, cb);
                        });
                    });
                },
                function (err, res) {
                    callback(err, new config.graphstore.g.gremlin.PipelineWrapper(config.graphstore.g.gremlin, list.iteratorSync()));
                });
            });
        } else {
            return client.search.apply(client, arguments);
        }
    };

    self.index = { };
    self.fields = [ ];
    for (var index in config.indexes) {
        self.index[config.indexes[index].id] = index;
        if (config.indexes[index].system && (config.indexes[index].type === 'text' || config.indexes[index].type === 'property') && index !== 'keyword') {
            self.fields.push(config.indexes[index].id);
        }
    }
    if (self.inuse) {
        var vorderquery = { query: { match_all: {} }, facets: { vorder: { statistical: { field: config.indexes['vorder'].id } } }, "size": 0 };
        self.search(self.indexname, 'vertex', vorderquery, function (err, data) {
            if (typeof err === 'undefined') {
                data = JSON.parse(data);
            }
            var static_relevance = '';
            if (typeof data.facets !== 'undefined') {
                var meanvorder = Math.round(data.facets.vorder.mean);
                var halfmeanvorder = Math.round(data.facets.vorder.mean / 2);
                static_relevance = config.indexes['vorder'].id + ':>' + meanvorder + '^2 OR ' + config.indexes['vorder'].id + ':[' + halfmeanvorder + ' TO ' + meanvorder + ']';
            } else {
                config.errorlog.write('Unable to get vorder facets!\n');
            }
            if (Object.keys(config.static_relevance_bumps).length > 0) {
                for (var field in config.static_relevance_bumps) {
                    var fieldquery = '';
                    for (var val in config.static_relevance_bumps[field]) {
                        fieldquery = fieldquery + ' ' + config.indexes[field].id + ':' + val + '^' + config.static_relevance_bumps[field][val];
                    }
                    static_relevance = static_relevance + fieldquery;
                }
            }
            if (static_relevance.length > 0) {
                self.boost = '(' + static_relevance + ')';
            }
        });
    }

    return self;
}

module.exports = ESClient;
