var getProtocol = require('./lib/protocol')
  , ServiceRequest = require('./lib/service-request')
  , http = require('http')
  , https = require('https')
  , request = require('request')

exports.attach = function (options) {
  var amino = this;
  amino.protocol = getProtocol(options);

  var customRequest = request.defaults({
    httpModules: { 'amino:': amino.protocol, 'http:': http, 'https:': https },
    json: true
  });

  amino.request = function (service, path, options, cb) {
    if (typeof service === 'object' || (typeof service === 'string' && service.indexOf('://') !== -1)) {
      cb = path;
      return customRequest(service, cb);
    }
    else if (typeof options === 'function') {
      cb = options;
      options = {};
    }
    var pathMatches = path.match(/^(?:(\w+) )?(\/.*)$/);
    if (!pathMatches) {
      var err = new Error('invalid path spec: ' + path);
      if (typeof cb === 'function') {
        cb(err);
      }
      else {
        throw err;
      }
    }
    var method = pathMatches[1] ? pathMatches[1].toUpperCase() : 'GET';
    path = pathMatches[2]
    var reqSpec = new amino.Spec(service);
    var opts = amino.utils.copy(options);
    opts.url || (opts.url = 'amino://' + reqSpec.service + path);
    opts.headers || (opts.headers = {});
    opts.headers['X-Amino-Version'] = reqSpec.version;
    opts.method || (opts.method = method);

    return customRequest(opts, cb);
  };

  amino.requestService = function (reqSpec, cb) {
    reqSpec = new amino.Spec(reqSpec);
    var req = new ServiceRequest(reqSpec);
    req.once('spec', cb);
    amino.protocol.globalAgent.addRequest(req, reqSpec.service);
    return req;
  };

  var _reset = amino.reset;
  amino.reset = function () {
    amino.protocol.globalAgent.reset();
    _reset && _reset();
  };
};