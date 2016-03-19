'use strict';

var compose = require('composable-middleware');
var expressJwt = require('express-jwt');
var jwt = require('jsonwebtoken');

var config = require('../config/environment');

var Logger = require('../services/logger.service');
var User = require('../api/user/user.model.js');

var validateJwt = expressJwt({secret: config.secrets.session});

var auth = {
  isAuthenticated: isAuthenticated,
  hasRole: hasRole,
  signToken: signToken,
  setTokenCookie: setTokenCookie
};

module.exports = auth;

// Implementation below

/**
 * Attaches the user object to the request if authenticated
 * Otherwise returns 403
 */
function isAuthenticated () {
  return compose()
  // Validate jwt
    .use(function (req, res, next) {
      // allow access_token to be passed through query parameter as well
      if (req.query && req.query.hasOwnProperty('token')) {
        req.headers.authorization = 'Bearer ' + req.query.token;
      }
      validateJwt(req, res, function (err) {
        if (err) {
          // we have to send it by ourselves, without any extra error data
          return res.sendStatus(401);
        }
        next();
      });
    })
    // Attach user to request
    .use(function (req, res, next) {
      if (!req.user) {
        Logger.setUser();
        return res.status(401).send('Unauthorized');
      }

      User.findById(req.user._id, function (err, user) {
        if (err) {
          Logger.setUser();
          return next(err);
        }

        if (!user) {
          Logger.setUser();
          return res.status(401).send('Unauthorized');
        }

        Logger.setUser(user);
        req.user = user;

        next();
      });
    });
}

/**
 * Checks if the user role meets the minimum requirements of the route
 */
function hasRole (roleRequired) {
  if (!roleRequired) {
    throw new Error('Required role needs to be set');
  }

  return compose()
    .use(isAuthenticated())
    .use(function meetsRequirements (req, res, next) {
      if (
        config.userRoles.indexOf(req.user.role) >=
        config.userRoles.indexOf(roleRequired)
      ) {
        next();
      } else {
        res.status(403).send('Forbidden');
      }
    });
}

/**
 * Returns a jwt token signed by the app secret
 */
function signToken (id) {
  // 1 week = 60sec * 60min * 24hours * 7days = 604800secs
  return jwt.sign({_id: id}, config.secrets.session, {expiresIn: 604800});
}

/**
 * Set token cookie directly for oAuth strategies
 */
function setTokenCookie (req, res) {
  if (!req.user) {
    return res.status(404).json({
      message: 'Something went wrong, please try again.'
    });
  }

  var token = signToken(req.user._id, req.user.role);
  res.cookie('token', JSON.stringify(token));
  res.redirect(config.frontend.url);
}
