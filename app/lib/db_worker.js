/* global importScripts,
          IPDLProtocol,
          mozContacts
*/

(function() {
  'use strict';

  importScripts(
    '/glue/protocol_helper.js',
    '/api/pouchdb.js',
    '/event_dispatcher.js',
    '/api/mozcontacts.js'
  );

  const protocols = {
    list: new IPDLProtocol('contactList'),
    details: new IPDLProtocol('contactDetails'),
    edit: new IPDLProtocol('contactEdit')
  };

  /* List protocol methods */
  protocols.list.recvGetAll = function(resolve, reject, args) {
    mozContacts.getAll().then(resolve, reject);
  };

  /* Edit protocol methods */
  protocols.edit.recvSave =  function(resolve, reject, args) {
    var contact = args.contact;
    mozContacts.save({
      givenName: contact.givenName ? [contact.givenName] : [],
      familyName: contact.familyName ? [contact.familyName] : [],
      email: contact.email ? [contact.email] : [],
      tel: contact.tel ? [{ value: contact.tel }] : []
    }).then(resolve, reject);
  };

  /* Details protocol methods */
  protocols.details.recvGet =  function(resolve, reject, args) {
    mozContacts.find({
      filterBy: ['id'],
      filterOp: 'equals',
      filterValue: args.id
    }).then(function(results) {
      resolve(results && results.length > 0 ? results[0] : null);
    }, reject);
  };

  protocols.details.recvRemove =  function(resolve, reject, args) {
    return mozContacts.remove(args.contact).then(resolve, reject);
  };

  mozContacts.addEventListener('contactchange', function(e) {
    protocols.list.sendContactChange(e);
    protocols.details.sendContactChange(e);
  });
})();
