describe('sticky session', function () {
  var services;

  function makeService (cb) {
    var server = net.createServer(function (socket) {
      socket.on('data', function (data) {
        socket.end(data.toString() + ':' + service.spec.id + ':1');
      });
    });
    var service = amino.createService('test@1.1.0', server);
    service.on('listening', function () {
      cb(null, service);
    });
  }

  before(function (done) {
    var tasks = [];
    for (var i = 0; i < 3; i++) {
      tasks.push(makeService);
    }
    async.parallel(tasks, function(err, results) {
      services = results;
      done();
    });
  });

  after(function (done) {
    amino.reset();
    var tasks = services.map(function (service) { return service.close.bind(service); });
    async.parallel(tasks, done);
  });

  function makeRequests (version, done) {
    if (typeof version === 'function') {
      done = version;
      version = null;
    }
    // Send 6 requests, which should all go to the same server.
    var tasks = []
      , clientId = amino.utils.idgen()
      , specId

    for (var i = 0; i < 6; i++) {
      tasks.push(function (cb) {
        var req = createRequest({service: 'test' + (version ? '@' + version : ''), stickyId: clientId});
        req.on('connect', function () {
          if (typeof specId === 'string') {
            assert.strictEqual(req.spec.id, specId);
          }
          else if (typeof specId === 'undefined') {
            specId = req.spec.id;
          }
          else {
            assert.fail(specId, undefined);
          }
          cb();
        });
      });
    }
    async.parallel(tasks, function (err, results) {
      assert.ifError(err);
      done();
    });
  }

  it('sticks to one server (no version)', makeRequests);
  it('sticks to one server (version)', makeRequests.bind(null, '1.1.x'));

  it('restart servers', function (done) {
    // Restart servers while spawning new ones.
    // Simulate some delay.
    var tasks = [];
    services.forEach(function (service) {
      tasks.push(function (cb) {
        service.on('close', function () {
          setTimeout(cb, 250);
        });
        service.close();
      });
      tasks.push(makeService);
    });
    async.series(tasks, function (err, results) {
      if (err) return done(err);
      services = results.filter(function (service) {
        return !!service;
      });
      done();
    });
  });

  it('works with new servers (no version)', makeRequests);
  it('works with new servers (version)', makeRequests.bind(null, '1.1.x'));
});