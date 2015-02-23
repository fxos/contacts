/* global BaseController,
          contracts,
          Client
*/

/* exported ContactEditController */

(function(exports) {
  'use strict';

  var ContactEditController = function () {
    BaseController.call(this, ['customizationavailable']);
    var worker = new SharedWorker('lib/db_worker.js');
    this.bridge = new Client(contracts.edit, worker);
  };

  ContactEditController.prototype = Object.create(BaseController.prototype);

  ContactEditController.prototype.save = function(contact) {
    return this.bridge.save(contact);
  };

  exports.ContactEditController = ContactEditController;
})(window);
