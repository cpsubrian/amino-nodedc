amino = require('amino')
  .use(require('../'))
  .init({request: false});

http = require('http');

assert = require('assert');

net = require('net');

async = require('async');

createRequest = require('./helpers/createRequest');

Stream = require('stream');

util = require('util');

ValidationStream = require('./helpers/ValidationStream');

assertRes = require('./helpers/assertRes');

fs = require('fs');

stuffPath = require('path').resolve(__dirname, './fixtures/tail.txt');
stuff = fs.readFileSync(stuffPath, 'utf8');