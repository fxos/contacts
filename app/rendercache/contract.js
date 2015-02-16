
var renderCacheContract = {
  name: 'render-cache',
  methods: {
    save: {
      args: ['string', 'string']
    },
    evict: {
      args: ['string']
    }
  },

  events: {
    saved: 'string'
  }
};

