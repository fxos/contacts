/* global IPDLProtocol */

/* exported ContactEditController */

(function(exports) {
  'use strict';

  var ContactEditController = function () {
    this.protocol = new IPDLProtocol(
      'contactEdit', new SharedWorker('/lib/db_worker.js')
    );
    this.protocol.recvContactChanged = this.onContactChanged;
  };

  ContactEditController.prototype.save = function(contact) {
    return this.protocol.sendSave(contact);
  };

  exports.ContactEditController = ContactEditController;
})(window);
