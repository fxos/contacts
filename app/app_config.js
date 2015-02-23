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
    },

    accounts: {
      timeout: 5000,
      endpoints: {
        oauth: 'https://oauth-stable.dev.lcip.org/v1',
        profile: 'https://stable.dev.lcip.org/profile/v1'
      },
      credentials: {
        local: {
          clientId: '2e59bc0f30faa234',
          redirectUri: 'http://localhost:8080/contacts/app/navigation/index.html',
          secret: 'f82b68768f900600dddf510ac973bff2740125c0e6c5db8366a264b8baf164f0'
        },
        ghDesktop: {
          clientId: '7bbe4d33efba6575',
          redirectUri: 'http://fxos.github.io/contacts/app/navigation/index.html',
          secret: '83c073b1719d49fb56226d35eaf0fd16dd1ffa169bcbea1f077cac4adf80f27a'
        },
        ghMobile: {
          clientId: '2ad0c0223a0c4224',
          redirectUri: 'http://fxos.github.io/contacts/app/views/list/index.html',
          secret: '581f9b02ac2f31ea2ba97bb25717580be2f2dbcde5a29d3a1c8c9fba432f4b8f'
        }
      }
    }
  });
})(self);
