'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/**
 * @constructor
 * @property {Array} corpus - an array of phrases to be classified by the worker
 * @property {ObjectId} job - the Job object that owns the Doctor see: {@link JobSchema}
 * @property {Number} amount - the amount paid for this Doctor in BTC
 * @property {Number} indexInJob - Job separate it's corpus to several tasks. This index allows to understand which part of corpus this task has.
 * @property {Array} workerResponses - the responses already submitted so far by the Task's worker see: {@link workerResponseSchema}
 * @property {Date} createdAt
 * @property {Date} completedAt
 */
var DoctorSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  clinic: {
    type: String,
    ref: 'Clinic',
    required: true
  },
  specializations: [{
    type: Schema.Types.ObjectId,
    ref: 'Specialization'
  }],
  receptions: [{
    type: Schema.Types.ObjectId,
    ref: 'Reception'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

DoctorSchema.index({name: 1});
DoctorSchema.index({clinic: 1});
DoctorSchema.index({specializations: 1});

module.exports = mongoose.model('Doctor', DoctorSchema);
