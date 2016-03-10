import {unlinkSync, readFileSync, statSync} from 'fs';
import {dirname, join} from 'path';
import {tail} from 'intel-fp';
import {exec} from 'child_process';
import {describe, beforeAll, afterAll, it, expect} from '../jasmine';

describe('build script', () => {
  var distDir;

  beforeAll((done) => {
    const moduleDir = dirname(dirname(dirname(__dirname)));
    distDir = join.bind(join, moduleDir, 'dist');

    exec('npm run prepublish', {cwd: moduleDir}, (error, stdout, stderr) => {
      if (stderr.length)
        console.error(stderr);

      if (error)
        done.fail(error);

      done();
    });
  }, 60000);

  afterAll(() => {
    unlinkSync(distDir('bundle.js.map'));
    unlinkSync(distDir('bundle.js'));
  });

  it('should result in a readable stream that points to a source map file', () => {
    const bundle = readFileSync(distDir('bundle.js'), 'utf8');
    expect(tail(bundle.split('\n')))
      .toBe('//# sourceMappingURL=bundle.js.map');
  });

  it('should store a sourcemap on the fs', () => {
    const stats = statSync(distDir('bundle.js.map'));
    expect(stats.isFile()).toBe(true);
  });
});
