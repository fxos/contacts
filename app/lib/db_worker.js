/* global importScripts,
          IPDLProtocol,
          mozContacts
*/

(function() {
  'use strict';

  importScripts(
    '/glue/protocol_helper.js',
    '/api/pouchdb.js',
    '/api/mozcontacts.js'
  );

  var listProtocol = new IPDLProtocol('contactList');
  var editProtocol = new IPDLProtocol('contactEdit');
  var detailsProtocol = new IPDLProtocol('contactDetails');

  listProtocol.recvGetAll = function(resolve, reject, args) {
    mozContacts.getAll().then(resolve, reject);
  };

  listProtocol.recvRemove =  function(resolve, reject, args) {
    reject(new Error('Not implemented!'));
  };

  editProtocol.recvSave =  function(resolve, reject, args) {
    var contact = args.contact;
    mozContacts.save({
      givenName: contact.givenName ? [contact.givenName] : [],
      familyName: contact.familyName ? [contact.familyName] : [],
      email: contact.email ? [contact.email] : [],
      tel: contact.tel ? [{ value: contact.tel }] : []
    }).then(resolve, reject);
  };

  detailsProtocol.recvGet =  function(resolve, reject, args) {
    mozContacts.find({
      filterBy: ['id'],
      filterOp: 'equals',
      filterValue: args.id
    }).then(function(results) {
      resolve(results && results.length > 0 ? results[0] : null);
    }, reject);
  };
})();
