/* global IPDLProtocol,
          EventDispatcher,
          AppConfig,
          syncManagerContract,
          Client
*/

/* exported BaseController */

(function(exports) {
  'use strict';

  var BaseController = function(allowedEvents) {
    EventDispatcher.mixin(this, allowedEvents);

    this.syncBridge = new Client(syncManagerContract);

    this.syncBridge.addEventListener('changesdetected', function(e) {
      console.log('Sync (%s) detected changes.', e.data);
    });

    this.syncBridge.addEventListener('syncsucceeded', function(e) {
      console.log('Sync (%s) succeeded.', e.data);
    });

    this.syncBridge.addEventListener('syncfailed', function(data) {
      console.log('Sync (%s) failed.', data);
    });

    this._toggleSync = this._toggleSync.bind(this);
    document.addEventListener('visibilitychange', this._toggleSync);

    // this._toggleSync();
  };

  BaseController.prototype._toggleSync = function() {
    if (document.hidden) {
      this.syncBridge.stopSync(
        AppConfig.databases.contacts.name,
        AppConfig.databases.contacts.remoteEndPoint
      );
    } else {
      this.syncBridge.startSync(
        AppConfig.databases.contacts.name,
        AppConfig.databases.contacts.remoteEndPoint
      );
    }
  };

  exports.BaseController = BaseController;
})(window);
