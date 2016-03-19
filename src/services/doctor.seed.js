'use strict';

var async = require('async');
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

  async.each(doctorsSeed,
    function (doctor, cb) {
      new Doctor(doctor)
        .save()
        .then(function () {
          cb();
        })
        .catch(cb);
    },
    function (err) {
      if (err) {
        return Logger.error('Insert doctors error', {
          error: err
        });
      }

      Logger.log('Doctors created');
    }
  );
}
