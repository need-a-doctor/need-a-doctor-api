'use strict';

var Logger = require('./logger.service');
var Country = require('../api/country/country.model');

if (process.env.NODE_ENV !== 'test') {
  init();
}

function init () {
  Country
    .find()
    .then(function (countries) {
      if (!countries.length) {
        Logger.log('Countries list is missing. Trying to recreate...');

        try {
          _recreateCountries();
        } catch (err) {
          Logger.error('Unable to populate countries', {
            error: err
          });
        }
      }
    })
    .catch(function (err) {
      Logger.error('Error - can\'t get countries list from DB', {
        error: err
      });
    });
}

function _recreateCountries () {
  var countrySeed = require('./country.seed.json');

  Country.collection.insert(countrySeed, function (err, countries) {
    if (err) {
      return Logger.error('Insert countries error', {
        error: err
      });
    }

    Logger.log('Countries created', {
      amount: countries.result.n
    });
  });
}
