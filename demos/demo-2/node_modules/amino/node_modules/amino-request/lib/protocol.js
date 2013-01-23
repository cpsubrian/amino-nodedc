var http = require('http')
  , getAgent = require('./agent')

module.exports = function getProtocol (options) {
  var proto = {};

  // Mirror http's exports.
  Object.keys(http).forEach(function (k) {
    proto[k] = http[k];
  });

  proto.Agent = getAgent(options);
  proto.globalAgent = new proto.Agent();
  return proto;
};