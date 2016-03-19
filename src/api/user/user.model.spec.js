'use strict';

var mongoose = require('mongoose');
var should = require('should');

require('../../app');
var User = require('./user.model');

var userData = {
  provider: 'local',
  name: 'Henry',
  email: 'henrye@test.com',
  password: 'password'
};

describe('User model', function () {
  after(function (done) {
    mongoose.connection.db.dropDatabase(done);
  });

  it('should register a new user', function (done) {
    var user = new User(userData);

    user.save(function (err) {
      should.not.exist(err);
      done();
    });
  });

  it('shouldn\'t save user with an existing email', function (done) {
    var user = new User(userData);

    user.save(function () {
      var user2 = new User(userData);

      user2.save(function (err) {
        should.exist(err);
        should.exist(err.errors.email);

        done();
      });
    });
  });

  it('should fail when saving without an email (empty)', function (done) {
    var user = new User(userData);
    user.email = '';

    user.save(function (err) {
      should.exist(err);
      should.exist(err.errors.email);

      done();
    });
  });

  it('should fail when saving without an email (undefined)', function (done) {
    var user = new User(userData);
    delete user.email;

    user.save(function (err) {
      should.exist(err);
      should.exist(err.errors.email);

      done();
    });
  });

  it('should authenticate user if password is valid', function (done) {
    var user = new User(userData);

    user.save(function () {
      user.authenticate('password').should.be.true; // eslint-disable-line no-unused-expressions

      done();
    });
  });

  it('should not authenticate user if password is invalid', function (done) {
    var user = new User(userData);

    user.save(function () {
      user.authenticate('blah').should.be.true; // eslint-disable-line no-unused-expressions

      done();
    });
  });

  it('should return user profile', function (done) {
    var user = new User(userData);

    user.save(function () {
      user.profile.name.should.equal(user.name);
      user.profile.email.should.equal(user.email);

      done();
    });
  });
});
