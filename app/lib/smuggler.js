(function() {
  'use strict';

  function debug(str) {
    //console.log('[smuggler] ' + str);
  };

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
  var config = {
    'lib/db_worker.js': {
      contracts: ['list', 'detail', 'edit'],
      type: Worker
    },

    'lib/sync_manager_worker.js': {
      contracts: ['sync-manager'],
      type: Worker
    },

    'workers/list/worker.js': {
      contracts: ['ListContract'],
      type: Worker
    },

    'sw.js': {
      contracts: ['render-cache'],
      type: function() {
        // TODO: This replicate the current state of thing in the
        // prototype but for real the serviceWorker can be killed
        // at any time, which makes it unclear that postMessage
        // is an option here.
        return navigator.serviceWorker ? navigator.serviceWorker.controller
                                       : new Boolean(false);
      }
    }
  };

  function getConfigForContract(contract) {
    for (var url in config) {
      if (config[url].contracts.indexOf(contract.name) != -1) {
        return {
          url: url,
          type: config[url].type
        }
      }
    }

    return null;
  }

  var channel = new BroadcastChannel('smuggler');
  channel.onmessage = function(msg) {
    switch (msg.data.name) {
      case 'Register':
        register(msg.data);
        break;

      case 'Unregister':
        unregister(msg.data);
        break;
    }
  };

  // Registrations is a map of contracts, that has a list of clients
  // and who is the server.
  // It also contains the unique UUID used for the side-to-side
  // communications between one client and the server.
  //
  // This is more or less something like:
  //  {
  //    contract: {
  //      server: server_instance,
  //      clients: [uuid1, uuid2, ...]
  //    }
  //  }
  //
  // When the server is running the |server| state is set to the
  // server instance.
  // If |server| then the smuggler does not see datas that are
  // transferred.
  // If |!server| then the smuggler receive the data, start the
  // server using the defined configuration, and forward the request
  // before setting |server| to true and forget about the channel.
  // 
  // In some special cases we would like to intercept messages even
  // if |server| is set to true.
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

  // Based on the configuration there could be multiple contracts
  // served by one end point. So if a server instance has already
  // started for a contract that is part of a group, let's return
  // this instance.
  function getInstanceForContract(name) {
    for (var url in config) {
      var contracts = config[url].contracts;
      if (contracts.indexOf(name) === -1) {
        continue;
      }

      for (var i = 0; i < contracts.length; i++) {
        if (!registrations.has(contracts[i])) {
          continue;
        }

        return registrations.get(contracts[i]).server;
      };
    }

    return null;
  }

  function registerContract(name) {
    if (registrations.has(name)) {
      return;
    }

    var registration = {
      server: getInstanceForContract(name),
      clients: []
    };

    registrations.set(name, registration);
  }

  function registerClientForContract(uuid, contract) {
    registerContract(contract.name);

    var registration = registrations.get(contract.name);
    registration.clients.push(uuid);
  }

  function hasClientsForContract(contract) {
    var registration = registrations.get(contract.name);
    return !!registration.clients.length;
  }

  function getClientsForContract(contract) {
    var registration = registrations.get(contract.name);
    return registration.clients;
  }

  function registerServerForContract(server, contract) {
    registerContract(contract.name);

    var registration = registrations.get(contract.name);
    registration.server = server;
  }

  function hasServerForContract(contract) {
    var registration = registrations.get(contract.name);
    return !!registration.server;
  }

  function getServerForContract(contract) {
    var registration = registrations.get(contract.name);
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

    var contract = registration.contract;
    if (!contract) {
      throw new Error(kEmptyContract);
    }

    switch (registration.type) {
      case 'client':
        registerClientForContract(registration.uuid, contract);
        registerServerForContract(
          getInstanceForContract(contract.name),
          contract
        );

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

          // TODO: If the server is supposed to be hosted by a serviceWorker
          // that is not running, then we don't support lazy restart here.
          if (server == false) {
            return;
          }

          registerServerForContract(server, contract);
        }


        if (hasServerForContract(contract)) {
          var server = getServerForContract(contract);
          // TODO: Sending the raw uuid sounds a bit agressive. Can we
          // do better.
          server.postMessage(registration.uuid);
        }
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
    debug('Someone is trying to unregister: ' + registration);
  };

  document.addEventListener('visibilitychange', function killer() {
    if (!document.hidden) {
      return;
    }

    // TODO: It works, but we need a disconnected event for servers,
    // so the client can requeue all its messages until the connection
    // is reactivated.
    registrations.forEach(function(registration) {
      registration.clients.forEach(function(uuid) {
        var channel = new BroadcastChannel(uuid);
        channel.postMessage('die');
        channel.close();
      });

      registration.clients = [];

      setTimeout(function() {
        registration.server && registration.server.terminate();
        registration.server = null;
      }, 1000);
    });
  });

})();

