/**
 * Created by alexander on 19.03.16.
 */
'use strict';

var mongoose = require('mongoose');

var Schema = mongoose.Schema;


var ReceptionSchema = new Schema({
  time: Date,
  user: {
    type: String,
    lowercase: true,
    required: true
  },
  schedule: {
    type: String,
    required: true
  },
  doctor: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Reception', ReceptionSchema);
