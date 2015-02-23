/* -*- Mode: js; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- /
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

/* exported AccountsClient */

/* globals ProfileStorage, EventDispatcher, AppConfig */

(function(exports) {

  var debug = 1 ? console.log.bind(console, '[FXA]') : function(){};

  var _client;

  var _config = AppConfig.accounts;
  var _credentials = _config.credentials.local;

  function _request(options) {
    return new Promise(function(resolve, reject) {
      var req = new XMLHttpRequest({mozSystem: true});
      req.open(options.method, options.url, true);
      req.setRequestHeader('Content-Type', 'application/json');
      req.responseType = 'json';
      req.timeout = _config.timeout;

      var authorization = '';
      if (options.credentials) {
        switch (options.credentials.type) {
          case 'Bearer':
            authorization =
              options.credentials.type + ' ' + options.credentials.value;
            break;
        }
        req.setRequestHeader('authorization', authorization);
      }

      req.onload = function() {
        if (req.status !== 200) {
          reject(req.statusText);
          return;
        }
        resolve(req.response);
      };

      req.onerror = req.ontimeout = function(event) {
        reject(event.target.status);
      };

      var body;
      if (options.body) {
        body = JSON.stringify(options.body);
      }

      req.send(body);
    });
  }

  function _getQueryParameter(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
    var results = regex.exec(location.search);
    return results === null ?
      "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  }

  function _setProfile() {
    var code = _getQueryParameter('code');
    if (!code && !code.length) {
      return Promise.reject();
    }

    debug('Dispatch startlogin');
    Accounts.dispatchEvent('startlogin', {});

    // XXX: fxaRelierClient.token.tradeCode doesn't work :(
    //      so we need to do the requests manually.
    return _request({
      method: 'POST',
      url: _config.endpoints.oauth + '/token',
      body: {
        client_id: _credentials.clientId,
        client_secret: _credentials.secret,
        code: code
      }
    }).then(function(response) {
      if (!response) {
        return Promise.reject();
      }

      if (!response.access_token) {
        return Promise.reject();
      }

      return _request({
        method: 'GET',
        url: _config.endpoints.profile + '/profile',
        credentials: {
          type: 'Bearer',
          value: response.access_token
        }
      })
    }).then(function(profile) {
      debug('Profile ' + profile);
      profile.user = profile.email.split('@')[0];
      return profile;
    });
  }

  var Accounts = EventDispatcher.mixin({
    get client() {
      if (!_client) {
        _client = new FxaRelierClient(_credentials.clientId, {
          oauthHost: _config.endpoints.oauth,
          profileHost: _config.endpoints.profile,
          clientSecret: _credentials.secret
        });
      }
      return _client;
    },

    init: function() {
      // If this comes from a redirection, we try to get the
      // profile.
      _setProfile().then((profile) => {
        ProfileStorage.set(profile);
        debug('Dispatch login with profile ' +
              JSON.stringify(profile));
        this.dispatchEvent('login', profile);
      });
    },

    signIn: function() {
      Accounts.client.auth.signIn({
        state: Date.now(),
        scope: 'profile',
        redirectUri: _credentials.redirectUri
      });
    },

    signOut: function() {
      ProfileStorage.clear();
      this.dispatchEvent('logout', {});
    }

  }, ['startlogin', 'login', 'logout']);

  exports.Accounts = Accounts;
})(this);

document.addEventListener('DOMContentLoaded', () => {
  Accounts.init();
});
