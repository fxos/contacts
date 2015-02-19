/* global importScripts,
          myPouch,
          AppConfig,
          CustomizationWorkerContract,
          Server
*/

(function() {
  'use strict';

  importScripts('/contacts/app/api/pouchdb.js');
  importScripts('/contacts/app/app_config.js');
  importScripts('/contacts/app/lib/customization_worker_contract.js');
  importScripts('/contacts/app/components/runtime-bridge/server.js');

  var bridge = new Server(CustomizationWorkerContract, {
    apply: function(patch) {
      // Ideally we should apply patch here (load the patch content, apply and
      // save it to customization cache), but at the moment we can't do
      // SharedWorker->ServiceWorker bridge since WorkerNavigator.serviceWorker
      // is not available. So for now we just mark patch as applied here.
      patch.applied = true;
      return db.put(patch).then(function() {
        console.log(
          'CustomizationWorker: marked %s as applied.', patch._id
        );
      }, function() {
        console.log(
          'CustomizationWorker: failed to mark %s as applied.', patch._id
        );
      });
    }
  });

  var db = new myPouch(AppConfig.databases.customization.name);

  function checkForNewCustomizations() {
    console.log('CustomizationWorker: querying for new customizations...');
    db.query(function(doc, emit) {
      if (!doc.applied) {
        emit(doc);
      }
    }, { include_docs: true }).then(function(result) {
      console.log(
        'CustomizationWorker: %s new customizations available!', result.rows.length
      );
      if (result.rows.length) {
        bridge.broadcast('customizationavailable', {
          customizations: result.rows.map(function(row) {
            return row.doc;
          })
        });
      }
    });
  }

  db.changes({ live: true }).on('change', checkForNewCustomizations);
  checkForNewCustomizations();
})();
