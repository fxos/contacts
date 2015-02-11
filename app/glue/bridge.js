'use strict';

var BridgeHelper = {
  map: {
    'window->worker': BridgeWindowToWorker,
    'worker->window': BridgeWorkerToWindow,
    'window->sharedworker': BridgeWindowToSharedWorker,
    'sharedworker->window': BridgeSharedWorkerToWindow,
    'window->serviceworker': BridgeWindowToServiceWorker,
    'serviceworker->window': BridgeServiceWorkerToWindow
  },

  createNewBridge: function bh_createNewBridge(tag, ipdl, target) {
    if (!tag) {
      throw new Error('Bridge needs a tag.');
    }

    if (!ipdl) {
      throw new Error('Bridge needs an ipdl description.');
    }

    var direction = ipdl.side.name + '->' + ipdl.otherside.name;
    var bridge = this.map[direction];
    if (!bridge) {
      throw new Error('Bridge for ' +
                      direction +
                      ' is not implemented.');
    }

    return new bridge(tag, ipdl, target);
  }
};

/**
 * Bridge
 */
function Bridge(tag, ipdl, target) {
  /*debug(
    'Creating a bridge for ' +
    ipdl.side.name + '->' + ipdl.otherside.name +
    ' for ' +
    target +
    ' (' + tag + ')'
  );*/

  this.tag = tag;
  this.ipdl = ipdl;
  this.target = target;
  this.debug = this.ipdl.debug || this.ipdl.side.debug;

  this.listenMessage();

  this.recvMessage = Bridge.prototype.recvMessage;
  Object.seal(this);
}

Bridge.prototype = {
  /**
   * Needs to be overidden by the class that inherit from Bridge.
   */
  listenMessage: function bridge_listenMessage() {
    throw new Error('Not implemented.');
  },

  /**
   * Needs to be overidden by the class that inherit from Bridge.
   */
  forwardMessage: function bridge_forwardMessage() {
    throw new Error('Not implemented.');
  },

  /**
   * Needs to be overidden by the consumer of the bridge.
   */
  recvMessage: function bridge_recvMessage() {
    throw new Error('Not implemented.');
  },

  handleEvent: function bridge_handleEvent(e) {
    var json = e.data;
    if (!this.checkMessage(json)) {
      return;
    }

    this.dump(json, true);

    this.recvMessage(json);
  },

  postMessage: function bridge_postMessage(json) {
    if (!this.checkMessage(json)) {
      return;
    }

    this.dump(json);

    this.forwardMessage(json);
  },

  checkMessage: function bridge_checkMessage(json) {
    if (!json) {
      throw new Error('Message data is empty.');
    }

    if (!'tag' in json) {
      throw new Error('Message does not have a tag.');
    }

    if (!'uuid' in json) {
      throw new Error('Message does not have an uuid.');
    }

    if (json.tag !== this.tag) {
      return false;
    }

    return true;
  },

  dump: function bridge_dump(json, revert) {
    if (this.debug) {
      var direction = revert ?
        this.ipdl.otherside.name + '->' + this.ipdl.side.name :
        this.ipdl.side.name + '->' + this.ipdl.otherside.name;

      debug('[' + this.tag + '] ' + direction);
      for (var prop in json) {
        debug(prop + ': ' + json[prop]);
      }
    }
  }
};


/**
 * BridgeWindowToWorker
 */
function BridgeWindowToWorker(tag, ipdl, target) {
  Bridge.call(this, tag, ipdl, target);

  if (!this.target) {
    var msg = 'Need an explicit target for a ' +
              this.side.name +
              '->' +
              this.otherside.name +
              ' bridge.';
    throw new Error(msg);
  }
}

BridgeWindowToWorker.prototype = Object.create(Bridge.prototype);

BridgeWindowToWorker.prototype.listenMessage = function() {
  this.target.addEventListener('message', this);
};

BridgeWindowToWorker.prototype.forwardMessage = function(json) {
  this.target.postMessage(json);
};


/**
 * BridgeWindowToSharedWorker
 */
function BridgeWindowToSharedWorker(tag, ipdl, target) {
  Bridge.call(this, tag, ipdl, target);

  if (!this.target) {
    var msg = 'Need an explicit target for a ' +
              this.side.name +
              '->' +
              this.otherside.name +
              ' bridge.';
    throw new Error(msg);
  }
}

BridgeWindowToSharedWorker.prototype = Object.create(Bridge.prototype);

BridgeWindowToSharedWorker.prototype.listenMessage = function() {
  this.target.port.addEventListener('message', this);
  this.target.port.start();
};

BridgeWindowToSharedWorker.prototype.forwardMessage = function(json) {
  this.target.port.postMessage(json);
};


/**
 * BridgeWindowToServiceWorker
 */
function BridgeWindowToServiceWorker(tag, ipdl, target) {
  Bridge.call(this, tag, ipdl, target || navigator.serviceWorker.controller);

  if (!this.target) {
    var msg = 'Need an explicit target for a ' +
              this.side.name +
              '->' +
              this.otherside.name +
              ' bridge if the page is not controlled.';
    throw new Error(msg);
  }
}

BridgeWindowToServiceWorker.prototype = Object.create(Bridge.prototype);

BridgeWindowToServiceWorker.prototype.listenMessage = function() {
  addEventListener('message', this);
};

BridgeWindowToServiceWorker.prototype.forwardMessage = function(json) {
  this.target.postMessage(json);
};


/**
 * BridgeWorkerToWindow
 */
function BridgeWorkerToWindow(tag, ipdl, target) {
  Bridge.call(this, tag, ipdl, target);
}

BridgeWorkerToWindow.prototype = Object.create(Bridge.prototype);

BridgeWorkerToWindow.prototype.listenMessage = function() {
  addEventListener('message', this);
};

BridgeWorkerToWindow.prototype.forwardMessage = function(json) {
  postMessage(json);
};


/**
 * BridgeSharedWorkerToWindow
 */
function BridgeSharedWorkerToWindow(tag, ipdl, target) {
  this._ports = [];
  Bridge.call(this, tag, ipdl, target);
}

BridgeSharedWorkerToWindow.prototype = Object.create(Bridge.prototype);

BridgeSharedWorkerToWindow.prototype.listenMessage = function() {
  addEventListener('connect', function(eConnect) {
    var port = eConnect.ports[0];

    port.addEventListener('message', this);
    port.start();

    this._ports.push(port);
  }.bind(this));
};

BridgeSharedWorkerToWindow.prototype.forwardMessage = function(json) {
  // TODO: We probably should forward message only to the port that's waiting
  // for it. + We can have "dead" ports that we should remove from ports list.
  this._ports.forEach(function(port) {
    port.postMessage(json);
  });
};


/**
 * BridgeServiceWorkerToWindow
 */
function BridgeServiceWorkerToWindow(tag, ipdl, target) {
  Bridge.call(this, tag, ipdl, target);
}

BridgeServiceWorkerToWindow.prototype = Object.create(Bridge.prototype);

BridgeServiceWorkerToWindow.prototype.listenMessage = function() {
  addEventListener('message', this);
};

BridgeServiceWorkerToWindow.prototype.forwardMessage = function(json) {
  clients.getAll().then(function(windows) {
    windows.forEach(function(window) {
      window.postMessage(json);
    });
  });
};

