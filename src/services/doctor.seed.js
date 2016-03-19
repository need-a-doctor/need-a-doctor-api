'use strict';

var Logger = require('./logger.service');
var Doctor = require('../api/doctor/doctor.model');

if (process.env.NODE_ENV !== 'test') {
  init();
}

function init () {
  Doctor
    .find()
    .then(function (doctors) {
      if (!doctors.length) {
        Logger.log('Doctors list is missing. Trying to recreate...');

        try {
          _recreateDoctors();
        } catch (err) {
          Logger.error('Unable to populate doctors', {
            error: err
          });
        }
      }
    })
    .catch(function (err) {
      Logger.error('Error - can\'t get doctors list from DB', {
        error: err
      });
    });
}

function _recreateDoctors () {
  var doctorsSeed = require('./doctor.seed.json');

  Doctor.collection.insert(doctorsSeed, function (err, doctors) {
    if (err) {
      return Logger.error('Insert doctors error', {
        error: err
      });
    }

    Logger.log('Doctors created', {
      amount: doctors.result.n
    });
  });
}
