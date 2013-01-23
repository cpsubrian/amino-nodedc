var prompt = require('prompt');
var amino = require('amino').init({
  redis: 'n.s8f.org:6379'
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