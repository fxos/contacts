(function(exports) {
  exports.CacheContract = Object.freeze({
    name: 'cache',

    methods: {
      put: {
        args: ['string', 'string', 'string']
      },
      evict: {
        args: ['string', 'string']
      }
    },

    events: {
      saved: 'undefined'
    }
  });
})(self);
