/* global Promise */

/* exported importScripts, onDomReady */

(function(exports) {
  'use strict';

  exports.importScripts = function () {
    Array.from(arguments).forEach(function(script) {
      if (document.querySelector('script[src="' + script + '"]')) {
        return;
      }

      var element = document.createElement('script');
      element.setAttribute('src', script);
      element.async = false;
      element.defer = false;

      document.head.appendChild(element);
    });
  };

  exports.onDomReady = function() {
    return new Promise(function(resolve) {
      document.addEventListener('DOMContentLoaded', resolve);
    });
  };
})(window);
