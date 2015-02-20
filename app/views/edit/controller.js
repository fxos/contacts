/* global IPDLProtocol,
          BaseController,
          contracts,
          Client
*/

/* exported ContactEditController */

(function(exports) {
  'use strict';

  var ContactEditController = function () {
    BaseController.call(this);
    this.bridge = new Client(contracts.edit);
  };

  ContactEditController.prototype = Object.create(BaseController.prototype);

  ContactEditController.prototype.save = function(contact) {
    return this.bridge.save(contact);
  };

  exports.ContactEditController = ContactEditController;
})(window);
