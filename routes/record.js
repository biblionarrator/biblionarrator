var sharedview = require('../lib/sharedview'),
    models = require('../models'),
    Record = models.Record,
    Field = models.Field,
    RecordType = models.RecordType,
    Q = require('q');

exports.linkselect = function(req, res) {
    res.render('link-select', {
        id: req.params.record_id,
        layout: false
    }, function(err, html) {
        res.send(html);
    });
};

exports.linkadd = function(req, res) {
    var record = Record.findOne({id: req.params.record_id});
    try {
        record.link(req.params.link_type, req.params.target_id);
        res.json({ success: true });
    } catch (e) {
        res.json({ error: e });
    }
};

exports.linklist = function(req, res) {};

exports.links = function(req, res) {
    var record = Record.findOne({id: req.params.record_id}) || new Record();
    var offset = parseInt(req.query.offset, 10) || 0;
    var perpage = parseInt(req.query.perpage, 10) || 20;
    record.links(offset, perpage, function (data) {
        data.layout = false;
        data.summary = 'Links for record ' + req.params.record_id;
        data.sortings = { available: [ { schema: 'mods', field: 'title', label: 'Title' } ] };
        var accept = req.accepts([ 'html', 'json' ]);
        if (accept === 'html') {
            res.render('partials/results', data, function(err, html) {
                if (err) {
                    res.send(404, err);
                } else {
                    res.send(html);
                }
            });
        } else {
            res.json(data);
        }
    }, function (message) {
        socketserver.registerPublication(message);
    });
};

exports.view = function(req, res) {
    var record = Record.findOne({id: req.params.record_id}) || new Record();
    var accept = req.accepts([ 'json', 'html' ]);
    if (accept === 'html') {
        Q.all([sharedview(), Field.all()]).then(function(defdata) {
            var data = defdata[0];
            data.view = 'record';
            data.record = record;
            data.fields = defdata[1];
            data.recordtypes = RecordType.findAll();
            data.record.rendered = data.record.render();
            res.render('record/interface', data, function(err, html) {
                if (err) {
                    res.send(404, err);
                } else {
                    res.send(html);
                }
            });
        }, function(errs) {
            res.send(404, errs);
        });
    } else {
        res.json(record);
    }
};

exports.snippet = function(req, res) {
    var record = Record.findOne({id: req.params.record_id}) || new Record();
    res.json(record.snippet());
};

exports.save = function(req, res) {
    req.body.recordtype_id = req.body.recordtype_id || 1;
    var record = new Record({
        id: decodeURIComponent(req.params.record_id),
        data: req.body.data,
        recordtype_id: req.body.recordtype_id,
        format: 'bnjson'
    });
    record.save();
    res.json(record);
};
