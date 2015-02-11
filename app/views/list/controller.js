/* global IPDLProtocol */

(function(exports) {
  'use strict';

  var ContactListController = function () {
    this.protocol = new IPDLProtocol(
      'contactList', new SharedWorker('worker.js')
    );
    this.protocol.recvContactChanged = this.onContactChanged;
  };

  ContactListController.prototype.getAll = function() {
    return this.protocol.sendGetAll();
  };

  ContactListController.prototype.remove = function(id) {
    return this.protocol.sendRemove(id);
  };

  ContactListController.prototype.save = function(contact) {
    return this.protocol.sendSave(contact);
  };

  ContactListController.prototype.get = function(id) {
    return this.protocol.sendGet(id);
  };

  ContactListController.prototype.onContactChanged =
  function(resolve, reject, contact) {
    resolve();
  };

  exports.ContactListController = ContactListController;
})(window);
