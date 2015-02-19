/* global BaseController,
          Client,
          contracts,
          UpdateUtils,
          CustomizationCache,
          RenderCache
*/

/* exported ContactListController */

(function(exports) {
  'use strict';

  var ContactListController = function () {
    BaseController.call(this, ['contactchange', 'customizationavailable']);

    this.bridge = new Client(contracts.list,
      new SharedWorker('lib/db_worker.js')
    );

    this.bridge.addEventListener('contactchange', e => this.onContactChange(e));

    // DIRTY HACK: this is to avoid showing confirmation dialog in views other
    // than list view.
    this.addEventListener('customizationavailable', (e) => {
      var customizationToApply = e.customizations[0];

      this.shouldApplyPatch(customizationToApply).then(() => {
        var appliedPatch = UpdateUtils.apply(
          UpdateUtils.getFileContent(customizationToApply.patch)
        );

        Object.keys(appliedPatch).forEach(function(url) {
          return CustomizationCache.put(url, appliedPatch[url]);
        });

        RenderCache.delete();

        this.customizationBridge.apply(customizationToApply);
      });
    });
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
