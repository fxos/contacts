'use strict';

function PromiseStore() {
  this._queue = {};

  Object.freeze(this);
}

PromiseStore.prototype.has = function(uuid) {
  return !!this._queue[uuid];
};

PromiseStore.prototype.new = function(uuid) {
  var resolveCallback = null;
  var rejectCallback = null;
  var promise = new Promise(function(resolve, reject) {
    resolveCallback = resolve;
    rejectCallback = reject;
  });
  promise.resolve = resolveCallback;
  promise.reject = rejectCallback;

  return this._queue[uuid] = promise;
};

PromiseStore.prototype.delete = function(uuid) {
  delete this._queue[uuid];
};

PromiseStore.prototype.get = function(uuid) {
  return this._queue[uuid];
};

PromiseStore.prototype.resolve = function(uuid, success, rv) {
  var promise = this.get(uuid);
  if (success) {
    promise.resolve(rv);
  } else {
    promise.reject(rv);
  }

  this.delete(uuid);
};

