var graphstore = require('../lib/graphstore'),
    g = graphstore(),
    T = g.Tokens;

function GraphModel (Model) {
    Model.findOne = function findOne (filter) {
        return this.findAll(filter)[0];
    };

    Model.findAll = function findAll (filter) {
        var all;
        try {
            if (filter.id) {
                all = g.v(filter.id).has('deleted', filter.deleted ? T.eq : T.neq, 1).toJSON();
            } else {
                filter.model = Model.model;
                all = g.V(filter).has('deleted', filter.deleted ? T.eq : T.neq, 1).toJSON();
            }
        } catch (e) {
            all = [ ];
        }
        var recordtypes = [ ];
        all.forEach(function (one) {
            recordtypes.push(new Model(one));
        });
        return recordtypes;
    };

    Model.prototype.v = function () {
        if (this.id) {
            return g.v(this.id);
        } else {
            throw('model not saved');
        }
    };

    Model.prototype.suppress = function () {
        var v = this.v().iterator().nextSync();
        v.setPropertySync('deleted', 1);
        graphstore.getDB().commitSync();
    };

    Model.prototype.destroy = function () {
        var v = this.v().iterator().nextSync();
        v.removeSync();
        graphstore.getDB().commitSync();
    };

    Model.prototype.initialize = function (data) {
        for (var prop in data) {
            if (data.hasOwnProperty(prop) && typeof data[prop] !== 'function') {
                this[prop] = data[prop];
            }
        }
        if (typeof this.id === 'undefined') {
            this.id = this._id;
        }
    };

    Model.prototype.save = function () {
        var v;
        try {
            v = this.v().iterator().nextSync();
            if (v === null) {
                throw('invalid id');
            }
        } catch (e) {
            v = graphstore.getDB().addVertexSync(null);
        }
        if (typeof this.deleted === 'undefined') {
            this.deleted = 0;
        }
        this.model = Model.model;
        for (var prop in this) {
            if (prop !== 'id' && this.hasOwnProperty(prop) && typeof this[prop] !== 'function' && typeof this[prop] !== 'undefined') {
                if (typeof this[prop] === 'object') {
                    v.setPropertySync(prop, JSON.stringify(this[prop]));
                } else {
                    v.setPropertySync(prop, this[prop]);
                }
            }
        }
        graphstore.getDB().commitSync();
        this.id = v.toString();
        this.id = this.id.replace(/^v\[#?/, '');
        this.id = this.id.replace(/\]$/, '');
        return this;
    };

    return Model;
}

module.exports = GraphModel;
