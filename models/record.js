var models,
    graphstore = require('../lib/graphstore'),
    GraphModel = require('../lib/graphmodel'),
    g = graphstore(),
    T = g.Tokens,
    formatters = require('../lib/formats');

function Record(data) {
    this.snippet = function() {
        if (typeof this.data === 'string') {
            this.data = JSON.parse(this.data);
        }
        return record = new Record({
            id: this.id,
            data: formatters[this.format].snippet(this.data),
        });
    };

    this.render = function() {
        if (typeof this.data === 'undefined' || this.data === null || this.data === '') {
            return '<article><header></header><section></section></article>';
        }
        if (typeof this.data === 'string') {
            this.data = JSON.parse(this.data);
        }
        if (typeof formatters[this.format] === 'undefined') {
            return '';
        } else {
            return formatters[this.format].render(this.data);
        }
    };

    this.link = function (type, target) {
        var sv = g.v(this.id).iterator().nextSync();
        var tv = g.v(typeof target === 'string' ? target : target.id).iterator().nextSync();
        var edge = graphstore.getDB().addEdgeSync(null, sv, tv, type);
        if (graphstore.autocommit) {
            graphstore.getDB().commitSync();
        }
    };

    this.links = function () {
        var count = new g.HashMap();
        var facets = new g.HashMap();
        return new models.RecordList({
            records: Record.fromJSON(this.v().as('me').copySplit(g._().outE().groupCount(facets, "{it.label + '@out@' + it.inV.key.next()}"), g._().inE().groupCount(facets, "{it.label + '@in@' + it.outV.key.next()}")).fairMerge().back('me').both().dedup().as('results').groupCount(count, "{'_'}").back('results').toJSON()),
            facets: facets.toJSON(),
            mainfacet: '*',
            count: count.toJSON()['_']
        });
    };

    this.initialize(data);

    return this;
}

Record.model = 'record';

module.exports = GraphModel(Record);


Record.init = function(ref) {
    models = ref;
};
