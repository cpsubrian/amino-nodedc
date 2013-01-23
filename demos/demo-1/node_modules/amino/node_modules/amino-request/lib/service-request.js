var EventEmitter = require('events').EventEmitter
  , inherits = require('util').inherits

function ServiceRequest (reqSpec) {
  this.headers = {};
  if (reqSpec.stickyId) {
    this.headers['X-Amino-StickyId'] = reqSpec.stickyId;
  }
  if (reqSpec.version) {
    this.headers['X-Amino-Version'] = reqSpec.version;
  }
}
inherits(ServiceRequest, EventEmitter);
module.exports = ServiceRequest;