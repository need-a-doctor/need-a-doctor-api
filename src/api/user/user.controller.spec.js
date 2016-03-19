'use strict';

var _ = require('lodash');
var mongoose = require('mongoose');
var request = require('supertest');
var should = require('should');

var app = require('../../app');
var Seed = require('../../config/seed');

var User = require('./user.model');

//var testJob;

describe('User controller', function () {
  before(function (done) {
    Seed.isLoggingEnabled = false;
    Seed.seedUsers(done);
  });

  after(function (done) {
    mongoose.connection.db.dropDatabase(done);
  });

  it('should return user profile', function (done) {
    request(app)
      .get('/api/users/me')
      .set('Authorization', 'Bearer ' + Seed.tokens.Al)
      .expect(200)
      .end(done);
  });

  describe('create user', function () {
    it('shouldn\'t create with invalid email', function (done) {
      var user = _.clone(Seed.users[0]);
      user.email = 'email';

      request(app)
        .post('/api/users')
        .send(user)
        .expect(400)
        .end(function (err, res) {
          should.exist(res.body.errors);
          should.exist(res.body.errors.email);

          should.equal(
            res.body.errors.email.message,
            'Email field is invalid.'
          );

          done();
        });
    });

    it('shouldn\'t create without email', function (done) {
      var user = _.clone(Seed.users[0]);
      delete user.email;

      request(app)
        .post('/api/users')
        .send(user)
        .expect(400)
        .end(function (err, res) {
          should.exist(res.body.errors);
          should.exist(res.body.errors.email);

          should.equal(
            res.body.errors.email.message,
            'Email field is invalid.'
          );

          done();
        });
    });

    it('shouldn\'t create with duplicate email', function (done) {
      var user = _.clone(Seed.users[0]);

      request(app)
        .post('/api/users')
        .send(user)
        .expect(409)
        .end(function (err, res) {
          should.exist(res.body.errors);
          should.exist(res.body.errors.email);

          should.equal(
            res.body.errors.email.message,
            'The specified email address is already in use.'
          );

          done();
        });
    });

    it('should create', function (done) {
      var user = _.clone(Seed.users[0]);
      user.email = 'email@domain.com';

      request(app)
        .post('/api/users')
        .send(user)
        .expect(200)
        .end(function (err, res) {
          should.not.exist(err);
          should.exist(res.body.token);

          done();
        });
    });
  });

  describe('verify user', function () {
    it('shouldn\'t verify', function (done) {
      request(app)
        .get('/api/users/verify/incorrect_hash')
        .expect(404)
        .end(done);
    });

    it('should verify', function (done) {
      User
        .findOne({
          email: 'email@domain.com'
        })
        .then(function (user) {
          should.exist(user.verifyEmailHash);

          request(app)
            .get('/api/users/verify/' + user.verifyEmailHash)
            .expect(302)
            .end(done);
        })
        .catch(done);
    });
  });

  describe('update user info', function () {
    it('should fail when saving with incorrect email', function (done) {
      request(app)
        .put('/api/users/me')
        .set('Authorization', 'Bearer ' + Seed.tokens.Al)
        .send({
          email: 'email'
        })
        .expect(400)
        .end(done);
    });

    it('should fail when saving with empty email', function (done) {
      request(app)
        .put('/api/users/me')
        .set('Authorization', 'Bearer ' + Seed.tokens.Al)
        .send({
          email: ''
        })
        .expect(400)
        .end(done);
    });

    it('should fail when saving with incorrect sex', function (done) {
      request(app)
        .put('/api/users/me')
        .set('Authorization', 'Bearer ' + Seed.tokens.Al)
        .send({
          sex: 'none'
        })
        .expect(400)
        .end(done);
    });

    it('should update', function (done) {
      request(app)
        .put('/api/users/me')
        .set('Authorization', 'Bearer ' + Seed.tokens.Al)
        .send({
          name: 'Test name'
        })
        .expect(200)
        .end(function (err, res) {
          should.not.exist(err);
          should.equal(res.body.name, 'Test name');

          done();
        });
    });
  });

  describe('change password', function () {
    it('should fail when old password is incorrect', function (done) {
      request(app)
        .post('/api/users/me/password')
        .set('Authorization', 'Bearer ' + Seed.tokens.Al)
        .send({
          old: 'incorrect',
          new: 'new_password'
        })
        .expect(400)
        .end(done);
    });

    it('should change', function (done) {
      request(app)
        .post('/api/users/me/password')
        .set('Authorization', 'Bearer ' + Seed.tokens.Al)
        .send({
          old: Seed.users[0].password,
          new: 'new_password'
        })
        .expect(200)
        .expect('OK')
        .end(done);
    });
  });
  //
  //it('should return list of user jobs', function (done) {
  //  var taxonomy = new Taxonomy(Seed.taxonomyData);
  //  taxonomy.owner = Seed._ids.Al;
  //
  //  taxonomy.save(function (err) {
  //    if (err) {
  //      return done(err);
  //    }
  //
  //    var job = _.clone(Seed.jobData);
  //    job.input.taxonomies = [taxonomy._id];
  //
  //    request(app)
  //      .post('/api/jobs')
  //      .set('Authorization', 'Bearer ' + Seed.tokens.Al)
  //      .send(job)
  //      .expect(201)
  //      .end(function (jobCreateErr, res) {
  //        should.not.exist(jobCreateErr);
  //        res.body.should.be.instanceof(Object);
  //
  //        request(app)
  //          .get('/api/users/me/jobs')
  //          .set('Authorization', 'Bearer ' + Seed.tokens.Al)
  //          .expect(200)
  //          .end(function (jobsErr, jobsRes) {
  //            should.not.exist(jobsErr);
  //            jobsRes.body.should.be.instanceof(Array).and.have.lengthOf(1);
  //
  //            if (res.body) {
  //              testJob = jobsRes.body[0];
  //            }
  //
  //            done();
  //          });
  //      });
  //  });
  //});
  //
  //describe('job', function () {
  //  it('should fail', function (done) {
  //    request(app)
  //      .get('/api/users/me/jobs/incorrect_id')
  //      .set('Authorization', 'Bearer ' + Seed.tokens.Al)
  //      .expect(400)
  //      .end(done);
  //  });
  //
  //  it('should find', function (done) {
  //    request(app)
  //      .get('/api/users/me/jobs/' + testJob._id)
  //      .set('Authorization', 'Bearer ' + Seed.tokens.Al)
  //      .expect(200)
  //      .end(function (err, res) {
  //        should.not.exist(err);
  //        should.equal(res.body._id, testJob._id);
  //
  //        done();
  //      });
  //  });
  //});
  //
  //it('should return list of user taxonomies', function (done) {
  //  request(app)
  //    .get('/api/users/me/taxonomies')
  //    .set('Authorization', 'Bearer ' + Seed.tokens.Al)
  //    .expect(200)
  //    .end(function (err, res) {
  //      should.not.exist(err);
  //      res.body.should.be.instanceof(Array).and.have.lengthOf(1);
  //
  //      done();
  //    });
  //});
});
