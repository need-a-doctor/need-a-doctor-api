'use strict';

var mongoose = require('mongoose');
var should = require('should');

require('../../app');
var Job = require('../job/job.model');
var Task = require('./task.model');

describe('Task model', function () {
  after(function (done) {
    mongoose.connection.db.dropDatabase(done);
  });

  it('shouldn\'t add new Task without Job', function (done) {
    var task = new Task();

    task.save(function (err) {
      should.exist(err);

      done();
    });
  });

  it('should add new Task', function (done) {
    var task = new Task({
      indexInJob: 0,
      job: new Job() // it won't save Job but it should save Task :)
    });

    task.save(function (err) {
      should.not.exist(err);
      task.corpus.should.be.instanceof(Array).and.have.lengthOf(0);

      done();
    });
  });

  it('should add new Task (with data)', function (done) {
    var task = new Task({
      job: new Job(), // it won't save Job but it should save Task :)
      corpus: ['qwe', 'asd', 'zxc'],
      indexInJob: 0,
      amount: 13
    });

    task.save(function (err) {
      should.not.exist(err);
      task.corpus.should.be.instanceof(Array).and.have.lengthOf(3);

      done();
    });
  });
});
