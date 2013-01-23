describe('basic test', function () {
  var service, service2;
  it('attaches', function () {
    assert.equal(typeof amino.request, 'function');
  });
  it('sets up a service', function (done) {
    service = createTestService('cool-stuff', 'cool stuff', done);
  });
  it('can request the service', function (done) {
    amino.request('cool-stuff', '/', function (err, res, body) {
      assert.ifError(err);
      assert.equal(body, 'cool stuff');
      done();
    });
  });
  it('can close the service', function (done) {
    service.once('close', done);
    service.close();
  });
  it('times out until service restored', function (done) {
    amino.request('cool-stuff', '/', function (err, res, body) {
      assert.ifError(err);
      assert.equal(body, 'really cool stuff');
      done();
    });
    setTimeout(function () {
      service2 = createTestService('cool-stuff', 'really cool stuff');
    }, 1000);
  });
});