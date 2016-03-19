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
    ref: 'User',
    required: true
  },
  //schedule: {
  //  type: Schema.ObjectId,
  //  ref: 'Schedule',
  //  required: true
  //},
  doctor: {
    type: Schema.ObjectId,
    ref: 'Doctor',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Reception', ReceptionSchema);
