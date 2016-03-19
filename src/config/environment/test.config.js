'use strict';

// Test specific configuration
// ===========================
module.exports = {
  secrets: {
    session: 'api-secret'
  },
  port: process.env.PORT || 9000,
  ip: process.env.IP || '0.0.0.0',

  mongo: {
    uri: 'mongodb://localhost/need-a-doctor-test'
  },
  frontend: {
    url: 'http://localhost:3000/'
  },
  backend: {
    url: 'http://localhost:9000/'
  }
};
