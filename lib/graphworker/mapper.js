"use strict";
var config = require('../../config/searchengine'),
    extend = require('extend'),
    graphstore = require('../graphstore'),
    g = graphstore();
var inspect = require('eyes').inspector({maxLength: false});

module.exports = function (input) {
    var records;
    var edges = [ ];
    var list = new g.ArrayList();
    var count = new g.HashMap();
    var recordtypes = new g.ArrayList();
    input.depth = input.depth || 1;
    /*var pipeline = g.v(input.records);
    while (input.depth-- > 0) {
        pipeline = pipeline.both();
    }*/
    g.v(input.landmarks).copySplit(g._().out().in(), g._().in().out()).fairMerge().groupCount().cap().orderMap(g.Tokens.decr).range(0, input.size).aggregate(list).iterate();
    var paths = g.v(input.landmarks).copySplit(g._().inE().outV().outE().inV(), g._().outE().inV().inE().outV()).fairMerge().retain(list).path('{it.id}{it.inV.next().id + "^" + it.label}{it.id}{it.inV.next().id + "^" + it.label}{it.id}').toJSON();
    records = g.start(list).toJSON();
    recordtypes = g.start(list).out('recordtype').property('key');

    var recmap = { };
    records.forEach(function (rec, index) {
        records[index].recordtype = recordtypes[index];
        records[index].weight = 0;
        recmap[rec._id] = index;
    });
    var edgeparts;
    var needed = { };
    var newedge;
    var edgemap = { };
    paths.forEach(function (path, index) {
        edgeparts = path[1].split('^');
        edgeparts[0] = parseInt(edgeparts[0], 10);
        newedge = { _inV: edgeparts[0], _label: edgeparts[1], _outV: edgeparts[0] === path[0] ? path[2] : path[0] };
        if (newedge._inV === newedge._outV) {
            console.log(path);
        }
        if (typeof edgemap[newedge._inV + '^' + newedge._label + '^' + newedge._outV] === 'undefined') {
            edges.push(newedge);
        }
        edgeparts = path[3].split('^');
        edgeparts[0] = parseInt(edgeparts[0], 10);
        newedge = { _inV: edgeparts[0], _label: edgeparts[1], _outV: edgeparts[0] === path[2] ? path[4] : path[2] };
        if (newedge._inV === newedge._outV) {
            console.log(path);
        }
        if (typeof edgemap[newedge._inV + '^' + newedge._label + '^' + newedge._outV] === 'undefined') {
            edges.push(newedge);
        }
        if (typeof recmap[path[0]] === 'undefined') {
            needed[path[0]] = true;
        }
        if (typeof recmap[path[2]] === 'undefined') {
            needed[path[2]] = true;
        }
        if (typeof recmap[path[4]] === 'undefined') {
            needed[path[4]] = true;
        }
    });
    if (typeof input.landmarks !== 'undefined') {
        input.landmarks.forEach(function (landmark) {
            if (typeof recmap[landmark] === 'undefined') {
                needed[landmark] = true;
            }
        });
    }
    if (Object.keys(needed).length > 0) {
        console.log(needed);
        recordtypes = new g.ArrayList();
        var newrecords = g.v(Object.keys(needed)).as('records').out('recordtype').property('key').store(recordtypes).back('records').toJSON();
        recordtypes = recordtypes.toJSON();
        newrecords.forEach(function (newrecord, index) {
            newrecord.recordtype = recordtypes[index];
            newrecord.weight = 0;
            recmap[newrecord._id] = records.push(newrecord) - 1;
        });
    }
    if (typeof input.landmarks !== 'undefined') {
        input.landmarks.forEach(function (landmark) {
            records[recmap[landmark]].landmark = true;
        });
    }
    var removes = [ ];
    for (var ii = 0; ii < edges.length; ii++) {
        edges[ii].source = recmap[edges[ii]._inV];
        edges[ii].target = recmap[edges[ii]._outV];
        if (typeof edges[ii].source === 'undefined' || typeof edges[ii].target === 'undefined') {
            removes.unshift(ii);
        } else {
            records[recmap[edges[ii]._inV]].weight += 1;
            records[recmap[edges[ii]._outV]].weight += 1;
        }
    }
    removes.forEach(function (ii) {
        edges.splice(ii, 1);
    });
    return { records: records, recmap: recmap, edges: edges, landmarks: input.landmarks };
};

module.exports.message = 'map';