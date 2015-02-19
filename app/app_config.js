/* exported AppConfig */

(function(exports) {
  'use strict';

  exports.AppConfig = Object.freeze({
    databases: {
      contacts: {
        name: 'pouchcontacts',
        remoteEndPoint: 'https://sms-cloud.iriscouch.com/',
        syncInterval: 3000
      },

      customization: {
        name: 'customisations',
        remoteEndPoint: 'https://sms-cloud.iriscouch.com/',
        syncInterval: 30000
      }
    }
  });
})(self);
