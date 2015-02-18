/* global
importScripts,
mozContacts,
contracts,
Server
*/

(function() {
  'use strict';

  importScripts('/contacts/app/api/pouchdb.js');
  importScripts('/contacts/app/event_dispatcher.js');
  importScripts('/contacts/app/app_config.js');
  importScripts('/contacts/app/api/mozcontacts.js');
  importScripts('/contacts/app/lib/db_worker_contracts.js');
  importScripts('/contacts/app/components/runtime-bridge/server.js');

  var bridges = {
    chrome: new Server(contracts.chrome, { resetDB: resetDB }),
    edit: new Server(contracts.edit, { save: save }),
    list: new Server(contracts.list, { getAll: getAll }),
    details: new Server(contracts.detail, {
      get: getContact,
      remove: removeContact
    })
  };

  function getAll() {
    return mozContacts.getAll();
  }

  function save(contact) {
    return mozContacts.save({
      givenName: contact.givenName ? [contact.givenName] : [],
      familyName: contact.familyName ? [contact.familyName] : [],
      email: contact.email ? [contact.email] : [],
      tel: contact.tel ? [{ value: contact.tel }] : []
    });
  }

  function getContact(id) {
    return new Promise((resolve, reject) => {
      mozContacts.find({
        filterBy: ['id'],
        filterOp: 'equals',
        filterValue: id
      }).then(function(results) {
        resolve(results && results.length > 0 ? results[0] : null);
      }, reject);
    });
  }

  function removeContact(contact) {
    return mozContacts.remove(contact);
  }

  function resetDB(dbName) {
    return mozContacts.resetDB(dbName);
  }

  mozContacts.addEventListener('contactchange', function(e) {
    bridges.list.broadcast('contactchange', e);
    bridges.details.broadcast('contactchange', e);
  });
})();
