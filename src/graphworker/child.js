"use strict";
/*jshint unused:true */ /* We need this in order to get environment's message handler */
var environment = require('../lib/environment');
var handlers = {
    setEnv: function () {
        require("fs").readdirSync(__dirname + '/tasks').forEach(function(file) {
            if (file.indexOf('.js') === file.length - 3 && file !== 'index.js') {
                var handler = require("./tasks/" + file);
                handlers[handler.message] = handler;
            }
        });
        var esclient = environment.esclient;
    }
};
/*jshint unused:false */

process.on('message', function (message) {
    for (var handler in handlers) {
        if (message[handler]) {
            handlers[handler](message[handler], function (result) {
                message[handler] = result;
                process.send(message);
            });
            break;
        }
    }
});
