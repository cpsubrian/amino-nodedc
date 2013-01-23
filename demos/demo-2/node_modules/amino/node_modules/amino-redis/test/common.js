amino = require('amino')
  .use(require('../'))
  .init({redis: false});

assert = require('assert');

inArray = require('./helpers/inArray');