/* global EventDispatcher,
          AppConfig,
          syncManagerContract,
          Client
*/

/* exported BaseController */

(function(exports) {
  'use strict';

  var BaseController = function(allowedEvents) {
    EventDispatcher.mixin(this, allowedEvents);

    this.syncBridge = new Client(
      syncManagerContract,
      new SharedWorker('lib/sync_manager_worker.js')
    );

    this.syncBridge.addEventListener('changesdetected', function(e) {
      console.log(
        'Sync (%s) detected changes.', e.data.dbRemoteEndpoint + e.data.dbName
      );
    });

    this.syncBridge.addEventListener('syncsucceeded', function(e) {
      console.log(
        'Sync (%s) succeeded.', e.data.dbRemoteEndpoint + e.data.dbName
      );
    });

    this.syncBridge.addEventListener('syncfailed', function(e) {
      console.log(
        'Sync (%s) failed.', e.data.dbRemoteEndpoint + e.data.dbName
      );
    });

    this._toggleSync = this._toggleSync.bind(this);
    document.addEventListener('visibilitychange', this._toggleSync);

    this._toggleSync();
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

  BaseController.prototype.shouldApplyPatch = function(patchDescriptor) {
    return new Promise((resolve, reject) => {
      var body = `
        <h3>Customization available</h3>
        <p>Name: ${patchDescriptor.name}</p>
        <p>Description: ${patchDescriptor.description}</p>
        <p>Author: ${patchDescriptor.author}</p>
      `;
      var action1 = {'label': 'Apply', callback: () => {
        resolve();
        this.confirm.close();
      }};
      var action2 = {'label': 'Cancel', callback: () => {
        reject();
        this.confirm.close();
      }};
      this._getConfirm(body, action1, action2).open();
    });
  }

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
