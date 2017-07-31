import { describe, it, beforeAll, afterAll, expect } from './jasmine.js';

import { unlinkSync, readFileSync, statSync } from 'fs';
import { dirname, join } from 'path';
import { exec } from 'child_process';

describe('build script', () => {
  let distDir;

  beforeAll(done => {
    const moduleDir = dirname(__dirname);
    distDir = join.bind(join, moduleDir, 'dist');

    exec('npm run postversion', { cwd: moduleDir }, (error, stdout, stderr) => {
      // eslint-disable-next-line
          if (stderr.length) console.error(stderr);

      if (error) done.fail(error);

      done();
    });
  }, 60000);

  afterAll(() => {
    unlinkSync(distDir('bundle.js.map'));
    unlinkSync(distDir('bundle.js'));
  });

  it('should result in a readable stream that points to a source map file', () => {
    const bundle = readFileSync(distDir('bundle.js'), 'utf8');
    expect(bundle.trim().split('\n').reverse()[0]).toBe(
      '//# sourceMappingURL=bundle.js.map'
    );
  });

  it('should store a sourcemap on the fs', () => {
    const stats = statSync(distDir('bundle.js.map'));
    expect(stats.isFile()).toBe(true);
  });
});
