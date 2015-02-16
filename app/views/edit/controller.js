/* global IPDLProtocol,
          BaseController
*/

/* exported ContactEditController */

(function(exports) {
  'use strict';

  var ContactEditController = function () {
    BaseController.call(this);

    this.protocol = new IPDLProtocol(
      'contactEdit', new SharedWorker('lib/db_worker.js')
    );
  };
  ContactEditController.prototype = Object.create(BaseController.prototype);

  ContactEditController.prototype.save = function(contact) {
    return this.protocol.sendSave(contact);
  };

  exports.ContactEditController = ContactEditController;
})(window);
