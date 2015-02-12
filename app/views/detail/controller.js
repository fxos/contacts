/* global IPDLProtocol */

/* exported ContactDetailsController */

(function(exports) {
  'use strict';

  var ContactDetailsController = function () {
    this.protocol = new IPDLProtocol(
      'contactDetails', new SharedWorker('/lib/db_worker.js')
    );
    this.protocol.recvContactChanged = this.onContactChanged;
  };

  ContactDetailsController.prototype.get = function(id) {
    return this.protocol.sendGet(id);
  };

  ContactDetailsController.prototype.onContactChanged =
  function(resolve, reject, contact) {
    resolve();
  };

  exports.ContactDetailsController = ContactDetailsController;
})(window);
