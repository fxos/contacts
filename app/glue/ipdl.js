'use strict';

importScripts('glue/ipdl_parser.js');

function IPDL(name) {
  var ast = parser.parse(this._getFileContent(name));
  this.side = this.getSide(ast.sides);
  this.otherside = this.getOtherSide(ast.sides);
  this.debug = ast.debug;

  Object.freeze(this);
}

IPDL.prototype.getSide = function(sides) {
  // XXX This is very weak...
  var sideName = '';

  if (sideName === '') {
    try {
      window;
      // XXX This stuff does not throw in our smartworker.
      // Needs to understand the diff.
      if (window !== undefined) {
        sideName = 'window';
      }
    } catch(e) {}
  }

  if (sideName === '') {
    try {
      postMessage;
      sideName = 'worker';
    } catch(e) {}
  }

  if (sideName === '') {
    sideName = 'serviceworker';
  }

  return sides.find(function(side) {
    return sideName == side.name;
  }, this);
};

IPDL.prototype.getOtherSide = function(sides) {
  return sides.find(function(side) {
    return this.side.name != side.name;
  }, this);
};

IPDL.prototype._getFileContent = function(name) {
  var xhr = new XMLHttpRequest();
  var filename =
    'glue/ipdl/' +
    'P' +
    name.charAt(0).toUpperCase() + name.slice(1) +
    '.ipdl';

  xhr.open('GET', filename, false);
  xhr.send();

  return xhr.responseText;
};

