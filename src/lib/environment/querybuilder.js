"use strict";
var extend = require('extend');

function QueryBuilder(config) {
    var self = this;
    var supports = { };

    this.build = function (ast) {
        return new QueryPlan(ast, supports, config);
    };

    if (config.graphstore.engine === 'titan') {
        supports.contains = true;
    }
    if (config.graphstore.searchbackend === 'elasticsearch') {
        supports.elasticsearch = true;
    }

    return self;
}

module.exports = QueryBuilder;

function QueryPlan(tree, supports, environment) {
    var self = this;
    self.partial = new PartialPlan();

    optimizeTree(tree, self.partial, supports, environment);

    self.vertexquery = self.partial.vertexq;
    self.pipeline = self.partial.pipeline;
    self.unoptimizable = self.partial.unoptimizable;

    if (supports.elasticsearch && self.partial.textq.length > 0) {
        self.esquery = prepareESQuery(self.partial);
        if (self.vertexquery.length === 0 && self.pipeline.length === 0) {
            self.esonly = true;
        } else {
            self.esquery.fields = [ ];
        }
    }
    return self;
}

function PartialPlan(options) {
    this.nextlabel = 1;
    this.vertexq = [ ];
    this.textq = [ ];
    this.pipeline = [ ];
    this.length = 0;
    extend(this, options);
    return this;
}

var dbcallbacks = {
    'linkbrowse': function (tree, query) {
        var linkbrowse = [ { start: tree[2].slice(1) }, { both: [ ] }, { dedup: [ ] } ];
        query.pipeline = linkbrowse.concat(query.pipeline);
    }
};

function optimizeTree(tree, query, supports, environment) {
    /*jshint -W086*/ /* No 'break' between cases */
    switch (tree[0]) {
    case 'AND':
        optimizeTree(tree[1], query, supports, environment);
        optimizeTree(tree[2], query, supports, environment);
        break;
    case 'NOT':
        var notplan = optimizeTree(tree[1], new PartialPlan(), supports, environment);
        query.unoptimizable = query.unoptimizable || notplan.unoptimizable;
        if (notplan.length === notplan.textq.length) {
            query.textq.push('-(' + notplan.textq.join(' ') + ')');
        } else if (notplan.length === notplan.pipeline.length) {
            query.pipeline = query.pipeline.concat(
                [ { as: 'trunk' + notplan.nextlabel } ],
                notplan.pipeline,
                [
                    { as: 'not' + (notplan.nextlabel + 1) },
                    { optional: 'trunk' + notplan.nextlabel },
                    { exceptStep: 'not' + (notplan.nextlabel + 1) }
                ]);
            query.nextlabel = notplan.nextlabel + 2;
        } else {
            query.unoptimizable = true;
        }
        break;
    case 'HAS':
    case 'FACET':
        query.length++;
        switch (environment.indexes[tree[1]].type) {
        case 'property':
            query.vertexq.push([ tree[1], analyzeValue(tree[2]) ]);
            break;
        case 'text':
            if (supports.elasticsearch) {
                query.textq.push(analyzeESValue(tree[2], environment.indexes[tree[1]].id));
            } else if (supports.contains) {
                analyzeContainsValue(tree[2]).forEach(function (value) {
                    query.vertexq.push([ tree[1], 'contains', value ]);
                });
            } else {
                query.pipeline.push({ filter: "{it->it.data?.count('" + analyzeValue(tree[2]).replace("'", "\\'") + "') >= 1}" });
            }
            break;
        case 'edge':
            query.pipeline = query.pipeline.concat(buildEdgeQuery('out', tree[1], tree[2], tree[0] === 'FACET'));
            break;
        case 'inverseedge':
            query.pipeline = query.pipeline.concat(buildEdgeQuery('in', tree[1], tree[2], tree[0] === 'FACET'));
            break;
        case 'biedge':
            query.pipeline = query.pipeline.concat(buildEdgeQuery('both', tree[1], tree[2], tree[0] === 'FACET'));
            break;
        case 'dbcallback':
            dbcallbacks[tree[1]](tree, query);
            break;
        default:
            query.unoptimizable = true;
            break;
        }
        break;
    case 'FLOAT':
        var floatquery = new PartialPlan();
        floatquery.nextlabel = query.nextlabel;
        optimizeTree(tree[1], floatquery, supports, environment);
        query.nextlabel = floatquery.nextlabel;
        query.vertexq = floatquery.vertexq.concat(query.vertexq);
        query.textq = floatquery.textq.concat(query.textq);
        query.pipeline = floatquery.pipeline;
        optimizeTree(tree[2], query, supports, environment);
        break;
    case undefined:
        break;
    default:
        query.unoptimizable = true;
    }
    /*jshint +W086*/
    return query;
}

function buildEdgeQuery(type, label, value, facet) {
    var enterop = { }, exitop = { }, expandop = { };
    var exit = { 'in': 'out', 'out': 'in' };
    if (type === 'both') {
        return [ ];
    }
    enterop[type + 'E'] = [ label ];
    exitop[exit[type] + 'V'] = [ ];
    expandop[exit[type]] = [ ];
    if (facet) {
        return [ { as: [ 'facet_' + label + value ] }, enterop, { filter: [ "{it->it.target == '" + analyzeValue(value).replace("'", "\\'") + "'}" ] }, { back: [ 'facet_' + label + value ] } ];
    } else {
        return [ enterop, { filter: [ "{it->it.marker == '" + analyzeValue(value).replace("'", "\\'") + "'}" ] }, exitop, expandop ];
    }
}

function analyzeESValue(tree, index) {
    if (tree[0] === 'PHRASE') {
        return index + ':"' + tree[1] + '"';
    } else {
        return index + ':' + tree[1];
    }
}

function analyzeContainsValue(tree) {
    if (tree[0] === 'PHRASE') {
        return [ tree[1] ];
    } else {
        return tree.slice(1);
    }
}

function analyzeValue(tree) {
    if (tree[0] === 'PHRASE') {
        return tree[1];
    } else {
        return tree.slice(1).join(' ');
    }
}

function prepareESQuery(plan) {
    var query = plan.textq.join(' ');
    return { query: { query_string: { query: query } }, size: 5000 };
}
