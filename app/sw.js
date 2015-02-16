'use strict';

/*13413f*/

/*global debug, caches, ServiceWorker, kCacheFiles, renderCache, Response*/


importScripts(
  '/contacts/app/sw-utils.js',
  '/contacts/app/rendercache/worker_api.js'
);

var worker = new ServiceWorker();

const OFFLINE_CACHE = 'offline-cache-v0';

worker.oninstall = function(e) {
  debug('oninstall');

  importScripts('/contacts/app/sw-files.js');

  e.waitUntil(
    caches.open(OFFLINE_CACHE).then(function(cache) {
      return cache.addAll(kCacheFiles).then(function() {
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
  var url = e.request.url;

  e.respondWith(
    renderCache.match(url).then(function(response) {
      if (response) {
        debug('returning rendered content previously cached for: ' + url);
        return Promise.resolve(response);
      }

      if (url.indexOf('?') != -1) {
        url = url.split('?')[0];
      }

      return caches.open(OFFLINE_CACHE).then(function(cache) {
        return cache.match(url);
      }).then(function(response) {
        if (!response) {
          // fetch(e.request) never resolves.
          // e.default() crashes the browser
          debug(url + ' is NOT in the cache');
          return Promise.resolve(new Response(''));
        }
        debug(url + ' is in the cache');
        return response;
      }).catch(function(error) {
        debug('Error for ' + e.request.url + ' ' + error);
      });
    })
  );
};
