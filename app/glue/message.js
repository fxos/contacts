'use strict';

importScripts('/contacts/app/glue/utils/uuid.js');

function Message(tag, uuid) {
  if (!tag) {
    throw new Error('Message: |tag| is required.');
  }

  if (!uuid) {
    throw new Error('Message: |uuid| is required.');
  }

  this.tag = tag;
  this.uuid = uuid;
  this.timestamp = Date.now();

  Object.freeze(this);
};

function CallMessage(tag, method, args) {
  this.method = method;
  this.args = args;

  Message.call(this, tag, generateUUID());
};

function SuccessMessage(tag, uuid, rv) {
  this.rv = rv;
  this.success = true;

  Message.call(this, tag, uuid);
};

function FailureMessage(tag, uuid, rv) {
  this.rv = rv;
  this.success = false;

  Message.call(this, tag, uuid);
};

