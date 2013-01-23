describe('failover', function () {
  var services;

  before(function (done) {
    var tasks = [];
    for (var i = 0; i < 3; i++) {
      tasks.push(function (cb) {
        var server = http.createServer(function (req, res) {
          res.end('failover-test:' + service.spec.id);
        });
        
        var service = amino.createService('failover-test', server);
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

  it('makes a request', function (done) {
    amino.request('failover-test', '/', function (err, res, body) {
      assert.ifError(err);
      assert(body.match(/^failover\-test:/));
      done();
    });
  });

  // Failover should happen after the first failed request. Subsequent requests
  // should use the updated spec list.
  it('should failover', function (done) {
    var tasks = [], errCount = 0;

    // Forcefully close one of the servers...
    var idx = Math.floor(Math.random() * 3);
    services[idx].server.removeAllListeners('close');
    services[idx].server.close();
    services.splice(idx, 1);

    // We should only get one error.
    for (var i = 0; i < 6; i++) {
      tasks.push(function (cb) {
        amino.request('failover-test', '/', function (err, res, body) {
          if (err) {
            assert.strictEqual(err.code, 'ECONNREFUSED', 'server is down');
            errCount++;
          }
          cb(null, 1);
        });
      });
    }

    async.series(tasks, function(err, results) {
      assert.strictEqual(errCount, 1, 'one error happened');
      assert.strictEqual(results.length, 6, '6 responses came back');
      done();
    });
  });
});