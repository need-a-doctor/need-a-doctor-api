'use strict';

var _ = require('lodash');
var crypto = require('crypto');
var urljoin = require('url-join');

var config = require('../../config/environment');
var authService = require('../../auth/auth.service');
var Logger = require('../../services/logger.service');

var Clinic = require('../clinic/clinic.model');
var User = require('./user.model');

var controller = {
  create: create,
  verify: verify,
  update: update,
  me: me,
  changePassword: changePassword,
  getClinic: getClinic,
  updateClinic: updateClinic,
  getDoctors: getDoctors,
  getDoctor: getDoctor,
  updateDoctor: updateDoctor,
  deleteDoctor: deleteDoctor
};

module.exports = controller;


/**
 * @function - Creates a new user
 * @memberof UserSchema
 */
function create (req, res) {
  var newUser = new User(req.body);

  newUser.provider = 'local';
  if (req.body.role === 'clinic-admin') {
    newUser.role = 'clinic-admin';
  } else {
    newUser.role = 'user';
  }

  newUser.verifyEmailHash = crypto.randomBytes(16).toString('hex');
  newUser.verifyEmailUrl = urljoin(config.backend.url,
    config.urls.verifyEndpointUrl, newUser.verifyEmailHash);
  newUser.isEmailVerified = false;

  newUser
    .save()
    .then(function (user) {
      if (user.role === 'clinic-admin') {
        Clinic
          .create({
            admin: user,
            name: 'Clinic name',
            address: 'Clinic address'
          })
          .then(function (clinic) {
            Logger.log('UserController::create() - Clinic created for clinic admin', {
              clinic: clinic
            });
          })
          .catch(function (err) {
            Logger.error('UserController::create() - Clinic creation failed' +
              ' for clinic admin',
              {
                admin: user,
                error: err
              });
          });
      }
      var token = authService.signToken(user._id);

      res.status(200).json({
        id: user._id,
        token: token
      });
    })
    .catch(function (err) {
      if (err.errors.email &&
        (
          err.errors.email.message ===
          'The specified email address is already in use.'
        )) {
        return validationError(res, err);
      }

      res.status(400).send(err);
    });
}

/**
 * @function - Verifies email for a user
 * @memberof UserSchema
 */
function verify (req, res) {
  User
    .findOne({
      verifyEmailHash: req.params.hash
    })
    .then(function (user) {
      if (!user) {
        return res.status(404).send();
      }

      user.isEmailVerified = true;
      user.verifyEmailHash = null;

      user
        .save()
        .then(function (savedUser) {
          var token = authService.signToken(savedUser._id);

          res
            .cookie('token', JSON.stringify(token))
            .redirect(config.frontend.url);
        })
        .catch(function (err) {
          Logger.error('UserController::verify() - "user.save()" failed', {
            error: err
          });

          res.status(400).send();
        });
    })
    .catch(function (err) {
      Logger.error('UserController::verify() - "User.findOne()" failed', {
        error: err
      });

      res.status(400).send();
    });
}

/**
 * @function - Updates an existing user in the DB.
 * @memberof UserSchema
 */
function update (req, res) {
  // We can't allow user to set "role" field for example
  var allowedToEditFields = {
    name: req.body.name,
    email: req.body.email,
    sex: req.body.sex
  };

  _.merge(req.user, allowedToEditFields);
  req.user.save(function (err, savedUser) {
    if (err) {
      if (err.name === 'ValidationError') {
        return res.status(400).send(err);
      }

      return handleError(res, err);
    }

    res.status(200).json(savedUser.profile);
  });
}

/**
 * @function - Change a user's password
 * @memberof UserSchema
 */
function changePassword (req, res) {
  var oldPass = String(req.body.old);
  var newPass = String(req.body.new);

  if (!req.user.authenticate(oldPass)) {
    return res.status(400).send('Wrong old password');
  }

  req.user.password = newPass;
  req.user.save(function (err) {
    if (err) {
      return validationError(res, err);
    }

    res.status(200).send('OK');
  });
}

