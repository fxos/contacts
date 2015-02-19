/* global importScripts,
          syncManagerContract,
          myPouch,
          Server,
          Map
*/

(function() {
  'use strict';

  importScripts('/contacts/app/components/runtime-bridge/server.js');
  importScripts('/contacts/app/lib/sync_manager_contract.js');
  importScripts('/contacts/app/api/pouchdb.js');
  importScripts('/contacts/app/app_config.js');

  const bridge = new Server(syncManagerContract, {
    startSync: startSync,
    stopSync: stopSync
  });

  const syncHandles = new Map();

  function ensureValidDBName(dbName) {
    if (!dbName || typeof dbName !== 'string') {
      throw new Error('dbName should be valid non-empty string!');
    }
  }

  function ensureValidDBRemoteEndpoint(dbRemoteEndpoint) {
    if (!dbRemoteEndpoint || typeof dbRemoteEndpoint !== 'string') {
      throw new Error('dbRemoteEndpoint should be valid non-empty string!');
    }
  }

  function startSync(dbName, dbRemoteEndpoint, dbSyncInterval) {
    return new Promise((resolve, reject) => {
      try {
        ensureValidDBName(dbName);
        ensureValidDBRemoteEndpoint(dbRemoteEndpoint);

        var remoteDBAddress = dbRemoteEndpoint + dbName;
        if (syncHandles.has(remoteDBAddress)) {
          resolve();
          return;
        }

        var syncHandle = null;

        syncHandles.set(remoteDBAddress, setInterval(function() {
          // Check if previous sync still in progress
          if (syncHandle) {
            return;
          }

          syncHandle = myPouch.sync(
            dbName, dbRemoteEndpoint + dbName
          ).
          on('change', function() {
            bridge.broadcast('changesdetected', {
              dbName: dbName,
              dbRemoteEndpoint: dbRemoteEndpoint
            });
          }).
          on('complete', function() {
            bridge.broadcast('syncsucceeded', {
              dbName: dbName,
              dbRemoteEndpoint: dbRemoteEndpoint
            });
            syncHandle = null;
          }).
          on('error', function() {
            bridge.broadcast('syncfailed', {
              dbName: dbName,
              dbRemoteEndpoint: dbRemoteEndpoint
            });
            syncHandle = null;
          });
        }, dbSyncInterval));

        resolve();
      } catch(e) {
        reject(e);
      }
    });
  }

  function stopSync(dbName, dbRemoteEndpoint) {
    return new Promise((resolve, reject) => {
      try {
        ensureValidDBName(dbName);
        ensureValidDBRemoteEndpoint(dbRemoteEndpoint);

        var remoteDBAddress = dbRemoteEndpoint + dbName;
        if (!syncHandles.has(remoteDBAddress)) {
          resolve();
          return;
        }

        var syncHandle = syncHandles.get(remoteDBAddress);

        clearInterval(syncHandle);
        syncHandles.delete(remoteDBAddress);

        resolve();
      } catch(e) {
        reject(e);
      }
    });
  }
})();
