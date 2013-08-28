"use strict";
var extend = require('extend'),
    graphstore = require('../graphstore'),
    config = graphstore.config,
    g = graphstore(),
    Text = g.java.import('com.thinkaurelius.titan.core.attribute.Text');
var inspect = require('eyes').inspector({maxLength: false});

var analysis = { };
var optimizer = { };

var dbcallbacks = {
    'linkbrowse': function (object, pipeline) {
        analysis.linkbrowse = object[1];
        return g.v(object[1]).both().dedup();
    },
    'limit': function (object, pipeline) {
    },
    'offset': function (object, pipeline) {
    }
};

var operations = {
    'edge': function (pipeline, label, value) {
        return pipeline.out(label).filter("{it.key=='" + value + "'}").back(2);
    },
    'inverseedge': function (pipeline, label, value) {
        return pipeline.in(label).filter("{it.key=='" + value + "'}").back(2);
    },
};

module.exports = function (input) {
    analysis = { };
    optimizer = {
        gremlinops: [ ]
    };
    if (graphstore.getEngine() === 'titan') {
        optimizer.vertexquery = graphstore.getDB().querySync();
    }
    var records;
    var count = new g.HashMap();
    var list = new g.ArrayList();
    var summary = 'All records';

    var pipeline = searchTree(input.query.ast, g.V());
    if (typeof optimizer.vertexquery !== 'undefined') {
        pipeline = terminateVertexQuery(pipeline);
    }
    records = pipeline.aggregate(list).range(input.offset, input.offset + input.perpage - 1).toJSON();
    list = list.toJSON();
    if (analysis.linkbrowse) {
        summary = 'Links for ' + analysis.linkbrowse;
    } else if (input.query.canonical) {
        summary = 'Search: ' + input.query.canonical;
    }
    return extend({
        records: records,
        more: true,
        list: list,
        summary: summary
    }, analysis);
};

module.exports.message = 'search';

function searchTree(tree, pipeline) {
    if (typeof tree === 'undefined') {
        return pipeline;
    }
    switch (tree[0]) {
    case 'AND':
        if (typeof optimizer.vertexquery !== 'undefined') {
            return pipeline;
        } else {
            return pipeline.and(searchTree(tree[1], g._()), searchTree(tree[2], g._()));
        }
    case 'OR':
        pipeline = terminateVertexQuery(pipeline);
        return pipeline.or(searchTree(tree[1], g._()), searchTree(tree[2], g._()));
    case 'NOT':
        pipeline = terminateVertexQuery(pipeline);
        return pipeline.except(searchTree(tree[1], pipeline));
    case 'HAS':
    case 'FACET':
        var value = searchTree(tree[2], null);
        switch (config.indexes[tree[1]].type) {
        case 'property':
            if (typeof optimizer.vertexquery !== 'undefined') {
                optimizer.vertexquery = optimizer.vertexquery.hasSync(tree[1], value);
                return pipeline;
            } else {
                return pipeline.has(tree[1], value).back(1);
            }
        case 'text':
            if (typeof optimizer.vertexquery !== 'undefined') {
                value.split(' ').forEach(function (value) {
                    optimizer.vertexquery = optimizer.vertexquery.hasSync(tree[1], Text.CONTAINS, value);
                });
                return pipeline;
            } else if (graphstore.getEngine() === 'titan') {
                var verts = new g.ArrayList();
                g.start(graphstore.getDB().querySync().hasSync(tree[1], Text.CONTAINS, value).verticesSync()).aggregate(verts).iterate();
                return pipeline.retain(verts);
            } else {
                return pipeline.filter("{it.data?.count('" + value + "') >= 1}");
            }
        case 'dbcallback':
            pipeline = terminateVertexQuery(pipeline);
            return dbcallbacks[tree[1]](tree[2], pipeline);
        default:
            if (typeof optimizer.vertexquery !== 'undefined') {
                optimizer.gremlinops.push(config.indexes[tree[1]], tree[1], value);
            } else {
                return operations[config.indexes[tree[1]]](pipeline, tree[1], value);
            }
        }
    case 'PHRASE':
        return tree[1];
    case 'ATOM':
        return tree.slice(1).join(' ');
    case 'FLOAT':
        pipeline = searchTree(tree[1], pipeline);
        return searchTree(tree[2], pipeline);
    }
    return pipeline;
}

function terminateVertexQuery(pipeline) {
    if (typeof optimizer.vertexquery !== 'undefined') {
        pipeline = g.start(optimizer.vertexquery.verticesSync().iteratorSync());
        var op;
        while (op = optimizer.gremlinops.pop()) {
            pipeline = operations[op[0]](pipeline, op[1], op[2]);
        }
        delete optimizer.vertexquery;
    }
    return pipeline;
}
