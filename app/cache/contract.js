(function(exports) {
  exports.CacheContract = Object.freeze({
    name: 'cache',

    methods: {
      put: {
        args: ['string', 'string', 'string']
      },

      evict: {
        args: ['string', 'string']
      },

      delete: {
        args: ['string']
      }
    },

    events: {
      saved: 'undefined'
    }
  });
})(self);
