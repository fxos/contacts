'use strict';

function RenderCacheAPI(theWorker) {
  this.protocol = new IPDLProtocol('renderCache', theWorker);
  this.protocol.recvSaved = this.onSaved;
};

RenderCacheAPI.prototype.save = function(url, markup) {
  // debug('Sending save cache for ' + url);
  return this.protocol.sendSave(url, markup);
};

// Utility method to save the current document
RenderCacheAPI.prototype.saveCurrent = function() {
  var url = document.location.toString();
  var markup = document.documentElement.outerHTML;
  return this.save(url, markup);
};

RenderCacheAPI.prototype.evict = function(url) {
  // debug('Sending evict cache for ' + url);
  return this.protocol.sendEvict(url);
};

RenderCacheAPI.prototype.evictCurrent = function() {
  var url = document.location.toString();
  return this.evict(url);
};

RenderCacheAPI.prototype.onSaved = function(resolve, reject, args) {
  // debug('Cache saved for ' + args.url);
  resolve();
};

var worker = null;
getSWInstance().then(w => {
  worker = w;
  if (worker) {
    window.renderCache = new RenderCacheAPI(worker);
  }
});
