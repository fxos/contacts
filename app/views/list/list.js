(function () {
/*global ContactListController,
         onDomReady
*/

var debug = 1 ? console.log.bind(console, '[LIST]') : function(){};
var controller;

var els = {
  list: document.querySelector('gaia-list')
};

function render() {
  if (document.body.classList.contains('rendered')) {
    console.log('Rendering saved content');
    return;
  }
  var frag = document.createDocumentFragment();

  controller.getAll().then(function(contacts) {
    if (els.list.textContent) {
      els.list.textContent = '';
    }

    contacts.forEach(function(contact) {
      var el = document.createElement('a');
      el.textContent = getContactName(contact);
      el.href = 'views/detail/index.html#/' + contact._id;
      el.rel = 'next';
      frag.appendChild(el);
    });

    els.list.appendChild(frag);
    document.body.classList.add('rendered');
    renderCache && renderCache.saveCurrent().then(() => {
      debug('Content saved');
    });
  });
}

function getContactName(contact) {
  var givenName = (contact.givenName && contact.givenName[0]) || '';
  var familyName = (contact.familyName && contact.familyName[0]) || '';

  if (givenName || familyName) {
    return givenName + ' ' + familyName;
  }

  if (contact.tel && contact.tel.length) {
    return contact.tel[0].value;
  }

  if (contact.email && contact.email.length) {
    return contact.email[0];
  }

  return '';
}

window.addEventListener('load', function() {
  if (navigator.serviceWorker) {
    importScripts('cache/render/api.js');
  }

  controller = new ContactListController();
  // Re-render content once contact list is updated
  // TODO: This is very inefficient code, we should debounce this event handler
  // since we can have tons of consequent events if we fetched several records
  // during sync.
  controller.addEventListener('contactchange', function() {
    document.body.classList.remove('rendered');
    render();
  });
  render();
});

})();
