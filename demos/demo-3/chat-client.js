var amino = require('amino').init({
  redis: {'viperfish.redistogo.com:9269' : 'a2743ce3be7f9de65eed2099a4a6bd34'}
});

amino.subscribe('chat', function (name, chat) {
  console.log(name + ': ' + chat);
});