var assert = require('assert')
  , EventEmitter = require('events').EventEmitter
  , mefirst = require('../')

describe('basic test', function() {
  it('works', function() {
    var emitter = new EventEmitter;
    emitter.fired = 0;
    emitter.on('test', function() {
      assert.equal(this.fired, 1);
      this.fired++;
    });
    emitter.on('test', function() {
      assert.equal(this.fired, 2);
      this.fired++;
    });
    mefirst(emitter, 'test', function() {
      assert.equal(this.fired, 0);
      this.fired++;
    });
    emitter.emit('test');
    assert.equal(emitter.fired, 3);
  });
});