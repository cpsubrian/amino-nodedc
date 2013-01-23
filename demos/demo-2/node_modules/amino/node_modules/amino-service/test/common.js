amino = require('amino')
  .use(require('../'))
  .init({service: false});

http = require('http');

assert = require('assert');

createTestService = require('./helpers/createTestService');

spawn = require('child_process').spawn;

resolve = require('path').resolve;