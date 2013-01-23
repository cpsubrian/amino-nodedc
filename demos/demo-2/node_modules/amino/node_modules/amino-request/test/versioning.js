describe('versioning', function () {
  var services = [];

  before(function (done) {
    var server = http.createServer(function (req, res) {
      res.end('1');
    });
    var service = amino.createService('test@1.1.1', server);
    service.on('listening', done);
    services.push(service);
  });

  before(function (done) {
    var server = http.createServer(function (req, res) {
      res.end('2');
    });
    var service = amino.createService('test@1.2.0', server);
    service.on('listening', done);
    services.push(service);
  });

  after(function (done) {
    amino.reset();
    var tasks = services.map(function (service) { return service.close.bind(service); });
    async.parallel(tasks, done);
  });

  it('should respect req@~1.1.0', function (done) {
    var tasks = [];

    // Send 6 requests @1.1.1
    for (var i = 0; i < 6; i++) {
      tasks.push(function (cb) {
        amino.request('test@~1.1.0', '/', function (err, res, body) {
          assert.ifError(err);
          assert.strictEqual(body, 1);
          cb(null, body);
        });
      });
    }
    async.parallel(tasks, function (err, results) {
      assert.strictEqual(results.length, 6, 'all responses received');
      done();
    });
  });

  it('should respect req@1.2.x', function (done) {
    var tasks = [];

    // Send 6 requests @1.2.0
    for (var i = 0; i < 6; i++) {
      tasks.push(function (cb) {
        amino.request('test@1.2.x', '/', function (err, res, body) {
          assert.ifError(err);
          assert.strictEqual(body, 2);
          cb(null, body);
        });
      });
    }
    async.parallel(tasks, function (err, results) {
      assert.strictEqual(results.length, 6, 'all responses received');
      done();
    });
  });

  it('should respect req@1.x', function (done) {
    var tasks = [];

    // Send 6 requests @1.x
    for (var i = 0; i < 6; i++) {
      tasks.push(function (cb) {
        amino.request('test@1.x', '/', function (err, res, body) {
          assert.ifError(err);
          cb(null, body);
        });
      });
    }
    async.parallel(tasks, function (err, results) {
      var version1 = [], version2 = [];
      results.forEach(function (result) {
        // We should get at least 3 responses from each server.
        if (result === 1) {
          version1.push(result);
        }
        else if (result === 2) {
          version2.push(result);
        }
      });
      assert.strictEqual(version1.length, 3, '3 responses from 1.1.1');
      assert.strictEqual(version2.length, 3, '3 responses from 1.2.0');
      assert.strictEqual(results.length, 6, '6 responses total');
      done();
    });
  });

  it('unsatisfied version times out', function(done) {
    var req = amino.request({url: 'amino://test/', headers: {'X-Amino-Version': '3.x'}, timeout: 100}, function(err, response, body) {
      assert.strictEqual(err.code, 'ETIMEDOUT', 'request timed out');
      done();
    });
  });
});