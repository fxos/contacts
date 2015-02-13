/* global IPDLProtocol,
          EventDispatcher
*/

/* exported ContactListController */

(function(exports) {
  'use strict';

  var ContactListController = function () {
    EventDispatcher.mixin(this, ['contactchange']);

    this.protocol = new IPDLProtocol(
      'contactList', new SharedWorker('/lib/db_worker.js')
    );
    this.protocol.recvContactChange = this.onContactChange.bind(this);
  };

  ContactListController.prototype.getAll = function() {
    return this.protocol.sendGetAll();
  };

  ContactListController.prototype.onContactChange =
  function(resolve, reject, args) {
    try {
      this.dispatchEvent('contactchange', args.e);
      resolve();
    } catch(e) {
      reject(e);
    }
  };

  exports.ContactListController = ContactListController;
})(window);
