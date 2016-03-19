'use strict';

var async = require('async');
var Logger = require('./logger.service');
var Clinic = require('../api/clinic/clinic.model');

if (process.env.NODE_ENV !== 'test') {
  init();
}

function init () {
  Clinic
    .find()
    .then(function (clinics) {
      if (!clinics.length) {
        Logger.log('Clinics list is missing. Trying to recreate...');

        try {
          _recreateClinics();
        } catch (err) {
          Logger.error('Unable to populate clinics', {
            error: err
          });
        }
      }
    })
    .catch(function (err) {
      Logger.error('Error - can\'t get clinics list from DB', {
        error: err
      });
    });
}

function _recreateClinics () {
  var clinicsSeed = require('./clinic.seed.json');
  async.each(clinicsSeed,
    function (clinic, cb) {
      new Clinic(clinic)
        .save()
        .then(function () {
          cb();
        })
        .catch(cb);
    },
    function (err) {
      if (err) {
        return Logger.error('Insert clinics error', {
          error: err
        });
      }

      Logger.log('Clinics created');
    }
  );
}
