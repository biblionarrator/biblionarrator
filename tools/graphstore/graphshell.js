var graphstore = require('../../src/node_modules/bngraphstore'),
    g = graphstore(),
    repl = require("repl"),
    inspect = require('eyes').inspector({maxLength: false});
    //require('repl.history')(repl, './.node_history');
var argv = require('optimist')
    .usage('Usage: $0 -c [config]')
    .argv;
var config = argv.c || process.env['BN_CONF'] || __dirname + '/../../config/config.json';
var environment = require('../src/lib/environment');

process.stdout.write('\n');
process.stdout.write('         \\,,,/' + '\n');
process.stdout.write('         (o o)' + '\n');
process.stdout.write('-----oOOo-(_)-oOOo-----' + '\n');

var r = repl.start({
  prompt: "gremlin> ",
  input: process.stdin,
  output: process.stdout,
  terminal: true,
  writer: outFunc
});

function _isObject(o) {
  return toString.call(o) === '[object Object]';
}

function outFunc(it){ 
  var arr;
  if(_isObject(it) && it.Type == 'GremlinJSPipeline'){
      arr = it.toList();
      for (var i = 0, l = arr.sizeSync(); i < l; i++) {
          process.stdout.write('==>'+arr.getSync(i)+'\n');
      }
  } else {
      process.stdout.write('==>'+it+'\n');
  }
  return '';
}

r.context.g = g;
r.context.graphstore = graphstore;
r.context.inspect = inspect;
r.context.Text = g.java.import('com.thinkaurelius.titan.core.attribute.Text');

r.on('exit', function () {
  console.log('Good-bye from Gremlin!');
  process.exit();
});

