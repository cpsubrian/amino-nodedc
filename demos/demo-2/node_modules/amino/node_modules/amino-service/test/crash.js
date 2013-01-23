describe('crash', function () {
  var proc, service;
  after(function (done) {
    if (service) {
      service.close(done);
    }
  });
  it('starts', function (done) {
    proc = spawn('node', [resolve(__dirname, './helpers/crashServer')]);
    proc.stdout.once('data', function (chunk) {
      done();
    });
  });
  it('request', function (done) {
    amino.request('whoa', '/', function (err, res, body) {
      assert.ifError(err);
      assert.equal(body, 'omg');
      done();
    });
  });
  it('crash', function (done) {
    var gotWhoa, gotTrace;
    proc.stderr.on('data', function (chunk) {
      var data = chunk.toString();
      if (data.match(/like whoa!/)) {
        gotWhoa = true;
      }
      if (data.match(/ReferenceError: whoa is not defined/) && data.match(/crashServer\.js:5:3/)) {
        gotTrace = true;
      }
      if (gotWhoa && gotTrace) {
        done();
      }
    });
    proc.kill('SIGUSR1');
  });
  it('times out until service restored', function (done) {
    amino.request('whoa', '/', function (err, res, body) {
      assert.ifError(err);
      assert.equal(body, 'omg');
      done();
    });
    setTimeout(function () {
      service = createTestService('whoa', 'omg');
    }, 1000);
  });
});