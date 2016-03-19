'use strict';

require('should');
var validators = require('./validators.utility');

describe('Email validator', function () {
  it('should be valid', function () {
    validators.isEmailValid('test@test.com').should.be.ok; // eslint-disable-line no-unused-expressions
  });

  it('should be invalid', function () {
    validators.isEmailValid('test@test').should.not.be.ok; // eslint-disable-line no-unused-expressions
  });
});
