'use strict';

importScripts('glue/message.js');
importScripts('glue/store.js');

var Protocol = function(methods, bridge) {
  this.store = new PromiseStore();

  this.methods = methods;
  methods._call = this.onMethodCallBeforeBridge.bind(this);

  this.bridge = bridge;
  bridge.recvMessage = this.recvBridgeMessage.bind(this);

  Object.freeze(this);
};

Protocol.prototype.recvBridgeMessage = function(json) {
  if ('method' in json) {
    this.onMethodCallAfterBridge(json);
  } else {
    this.onMethodResolveBeforeBridge(json);
  }
};

Protocol.prototype.onMethodCallBeforeBridge = function(method, args) {
  var msg = new CallMessage(this.bridge.tag, method, args);
  this.bridge.postMessage(msg);

  return this.store.new(msg.uuid);
};

Protocol.prototype.onMethodResolveBeforeBridge = function(json) {
  var uuid = json.uuid;
  if (!this.store.has(uuid)) {
    throw new Error('There is no promise for method.');
  }

  this.store.resolve(uuid, json.success, json.rv);
};

Protocol.prototype.onMethodCallAfterBridge = function(json) {
  var methodName = 'recv' + json.method;
  if (!methodName in this.methods) {
    throw new Error('Method ' + methodName + ' does not exists.');
  }

  this.methods[methodName](
    this.onMethodResolveAfterBridge.bind(this, json.uuid),
    this.onMethodRejectAfterBridge.bind(this, json.uuid),
    json.args
  );
};

Protocol.prototype.onMethodResolveAfterBridge = function(uuid, rv) {
  var msg = new SuccessMessage(this.bridge.tag, uuid, rv);
  this.bridge.postMessage(msg);
};

Protocol.prototype.onMethodRejectAfterBridge = function(uuid, rv) {
  var msg = new FailureMessage(this.bridge.tag, uuid, rv);
  this.bridge.postMessage(msg);
};

