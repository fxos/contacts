/* global ContactDetailsController,
          onDomReady
*/

(function() {

var debug = 1 ? console.log.bind(console, '[DETAIL]') : function(){};

var els = {
  firstName: document.querySelector('.first-name'),
};
var controller, activeContact;

// Events
addEventListener('hashchange', function() {
  if (document.body.classList.contains('rendered')) {
    document.body.classList.remove('rendered');
  }

  render();
});

function getContactId() {
  return location.hash.slice(2);
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

function render() {
  if (document.body.classList.contains('rendered')) {
    return;
  }
  var id = getContactId();

  controller.get(id).then(function(contact) {
    if (!contact) { return; }
    debug('Contact retrieved successfully', contact);
    activeContact = contact;
    els.firstName.textContent = getContactName(activeContact);
    document.title = els.firstName.textContent;
    document.body.classList.add('rendered');
    renderCache && renderCache.saveCurrent().then(() => {
      debug('Content saved');
    });
  }, function() {
    debug('Error occurred while retrieving contact by id', id);
  });
}

onDomReady().then(function() {
  debug('dom ready');

  controller = new ContactDetailsController();
  // Re-render content once contact list is updated
  // controller.addEventListener('contactchange', render);

  var target = document.querySelector('head > meta[name=action]');
  target.onclick = function(e) {
    if (window.confirm('Delete contact?')) {
      controller.remove(activeContact).then(function() {
        debug('Contact removed successfully', activeContact._id);
        document.location = 'views/list/index.html';
      }, function() {
        debug('Error occurred while removing contact', activeContact._id);
      });
    } else {
      e.stopImmediatePropagation();
    }
  };

  render();
});

})();
