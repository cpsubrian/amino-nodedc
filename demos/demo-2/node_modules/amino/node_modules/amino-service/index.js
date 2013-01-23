exports.attach = function (options) {
  var amino = this;
  var Service = require('./lib/service');
  this.createService = function (name, server) {
    return new Service(amino, name, server, options);
  };
};