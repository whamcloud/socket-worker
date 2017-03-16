import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve';
import cleanup from 'rollup-plugin-cleanup';
import commonjs from 'rollup-plugin-commonjs';

export default {
  entry: 'source/index.js',
  plugins: [
    babel({
      presets: [
        [
          'env',
          {
            targets: {
              browsers: ['last 1 chrome version', 'last 1 firefox version']
            },
            modules: false
          }
        ]
      ],
      plugins: ['transform-flow-strip-types', 'external-helpers'],
      babelrc: false
    }),
    commonjs({
      ignore: ['JSON']
    }),
    nodeResolve({ main: true }),
    cleanup({ maxEmptyLines: 0 })
  ],
  sourceMap: true,
  format: 'iife'
};
