/* global importScripts,
          IPDLProtocol,
          Map
*/

(function() {
  'use strict';

  importScripts('/glue/protocol_helper.js',
    '/api/pouchdb.js',
    '/api/mozcontacts.js');

  var protocol = new IPDLProtocol('contactList');

  const DB = new Map([
    [1, {
      id: 1,
      firstName: 'Bill'
    }],
    [2, {
      id: 2,
      firstName: 'Bob'
    }],
    [3, {
      id: 3,
      firstName: 'Ben'
    }]
  ]);

  protocol.recvGetAll = function(resolve, reject, args) {
    mozContacts.getAll().then(contacts => resolve(contacts), reject);
  };

  protocol.recvSave =  function(resolve, reject, args) {
    var newId = DB.size + 1;
    DB.set(newId, args);
    resolve();
  };

  protocol.recvRemove =  function(resolve, reject, args) {
    DB.delete(args.id);
    resolve();
  };

  protocol.recvGet = function(resolve, reject, args) {
    resolve(DB.get(args.id));
  };
})();
