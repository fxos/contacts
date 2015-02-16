/* global IPDLProtocol,
          BaseController
*/

/* exported ContactDetailsController */

(function(exports) {
  'use strict';

  var ContactDetailsController = function () {
    BaseController.call(this, ['contactchange']);

    this.protocol = new IPDLProtocol(
      'contactDetails', new SharedWorker('lib/db_worker.js')
    );

    this.protocol.recvContactChange = this.onContactChange.bind(this);
  };
  ContactDetailsController.prototype = Object.create(BaseController.prototype);

  ContactDetailsController.prototype.get = function(id) {
    return this.protocol.sendGet(id);
  };

  ContactDetailsController.prototype.remove = function(contact) {
    return this.protocol.sendRemove(contact);
  };

  ContactDetailsController.prototype.onContactChange =
  function(resolve, reject, args) {
    try {
      this.dispatchEvent('contactchange', args.e);
      resolve();
    } catch(e) {
      reject(e);
    }
  };

  exports.ContactDetailsController = ContactDetailsController;
})(window);
