/**
 * Express configuration
 */

'use strict';

var bodyParser = require('body-parser');
var compression = require('compression');
var cors = require('cors')
var errorHandler = require('errorhandler');
var methodOverride = require('method-override');
var morgan = require('morgan');
var notifier = require('node-notifier');
var passport = require('passport');

var config = require('./environment/index');

var Logger = require('../services/logger.service');

module.exports = function (app) {
  app.use(compression());
  app.use(bodyParser.json({limit: '5mb'}));
  app.use(bodyParser.urlencoded({limit: '5mb', extended: true}));
  app.use(methodOverride());
  app.use(passport.initialize());
  app.use(cors());

  switch (config.env) {
    case 'production':
      app.use(morgan('dev'));
      break;
    case 'test':
      app.use(errorHandler({log: errorNotification})); // Error handler - has to be last
      break;
    default:
      app.use(morgan('dev'));
      app.use(errorHandler({log: errorNotification})); // Error handler - has to be last
      break;
  }
};

function errorNotification (err, str, req) {
  var title = `Error in ${req.method} ${req.url}`;

  Logger.error(title, str);

  notifier.notify({
    title: title,
    message: str
  });
}
