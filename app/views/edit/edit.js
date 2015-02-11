(function() {

var debug = 1 ? console.log.bind(console, '[LIST]') : function(){};
var chromeless = !!~location.search.indexOf('chromeless');

var els = {
  header: document.querySelector('gaia-header'),
  actionButton: document.querySelector('.action'),
  fields: document.querySelectorAll('gaia-text-input'),
  save: document.querySelector('.save')
};

// Setup
els.header.hidden = chromeless;
render();

// Events
addEventListener('hashchange', render);
els.save.addEventListener('click', onSaveClick);

function render() {

}

function onSaveClick() {
  var data = getFormData();
  debug('save form', data);
}

function getFormData() {
  var result = {};

  [].forEach.call(els.fields, (el) => {
    var name = el.getAttribute('name');
    result[name] = el.value;
  });

  return result;
}

})();
