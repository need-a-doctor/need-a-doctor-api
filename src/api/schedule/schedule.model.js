/**
 * Created by alexander on 19.03.16.
 */
'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var ScheduleSchema = new Schema({
  date: {
    type: Date
  },
  dayOfWeek: {
    type: Number
  },
  interval: {
    type: Number,
    required: true
  },
  doctor: {
    type: Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  receptions: [{
    type: Schema.Types.ObjectId,
    ref: 'Reception'
  }],
  description: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Schedule', ScheduleSchema);
