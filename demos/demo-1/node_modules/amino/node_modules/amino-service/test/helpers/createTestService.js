module.exports = function createTestService (name, text, done) {
  var server = http.createServer(function (req, res) {
    res.end(text);
  });
  var service = amino.createService(name, server);
  service.on('listening', function () {
    assert.equal(typeof service.spec.port, 'number');
    done && done();
  });
  return service;
};