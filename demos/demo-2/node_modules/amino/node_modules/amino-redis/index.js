var redis = require('haredis')
  , hydration = require('hydration')
  , EventEmitter = require('events').EventEmitter

exports.attach = function (options) {
  var amino = this
    , subscriber = new EventEmitter
    , client

  if (typeof options === 'string') {
    var split = options.split(':');
    options = {host: split[0]};
    if (split[1] && split[1].match(/^\d+$/)) {
      options.port = parseInt(split[1], 10);
    }
  }
  else if (typeof options === 'number') {
    options = {port: options};
  }
  else if (options && !Array.isArray(options) && options['0']) {
    // Support for nodes as object, like optimist might produce.
    var nodes = [];
    Object.keys(options).forEach(function (k) {
      if (k.match(/^\d+$/)) {
        nodes.push(options[k]);
        delete options[k];
      }
    });
    options.nodes = nodes;
  }
  else if (Array.isArray(options)) {
    options = {nodes: options};
  }
  else {
    options || (options = {host: 'localhost', port: 6379});
  }

  if (options.nodes) {
    // haredis node list
    client = redis.createClient(options.nodes, options);
  }
  else {
    client = redis.createClient(options.port, options.host, options);
  }

  subscriber.setMaxListeners(0);

  client.on('error', amino.emit.bind(amino, 'error'));
  client.on('subscribe', amino.emit.bind(amino, 'subscribe'));
  client.on('unsubscribe', amino.emit.bind(amino, 'unsubscribe'));

  client.on('message', function (ev, packet) {
    try {
      packet = JSON.parse(packet);
      packet = hydration.hydrate(packet);
      subscriber.emit.apply(subscriber, [ev].concat(packet.args));
    }
    catch (e) {
      amino.emit('error', e);
    }
  });

  amino.publish = function () {
    var args = Array.prototype.slice.call(arguments)
      , ev = args.shift()

    try {
      args = {args: args}; // (dehydration only works on objects)
      args = hydration.dehydrate(args);
      client.publish(ev, JSON.stringify(args));
    }
    catch (e) {
      amino.emit('error', e);
    }
  };

  amino.subscribe = function (ev, handler) {
    subscriber.on(ev, handler);
    client.subscribe(ev);
  };

  amino.unsubscribe = function (ev, handler) {
    if (handler) {
      subscriber.removeListener(ev, handler);
    }
    else {
      subscriber.removeAllListeners(ev);
    }
    if (subscriber.listeners(ev).length === 0) {
      client.unsubscribe(ev);
    }
  };
};