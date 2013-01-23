var Spec = require('../')
  , assert = require('assert')

describe('basic test', function () {
  it('can create a spec (service as arg)', function () {
    var s = new Spec('my-service');
    assert.equal(s.service, 'my-service');
    assert.equal(s.version, undefined);
    assert.equal(typeof s.id, 'string');
  });
  it('can create a versioned spec (service as arg)', function () {
    var s = new Spec('my-service@0.1.0');
    assert.equal(s.service, 'my-service');
    assert.equal(s.version, '0.1.0');
    assert.equal(typeof s.id, 'string');
  });
  it('can create a spec (object as arg)', function () {
    var s = new Spec({service: 'my-service', host: '127.0.0.1', port: 12345, version: '0.1.0'});
    assert.equal(s.service, 'my-service');
    assert.equal(s.version, '0.1.0');
    assert.equal(s.host, '127.0.0.1');
    assert.equal(s.port, 12345);
    assert.equal(typeof s.id, 'string');
  });
  it('can create a versioned spec (object as arg)', function () {
    var s = new Spec({service: 'my-service@0.1.0', host: '127.0.0.1', port: 12345});
    assert.equal(s.service, 'my-service');
    assert.equal(s.version, '0.1.0');
    assert.equal(s.host, '127.0.0.1');
    assert.equal(s.port, 12345);
    assert.equal(typeof s.id, 'string');
  });
  it('translates to expected string', function () {
    var s = new Spec({service: 'my-service@0.1.0', host: '127.0.0.1', port: 12345});
    assert.equal(s + '', 'my-service[v' + s.version + ']@' + s.host + ':' + s.port);
    delete s.version;
    assert.equal(s + '', 'my-service@' + s.host + ':' + s.port);
    delete s.service;
    assert.equal(s + '', s.host + ':' + s.port);
  });
});