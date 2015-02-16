/* global importScripts,
          IPDLProtocol,
          myPouch,
          Map
*/

(function() {
  'use strict';

  importScripts(
    '/contacts/app/glue/protocol_helper.js',
    '/contacts/app/api/pouchdb.js',
    '/contacts/app/app_config.js'
  );

  const DB_SYNC_INTERVAL = 2000;

  const protocol = new IPDLProtocol('syncManager');

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

  protocol.recvStartSync = function(resolve, reject, args) {
    try {
      ensureValidDBName(args.dbName);
      ensureValidDBRemoteEndpoint(args.dbRemoteEndpoint);

      var remoteDBAddress = args.dbRemoteEndpoint + args.dbName;
      if (syncHandles.has(remoteDBAddress)) {
        resolve();
        return;
      }

      var syncInterval = typeof args.interval === 'number' ?
        args.interval : DB_SYNC_INTERVAL;

      var syncHandle = null;

      syncHandles.set(remoteDBAddress, setInterval(function() {
        // Check if previous sync still in progress
        if (syncHandle) {
          return;
        }

        syncHandle = myPouch.sync(
          args.dbName, args.dbRemoteEndpoint + args.dbName
        ).
        on('change', function() {
          protocol.sendOnChangesDetected({
            dbName: args.dbName,
            dbRemoteEndpoint: args.dbRemoteEndpoint
          });
        }).
        on('complete', function() {
          protocol.sendOnSyncSucceeded({
            dbName: args.dbName,
            dbRemoteEndpoint: args.dbRemoteEndpoint
          });
          syncHandle = null;
        }).
        on('error', function() {
          protocol.sendOnSyncFailed({
            dbName: args.dbName,
            dbRemoteEndpoint: args.dbRemoteEndpoint
          });
          syncHandle = null;
        });
      }, syncInterval));

      resolve();
    } catch(e) {
      reject(e);
    }
  };

  protocol.recvStopSync = function(resolve, reject, args) {
    try {
      ensureValidDBName(args.dbName);
      ensureValidDBRemoteEndpoint(args.dbRemoteEndpoint);

      var remoteDBAddress = args.dbRemoteEndpoint + args.dbName;
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
  };
})();
