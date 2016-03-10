#!/usr/bin/env node

'use strict';

var Builder = require('systemjs-builder');

var builder = new Builder('./', './dist/source/config.js');

builder.buildStatic('source/index.js', './dist/bundle.js', {
  runtime: false,
  sourceMaps: true,
  minify: true,
  rollup: true
});
