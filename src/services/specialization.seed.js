'use strict';

var Logger = require('./logger.service');
var Specialization = require('../api/specialization/specialization.model');

if (process.env.NODE_ENV !== 'test') {
  init();
}

function init () {
  Specialization
    .find()
    .then(function (specializations) {
      if (!specializations.length) {
        Logger.log('Specializations list is missing. Trying to recreate...');

        try {
          _recreateSpecializations();
        } catch (err) {
          Logger.error('Unable to populate specializations', {
            error: err
          });
        }
      }
    })
    .catch(function (err) {
      Logger.error('Error - can\'t get specializations list from DB', {
        error: err
      });
    });
}

function _recreateSpecializations () {
  var specializationsSeed = require('./specialization.seed.json');

  Specialization.collection.insert(specializationsSeed, function (err, specializations) {
    if (err) {
      return Logger.error('Insert specializations error', {
        error: err
      });
    }

    Logger.log('Specializations created', {
      amount: specializations.result.n
    });
  });
}
