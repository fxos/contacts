(function() {
  var debug = 0 ? console.log.bind(console, '[DOC]') : function(){};

  var els = {
    frames: {
      list: document.querySelector('.frame-list'),
      detail: document.querySelector('.frame-detail')
    },
    header: document.querySelector('gaia-header'),
    title: document.querySelector('gaia-header > h1')
  };

  els.frames.list.addEventListener('onlinkclicked', (e) => {
    els.frames.detail.src = e.detail.href;
  });

  els.frames.detail.addEventListener('ontitlechanged', (e) => {
    els.title.textContent = e.detail.title;
  });

  els.frames.detail.addEventListener('onactionchanged', (e) => {
    var action = els.header.children[1];
    action.parentNode.removeChild(action);

    var content = e.detail.content;
    var actions = content.split('=');
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
      var view = els.frames.detail;
      view.dispatchEvent(new CustomEvent('onaction'));
    }

    els.header.insertBefore(icon, els.title.nextElementSibling);
  });

  addEventListener('load', () => {
    if (!navigator.serviceWorker) {
      return;
    }

    debug('Registering service worker');
    navigator.serviceWorker.register('sw.js').then((worker) => {
      var theWorker = worker.installing || worker.waiting ||
                      worker.active;
      if (navigator.serviceWorker.controller) {
        importScripts('/contacts/app/cache/render/api.js');
        //window.updateAPI = new UpdateAPI();
        //window.urlOverladingAPI = new UrlOverloadingAPI();
      }
      debug('Registered ' + theWorker);
    }, function(e) {
      debug('Not registered: ' + e);
    });
  });
})();
