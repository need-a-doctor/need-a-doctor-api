'use strict';

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

/**
 * @constructor
 * @property {ObjectId} admin - user, that have access to {@link UserSchema}
 * @property {Number} amount - the amount paid for this Task in BTC
 * @property {Number} indexInJob - Job separate it's corpus to several tasks. This index allows to understand which part of corpus this task has.
 * @property {Array} workerResponses - the responses already submitted so far by the Task's worker see: {@link workerResponseSchema}
 * @property {Date} createdAt
 */
var SpecializationSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  tags: {
    type: [String],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

SpecializationSchema.index({name: 1});

module.exports = mongoose.model('Specialization', SpecializationSchema);
