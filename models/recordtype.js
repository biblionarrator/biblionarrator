var Q = require('q'),
    models,
    datastore = require('../lib/datastore');

module.exports = RecordType;

function RecordType (data) {
    var createPromise = Q.defer();
    var me = this;

    if (typeof data === 'object') {
        for (var idx in data) {
            me[idx] = data[idx];
        }
        createPromise.resolve(me);
    } else if (typeof data === 'string') {
        datastore.query('SELECT recordtypes.* FROM recordtypes WHERE recordtypes.id = ?', [ data ], function (err, results, fields) {
            for (var idx in fields) {
                me[fields[idx].name] = results[0][fields[idx].name];
            }
            if (err) {
                createPromise.reject(err);
            } else {
                createPromise.resolve(me);
            }
        });
    } else {
        createPromise.resolve(me);
    }
    return createPromise.promise;
}

RecordType.all = function () {
    var prom = Q.defer();
    datastore.query('SELECT recordtypes.* FROM recordtypes', [ ], function (err, results, fields) {
        if (err) {
            prom.reject(err);
        } else {
            var list = [];
            for (var idx in results) {
                list.push(new RecordType(results[idx]));
            }
            Q.all(list).then(function (l) {
                prom.resolve(l);
            });
        }
    });
    return prom.promise;
};

RecordType.init = function (ref) {
    models = ref;
};

