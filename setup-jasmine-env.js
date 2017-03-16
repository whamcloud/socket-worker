/*global jasmine:true*/

jasmine.DEFAULT_TIMEOUT_INTERVAL = 600000;

require('intel-jasmine-n-matchers');

if (process.env.RUNNER === 'CI') {
  const jasmineReporters = require('jasmine-reporters');

  jasmine.VERBOSE = true;
  jasmine.getEnv().addReporter(
    new jasmineReporters.JUnitXmlReporter({
      consolidateAll: true,
      savePath: process.env.SAVE_PATH || './',
      filePrefix: process.env.FILE_PREFIX ||
        'socket-worker-results-' + process.version
    })
  );
}
