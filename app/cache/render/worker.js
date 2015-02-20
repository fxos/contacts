/* global caches,
          normalizeUrl,
          Promise,
          Response
*/

/* exported RenderCacheWorker */

(function(exports) {
  'use strict';

  exports.RenderCacheWorker = {
    get cacheName() {
      return 'render-cache-v0';
    },

    put: function(url, content) {
      return caches.open(this.cacheName).then(function(cache) {
        return cache.put(normalizeUrl(url), new Response(content, {
          headers: {
            'Content-Type': 'text/html'
          }
        }));
      });
    },

    evict: function(url) {
      return caches.open(this.cacheName).then(function(cache) {
        return cache.delete(normalizeUrl(url));
      });
    },

    match: function(url) {
      return caches.open(this.cacheName).then(function(cache) {
        return cache.match(normalizeUrl(url));
      }).then(function(response) {
        // Reject if nothing found in the cache
        return response ? response : Promise.reject();
      });
    },

    delete: function() {
      return caches.delete(this.cacheName);
    }
  };
})(self);
