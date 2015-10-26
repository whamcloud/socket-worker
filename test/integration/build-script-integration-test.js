'use strict';

var build = require('../../build');
var λ = require('highland');
var fs = require('fs');
var path = require('path');
var join = path.join;

describe('build script', function () {
  var stream, joinDirname;

  it('should return a function when required programmatically', function () {
    expect(build).toEqual(jasmine.any(Function));
  });

  describe('when invoked', function () {
    beforeAll(function browserify () {
      joinDirname = join.bind(path, __dirname);

      stream = build(__dirname);
    });

    afterAll(function deleteSourceMap (done) {
      var unlink = λ.wrapCallback(fs.unlink);

      λ(unlink(joinDirname('bundle.map.json')))
        .stopOnError(done.fail)
        .each(done);
    });

    it('should result in a readable stream that points to a source map file', function (done) {
      λ(stream)
        .split()
        .last()
        .stopOnError(done.fail)
        .map(function assert (x) {
          expect(x.toString()).toEqual('//# sourceMappingURL=bundle.map.json');
        })
        .each(done);
    });

    it('should store a sourcemap on the fs', function (done) {
      var stat = λ.wrapCallback(fs.stat);

      stat(joinDirname('bundle.map.json'))
        .map(function assert (stats) {
          expect(stats.isFile()).toBe(true);
        })
        .stopOnError(done.fail)
        .each(done);
    });
  });

});
