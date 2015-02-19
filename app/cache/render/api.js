'use strict';

/* global CacheContract,
          Client
*/

const CACHE_TYPE = 'render-cache';

function RenderCacheAPI(theWorker) {
  this.bridge = new Client(CacheContract, theWorker);
  this.bridge.addEventListener('saved', this.onSaved.bind(this));
}

RenderCacheAPI.prototype.save = function(url, markup) {
  // debug('Sending save cache for ' + url);
  return this.bridge.put(CACHE_TYPE, url, markup);
};

// Utility method to save the current document
RenderCacheAPI.prototype.saveCurrent = function() {
  var url = document.location.toString();
  var markup = document.documentElement.outerHTML;
  return this.save(url, markup);
};

RenderCacheAPI.prototype.evict = function(url) {
  // debug('Sending evict cache for ' + url);
  return this.bridge.evict(CACHE_TYPE, url);
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
  var url = document.location.toString();
  return this.evict(url);
};

RenderCacheAPI.prototype.onSaved = function() {
  // debug('Cache saved for ' + args.url);
};

var worker = navigator.serviceWorker ? navigator.serviceWorker.controller
                                     : null;
if (worker) {
  window.renderCache = new RenderCacheAPI(worker);
}
