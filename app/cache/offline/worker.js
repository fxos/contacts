/* global caches,
          kCacheFiles
*/

/* exported OfflineCacheWorker */

(function(exports) {
  'use strict';

  exports.OfflineCacheWorker = {
    get cacheName() {
      return 'offline-cache-v0';
    },

    install: function() {
      importScripts('/contacts/app/sw-files.js');

      return caches.open(this.cacheName).then(function(cache) {
        return cache.addAll(kCacheFiles);
      });
    },

    match: function(url) {
      if (url.indexOf('?') != -1) {
        url = url.split('?')[0];
      }

      return caches.open(this.cacheName).then(function(cache) {
        return cache.match(url);
      }).then(function(response) {
        // Reject if nothing found in the cache
        return response ? response : Promise.reject();
      });
    }
  };
})(self);
