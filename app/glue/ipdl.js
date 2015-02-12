'use strict';

importScripts('/glue/ipdl_parser.js');

function IPDL(name) {
  var ast = parser.parse(this._getFileContent(name));
  this.side = this.getSide(ast.sides);
  this.otherside = this.getOtherSide(ast.sides);
  this.debug = ast.debug;

  Object.freeze(this);
}

IPDL.prototype.getSide = function(sides) {
  var getSide = function(name) {
    return sides.find(function(side) {
      return name === side.name;
    });
  };

  try {
    if (window !== undefined) {
      // TODO: This is a nasty hack that allows to run worker code in a separate
      // tab to be able to debug it. Will get rid of it once get better solution
      return window.__fakeWorker ? getSide('worker') : getSide('window');
    }
  } catch(e) {}

  try {
    if (self instanceof DedicatedWorkerGlobalScope) {
      return getSide('worker');
    }
  } catch(e) {}

  try {
    if (self instanceof SharedWorkerGlobalScope) {
      return getSide('sharedworker');
    }
  } catch(e) {}

  try {
    if (self instanceof ServiceWorkerGlobalScope) {
      return getSide('serviceworker');
    }
  } catch(e) {}

  return null;
};

IPDL.prototype.getOtherSide = function(sides) {
  return sides.find(function(side) {
    return this.side.name != side.name;
  }, this);
};

IPDL.prototype._getFileContent = function(name) {
  var xhr = new XMLHttpRequest();
  var filename =
    '/glue/ipdl/' +
    'P' +
    name.charAt(0).toUpperCase() + name.slice(1) +
    '.ipdl';

  xhr.open('GET', filename, false);
  xhr.send();

  return xhr.responseText;
};

