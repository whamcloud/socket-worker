System.config({
  paths: {
    'socket.io-client/*': 'node_modules/socket.io-client/*',
    isarray: 'node_modules/isarray/index.js',
    'source/*': 'dist/source/*',
    'path-to-regexp': 'node_modules/path-to-regexp/index.js',
    'intel-router': 'node_modules/intel-router'
  },
  packages: {
    'node_modules/intel-router': {
      main: 'dist/source/get-router.js',
      format: 'cjs'
    }
  }
});
