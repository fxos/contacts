/* exported AppConfig */

(function(exports) {
  'use strict';

  exports.AppConfig = Object.freeze({
    databases: {
      contacts: {
        name: 'pouchcontacts',
        remoteEndPoint: 'https://sms-cloud.iriscouch.com/'
      }
    }
  });
})(self);
