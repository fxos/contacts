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
})();