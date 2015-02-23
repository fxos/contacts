/* global EventDispatcher,
          AppConfig,
          syncManagerContract,
          CustomizationWorkerContract,
          Client,
          Promise
*/

/* exported BaseController */

(function(exports) {
  'use strict';

  var BaseController = function(allowedEvents) {
    EventDispatcher.mixin(this, allowedEvents);

    this._initSyncBridge();
    this._initCustomizationBridge();

    this._toggleSync = this._toggleSync.bind(this);
    document.addEventListener('visibilitychange', this._toggleSync);

    this._toggleSync();
  };

  BaseController.prototype._initSyncBridge = function() {
    this.syncBridge = new Client(
      syncManagerContract,
      new SharedWorker('lib/sync_manager_worker.js')
    );

    this.dbBridge = new Client(
      contracts.chrome,
      new SharedWorker('lib/db_worker.js')
    );

    this.syncBridge.addEventListener('changesdetected', function(e) {
      console.log(
        'Sync (%s) detected changes.', e.data.dbRemoteEndpoint + e.data.dbName
      );
    });

    this.syncBridge.addEventListener('syncfailed', function(e) {
      console.log(
        'Sync (%s) failed.', e.data.dbRemoteEndpoint + e.data.dbName
      );
    });
  };

  BaseController.prototype._initCustomizationBridge = function() {
    this.customizationBridge = new Client(
      CustomizationWorkerContract,
      new SharedWorker('lib/customization_worker.js')
    );

    this.customizationBridge.addEventListener('customizationavailable', (e) => {
      this.dispatchEvent('customizationavailable', e.data);
    });

    if (parent.Accounts) {
      parent.Accounts.addEventListener('login', this._reset.bind(this));
      parent.Accounts.addEventListener('logout', this._reset.bind(this));
    }
  };

  BaseController.prototype._toggleSync = function() {
    var ProfileStorage = parent.ProfileStorage || {
      get: function() {
        return new Promise((resolve, reject) => {
          resolve(null);
        });
      }
    };

    ProfileStorage.get().then((profile) => {
      Object.keys(AppConfig.databases).forEach(function(dbKey) {
        var db = AppConfig.databases[dbKey];

        var dbName = db.name;
        if (profile && profile.user) {
          dbName = profile.user;
        }

        if (document.hidden) {
            this.syncBridge.stopSync(dbName, db.remoteEndPoint);
        } else {
            this.syncBridge.startSync(dbName,
                                      db.remoteEndPoint,
                                      db.syncInterval);
        }
      }, this);
    });
  };

  BaseController.prototype._reset = function(profile) {
    var dbRemoteEndpoint = AppConfig.databases.contacts.remoteEndPoint;

    var user = (profile && profile.user) ? profile.user : '';
    this.dbBridge.resetDB(user).then((resetedDb) => {
      this.syncBridge.stopSync(resetedDb, dbRemoteEndpoint).then(() => {
        this._toggleSync();
      });
    });
  };

  BaseController.prototype.shouldApplyPatch = function(patchDescriptor) {
    return new Promise((resolve, reject) => {
      var body = `
        <h3>Customization available</h3>
        <p>Name: ${patchDescriptor.name}</p>
        <p>Description: ${patchDescriptor.description}</p>
        <p>Author: ${patchDescriptor.author}</p>
      `;
      var action1 = {'label': 'Apply', callback: function() {
        resolve();
        this.confirm.close();
      }.bind(this)};
      var action2 = {'label': 'Cancel', callback: function() {
        reject();
        this.confirm.close();
      }.bind(this)};
      this._getConfirm(body, action1, action2).open();
    });
  };

  BaseController.prototype._getConfirm = function(body, action1, action2) {
    function updateConfirm() {
      document.getElementById('confirm_body').innerHTML = body;
      var action1Button = document.getElementById('action1');
      var action2Button = document.getElementById('action2');
      action1Button.textContent = action1.label;
      action2Button.textContent = action2.label;
      action1Button.addEventListener('click', action1.callback);
      action2Button.addEventListener('click', action2.callback);
    }
    if (this.confirm) {
      updateConfirm();
      return this.confirm;
    }

    document.body.innerHTML += `<gaia-modal id="confirm">
      <section id="confirm_body">
        {$body}
      </section>
      <footer>
        <button id="action1">{$action1.label}</button>
        <button id="action2">{$action2.label}</button>
      <footer>
    </gaia-modal>`;

    updateConfirm();

    this.confirm = document.getElementById('confirm');

    return this.confirm;
  };

  exports.BaseController = BaseController;
})(window);
