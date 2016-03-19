'use strict';

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

/**
 * @constructor
 * @property {Array} corpus - an array of phrases to be classified by the worker
 * @property {ObjectId} job - the Job object that owns the Task see: {@link JobSchema}
 * @property {Number} amount - the amount paid for this Task in BTC
 * @property {Number} indexInJob - Job separate it's corpus to several tasks. This index allows to understand which part of corpus this task has.
 * @property {Array} workerResponses - the responses already submitted so far by the Task's worker see: {@link workerResponseSchema}
 * @property {Date} createdAt
 * @property {Date} completedAt
 */
var TaskSchema = new Schema({
  corpus: {
    type: [String],
    default: []
  },
  job: {
    type: Schema.ObjectId,
    ref: 'Job',
    required: true
  },
  indexInJob: {
    type: Number,
    required: true
  },
  amount: Number, // BTC amount
  //workerResponses: [workerResponse.schema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date
});

TaskSchema.index({completedAt: 1});
TaskSchema.index({completedAt: 1, amount: 1});
TaskSchema.index({createdAt: 1});
TaskSchema.index({createdAt: -1});

module.exports = mongoose.model('Task', TaskSchema);
