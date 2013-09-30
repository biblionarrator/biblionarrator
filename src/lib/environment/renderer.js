var Handlebars = require('handlebars'),
    MARCRecord = require('../marcrecord'),
    util = require('util');

Handlebars.registerHelper('subfordered', function (field, subfields, sep) {
    if (typeof field !== 'undefined' && field !== null) {
        return field.ordered(subfields, sep);
    }
});

Handlebars.registerHelper('subfstring', function (field, subfields, sep) {
    if (typeof field !== 'undefined' && field !== null) {
        return field.string(subfields, sep);
    }
});

Handlebars.registerHelper('subffirst', function (field, subfields) {
    if (typeof field !== 'undefined' && field !== null) {
        return field.first(subfields, 1);
    }
});

Handlebars.registerHelper('field', function (field, options) {
    var ii, string, index = 0;
    if (typeof field === 'undefined' || typeof options === 'undefined') {
        return '';
    } else if (typeof field === 'string') {
        string = '';
        var re = new RegExp('^' + field);
        for (ii = 0; ii < this.fields.length; ii++) {
            if (this.fields[ii].tag.match(re)) {
                this.fields[ii].index = index++;
                string = string + options.fn(this.fields[ii]);
            }
        }
        return string;
    } else if (util.isArray(field)) {
        string = '';
        for (ii = 0; ii < field.length; ii++) {
            field[ii].index = index++;
            string = string + options.fn(field[ii]);
        }
    } else {
        field.index = index;
        return options.fn(field);
    }
});

Handlebars.registerHelper('ifhasfield', function (field, options) {
    var hasfield = false;
    if (typeof field === 'string') {
        var re = new RegExp('^' + field);
        for (ii = 0; ii < this.fields.length; ii++) {
            if (this.fields[ii].tag.match(re)) {
                hasfield = true;
                break;
            }
        }
    } else if (field) {
        hasfield = true;
    }
    if (hasfield) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

Handlebars.registerHelper('marc', function (record, options) {
    var marcrec = new MARCRecord (record);
    return options.fn(marcrec);
});

function Renderer(config) {
    var templates = { };

    this.registerHelper = function () {
        Handlebars.registerHelper.apply(Handlebars, arguments);
    };

    this.registerPartial = function () {
        Handlebars.registerPartial.apply(Handlebars, arguments);
    };

    this.register = function (name, template) {
        templates[name] = Handlebars.compile(template);
        return templates[name];
    };

    this.registered = function (name) {
        return (typeof templates[name] === 'function');
    };

    this.render = function (name, data) {
        return templates[name](data);
    };
    return this;
};

module.exports = Renderer;
