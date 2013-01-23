require('../common');

process.on('SIGUSR1', function () {
  console.error('like whoa!');
  whoa();
});

var service = require('./createTestService')('whoa', 'omg', function () {
  console.log(service.spec.port);
});