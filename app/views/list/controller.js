/* global IPDLProtocol */

/* exported ContactListController */

(function(exports) {
  'use strict';

  var ContactListController = function () {
    this.protocol = new IPDLProtocol(
      'contactList', new SharedWorker('/lib/db_worker.js')
    );
    this.protocol.recvContactChanged = this.onContactChanged;
  };

  ContactListController.prototype.getAll = function() {
    return this.protocol.sendGetAll();
  };

  ContactListController.prototype.remove = function(id) {
    return this.protocol.sendRemove(id);
  };

  ContactListController.prototype.onContactChanged =
  function(resolve, reject, contact) {
    resolve();
  };

  exports.ContactListController = ContactListController;
})(window);
