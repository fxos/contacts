(function () {
/*global ContactListController,
         onDomReady
*/

var debug = 0 ? console.log.bind(console, '[LIST]') : function(){};
var controller;

var els = {
  list: document.querySelector('gaia-list')
};

function render() {
  controller.getAll().then(function(contacts) {
    els.list.innerHTML = contacts;
  });
}


window.addEventListener('load', function() {
  if (navigator.serviceWorker) {
    importScripts('rendercache/api.js');
  }

  controller = new ContactListController();
  // Re-render content once contact list is updated
  // TODO: This is very inefficient code, we should debounce this event handler
  // since we can have tons of consequent events if we fetched several records
  // during sync.
  controller.addEventListener('contactschanged', render);
  render();
});

})();
