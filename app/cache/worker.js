/* global Server,
          Promise,
          RenderCacheWorker,
          CustomizationCacheWorker,
          OfflineCacheWorker,
          Map,
          CacheContract
*/

(function(exports) {
  'use strict';

  importScripts('/contacts/app/components/runtime-bridge/server.js');
  importScripts('/contacts/app/cache/contract.js');
  importScripts('/contacts/app/cache/render/worker.js');
  importScripts('/contacts/app/cache/customization/worker.js');
  importScripts('/contacts/app/cache/offline/worker.js');

  /**
   * Supported cache types.
   * @enum {string}
   */
  const CacheType = {
    Render: 'render-cache',
    Customization: 'customization-cache',
    Offline: 'offline-cache'
  };

  /**
   * Map with processor for every supported cache type.
   * @type {Map.<CacheType, CacheWorker>}
   */
  const CacheWorkers = new Map([
    [CacheType.Render, RenderCacheWorker],
    [CacheType.Customization, CustomizationCacheWorker],
    [CacheType.Offline, OfflineCacheWorker]
  ]);

  const cacheBridge = new Server(CacheContract, {
    put: function(cacheType, url, content) {
      console.log('CacheWorker (%s): save %s.', cacheType, url);

      var cacheWorker = CacheWorkers.get(cacheType);
      if (!cacheWorker) {
        return Promise.reject(new Error('Unsupported cache type'));
      }

      if (!url || !content) {
        return Promise.reject(new Error('Url and Content should be defined'));
      }

      return cacheWorker.put(url, content).then(function() {
        console.log('CacheWorker (%s): successfully saved %s.', cacheType, url);
        cacheBridge.broadcast('saved');
      }).catch(function(e) {
        console.error(
          'CacheWorker (%s): failed to save %s.', cacheType, url, e
        );
        return Promise.reject(e);
      });
    },

    evict: function(cacheType, url) {
      console.log('CacheWorker (%s): evict %s', cacheType, url);

      var cacheWorker = CacheWorkers.get(cacheType);
      if (!cacheWorker) {
        return Promise.reject(new Error('Unsupported cache type'));
      }

      if (!url) {
        return Promise.reject(new Error('Url should be defined'));
      }

      return cacheWorker.put(url).then(function() {
        console.log(
          'CacheWorker (%s): successfully evicted %s', cacheType, url
        );
      }).catch(function(e) {
        console.error(
          'CacheWorker (%s): failed to evict %s', cacheType, url
        );
        return Promise.reject(e);
      });
    }
  });

  exports.CacheWorker = {
    install: function(args) {
      var promises = [];

      CacheWorkers.forEach(function(worker, type) {
        // Check if cache worker supports "install action"
        if (typeof worker.install === 'function') {
          console.log('CacheWorker (%s): installing...', type);
          promises.push(worker.install(args).then(function() {
            console.log('CacheWorker (%s): installed!', type);
          }, function(e) {
            console.error('CacheWorker (%s): failed to install', type, e);
          }));
        }
      });

      return Promise.all(promises);
    },

    match: function(request) {
      var url = request.url;
      console.log('CacheWorker (%s): looking at %s', url, CacheType.Render);
      // TODO: To make app faster every cache worker should do preliminary light
      // check, before accessing CacheStorage, eg. Render cache can skip css/js
      // resources.
      return CacheWorkers.get(CacheType.Render).match(url).catch(function() {
        console.log(
          'CacheWorker (%s): looking at %s', url, CacheType.Customization
        );
        return CacheWorkers.get(CacheType.Customization).match(url);
      }).catch(function() {
        console.log('CacheWorker (%s): looking at %s', url, CacheType.Offline);
        return CacheWorkers.get(CacheType.Offline).match(url);
      });
    }
  };
})(self);
