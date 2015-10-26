'use strict';

var join = require('path').join;
var browserify = require('browserify');

module.exports = function buildSocketWorker (outDir) {
  var srcMapName = 'bundle.map.json';
  var minifyifyDest = join(outDir, srcMapName);
  var socketWorkerIndex = join(__dirname, 'index.js');

  return browserify(socketWorkerIndex, { basedir: __dirname, debug: true })
    .plugin('minifyify', { minify: true,  map: srcMapName, output: minifyifyDest })
    .bundle(function handleErrors (err) {
      if (err) throw err;
    });
};
