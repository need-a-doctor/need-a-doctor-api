'use strict';

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

  Clinic.collection.insert(clinicsSeed, function (err, clinics) {
    if (err) {
      return Logger.error('Insert clinics error', {
        error: err
      });
    }

    Logger.log('Clinics created', {
      amount: clinics.result.n
    });
  });
}
