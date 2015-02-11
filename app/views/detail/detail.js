(function() {

var debug = 0 ? console.log.bind(console, '[LIST]') : function(){};

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

var queryParams = parseQueryParams(location.search);

// Setup
setupHeaderAction(queryParams);
render();

// Events
addEventListener('hashchange', render);

function setupHeaderAction(queryParams) {
  debug('setup header action', queryParams);
  var headerActionEnabled = queryParams['header-action'] !== 'false';
  els.actionButton.hidden = !headerActionEnabled;
}

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

function parseQueryParams(string) {
  string = string.replace('?', '');

  var parts = string.split('&');
  var params = {};

  parts.forEach(part => {
    var parts = part.split('=');
    params[parts[0]] = parts[1];
  });

  return params;
}

})();
