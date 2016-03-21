'use strict';

// Production specific configuration
// =================================
module.exports = {
  mongo: {
    uri: 'mongodb://localhost/need-a-doctor-production'
  },
  frontend: {
    url: 'http://52.38.21.188/'
  },
  backend: {
    url: 'http://52.38.21.188:9000/'
  }
};
