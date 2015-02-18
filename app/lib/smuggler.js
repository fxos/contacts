(function() {
  'use strict';

  // TODO:
  // For the first iteration this code is going to live in the
  // main UI Thread.
  // That said it will be nicer if we can bootstrap it into a Worker
  // on some devices, so if there is a lot of traffic the UI Thread
  // is not affected.

  // TODO: Have a map of all contracts
  // Should we just passed the name of the contract and the smuggler
  // is responsible to open the right file for it ?
  // Then it will return the contract to the client, or the server,
  // as well as a uuid to transfer data over the channel.
  //
  //var contracts = new Map(); 


  // TODO: Read the configuration from a file
  // This is the default configuration used for the app.
  // It describes in which type of environment the server will run.
  // TODO: Find a nicer format
  // For the same url it sounds like we always want it to run in 
  // the same server.
  // We likely want something like:
  //  {
  //    url: {
  //      contracts: [],
  //      type: Worker
  //    }
  //  }
  // But this format does not fit perfectly with our registrations map.
  var config = {
    'list': {
      url: 'lib/db_worker.js',
      type: SharedWorker
    },

    'detail': {
      url: 'lib/db_worker.js',
      type: SharedWorker
    },

    'edit': {
      url: 'lib/db_worker.js',
      type: SharedWorker
    },

    'sync-manager': {
      url: 'lib/sync_manager_worker.js',
      type: Worker
    },

    'ListContract': {
      url: 'workers/list/worker.js',
      type: Worker
    },

    'render-cache': {
      url: 'sw.js',
      type: ServiceWorker
    }
  };

  function getConfigForContract(contract) {
    return config[contract.name] || null;
  }

  var channel = new BroadcastChannel('smuggler');
  channel.onmessage = function(msg) {
    switch (msg.data.type) {
      case 'Register':
        register(msg.data.contract);
        break;

      case 'Unregister':
        unregister(msg.data.contract);
        break;
    }
  };

  // TODO: Should active be a boolean or a reference to the server ?
  // I feel like it should be a instance of the server.
  //
  // Registrations is a map of contracts, that has a list of clients
  // and who is the server.
  // It also contains the unique UUID used for the side-to-side
  // communications between one client and the server.
  //
  // This is more or less something like:
  //  {
  //    contract: {
  //      active: true,
  //      clients: [uuid1, uuid2, ...]
  //    }
  //  }
  //
  // When the server is running the |active| state is set to true.
  // If |active| then the smuggler does not see datas that are
  // transferred.
  // If |!active| then the smuggler receive the data, start the
  // server using the defined configuration, and forward the request
  // before setting |active| to true and forget about the channel.
  // 
  // In some special cases we would like to intercept messages even
  // if |active| is set to true.
  // For example we may want to be able to inspect the data
  // that are exchange between the client and the server and rewrite
  // them on the fly for debugging purpose.
  // Or if one of the client is not prioritary anymore (it may
  // happens if the client is a view, and this is not the view
  // that is currently visible to the user. Then we may want to
  // intercept those messages in order to delay them a little bit
  // to favor the server that is actively running.
  //
  var registrations = new Map();

  function registerContract(contract) {
    if (registrations.has(contract)) {
      return;
    }

    var registration = {
      active: false,
      clients: []
    };

    registrations.set(contract, registration);
  }

  function registerClientForContract(uuid, contract) {
    registerContract(contract);

    var registration = registrations.get(contract);
    registration.clients.push(uuid);
  }

  function hasClientsForContract(contract) {
    var registration = registrations.get(contract);
    return !!registration.clients.length;
  }

  function getClientsForContract(contract) {
    var registration = registrations.get(contract);
    return registration.clients;
  }

  function registerServerForContract(server, contract) {
    registerContract(contract);

    var registration = registrations.get(contract);
    registration.server = server;
  }

  function hasServerForContract(contract) {
    var registration = registrations.get(contract);
    return !!registration.server;
  }

  function getServerForContract(contract) {
    var registration = registrations.get(contract);
    return registration.server;
  }

  // TODO: Just use a name and a version for registration.
  // In order to activate this, Client/Server code needs to be changed
  // in such a way that |new Client('list');| returns a promise instead
  // of returning directly the protocol object.
  // Also the smuggler needs to have a global contracts database that
  // can be populated at runtime.
  var kEmptyRegistration = 'Empty registration are not allowed.';
  var kEmptyContract = 'Empty contract are not allowed.';
  var kUnknownRegistrationType = 'Unknown registration type.';
  function register(registration) {
    if (!registration) {
      throw new Error(kEmptyRegistration);
    }
    console.log('Someone is trying to register: ' + registration);

    var contract = registration.contract;
    if (!contract) {
      throw new Error(kEmptyContract);
    }
    console.log('Someone is trying to register a contract: ' + contract);

    switch (registration.type) {
      case 'client':
        registerClientForContract(registration.uuid, contract);

        // TODO: Lazily start the server.
        // The server does not need to run if the client is not trying
        // to exchange any data. So the smuggler should first listen for
        // data coming over the communication channel before and once there
        // is some it can start the server and forward it the data before
        // dropping its own reference to the communication channel.
        // But for now we are lazy and start the server as soon the client
        // is connected.
        if (!hasServerForContract(contract)) {
          var config = getConfigForContract(contract)
          var server = new config.type(config.url);
          registerServerForContract(server, contract);
        }

        if (hasServerForContract(contract)) {
          var server = getServerForContract(contract);
          // TODO: Sending the raw uuid sounds a bit agressive. Can we
          // do better.
          server.postMessage(registration.uuid);
        }

        // TODO: Returns something to the client, so it knows that
        // the server is ready and aware of it before sending data!
        break;

      case 'server':
        registerServerForContract(uuid, contract);

        if (hasClientsForContract(contract)) {
          // TODO:
          // Forward clients uuids to the server if the server is
          // restarted lazily.
        }
        break;

      default:
        // TODO: Add a new type so it less us see which kind of datas
        // are exchanged, and it may open the way to build some tools
        // to monitor messages latencies.
        throw new Error(registration.type + ': ' + kUnknowRegistrationType);
        break;
    }
  };

  function unregister(registration) {
    console.log('Someone is trying to unregister: ' + registration);
  };

});
