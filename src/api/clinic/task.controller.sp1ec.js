'use strict';

var _ = require('lodash');
var mongoose = require('mongoose');
var request = require('supertest');
var should = require('should');

var app = require('../../app');
var Seed = require('../../config/seed');

var CoinKiteMock = require('../services/coinkite.mock');

var Payment = require('../payment/payment.model');
var Task = require('./task.model');
var Taxonomy = require('../taxonomy/taxonomy.model');
var WorkerResponse = require('../workerResponse/workerResponse.model');

describe('Task controller', function () {
  var task;

  before(function (done) {
    CoinKiteMock.clean();
    CoinKiteMock.newReceive();

    Seed.isLoggingEnabled = false;

    Seed.seedUsers(function () {
      var taxonomy = new Taxonomy(Seed.taxonomyData);
      taxonomy.owner = Seed._ids.Al;

      taxonomy.save(function (err) {
        if (err) {
          return done(err);
        }

        var job = _.clone(Seed.jobData);
        job.input.taxonomies = [taxonomy._id];

        request(app)
          .post('/api/jobs')
          .set('Authorization', 'Bearer ' + Seed.tokens.Al)
          .send(job)
          .expect(201)
          .end(function (jobErr, res) {
            should.not.exist(jobErr);
            res.body.should.be.instanceof(Object);

            Payment.update({}, {status: 'completed'}, {multi: true}, done);
          });
      });
    });
  });

  after(function (done) {
    mongoose.connection.db.dropDatabase(done);
  });

  it('should return empty list of tasks', function (done) {
    request(app)
      .get('/api/tasks')
      .set('Authorization', 'Bearer ' + Seed.tokens.Al)
      .expect(200)
      .end(function (err, res) {
        should.not.exist(err);

        should.exist(res.body.meta);
        should.exist(res.body.meta.paging);
        should.exist(res.body.meta.filter);
        res.body.data.should.be.instanceof(Array).and.have.lengthOf(0);

        done();
      });
  });

  it('should return list of tasks', function (done) {
    request(app)
      .get('/api/tasks?stream=testing')
      .set('Authorization', 'Bearer ' + Seed.tokens.Al)
      .expect(200)
      .end(function (err, res) {
        should.not.exist(err);

        should.exist(res.body.meta);
        should.exist(res.body.meta.paging);
        should.exist(res.body.meta.filter);
        res.body.data.should.be.instanceof(Array).and.have.lengthOf(2);

        if (res.body.data.length) {
          task = res.body.data[0];
        }

        done();
      });
  });

  it('should return task details', function (done) {
    request(app)
      .get('/api/tasks/' + task._id)
      .set('Authorization', 'Bearer ' + Seed.tokens.Al)
      .expect(200)
      .end(function (err, res) {
        should.not.exist(err);

        should.equal(res.body._id, task._id);
        should.equal(res.body.createdAt, task.createdAt);
        should.not.exist(res.body.corpus);
        should.not.exist(res.body.job.input.corpus);
        should.not.exist(res.body.job.input.taxonomies);
        should.not.exist(res.body.workerResponses);

        done();
      });
  });

  it('shouldn\'t find the task because ' +
    'current user is not a worker for this task', function (done) {
    request(app)
      .get('/api/tasks/' + task._id + '/work')
      .set('Authorization', 'Bearer ' + Seed.tokens.Al)
      .expect(404)
      .end(done);
  });

  it('should return task details for the worker', function (done) {
    Task
      .findOne({_id: task._id})
      .then(function (foundTask) {
        var workerResponse = new WorkerResponse();
        workerResponse.worker = Seed._ids.Al;
        workerResponse.task = task._id;

        foundTask.workerResponses = [workerResponse];

        foundTask.save(function (taskErr) {
          should.not.exist(taskErr);


          request(app)
            .get('/api/tasks/' + task._id + '/work')
            .set('Authorization', 'Bearer ' + Seed.tokens.Al)
            .expect(200)
            .end(function (err, res) {
              should.not.exist(err);

              should.equal(res.body._id, task._id);
              should.equal(res.body.createdAt, task.createdAt);
              should.exist(res.body.corpus);
              should.exist(res.body.categories);
              should.not.exist(res.body.job.input.corpus);
              should.not.exist(res.body.job.input.taxonomies);
              should.not.exist(res.body.workerResponses);

              done();
            });
        });
      })
      .catch(done);
  });
});
