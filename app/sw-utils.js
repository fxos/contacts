'use strict';

// XXX Firefox compat with latest spec
if ('getServiced' in clients) {
  clients.getAll = clients.getServiced;
}

function debug(str) {
  console.log('ServiceWorker: ' + str);

  if ('dump' in self) {
    dump('ServiceWorker: ' + str + '\n');
  }
}

function ServiceWorker() {
  // lifecycle events
  addEventListener('activate', this);
  addEventListener('install', this);
  addEventListener('beforeevicted', this);
  addEventListener('evicted', this);

  // network events
  addEventListener('fetch', this);

  // misc events
  addEventListener('message', this);
};

ServiceWorker.prototype.handleEvent = function(e) {
  if (!this['on' + e.type]) {
    return;
  }

  this['on' + e.type].call(this, e);
};
