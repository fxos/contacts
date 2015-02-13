'use strict';

function RenderCacheAPI(theWorker) {
  this.protocol = new IPDLProtocol('renderCache', worker);
  this.protocol.recvSaved = this.onSaved;
};

RenderCacheAPI.prototype.save = function(url, markup) {
  // debug('Sending save cache for ' + url);
  return this.protocol.sendSave(url, markup);
};

RenderCacheAPI.prototype.evict = function(url) {
  // debug('Sending evict cache for ' + url);
  return this.protocol.sendEvict(url);
};

RenderCacheAPI.prototype.onSaved = function(resolve, reject, args) {
  // debug('Cache saved for ' + args.url);
  // This is an awful hack to avoid rendering again if we already
  // have the DOM ready because we are consuming a cached session.
  localStorage.setItem('rendercache', args.url);
  resolve();
};

var worker = navigator.serviceWorker.controller;
if (worker) {
  window.renderCache = new RenderCacheAPI(worker);
}
