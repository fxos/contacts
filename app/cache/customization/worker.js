/* global caches,
          Promise,
          normalizeUrl,
          Response
*/

/* exported CustomizationCacheWorker */

(function(exports) {
  'use strict';

  function guessMimeType(url) {
    switch (url.slice(url.lastIndexOf('.') + 1)) {
      case 'css':
        return 'text/css';
      case 'js':
        return 'application/javascript';
      default:
        return 'text/html';
    }
  }

  exports.CustomizationCacheWorker = {
    get cacheName() {
      return 'customization-cache-v0';
    },

    put: function(url, content) {
      // TODO: Just dumb method, will be updated in the next commit
      return caches.open(this.cacheName).then(function(cache) {
        return cache.put(normalizeUrl(url), new Response(content, {
          headers: {
            'Content-Type': guessMimeType(url)
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
