var sharedview = require('../lib/sharedview'),
    models = require('../models'),
    RecordList = models.RecordList,
    Q = require('q');

exports.view = function(req, res) {
    var query = req.query.q || '';
    var list = new RecordList();

    Q.all([sharedview(), list.search(query)]).then(function(defdata) {
        var data = defdata[0];
        data.view = 'results';
        if (query) {
            data.summary = 'Search: ' + query;
        } else {
            data.summary = 'All records';
        }
        data.query = query;
        for (var idx in defdata[1]) {
            data[idx] = defdata[1][idx];
        }
        data.sortings = { available: [ { schema: 'mods', field: 'title', label: 'Title' } ] };
        res.render('list/interface', data, function(err, html) {
            if (err) {
                res.send(404, err);
            } else {
                res.send(html);
            }
        });
    });
};