
var header = document.querySelector('gaia-header');
header.addEventListener('action', function() {
  History.back();
});

window.addEventListener('historyback', function() {
  header.removeAttribute('action');
});

window.addEventListener('historyforward', function() {
  header.setAttribute('action', 'back');
});

window.addEventListener('onlinkclicked', function(evt) {
  var data = evt.detail;
  if (data.rel === 'next') {
    History.forward(data.href);
  } else if (data.rel === 'prev') {
    History.back(data.href);
  }
});

// XXX
// It would be cool if this stuff lives into the gaia-header component.
// It would let us synchronize the document.title with the gaia-header
// and have a document title that actually makes sense.
var target = document.querySelector('head > title');
var observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    header.querySelector('h1').textContent = document.title;
  });
});
observer.observe(target, { childList: true });

var fixedActions = {
  'fxa': function() {}
};

var target = document.querySelector('head > meta[name=action]');
var observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    var actions = header.querySelectorAll('a,button');
    for (var i = 0; i < actions.length; i++) {
      if (!fixedActions[actions[i].id]) {
        header.removeChild(actions[i]);
      }
    }

    var icon = null;

    var actions = target.content.split('=');
    if (actions[0] === 'icon') {
      icon = document.createElement('a');
      icon.dataset.icon = actions[1];
    } else if (actions[0] === 'text') {
      icon = document.createElement('button');
      icon.textContent = actions[1];
    } else {
      throw new Error('Not Implemented.');
    }

    icon.onclick = function() {
      var view = History.current();
      view.dispatchEvent(new CustomEvent('onaction'));
    }
    header.appendChild(icon);

  });
});
observer.observe(target, { attributes: true });
