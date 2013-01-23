describe('load-balancing', function () {
  var services;

  before(function (done) {
    var tasks = [];
    for (var i = 0; i < 3; i++) {
      tasks.push(function (cb) {
        var server = net.createServer(function (socket) {
          socket.on('data', function (data) {
            socket.end(data.toString() + ':' + service.spec.id);
          });
        });
        
        var service = amino.createService('test', server);
        service.on('listening', function () {
          cb(null, service);
        });
      });
    }
    async.parallel(tasks, function (err, results) {
      services = results;
      done();
    });
  });

  after(function (done) {
    amino.reset();
    var tasks = services.map(function (service) { return service.close.bind(service); });
    async.parallel(tasks, done);
  });

  it('can load-balance', function (done) {
    var expected = [];
    services.forEach(function (service) {
      expected.push('hello:' + service.spec.id);
    });
    // Double the array to test round-robin
    expected = expected.concat(expected);

    assert.equal(expected.length, 6);

    // Send 6 requests, so each server should get 2 requests.
    var tasks = [];
    for (var i = 0; i < 6; i++) {
      tasks.push(function (cb) {
        var req = createRequest('test');
        req.on('error', cb);
        req.on('connect', function () {
          req.write('hello');
        });
        req.on('data', function (data) {
          var index = expected.indexOf(data);
          assert.notStrictEqual(index, -1, 'response expected');
          expected.splice(index, 1);
          cb();
        });
      });
    }

    async.parallel(tasks, function (err, results) {
      assert.ifError(err);
      assert.equal(expected.length, 0, 'all responses received');
      done();
    });
  });
});