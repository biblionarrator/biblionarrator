"use strict";
var models,
    queryparser = require('queryparser'),
    extend = require('extend');

function Query(string, syntax) {
    var self = this;

    self.ast = queryparser.parsers[syntax].parse(string);
    self.original = string;
    self.syntax = syntax;
    extend(self, queryparser.decompose(self.ast));
    return self;
}

module.exports = Query;

Query.init = function(ref) {
    models = ref;
};