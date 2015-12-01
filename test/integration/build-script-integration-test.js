import {unlinkSync, readFileSync, statSync} from 'fs';
import {dirname, join} from 'path';
import {tail} from 'intel-fp';
import {exec} from 'child_process';

describe('build script', () => {
  var distDir;

  beforeAll((done) => {
    const moduleDir = dirname(dirname(__dirname));
    distDir = join.bind(join, moduleDir, 'dist');

    exec(join(moduleDir, 'bin/build'), (error, stdout, stderr) => {
      if (stderr.length)
        console.error(stderr);

      if (error)
        done.fail(error);

      done();
    });
  }, 60000);

  afterAll(function deleteSourceMap () {
    unlinkSync(distDir('bundle.map.json'));
    unlinkSync(distDir('bundle.js'));
  });

  it('should result in a readable stream that points to a source map file', () => {
    const bundle = readFileSync(distDir('bundle.js'), 'utf8');
    expect(tail(bundle.split('\n')))
      .toBe('//# sourceMappingURL=bundle.map.json');
  });

  it('should store a sourcemap on the fs', () => {
    const stats = statSync(distDir('bundle.map.json'));
    expect(stats.isFile()).toBe(true);
  });
});
