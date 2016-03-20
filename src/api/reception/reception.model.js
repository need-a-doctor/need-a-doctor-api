/**
 * Created by alexander on 19.03.16.
 */
'use strict';

var mongoose = require('mongoose');

var Schema = mongoose.Schema;


var ReceptionSchema = new Schema({
  time: {
    type: Date,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  schedule: {
    type: Schema.Types.ObjectId,
    ref: 'Schedule'
  },
  doctor: {
    type: Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
ReceptionSchema.index({doctor: 1});
ReceptionSchema.index({user: 1});

module.exports = mongoose.model('Reception', ReceptionSchema);
