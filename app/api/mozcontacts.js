/* global myPouch,
   EventDispatcher,
   AppConfig
*/

/* exported mozContacts */

(function(exports) {
  'use strict';

  importScripts('/contacts/app/fxa/profile_storage.js');

  /**
   * Possible change reason type.
   * @enum {string}
   */
  const changeReason = {
    UPDATE: 'update',
    CREATE: 'create',
    REMOVE: 'remove',
    RESET: 'reset'
  };

  function onChange(reason, change) {
    exports.mozContacts.dispatchEvent('contactchange', {
      contactID: change ? change.id : null,
      reason: reason
    });
  }

  var db;
  function ensureDB(newDbName) {
    if (db) {
      return Promise.resolve(db);
    }
    return ProfileStorage.get().then((profile) => {
      var dbName;
      if (profile && profile.user) {
        dbName = profile.user;
      } else {
        dbName = AppConfig.databases.contacts.name;
      }

      if (newDbName && newDbName.length) {
        dbName = newDbName;
      }

      db = new myPouch(dbName);

      db.changes({
        live: true
      })
      .on('create',  onChange.bind(null, changeReason.CREATE))
      .on('update',  onChange.bind(null, changeReason.UPDATE))
      .on('delete',  onChange.bind(null, changeReason.REMOVE));

      return db;
    });
  }

  function find(options) {
    if (options.filterBy.length > 1 || options.filterBy[0] !== 'id') {
      // Not implemented yet
      return Promise.reject('Only search by ID is supported!');
    }

    return ensureDB().then(() => {
      return db.allDocs({
        include_docs: true,
        key: options.filterValue
      });
    }).then((result) => {
      return result.rows.map((row) => {
        return row.doc;
      });
    });
  }

  function getAll(options) {
    return ensureDB().then(() => {
      options = options || {};
      return db.allDocs({
        include_docs: true
      });
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
    return ensureDB().then(() => {
      return db.destroy();
    });
  }

  function save(contact) {
    return ensureDB().then(() => {
      if (!contact._id) {
        //contact = new mozContact(contact);
        return db.post(contact);
      } else {
        return db.put(contact);
      }
    });
  }

  function remove(contact) {
    return ensureDB().then(() => {
      return db.remove(contact);
    });
  }

  function getRevision() {
    return ensureDB().then(() => {
      return db.info();
    }).then(info => {
      info = info || {update_sec: -1}
      return info.update_seq;
    });
  }

  function getCount() {
    return ensureDB().then(() => {
      return db.info();
    }).then(info => {
      info = info || {doc_count: 0};
      return info.doc_count;
    });
  }

  function prefill() {
    return ensureDB().then(() => {
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
    });
  }

  function resetDB(newDbName) {
    var dbName;
    return ensureDB().then(() => {
      return db.info();
    }).then((info) => {
      dbName = info.db_name;
      db = null;
      return ensureDB(newDbName);
    }).then(() => {
      onChange(changeReason.RESET);
      return dbName;
    });
  }

  exports.mozContacts = EventDispatcher.mixin({
    find,
    getAll,
    clear,
    save,
    remove,
    getRevision,
    getCount,
    db,
    prefill,
    resetDB
  }, ['contactchange']);
})(this);
