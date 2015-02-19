/* global caches,
          Promise,
          normalizeUrl,
          Response
*/

/* exported CustomizationCacheWorker */

(function(exports) {
  'use strict';

  exports.CustomizationCacheWorker = {
    get cacheName() {
      return 'customization-cache-v0';
    },

    put: function(url, content) {
      // TODO: Just dumb method, will be updated in the next commit
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
    }
  };
})(self);
