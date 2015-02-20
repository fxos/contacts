/* global CacheContract,
          Client
*/

(function(exports) {
  'use strict';

  const CACHE_TYPE = 'render-cache';

  function RenderCacheAPI() {
    this.bridgePromise = navigator.serviceWorker.ready.then((registration) => {
      return new Client(CacheContract, registration.active);
    });
  }

  RenderCacheAPI.prototype.save = function(url, markup) {
    return this.bridgePromise.then(function(bridge) {
      return bridge.put(CACHE_TYPE, url, markup);
    });
  };

  // Utility method to save the current document
  RenderCacheAPI.prototype.saveCurrent = function() {
    var url = document.location.toString();
    var markup = document.documentElement.outerHTML;
    return this.save(url, markup);
  };

  RenderCacheAPI.prototype.evict = function(url) {
    return this.bridgePromise.then(function(bridge) {
      return bridge.evict(CACHE_TYPE, url);
    });
  };

  RenderCacheAPI.prototype.delete = function() {
    return this.bridgePromise.then(function(bridge) {
      return bridge.delete(CACHE_TYPE);
    });
  };

  RenderCacheAPI.prototype.evictList = function() {
    // XXX we shouldn't evict the contacts list always,
    // but so far we will rebuild each time we have a change
    var url = document.location.toString();
    url = url.substr(0, url.indexOf('/', 7)) +
     '/contacts/app/views/list/index.html';
    return this.evict(url);
  };

  RenderCacheAPI.prototype.evictCurrent = function() {
    return this.evict(document.location.toString());
  };

  exports.RenderCache = new RenderCacheAPI();
})(self);
