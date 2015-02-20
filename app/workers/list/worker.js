'use strict';

importScripts('/contacts/app/components/runtime-bridge/client.js');
importScripts('/contacts/app/components/runtime-bridge/server.js');

importScripts('/contacts/app/lib/db_worker_contracts.js');
var client = new Client(contracts.list);

// There may be a lot of contacts changes in a row, so let's
// try to batch them in the worker, and inform the ui only once.
var aggregationTimeout = 0;
client.addEventListener('contactchange', e => {;
  clearTimeout(aggregationTimeout);
  aggregationTimeout = setTimeout(function() {
    server.broadcast('contactschanged');
  }, 100);
});

importScripts('/contacts/app/workers/list/contract.js');
var server = new Server(ListContract, {
  getAll: getAll
});

function getAll() {
  return client.getAll().then(function(contacts) {
    var rv = '';

    contacts.forEach(function(contact) {
      rv += '<a ' +
            ' rel="next" ' +
            ' href="views/detail/index.html#/' + contact._id + '"' +
            '>' +
            getContactName(contact) +
            '</a>';
    });

    return rv;
  });
}

function getContactName(contact) {
  var givenName = (contact.givenName && contact.givenName[0]) || '';
  var familyName = (contact.familyName && contact.familyName[0]) || '';

  if (givenName || familyName) {
    return givenName + ' ' + familyName;
  }

  if (contact.tel && contact.tel.length) {
    return contact.tel[0].value;
  }

  if (contact.email && contact.email.length) {
    return contact.email[0];
  }

  return '';
}

