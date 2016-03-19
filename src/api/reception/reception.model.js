/**
 * Created by alexander on 19.03.16.
 */
'use strict';

var mongoose = require('mongoose');

var Schema = mongoose.Schema;


var ReceptionSchema = new Schema({
  time: Date,
  user: {
    type: Schema.ObjectId,
    lowercase: true,
    required: true
  },
  schedule: {
    type: Schema.ObjectId,
    required: true,
    ref: 'Schedule'
  },
  doctor: {
    type: Schema.ObjectId,
    required: true,
    ref: 'Doctor'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Reception', ReceptionSchema);
