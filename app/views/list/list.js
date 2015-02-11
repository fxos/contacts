(function () {
/*global BroadcastChannel*/

var debug = 0 ? console.log.bind(console, '[LIST]') : function(){};
var chromeless = !!~location.search.indexOf('chromeless');
var channel = new BroadcastChannel('navigate');
var isNested = window.parent !== window;

var els = {
  header: document.querySelector('gaia-header'),
  list: document.querySelector('gaia-list')
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
render();

function render() {
  var frag = document.createDocumentFragment();

  for (var id in database) {
    var item = database[id];
    var el = document.createElement('a');
    el.textContent = item.firstName;
    el.href = '../detail/#/' + id;
    frag.appendChild(el);
  }

  els.list.appendChild(frag);
}

})();
