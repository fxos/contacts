
var syncManagerContract = {
  name: 'sync-manager',

  methods: {
    startSync: {
      args: ['string', 'string'],
      returns: undefined
    },

    stopSync: {
      args: ['string', 'string'],
      returns: undefined
    },
  },

  events: {
    changesdetected: 'object',
    syncsucceeded: 'object',
    syncfailed: 'object'
  }
};
