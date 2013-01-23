module.exports = function createRequest (reqSpec) {
  var req = amino.requestService(reqSpec, function (spec) {
    req.spec = spec;
    req.socket = net.createConnection(spec.port, spec.host, req.emit.bind(req, 'connect'));
    req.socket.on('data', req.emit.bind(req, 'data'));
    req.socket.once('end', req.emit.bind(req, 'end'));
    req.socket.once('close', req.emit.bind(req, 'close'));
    req.socket.on('error', req.emit.bind(req, 'error'));
    req.socket.setTimeout(100);
    req.socket.setEncoding('utf8');
  });
  req.write = function () {
    req.socket.write.apply(req.socket, arguments);
  };
  req.end = function () {
    req.socket.end.apply(req.socket, arguments);
  };
  return req;
};