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

  /**
   * Returns a function that will call specified "func" function only after it
   * stops being called for a specified wait time.
   * @param {function} func Function to call.
   * @param {number} waitTime Number of milliseconds to wait before calling
   * actual "func" function once debounced function stops being called.
   * @returns {function}
   */
  exports.debounce = function(func, waitTime) {
    var timeout, args, context;

    var executeLater = function() {
      func.apply(context, args);
      timeout = context = args = null;
    };

    return function() {
      context = this;
      args = arguments;

      if (timeout) {
        clearTimeout(timeout);
      }

      timeout = setTimeout(executeLater, waitTime);
    };
  };
})(window);
