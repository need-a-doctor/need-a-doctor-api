'use strict';

var async = require('async');
var Logger = require('./logger.service');
var Reception = require('../api/reception/reception.model');

if (process.env.NODE_ENV !== 'test') {
  init();
}

function init () {
  Reception
    .find()
    .then(function (receptions) {
      if (!receptions.length) {
        Logger.log('Receptions list is missing. Trying to recreate...');

        try {
          _recreateReceptions();
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

function _recreateReceptions () {
  var receptionsSeed = require('./reception.seed.json');
  async.each(receptionsSeed,
    function (reception, cb) {
      new Reception(reception)
        .save()
        .then(function () {
          cb();
        })
        .catch(cb);
    },
    function (err) {
      if (err) {
        return Logger.error('Insert receptions error', {
          error: err
        });
      }

      Logger.log('Receptions created');
    }
  );
}
