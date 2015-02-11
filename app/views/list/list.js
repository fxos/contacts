(function () {
/*global BroadcastChannel,
         ContactListController
*/

var debug = 0 ? console.log.bind(console, '[LIST]') : function(){};
var chromeless = !!~location.search.indexOf('chromeless');
var channel = new BroadcastChannel('navigate');
var isNested = window.parent !== window;

var els = {
  header: document.querySelector('gaia-header'),
  list: document.querySelector('gaia-list')
};

document.body.addEventListener('click', (e) => {
  if (!isNested) { return; }

  e.preventDefault();

  var a = e.target.closest('a');
  if (!a) { return; }

  var id = a.hash.replace('#/', '');

  debug('link click', id);
  channel.postMessage(id);
});

els.header.hidden = chromeless;

function render() {
  var frag = document.createDocumentFragment();
  var controller = new ContactListController();

  controller.getAll().then(function(contacts) {
    contacts.forEach(function(contact) {
      var el = document.createElement('a');
      el.textContent = getContactName(contact);
      el.href = '../detail/#/' + contact._id;
      frag.appendChild(el);
    });

    els.list.appendChild(frag);
  });
}

function getContactName(contact) {
  var components = [];
  components.push(contact.givenName, contact.familyName, contact.tel);
  return components.join(' ');
}

document.addEventListener('DOMContentLoaded', render);

})();
