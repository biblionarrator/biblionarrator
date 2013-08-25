"use strict";
var sharedview = require('../lib/sharedview'),
    models = require('../models'),
    RecordList = models.RecordList,
    Query = models.Query,
    paginator = require('../lib/paginator'),
    socketserver = require('../lib/socketserver'),
    Q = require('q'),
    searchengine = require('../lib/searchengine'),
    extend = require('extend');
var graphstore = require('../lib/graphstore'),
    g = graphstore();
var offload = require('../lib/graphoffloader'),
    cache = require('../lib/cache'),
    inspect = require('eyes').inspector({maxLength: false});

function prepareQuery(req) {
    var querystring = req.query.q || '';
    if (typeof req.query.facet === 'string') {
        querystring = querystring + ' ' + req.query.facet;
    } else if (typeof req.query.facet !== 'undefined') {
        querystring = querystring + ' ' + req.query.facet.join(' ');
    }
    return querystring;
}

exports.view = function(req, res) {
    var query = new Query(prepareQuery(req), 'qp');
    var offset = parseInt(req.query.offset, 10) || 0;
    var perpage = parseInt(req.query.perpage, 10) || 20;
    
    Q.all([sharedview()]).then(function(data) {
        data.url = req.url.replace(/&?layout=[^&]*/, '');
        data.view = 'results';
        data.query = query;
        searchengine.search({ query: query, offset: offset, perpage: perpage }, function (list) {
            var layout = 'list/interface';
            if (typeof req.query.layout !== 'undefined' && req.query.layout === 'none') {
                data.layout = false;
                layout = 'partials/results';
            }
            extend(data, list);
            if (req.query.format === 'map') {
                req.query.records = [ ];
                data.records.forEach(function (rec) {
                    req.query.records.push(rec.id);
                });
                return exports.map(req, res);
            };
            if (data.count > data.records.length) {
                data.paginator = paginator(offset, data.count, perpage, req.path, req.query);
            }
            data.sortings = { available: [ { schema: 'mods', field: 'title', label: 'Title' } ] };
            res.render(layout, data, function(err, html) {
                if (err) {
                    res.send(404, err);
                } else {
                    res.send(html);
                }
            });
            // Preseed next page
            searchengine.search({ query: query, offset: offset + perpage, perpage: perpage });
        }, function (data) {
            socketserver.announcePublication(encodeURIComponent('facets^' + query.canonical), data);
        });
    }, function (err) { res.send(404, err); });
};

exports.map = function (req, res) {
    if (typeof req.query.landmark === 'string') {
        req.query.landmark = [ req.query.landmark ];
    }
    var options = {
        landmarks: req.query.landmark,
        records: req.query.records || req.query.landmark,
        depth: req.query.depth || 1,
        size: req.query.size || 60
    };
    var mapkey;
    if (typeof req.query.landmark !== 'undefined') {
        mapkey = encodeURIComponent('landmarkmap^' + req.query.landmark.join('^'));
    } else {
        mapkey = encodeURIComponent('recordmap^' + req.query.records.join('^'));
    }
    cache.get(mapkey, function (cacherecerror, cachemap) {
        if (cacherecerror || cachemap === null) {
            offload('map', options, function (results) {
                res.json(results.map);
                cache.set(mapkey, results.map, 600);
            });
        } else {
            res.json(cachemap);
        }
    });
};
