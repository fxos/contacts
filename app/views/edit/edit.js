/* global ContactEditController,
          onDomReady,
          RenderCache
*/
(function() {

var debug = 1 ? console.log.bind(console, '[LIST]') : function(){};
var controller;

var els = {
  actionButton: document.querySelector('.action'),
  fields: document.querySelectorAll('gaia-text-input'),
};

// Setup
render();

// Events
addEventListener('hashchange', render);

var target = document.querySelector('head > meta[name=action]');
target.onclick = onSaveClick;

function render() {

}

function onSaveClick() {
  var data = getFormData();
  // XXX: For a proper view separation, evicting the list cache
  // should happen at sharedworker level, oncontactchange, but
  // we don't have the time to implemente this. With future versions
  // of cache exposed to sharedworkers, we can do this on that 'server'
  // side.
  
  RenderCache.evictList().then(() => {
    controller.save(data).then(function(contact) {
      debug('Contact saved successfully', data);
      var link = document.getElementById('link');
      link.href = 'views/detail/index.html#/' + contact.id;
      link.click();
    }, function() {
      debug('Error occurred while saving contact', data);
    });
  });
}

function getFormData() {
  var result = {};

  [].forEach.call(els.fields, (el) => {
    var name = el.getAttribute('name');
    result[name] = el.value;
  });

  return result;
}

onDomReady().then(function() {
  controller = new ContactEditController();
  render();
});

})();
