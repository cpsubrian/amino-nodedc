module.exports = function mefirst(emitter, ev, listener) {
  var listeners = emitter.listeners(ev).slice(0);
  emitter.removeAllListeners(ev);
  listeners.unshift(listener);
  listeners.forEach(emitter.on.bind(emitter, ev));
};