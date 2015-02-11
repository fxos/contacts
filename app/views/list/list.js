(function () {
/*global BroadcastChannel*/

var debug = 0 ? console.log.bind(console, '[LIST]') : function(){};
var channel = new BroadcastChannel('navigate');
var isNested = window.parent !== window;


document.body.addEventListener('click', (e) => {
  if (!isNested) { return; }

  e.preventDefault();

  var a = e.target.closest('a');
  if (!a) { return; }

  var id = a.hash.replace('#/', '');

  debug('link click', id);
  channel.postMessage(id);
});

})();
