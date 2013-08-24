var models = require('../models'),
    Field = models.Field;

module.exports.save = function(req, res) {
    var field = req.body;
    field.schema = field.schema || req.params.schema;
    field.field = field.field || req.params.field;
    var promise = new Field(field);
    promise.then(function (field) {
        field.save();
        res.json({ success: 1 });
    });
};
