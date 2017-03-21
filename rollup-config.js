import babel from 'rollup-plugin-babel';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-re';

export default {
  entry: 'source/index.js',
  plugins: [
    replace({
      patterns: [
        {
          test: "require('json3')",
          replace: 'JSON'
        },
        {
          test: "require('debug')",
          replace: '(() => () => {})'
        },
        {
          test: "from 'highland';",
          replace: "from 'highland/dist/highland.js';"
        }
      ]
    }),
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
        ],
        'babili'
      ],
      plugins: [
        ['transform-object-rest-spread', { useBuiltIns: true }],
        'transform-flow-strip-types',
        'transform-class-properties',
        'transform-object-rest-spread',
        'external-helpers'
      ],
      babelrc: false
    }),
    nodeResolve({ jsnext: true, main: true, browser: true }),
    commonjs({
      ignore: ['bufferutil', 'utf-8-validate']
    }),
    globals(),
    builtins()
  ],
  sourceMap: true,
  format: 'iife'
};
