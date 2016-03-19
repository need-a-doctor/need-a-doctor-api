'use strict';

var async = require('async');
var Logger = require('./logger.service');
var User = require('../api/user/user.model');

if (process.env.NODE_ENV !== 'test') {
  init();
}

function init () {
  User
    .find()
    .then(function (users) {
      if (!users.length) {
        Logger.log('Users list is missing. Trying to recreate...');

        try {
          _recreateUsers();
        } catch (err) {
          Logger.error('Unable to populate users', {
            error: err
          });
        }
      }
    })
    .catch(function (err) {
      Logger.error('Error - can\'t get users list from DB', {
        error: err
      });
    });
}

function _recreateUsers () {
  var userSeed = require('./user.seed.json');

  async.each(userSeed,
    function (user, cb) {
      new User(user)
        .save()
        .then(function () {
          cb();
        })
        .catch(cb);
    },
    function (err) {
      if (err) {
        return Logger.error('Insert users error', {
          error: err
        });
      }

      Logger.log('Users created');
    }
  );
}
