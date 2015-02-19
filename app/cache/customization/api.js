/* global CacheContract,
          Client
*/

/*
  How it works:

  var patch = UpdateUtils.getFileContent(
    '/contacts/app/patches/patch.patch'
  );

  var appliedPatch = UpdateUtils.apply(patch);

  Object.keys(appliedPatch).forEach(function(url) {
    CustomizationCache.put(url, appliedPatch[url]);
  });

  RenderCache.delete();
 */

(function(exports) {
  'use strict';

  const CACHE_TYPE = 'customization-cache';

  var bridgePromise = navigator.serviceWorker.ready.then((registration) => {
    return new Client(CacheContract, registration.active);
  });

  exports.CustomizationCache = {
    put: function(url, content) {
      return bridgePromise.then(function(bridge) {
        return bridge.put(CACHE_TYPE, url, content);
      });
    },

    evict: function(url) {
      return bridgePromise.then(function(bridge) {
        return bridge.evict(CACHE_TYPE, url);
      });
    }
  };
})(self);