/**
 * @function - Get my info
 * @memberof UserSchema
 */
function me (req, res) {
  res.json(req.user.profile);
}

/**
 * @function - Get clinic-admin's clinic
 * @memberof UserSchema
 */
function getClinic (req, res) {
  Clinic
    .findOne({admin: req.user._id})
    .select({
      admin: 0
    })
    .lean()
    .then(function (clinic) {
      res.json(clinic);
    })
    .catch(function (err) {
      handleError(res, err);
    });
}

/**
 * @function - Update clinic-admin's clinic
 * @memberof UserSchema
 */
function updateClinic (req, res) {
  Clinic
    .findOne({admin: req.user._id})
    .then(function (clinic) {
      // We can't allow to set "admin" field for example
      var allowedToEditFields = {
        name: req.body.name,
        address: req.body.address
      };
      _.merge(clinic, allowedToEditFields);
      clinic.save(function (err, savedClinic) {
        if (err) {
          if (err.name === 'ValidationError') {
            return res.status(400).send(err);
          }
          return handleError(res, err);
        }
        res.status(200).json(savedClinic);
      });
    })
    .catch(function (err) {
      handleError(res, err);
    });
}


/**
 * @function - Get clinic-admin's clinic
 * @memberof UserSchema
 */
function getDoctors (/*req, res*/) {
  //Clinic
  //  .findOne({admin: req.user._id})
  //  .lean()
  //  .then(function (clinic) {
  //    res.json(clinic);
  //  })
  //  .catch(function (err) {
  //    handleError(res, err);
  //  });
}

/**
 * @function - Get clinic-admin's clinic
 * @memberof UserSchema
 */
function getDoctor (/*req, res*/) {
  //Clinic
  //  .findOne({admin: req.user._id})
  //  .lean()
  //  .then(function (clinic) {
  //    res.json(clinic);
  //  })
  //  .catch(function (err) {
  //    handleError(res, err);
  //  });
}

/**
 * @function - Update clinic-admin's clinic
 * @memberof UserSchema
 */
function updateDoctor (/*req, res*/) {
  //Clinic
  //  .findOne({admin: req.user._id})
  //  .then(function (clinic) {
  //    // We can't allow to set "admin" field for example
  //    var allowedToEditFields = {
  //      name: req.body.name, //TODO: set clinic's fields
  //      email: req.body.email,
  //      sex: req.body.sex
  //    };
  //    _.merge(clinic, allowedToEditFields);
  //    clinic.save(function (err, savedClinic) {
  //      if (err) {
  //        if (err.name === 'ValidationError') {
  //          return res.status(400).send(err);
  //        }
  //        return handleError(res, err);
  //      }
  //      res.status(200).json(savedClinic);
  //    });
  //  })
  //  .catch(function (err) {
  //    handleError(res, err);
  //  });
}

/**
 * @function - Deletes a workerResponse from the DB.
 * @memberof WorkerResponseSchema
 * @arg {Number} req.id - the id of the WorkerResponse
 * @returns nothing
 */
function deleteDoctor (/*req, res*/) {
  //Task
  //  .findOne({'workerResponses._id': req.params.id})
  //  .then(function (task) {
  //    if (!task) {
  //      return res.status(404);
  //    }
  //
  //    var workerResponse = task.workerResponses.id(req.params.id);
  //
  //    if ((req.user.role !== 'admin') &&
  //      !req.user._id.equals(workerResponse.worker)) {
  //      return res.status(403).send('Not authorised');
  //    }
  //    if (workerResponse.completedAt) {
  //      return res.status(400).send('answers already submitted');
  //    }
  //
  //    workerResponse.remove();
  //    task
  //      .save()
  //      .then(function () {
  //        res.status(204).send('No Content');
  //      })
  //      .catch(function (err) {
  //        res.status(400).send(err);
  //      });
  //  })
  //  .catch(function (err) {
  //    handleError(res, err);
  //  });
}

function handleError (res, err) {
  return res.status(400).send(err);
}

function validationError (res, err) {
  return res.status(409).json(err);
}
