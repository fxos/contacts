/* exported CustomizationWorkerContract */

(function(exports) {
  'use strict';

  exports.CustomizationWorkerContract = Object.freeze({
    name: 'customization-worker',

    methods: {
      apply: {
        args: ['object'],
        returns: undefined
      }
    },

    events: {
      customizationavailable: 'object'
    }
  });
})(self);
