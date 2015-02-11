'use strict';

importScripts('sw-utils.js');

var worker = new ServiceWorker();

const OFFLINE_CACHE = 'offline-cache-v0';

worker.oninstall = function(e) {
  debug('oninstall');

  e.waitUntil(
    caches.open(OFFLINE_CACHE).then(function(cache) {
      return cache.addAll(['/index.html']).then(function() {
        debug('Added files to cache');
        return Promise.resolve();
      }).catch(function(error) {
        debug('Error ' + error);
      });
    })
  );
};

worker.onactivate = function(e) {
  debug('onactivate');
};

worker.onfetch = function(e) {
  debug('onfetch: ' + e.request.url);
  e.respondWith(
    caches.open(OFFLINE_CACHE).then(function(cache) {
      return cache.match(e.request.url);
    }).then(function(response) {
      if (!response) {
        return fetch(e.request);
      }
      return response;
    })
  );
};
