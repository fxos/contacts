'use strict';

function SharedWorker(url) {
  var channel = new BroadcastChannel('this_is_so_hacky');
  return channel;
}
