
var syncManagerContract = {
  name: 'sync-manager',

  methods: {
    startSync: {
      args: ['string', 'string', 'number'],
      returns: undefined
    },

    stopSync: {
      args: ['string', 'string'],
      returns: undefined
    }
  },

  events: {
    changesdetected: 'object',
    syncsucceeded: 'object',
    syncfailed: 'object'
  }
};
