var prompt = require('prompt');
var amino = require('amino').init({
  redis: {'viperfish.redistogo.com:9269' : 'a2743ce3be7f9de65eed2099a4a6bd34'}
});

prompt.message = '';
prompt.delimiter = '> ';
prompt.start();

prompt.get(['name'], function (err, result) {
  if (err) return console.error(err);

  var name = result.name;

  function chat () {
    prompt.get(['msg'], function (err, result) {
      if (err) {
        console.error(err);
        process.exit();
      }
      amino.publish('chat', name, result.msg);
      chat();
    });
  }

  chat();
});