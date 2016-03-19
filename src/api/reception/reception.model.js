/**
 * Created by alexander on 19.03.16.
 */
'use strict';

var mongoose = require('mongoose');

var Schema = mongoose.Schema;


var ReceptionSchema = new Schema({
  id: Number,
  time: Date,
  user: Number,
  schedule: Number,
  doctor: Number
});

module.exports = mongoose.model('Reception', ReceptionSchema);
