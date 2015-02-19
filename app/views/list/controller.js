/* global BaseController,
          Client,
          contracts
*/

/* exported ContactListController */

(function(exports) {
  'use strict';

  var ContactListController = function () {
    BaseController.call(this, ['contactchange']);

    this.bridge = new Client(contracts.list,
      new SharedWorker('lib/db_worker.js')
    );

    this.bridge.addEventListener('contactchange', e => this.onContactChange(e));
  };

  ContactListController.prototype = Object.create(BaseController.prototype);

  ContactListController.prototype.getAll = function() {
    return this.bridge.getAll();
  };

  ContactListController.prototype.onContactChange = function(contact) {
    try {
      this.dispatchEvent('contactchange', contact);
    } catch(e) {}
  };

  exports.ContactListController = ContactListController;
})(window);
