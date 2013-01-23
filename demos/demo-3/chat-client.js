var amino = require('amino').init({
  redis: 'n.s8f.org:6379'
});

amino.subscribe('chat', function (name, chat) {
  console.log(name + ': ' + chat);
});