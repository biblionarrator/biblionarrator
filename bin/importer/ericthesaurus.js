var fs = require('fs'),
    xml2js = require('xml2js'),
    inspect = require('eyes').inspector({maxLength: false}),
    datastore = require('./lib/datastore'),
    Q = require('q');

var parser = new xml2js.Parser();
var recs = { };
var promises = [ ];
fs.readFile(__dirname + '/eric/ERICthesaurus.xml', function(err, data) {
    parser.parseString(data, function (err, result) {
        var term;
        for (var ii in result.Nstein.Terms[0].Term) {
            term = result.Nstein.Terms[0].Term[ii];
            var rec = { name: term.Name[0] };
            var recordtype;
            for (var jj in term.Attributes[0].Attribute) {
                if (term.Attributes[0].Attribute[jj]['$'].name === 'ScopeNote') {
                    if (term.Attributes[0].Attribute[jj]['_']) {
                        rec.scope = term.Attributes[0].Attribute[jj]['_'];
                    }
                } else if (term.Attributes[0].Attribute[jj]['$'].name === 'RecType') {
                    if (term.Attributes[0].Attribute[jj]['_'] === 'Main') {
                        recordtype = 18;
                    } else if (term.Attributes[0].Attribute[jj]['_'] === 'Synonym') {
                        recordtype = 17;
                    }
                }
            }
            for (var jj in term.Relationships[0].Relationship) {
                if (term.Relationships[0].Relationship[jj]['$'].type === 'UF') {
                    rec.synonyms = term.Relationships[0].Relationship[jj].Is;
                } else if (term.Relationships[0].Relationship[jj]['$'].type === 'BT') {
                    rec.broader = term.Relationships[0].Relationship[jj].Is;
                } else if (term.Relationships[0].Relationship[jj]['$'].type === 'NT') {
                    rec.narrower = term.Relationships[0].Relationship[jj].Is;
                } else if (term.Relationships[0].Relationship[jj]['$'].type === 'RT') {
                    rec.related = term.Relationships[0].Relationship[jj].Is;
                } else if (term.Relationships[0].Relationship[jj]['$'].type === 'U') {
                    rec.preferred = term.Relationships[0].Relationship[jj].Is;
                }
            }
            promises.push(addRecord(rec, recordtype));
        }
        Q.all(promises).then(function (data) {
            promises = [];
            for (var ii in data) {
                recs[data[ii].name] = data[ii];
            }
            for (var rec in recs) {
                for (var ref in recs[rec].synonyms) {
                    ref = recs[rec].synonyms[ref];
                    if (recs[ref]) {
                        promises.push(addLink(recs[rec].id, recs[ref].id, 22));
                    }
                }
                for (var ref in recs[rec].broader) {
                    ref = recs[rec].broader[ref];
                    if (recs[ref]) {
                        promises.push(addLink(recs[rec].id, recs[ref].id, 18));
                    }
                }
                for (var ref in recs[rec].narrower) {
                    ref = recs[rec].narrower[ref];
                    if (recs[ref]) {
                        promises.push(addLink(recs[rec].id, recs[ref].id, 17));
                    }
                }
                for (var ref in recs[rec].related) {
                    ref = recs[rec].related[ref];
                    if (recs[ref]) {
                        promises.push(addLink(recs[rec].id, recs[ref].id, 19));
                    }
                }
                for (var ref in recs[rec].preferred) {
                    ref = recs[rec].preferred[ref];
                    if (recs[ref]) {
                        promises.push(addLink(recs[rec].id, recs[ref].id, 21));
                    }
                }
            }
            Q.all(promises).then(function () {
                console.log('done');
                process.exit();
            });
        });
    });
});

function addLink(source, target, field) {
    var deferred = Q.defer();
    datastore.query('INSERT INTO record_links (source_id, target_id, field_id) VALUES (?, ?, ?)', [ source, target, field ], function (err, results) {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(results);
        }
    });
    return deferred.promise;
}

function addRecord(rec, recordtype) {
    var deferred = Q.defer();
    datastore.query('INSERT INTO records (data, recordtype_id, collection_id) VALUES (?, ?, ?)', [ JSON.stringify(rec), recordtype, 1 ], function (err, results) {
        if (err) {
            deferred.reject(err);
        } else {
            rec.id = results.insertId;
            deferred.resolve(rec);
        }
    });
    return deferred.promise;
}
