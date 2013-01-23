var EventEmitter = require('events').EventEmitter
  , emitter = new EventEmitter
  , mefirst = require('../')

emitter.on('something', function() {
  console.log('i ran');
});

mefirst(emitter, 'something', function() {
  console.log('i ran first!');
});

emitter.emit('something');
