/* global IPDLProtocol,
          EventDispatcher,
          AppConfig
*/

/* exported BaseController */

(function(exports) {
  'use strict';

  var BaseController = function(allowedEvents) {
    EventDispatcher.mixin(this, allowedEvents);

    this._syncProtocol = new IPDLProtocol(
      'syncManager',
      new SharedWorker('lib/sync_manager_worker.js')
    );
    this._syncProtocol.recvOnChangesDetected = function(resolve, reject, args) {
      console.log(
        'Sync (%s) detected changes.', args.e.dbRemoteEndpoint + args.e.dbName
      );
      resolve();
    };
    this._syncProtocol.recvOnSyncSucceeded = function(resolve, reject, args) {
      console.log(
        'Sync (%s) succeeded.', args.e.dbRemoteEndpoint + args.e.dbName
      );
    };
    this._syncProtocol.recvOnSyncFailed = function(resolve, reject, args) {
      console.log(
        'Sync (%s) failed.', args.e.dbRemoteEndpoint + args.e.dbName
      );
    };

    this._toggleSync = this._toggleSync.bind(this);
    document.addEventListener('visibilitychange', this._toggleSync);

    this._toggleSync();
  };

  BaseController.prototype._toggleSync = function() {
    if (document.hidden) {
      this._syncProtocol.sendStopSync(
        AppConfig.databases.contacts.name,
        AppConfig.databases.contacts.remoteEndPoint
      );
    } else {
      this._syncProtocol.sendStartSync(
        AppConfig.databases.contacts.name,
        AppConfig.databases.contacts.remoteEndPoint
      );
    }
  };

  exports.BaseController = BaseController;
})(window);
