/*13413f*/

/* global ServiceWorker,
          Response,
          Promise,
          CacheWorker
*/

'use strict';

importScripts('/contacts/app/sw-utils.js');
importScripts('/contacts/app/components/runtime-bridge/server.js');
importScripts('/contacts/app/cache/worker.js');

var worker = new ServiceWorker();

worker.oninstall = function(e) {
  console.log('ServiceWorker: oninstall');

  e.waitUntil(CacheWorker.install(e));
};

worker.onactivate = function(e) {
  console.log('ServiceWorker: onactivate');
};

worker.onfetch = function(e) {
  console.log('ServiceWorker: onfetch %s', e.request.url);

  var response = CacheWorker.match(e.request).then(function(response) {
    console.log('ServiceWorker: %s is in the cache', e.request.url);
    return response;
  }).catch(function(e) {
    // Unexpected error occurred
    if (e) {
      console.error(
        'ServiceWorker: error occurred while matching %s', e.request.url, e
      );
      return Promise.reject(e);
    }

    // fetch(e.request) never resolves.
    // e.default() crashes the browser
    console.log('ServiceWorker: %s is NOT in the cache', e.request.url);
    return new Response('');
  });

  e.respondWith(response);
};
