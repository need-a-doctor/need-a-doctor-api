/**
 * Main application routes
 */

'use strict';

var express = require('express');

module.exports = function (app) {
  app.use('/api/auth', require('./auth'));
  app.use('/api/users', require('./api/user'));
  //app.use('/api/clinics', require('./api/clinic'));
  app.use('/api/specializations', require('./api/specialization'));

  app.use('/', express.static(__dirname + '/swagger-ui'));

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth)/*').get(function pageNotFound (req, res) {
    res.sendStatus(404);
  });
};
