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

  exports.getSWInstance = function() {
    if (navigator.serviceWorker.controller) {
      return Promise.resolve(navigator.serviceWorker.controller);
    }
    return navigator.serviceWorker.getRegistrations().then( r => {
      var service = document.location.toString();
      r.forEach(registration => {
        if (service.starsWith(registration.scope) && registration.active) {
          return Promise.resolve(registration.active);
        }
      });

      return Promise.reject('Could not find ServiceWorker');
    });
  }
})(window);
