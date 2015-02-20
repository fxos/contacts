/* global IPDLProtocol,
          BaseController,
          Client,
          ListContract
*/

/* exported ContactListController */

(function(exports) {
  'use strict';

  var ContactListController = function () {
    BaseController.call(this, ['contactschanged']);

    this.bridge = new Client(ListContract);
    this.bridge.addEventListener('contactschanged', e => this.onContactChange(e));
  };

  ContactListController.prototype = Object.create(BaseController.prototype);

  ContactListController.prototype.getAll = function() {
    return this.bridge.getAll();
  };

  ContactListController.prototype.onContactChange = function(contact) {
    try {
      this.dispatchEvent('contactschanged', contact);
    } catch(e) {}
  };

  exports.ContactListController = ContactListController;
})(window);
