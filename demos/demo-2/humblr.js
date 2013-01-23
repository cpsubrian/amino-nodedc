var http = require('http')
  , amino = require('amino').init();

var server = http.createServer(function (req, res) {
  res.end('Humblr - Where Hipsters Blog\n');
  console.log('Served request');
});

amino.createService('humblr', server);