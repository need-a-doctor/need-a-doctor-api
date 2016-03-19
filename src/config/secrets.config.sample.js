'use strict';

module.exports = {
  secrets: {
    session: 'api-secret'
  },
  port: process.env.PORT || 9000,
  ip: process.env.IP || '0.0.0.0',

  sentryDSN: ''
};
