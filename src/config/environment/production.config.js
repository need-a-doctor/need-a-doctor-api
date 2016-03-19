'use strict';

// Production specific configuration
// =================================
module.exports = {
  mongo: {
    uri: 'mongodb://localhost/need-a-doctor-production'
  },
  frontend: {
    url: 'http://50.112.191.195/'
  },
  backend: {
    url: 'http://50.112.191.195:9000/'
  }
};
