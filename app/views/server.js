(function() {
'use strict';

// XXX
// For the moment this is built as a standalone script, but it
// should really use the bridge API.

if (!window.frameElement) {
  return;
}

var debug = 0 ? console.log.bind(console, '[View]') : function(){};

function dispatchEventToParent(type, data) {
  var evt = new CustomEvent(type, {
    detail: data || null,
    bubbles: true
  });
  window.frameElement.dispatchEvent(evt);
}

// fire an event when the view has loaded
window.addEventListener('load', function() {
  dispatchEventToParent('onloaded');
});

// intercept link clicks so they are forwarded to the parent
document.addEventListener('click', (e) => {
  e.preventDefault();

  var href = e.target.href || e.target.getAttribute('href');
  if (!href) {
    return;
  }

  var rel = e.target.rel || e.target.getAttribute('rel');

  dispatchEventToParent('onlinkclicked', { href: href, rel: rel });
});

var target = document.querySelector('head > meta[name=action]');
var observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    dispatchEventToParent('onactionchanged', { content: target.content });
  });
});
observer.observe(target, { attributes: true });

dispatchEventToParent('onactionchanged', { content: target.content });

window.frameElement.addEventListener('onaction', function(e) {
  var target = document.querySelector('head > meta[name=action]');
  target.click();
});

// set up an observer for the title element
var target = document.querySelector('head > title');
var observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    dispatchEventToParent('ontitlechanged', { title: document.title });
  });
});
observer.observe(target, { childList: true });

dispatchEventToParent('ontitlechanged', { title: document.title });

})();
