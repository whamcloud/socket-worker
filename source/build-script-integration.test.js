import {
  describe,
  it,
  beforeAll,
  afterAll,
  expect,
  jasmine
} from './jasmine.js';

import { unlinkSync, readFileSync, statSync } from 'fs';
import { dirname, join } from 'path';
import { exec } from 'child_process';

describe('build script', () => {
  let distDir;

  beforeAll(done => {
    const moduleDir = dirname(__dirname);
    distDir = join.bind(join, moduleDir, 'dist');
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 180000;

    exec(
      'npm run postversion',
      { cwd: moduleDir, format: 'cjs' },
      (error, stdout, stderr) => {
        // eslint-disable-next-line
        if (stderr.length) console.error(stderr);

        if (error) done.fail(error);

        done();
      }
    );
  }, 180000);

  afterAll(() => {
    unlinkSync(distDir('bundle.js.map'));
    unlinkSync(distDir('bundle.js'));
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000;
  });

  it('should result in a readable stream that points to a source map file', () => {
    const bundle = readFileSync(distDir('bundle.js'), 'utf8');
    expect(
      bundle
        .trim()
        .split('\n')
        .reverse()[0]
    ).toBe('//# sourceMappingURL=bundle.js.map');
  });

  it('should store a sourcemap on the fs', () => {
    const stats = statSync(distDir('bundle.js.map'));
    expect(stats.isFile()).toBe(true);
  });
});
