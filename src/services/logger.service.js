'use strict';

var _ = require('lodash');
require('colors');
var moment = require('moment');
var raven = require('raven');

var config = require('../config/environment');

var client = new raven.Client(config.sentryDSN);
var currentUser;

module.exports = {
  debug: debug,
  log: log,
  warn: warn,
  error: error,
  fatal: fatal,

  setUser: setUser,

  requestHandler: raven.middleware.express.requestHandler(client),
  errorHandler: raven.middleware.express.errorHandler(client)
};

function log (message, params) {
  _captureMessage('info', message, params);
}

function debug (message, params) {
  _captureMessage('debug', message, params);
}

function warn (message, params) {
  _captureMessage('warning', message, params);
}

function error (message, params) {
  _captureMessage('error', message, params);
}

function fatal (message, params) {
  _captureMessage('fatal', message, params);
}

function setUser (user) {
  if (user) {
    currentUser = {
      id: user._id,
      email: user.email,
      name: user.name
    };
  } else {
    currentUser = undefined;
  }

  client.setUserContext(currentUser);
}

function _captureMessage (level, message, params) {
  switch (process.env.NODE_ENV) {
    case 'test':
      return;
    case 'rc':
      _logToConsole(level, message, params);
      client.captureMessage(message, {
        extra: params,
        level: level
      });
      break;
    default:
      _logToConsole(level, message, params);
  }
}

function _logToConsole (level, message, params) {
  var timestamp = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
  var logMessage = '\n[' + timestamp + '] ' +
    _.capitalize(level) + ': ' + message + '\n';

  if (currentUser) {
    logMessage += 'user: ' + _toString(currentUser) + '\n';
  }

  for (var key in params) {
    logMessage += key + ': ' + _toString(params[key]) + '\n';
  }

  console.log(logMessage);
}

function _toString (obj) {
  if (typeof obj !== 'string') {
    obj = JSON.stringify(obj, null, 2);
  }

  return obj;
}
