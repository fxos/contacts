var History = (function() {
  'use strict';

  // How much time is left to the view before performing the
  // page transition.
  var kDefaultTransitionDuration = 200;

  var index = 0;

  // XXX
  // It would be nice if 'view' can be a Web Component instead, so all the
  // client side of view will be hidden.
  var views = 
    Array.prototype.slice.call(document.querySelectorAll('iframe', 0));

  initializeViews();

  function initializeViews() {
    views.forEach(function(view) {
      attachListenersToView(view);
    });
  }

  function attachListenersToView(view) {
    view.addEventListener('ontitlechanged', function(msg) {
      view.dataset.title = msg.detail.title;

      if (view === getCurrentView()) {
        document.title = view.dataset.title;
      }
    });

    view.addEventListener('onactionchanged', function(msg) {
      view.dataset.content = msg.detail.content;

      if (view === getCurrentView()) {
        var target = document.querySelector('head > meta[name=action]');
        target.content = view.dataset.content;
      }
    });
  }

  function getCurrentView() {
    return views[index];
  }

  function getPreviousView() {
    return views[index - 1] || null;
  }

  function getNextView() {
    return views[index + 1] || createView();
  }

  function createView(url) {
    var view = document.createElement('iframe');
    var container = document.getElementById('views');
    container.appendChild(view);

    views.push(view);
    return view;
  }

  function dispatchEvent(type) {
    window.dispatchEvent(new CustomEvent('history' + type));
  }

  function activateNextView() {
    setTimeout(function() {
      getCurrentView().classList.add('back');
      getNextView().classList.add('current');

      document.title = getNextView().dataset.title;
      var target = document.querySelector('head > meta[name=action]');
      target.content = getNextView().dataset.content;

      index++;
      dispatchEvent('forward');
    }, kDefaultTransitionDuration);
  }

  function activatePreviousView() {
    setTimeout(function() {
      getPreviousView().classList.remove('back');
      getCurrentView().classList.remove('current');

      document.title = getPreviousView().dataset.title;
      var target = document.querySelector('head > meta[name=action]');
      target.content = getPreviousView().dataset.content;

      index--;
      dispatchEvent('back');
    }, kDefaultTransitionDuration);
  }

  var rv = {
    back: function back() {
      activatePreviousView();
    },

    forward: function forward(url) {
      var view = getNextView();
      view.src = url;

      activateNextView();
    },
    
    current: getCurrentView
  };

  return rv;
})();
