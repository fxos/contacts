'use strict';

/*global Server, renderCacheContract, debug, normalizeUrl, caches, Response*/

importScripts('/contacts/app/sw-utils.js');
importScripts('/contacts/app/rendercache/contract.js');
importScripts('/contacts/app/components/runtime-bridge/server.js');

var CACHE = 'render-cache-v0';

function RenderCacheWorker() {
  this.protocol = new Server(renderCacheContract, {
    save: this.save.bind(this),
    evict: this.evict.bind(this)
  });
}

RenderCacheWorker.prototype.save = function(url, markup) {
  return new Promise((resolve, reject) => {
    debug('Got save with ' + url);

    if (!url || !markup) {
      debug('Invalid cache');
      reject();
      return;
    }

    var normalizedUrl = normalizeUrl(url);

    debug('Normalized URL ' + normalizedUrl);

    var self = this;

    caches.open(CACHE).then(function(cache) {
      return cache.put(normalizedUrl, new Response(markup, {
        headers: {
          'Content-Type': 'text/html'
        }
      }));
    }).then(function() {
      debug('Saved correctly, broadcasting');
      self.protocol.broadcast('saved');
      debug('Broadcasting done, resolving the promise');
      resolve();
    }).catch(function(error) {
      debug('Could not save cache for ' + normalizedUrl + ' ' + error);
      reject();
    });
  });
};

RenderCacheWorker.prototype.evict = function(url) {
  url = normalizeUrl(url);
  debug('Got evict for ' + url);
  return caches.open(CACHE).then(function(cache) {
    return cache.delete(url);
  });
};

RenderCacheWorker.prototype.match = function(url) {
  url = normalizeUrl(url);
  debug('[rendercache] Looking for ' + url + ' in render cache');
  return caches.open(CACHE).then(function(cache) {
    return cache.match(url);
  });
};

var renderCache = new RenderCacheWorker();
