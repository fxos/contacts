/* global ContactDetailsController,
          onDomReady
*/

(function() {

var debug = 0 ? console.log.bind(console, '[LIST]') : function(){};
var chromeless = !!~location.search.indexOf('chromeless');

var els = {
  header: document.querySelector('gaia-header'),
  actionButton: document.querySelector('.action'),
  firstName: document.querySelector('.first-name')
};
var controller;

// Setup
els.header.hidden = chromeless;

// Events
addEventListener('hashchange', render);

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
  var id = getContactId();

  controller.get(id).then(function(contact) {
    debug('Contact retrieved successfully', contact);
    els.firstName.textContent = getContactName(contact);
  }, function() {
    debug('Error occurred while retrieving contact by id', id);
  });
}

onDomReady().then(function() {
  controller = new ContactDetailsController();
  render();
});

})();
