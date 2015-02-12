// Needs pouchdb.js

(function(exports) {
  'use strict';
  const DB_NAME = 'pouchcontacts';

  var db;

  function ensureDB() {
    db = new myPouch(DB_NAME);
  }

  function find(options) {
    if (options.filterBy.length > 1 || options.filterBy[0] !== 'id') {
      // Not implemented yet
      return Promise.reject('Only search by ID is supported!');
    }

    ensureDB();
    return db.allDocs({
      include_docs: true,
      key: options.filterValue
    }).then(function(result) {
      return result.rows.map(function(row) {
        return row.doc;
      });
    });
  }

  function getAll(options) {
    ensureDB();
    options = options || {};
    return db.allDocs({
      include_docs: true
    }).then(result => {
      var docs = result.rows.map(entry => entry.doc);
      // Order them
      return docs.sort(function compare(a, b) {
        var field = options.sortBy || 'givenName';
        var way = options.sortOrder || 'ascending';

        var field1 = (a[field] && a[field][0]) || '';
        var field2 = (b[field] && b[field][0]) || '';

        var result = field1.localeCompare(field2);

        return way === 'ascending' ? result : -result;
      });
    });
  }

  function clear() {
    ensureDB();
    return db.destroy().then(function() {
      return Promise.resolve();
    });
  }

  function save(contact) {
    ensureDB();
    if (!contact._id) {
      //contact = new mozContact(contact);
      return db.post(contact);
    } else {
      return db.put(contact);
    }
  }

  function remove(contact) {
    ensureDB();
    return db.remove(contact);
  }

  function getRevision() {
    ensureDB();
    return db.info().then(info => {
      info = info || {update_sec: -1}
      return Promise.resolve(info.update_seq);
    });
  }

  function getCount() {
    ensureDB();
    return db.info().then(info => {
      info = info || {doc_count: 0};
      return Promise.resolve(info.doc_count);
    });
  }

  function prefill() {
    ensureDB();
    var i = 0;
    var promises = [];
    while(i < 500) {
      i++;
      promises.push(save({
        givenName: ['Wilson_' + i],
        familyName: ['Page_' + i]
      }));
    }

    return Promise.all(promises);
  }

  exports.mozContacts = {
    find,
    getAll,
    clear,
    save,
    remove,
    getRevision,
    getCount,
    db,
    prefill
  }
})(this);
