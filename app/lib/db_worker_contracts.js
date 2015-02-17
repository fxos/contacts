
var contracts = {
  list: {
    name: 'list',

    methods: {
      getAll: {
        args: [],
        returns: 'object'
      }
    },

    events: {
      contactchange: 'object'
    }
  },

  detail: {
    name: 'detail',

    methods: {
      get: {
        args: ['string'],
        returns: 'object'
      },

      remove: {
        args: ['object']
      }
    },

    events: {
      contactchange: 'object'
    }
  },

  edit: {
    name: 'edit',

    methods: {
      save: {
        args: ['object'],
        returns: 'object'
      }
    },

    events: {
      contactchange: 'object'
    }
  }
};
