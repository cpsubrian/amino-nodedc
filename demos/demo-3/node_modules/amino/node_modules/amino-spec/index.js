var idgen = require('idgen');

function Spec(set) {
  if (set) {
    if (typeof set === 'string') {
      set = {service: set};
    }
    // Parse a version out of service
    if (set.service && set.service.indexOf('@') !== -1) {
      var parts = set.service.split('@');
      this.service = parts[0];
      this.version = parts[1];
      delete set.service;
    }
    var self = this;
    Object.keys(set).forEach(function (k) {
      self[k] = set[k];
    });
  }
  if (!this.id) {
    this.id = idgen();
  }
}

Spec.prototype.toString = function() {
  if (this.version) {
    return this.service + '[v' + this.version + ']@' + this.host + ':' + this.port;
  }
  else if (this.service) {
    return this.service + '@' + this.host + ':' + this.port;
  }
  else if (this.host && this.port) {
    return this.host + ':' + this.port;
  }
  return this.id;
};

module.exports = exports = Spec;

exports.attach = function (options) {
  var amino = this;
  amino.Spec = Spec;
};