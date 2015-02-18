/* -*- Mode: js; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

/* exported ProfileStorage */

/* globals asyncStorage */

(function(exports) {
  'use strict';

  // This code runs on a document and a worker.
  if (typeof window == 'undefined') {
    importScripts('/contacts/app/async_storage.js');
  }

  var STORE_KEY = 'account';
  var _profile;

  var ProfileStorage = {
    /**
     * Load the profile object.
     * @return Promise resolving with the stored account or null.
     */
    get: function() {
      if (_profile !== undefined) {
        return Promise.resolve(_profile);
      }
      return new Promise((resolve, reject) => {
        asyncStorage.getItem(STORE_KEY, (profile) => {
          _profile = profile;
          resolve(_profile);
        });
      });
    },

    /**
     * Store the profile object.
     * @param {Object} profile object to store.
     */
    set: function(profile) {
      _profile = profile;
      asyncStorage.setItem(STORE_KEY, _profile);
    },

    /**
     * Clear the account storage.
     */
    clear: function() {
      _profile = null;
      asyncStorage.clear();
    }
  };

  exports.ProfileStorage = ProfileStorage;
})(this);
