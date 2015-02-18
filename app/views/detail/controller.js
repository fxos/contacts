/* global BaseController,
          Contracts,
          Client
*/

/* exported ContactDetailsController */

(function(exports) {
  'use strict';

  var ContactDetailsController = function () {
    BaseController.call(this, ['contactchange', 'customizationavailable']);
    var worker = new SharedWorker('lib/db_worker.js');
    this.bridge = new Client(contracts.detail, worker);
    this.bridge.addEventListener('contactchange', e => this.onContactChange(e));
  };

  ContactDetailsController.prototype = Object.create(BaseController.prototype);

  ContactDetailsController.prototype.get = function(id) {
    return this.bridge.get(id);
  };

  ContactDetailsController.prototype.remove = function(contact) {
    return this.bridge.remove(contact);
  };

  ContactDetailsController.prototype.onContactChange = function(e) {
    this.dispatchEvent('contactchange', e.data);
  };

  exports.ContactDetailsController = ContactDetailsController;
})(window);
