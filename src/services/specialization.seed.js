'use strict';

var async = require('async');
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

  async.each(specializationsSeed,
    function (specialization, cb) {
      new Specialization(specialization)
        .save()
        .then(function () {
          cb();
        })
        .catch(cb);
    },
    function (err) {
      if (err) {
        return Logger.error('Insert specializations error', {
          error: err
        });
      }

      Logger.log('Specializations created');
    }
  );
}
