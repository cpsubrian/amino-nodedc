module.exports = function assertRes (expected, done, err, res, body) {
  assert.ifError(err);
  if (body) {
    assert.equal(body, expected);
    done();
  }
  else {
    body = '';
    res.on('data', function (chunk) {
      body += chunk;
    });
    res.once('end', function () {
      assert.equal(body, expected);
      done();
    });
  }
};