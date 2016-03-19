/**
 * Main application file
 */

'use strict';

// Set default node environment to development

require('colors');
var express = require('express');
var mongoose = require('mongoose');

var config = require('./config/environment');
var Logger = require('./services/logger.service');

mongoose.Promise = require('q').Promise;

// Setup server
var app = express();

// Connect to database
mongoose.connect(config.mongo.uri, config.mongo.options, function (err) {
  if (err) {
    Logger.fatal('MongoDB connection error', {error: err});
    return setTimeout(function () {
      process.exit(-1);
    }, 1000);
  }

  if (!verifyConfig()) {
    Logger.fatal('Check your Environment');
    return setTimeout(function () {
      process.exit(-1);
    }, 1000);
  }

  //require('./services/country.seed');
  require('./swagger-ui/updateAPIPath');

  app.server = require('http').createServer(app);
  app.server.listen(config.port, config.ip, function () {
    Logger.warn('Server started', {
      port: config.port,
      mode: app.get('env').toUpperCase()
    });

    if (process.env.NODE_ENV === 'test') {
      return;
    }
  });

  app.use(Logger.requestHandler);

  // init services
  require('./config/express')(app);
  require('./routes')(app);

  app.use(Logger.errorHandler);
});

// Expose app
module.exports = app;

function verifyConfig () {
  var result = true;
  //if (!config.mailgun.api_key) {
  //  result = false;
  //  Logger.fatal('config.mailgun.api_key not set');
  //}
  return result;
}
