(function() {
  /*global BroadcastChannel*/

  var debug = 0 ? console.log.bind(console, '[DOC]') : function(){};

  var channel = new BroadcastChannel('navigate');

  var els = {
    frames: {
      list: document.querySelector('.frame-list'),
      detail: document.querySelector('.frame-detail')
    }
  };

  channel.onmessage = (e) => {
    debug('linkclick', e);
    var id = e.data;
    location.hash = '/' + id;
  };

  addEventListener('hashchange', updateDetailFrame);
  els.frames.detail.onload = updateDetailFrame;

  function updateDetailFrame() {
    var win = els.frames.detail.contentWindow;
    win.location.hash = location.hash;
  }

  addEventListener('load', () => {
    debug('Registering service worker');
    navigator.serviceWorker.register('sw.js').then((worker) => {
      var theWorker = worker.installing || worker.waiting ||
                      worker.active;
      if (navigator.serviceWorker.controller) {
        // importScripts('/contacts/app/rendercache/api.js');
        // debug('renderCache ' + window.RenderCacheAPI);
        // window.renderCache = new RenderCacheAPI(theWorker);
        // debug('renderCache ' + window.renderCache);
        importScripts('/contacts/app/rendercache/api.js');
        //window.updateAPI = new UpdateAPI();
        //window.urlOverladingAPI = new UrlOverloadingAPI();
      }
      debug('Registered ' + theWorker);
    }, function(e) {
      debug('Not registered: ' + e);
    });
  });
})();
