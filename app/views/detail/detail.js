(function() {

var debug = 0 ? console.log.bind(console, '[LIST]') : function(){};
var chromeless = !!~location.search.indexOf('chromeless');

var els = {
  header: document.querySelector('gaia-header'),
  actionButton: document.querySelector('.action'),
  firstName: document.querySelector('.first-name')
};

var database = {
  1: {
    firstName: 'Bill'
  },

  2: {
    firstName: 'Bob'
  },

  3: {
    firstName: 'Ben'
  }
};

// Setup
els.header.hidden = chromeless;
render();

// Events
addEventListener('hashchange', render);

function getContactId() {
  return location.hash.slice(2);
}

function render() {
  var id = getContactId();
  var data = database[id];

  debug('render', data, id);
  if (!data) { return; }
  els.firstName.textContent = data.firstName;
}

})();
