var options = require('../../src/lib/cmd'),
    environment = require('../../src/lib/environment');

var fs = require('fs'),
    path = require('path'),
    readdirp = require('readdirp'),
    extend = require('extend');

var keys = { };

environment.renderer.registerHelper('t', function(i18n_key) {
    keys[i18n_key] = '';

    return '';
});

environment.renderer.registerHelper('tr', function(i18n_key, options) {
    var defaultValue = ''
    if (options.fn) defaultValue = options.fn({ });

    keys[i18n_key] = defaultValue;

    return '';
});

environment.renderer.registerHelper('block', function () {
    return '';
});

function registerBlockHelper(name) {
    environment.renderer.registerHelper(name, function (input, options) {
        if (options.fn) options.fn({ });
        if (options.inverse) options.inverse({ });
        return '';
    });
}

var languages = options.argv || [ 'en' ];

['if', 'contentFor', 'each', 'field', 'ifsubf', 'iffield'].forEach(registerBlockHelper);
var files = [ ];
readdirp({ root: path.resolve(__dirname, '../../views'), fileFilter: '*.handlebars' }, function (err, res) {
    res.files.forEach(function (file) {
        files.push(file.name);
        var data = fs.readFileSync(file.fullPath, { encoding: 'utf8' });
            
        if (file.parentDir.indexOf('partials') > -1) {
            environment.renderer.registerPartial(file.path.replace('.handlebars', '').replace('partials/', ''), data);
        }
        environment.renderer.register(file.name, data);
    });
    files.forEach(function (file) {
        try {
            environment.renderer.render(file, { });
        } catch (e) {
            if (e.name !== 'RangeError') {
                console.log("Caught and ignored error: " + e);
            }
        }
    });
    var namespaces = { };
    for (var key in keys) {
        var namespace = 'common';
        var parts = key.split(/:/);
        if (parts.length > 1) {
            namespace = parts[0];
            parts = parts[1].split(/\./);
        } else {
            parts = key.split(/\./);
        }
        var value = keys[key].replace(/\s+/g, ' ');
        var part;
        while ((part = parts.pop())) {
            var temp = { };
            temp[part] = value;
            value = temp;
        }
        namespaces[namespace] = namespaces[namespace] || { };
        extend(true, namespaces[namespace], value);
    }
    languages.forEach(function (language) {
        try {
            fs.mkdirSync(path.resolve(__dirname, '../../locales', language));
        } catch (e) {
            if (e.message.indexOf('EEXIST') === -1) {
                console.log("Caught and ignored error: " + e);
            }
        }
        for (namespace in namespaces) {
            var newlocale = { };
            extend(true, newlocale, namespaces[namespace]);
            try {
                var data = fs.readFileSync(path.resolve(__dirname, '../../locales', language, 'ns.' + namespace + '.json'), { encoding: 'utf8' });
                locale = JSON.parse(data);
            } catch (e) {
                if (e.message.indexOf('ENOENT') === -1) {
                    console.log("Caught and ignored error: " + e);
                }
            }
            extend(true, newlocale, locale);
            fs.writeFileSync(path.resolve(__dirname, '../../locales', language, 'ns.' + namespace + '.json'), JSON.stringify(newlocale, null, 4));
        }
    });
    process.exit();
});
