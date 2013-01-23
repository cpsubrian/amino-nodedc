var EventEmitter = require('events').EventEmitter
  , amino = require('amino')
  , inherits = require('util').inherits
  , os = require('os')
  , dns = require('dns')
  , mefirst = require('mefirst')

function Service (amino, name, server, options) {
  var self = this;
  EventEmitter.call(this);
  this.setMaxListeners(0);

  this.closing = false;
  this.amino = amino;
  this.options = amino.utils.copy(options);
  if (typeof this.options.listen === 'undefined') {
    this.options.listen = true;
  }
  this.server = server;
  this.spec = new amino.Spec(name);
  
  // Get a host/port by configuration and/or discovery.
  // Run first so existing listeners get access to spec.port.
  mefirst(server, 'listening', function () {
    self.spec.port = server.address().port;
    self.publishSpec();
  });

  // Attempt to get my address.
  self.ipAddress(function (err, address) {
    if (err) {
      self.emit('error', new Error("could not autodetect host! Try setting service.options.host manually."));
      return;
    }

    self.spec.host = address;
    if (self.options.listen) {
      server.listen(self.options.port || 0);
    }
  });

  server.once('close', this.onClose.bind(this));

  // Unpublish our spec if process closes.
  self.processListeners = {
    SIGINT: this.onTerminate('SIGINT'),
    SIGKILL: this.onTerminate('SIGKILL'),
    SIGTERM: this.onTerminate('SIGTERM'),
    uncaughtException: this.onTerminate('uncaughtException')
  };

  Object.keys(this.processListeners).forEach(function (sig) {
    process.once(sig, self.processListeners[sig]);
  });
}
inherits(Service, EventEmitter);
module.exports = Service;

// Publish our spec.
Service.prototype.publishSpec = function () {
  var self = this;

  this.responder = function responder (id) {
    self.amino.publish('_get:' + self.spec.service + ':' + id, self.spec);
  };
  self.amino.subscribe('_get:' + this.spec.service, this.responder);
  self.amino.publish('_spec:' + this.spec.service, this.spec);

  self.emit('listening');
};

// Create a handler for process termination on a certain signal.
Service.prototype.onTerminate = function (sig) {
  var self = this;
  return function (err) {
    // Close the server when process is terminated.
    self.close(function () {
      if (!process.listeners(sig).length) {
        if (sig === 'uncaughtException') {
          err.stack ? console.error(err.stack) : console.error(err);
          process.exit(1);
        }
        process.exit();
      }
    });
  };
};

// Get my IP address.
Service.prototype.ipAddress = function (done) {
  var self = this;
  if (!self.options.host) {
    dns.lookup(os.hostname(), function (err, address, fam) {
      if (!err) {
        self.options.host = address;
      }
      done(err, self.options.host);
    });
  }
  else {
    done(null, self.options.host);
  }
};

// Close the server and the service.
Service.prototype.close = function (cb) {
  if (cb) this.once('close', cb);
  this.server.close();
  this.onClose();
};

// Close the service, unpublishing spec and shutting down the server (if we
// started one)
Service.prototype.onClose = function () {
  var self = this;
  if (this.closing) {
    return;
  }
  this.closing = true;

  if (this.responder) {
    self.amino.unsubscribe('_get:' + this.spec.service, this.responder);
    delete this.responder;

    self.amino.publish('_drop:' + this.spec.service, this.spec);
    self.amino.publish('_close:' + this.spec.service, this.spec);

    // If the server is manually closed, we don't want an event listener leak.
    Object.keys(this.processListeners).forEach(function (k) {
      process.removeListener(k, self.processListeners[k]);
    });
  }
  this.emit('close');
};