'use strict';

importScripts('/contacts/app/sw-utils.js');
importScripts('/contacts/app/glue/protocol_helper.js');

var CACHE = 'render-cache-v0';

function RenderCacheWorker() {
  this.protocol = new IPDLProtocol('renderCache');
  this.protocol.recvSave = this.save.bind(this);
  this.protocol.recvEvict = this.evict;
};

RenderCacheWorker.prototype.save = function(resolve, reject, args) {
  var url = args.url;

  debug('Got save with ' + url);

  if (!url || !args.markup) {
    debug('Invalid cache');
    reject();
    return;
  }

  var normalizedUrl = normalizeUrl(url);

  debug('Normalized URL ' + normalizedUrl);

  var self = this;

  caches.open(CACHE).then(function(cache) {
    return cache.put(normalizedUrl, new Response(args.markup, {
      headers: {
        'Content-Type': 'text/html'
      }
    }))
  }).then(function() {
    self.protocol.sendSaved(url);
    resolve();
  }).catch(function(error) {
    debug('Could not save cache for ' + normalizedUrl + ' ' + error);
    reject();
  });
};

RenderCacheWorker.prototype.evict = function(resolve, reject, args) {
  debug('Got evict for ' + args.url);
  resolve();
};

RenderCacheWorker.prototype.match = function(url) {
  url = normalizeUrl(url);
  // debug('Looking for ' + url + ' in render cache');
  return caches.open(CACHE).then(function(cache) {
    return cache.match(url);
  });
}
