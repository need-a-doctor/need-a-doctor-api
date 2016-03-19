'use strict';

var _ = require('lodash');
var path = require('path');

/**
 *  Base options
 */
var all = {
  env: process.env.NODE_ENV.toLowerCase(),
  root: path.normalize(__dirname + '/../../..'), // Root path of server
  mongo: {
    options: {
      db: {
        safe: true
      }
    }
  },

  userRoles: ['user', 'clinic-admin', 'admin'], // order is important. Latest
  // object in
  // array has more privileges, than first one

  urls: {
    verifyEndpointUrl: '/api/users/verify/'
  }
};

_.merge(all, require('./' + all.env + '.config.js') || {});

try {
  _.merge(all, require('../secrets.config.js') || {});
} catch (e) {};

module.exports = all;
