'use strict';

var mongoose = require('mongoose');
var crypto = require('crypto');

var uniqValidatorPlugin = require('../../plugins/uniqueValidator.plugin');
var validators = require('../../utilities/validators.utility');

var authTypes = ['google'];
var Schema = mongoose.Schema;

/**
 * @constructor
 * @property {String} name
 * @property {String} email
 * @property {String} sex - can be male, female or other
 * @property {String} country
 * @property {String} role - indicates the guy's access permissions: default is 'user'
 */
var UserSchema = new Schema({
  name: String,
  email: {
    type: String,
    lowercase: true,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  sex: {
    type: String,
    lowercase: true,
    enum: ['male', 'female', 'other']
  },
  verifyEmailHash: String,
  isEmailVerified: Boolean,
  role: {
    type: String,
    default: 'user'
  },
  hashedPassword: String,
  salt: String,

  provider: String,
  google: {},

  createdAt: {
    type: Date,
    default: Date.now
  }
});

UserSchema.plugin(uniqValidatorPlugin);

/**
 * Virtuals
 */
UserSchema
  .virtual('password')
  .set(function (password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(function () {
    return this._password;
  });

// Public profile information
UserSchema
  .virtual('profile')
  .get(function () {
    return {
      _id: this._id,
      name: this.name,
      email: this.email,
      sex: this.sex,
      avatar: this.google && this.google.image ? this.google.image.url : null
    };
  });

// Non-sensitive info we'll be putting in the token
UserSchema
  .virtual('token')
  .get(function () {
    return {
      _id: this._id,
      role: this.role
    };
  });

/**
 * Validations
 */

// Validate email
UserSchema
  .path('email')
  .validate(function (email) {
    if (authTypes.indexOf(this.provider) !== -1) {
      return true;
    }

    return email.length && validators.isEmailValid(email);
  }, 'Email field is invalid.');

UserSchema
  .path('email')
  .validate(function (value, respond) {
    this.constructor
      .findOne({
        _id: {$ne: this._id},
        email: value
      })
      .then(function (user) {
        respond(!user);
      })
      .catch(function (err) {
        throw err;
      });
  }, 'The specified email address is already in use.');

// Validate empty password
UserSchema
  .path('hashedPassword')
  .validate(function (hashedPassword) {
    if (authTypes.indexOf(this.provider) !== -1) {
      return true;
    }

    return hashedPassword.length;
  }, 'Password cannot be blank');

function validatePresenceOf (value) {
  return value && value.length;
}

/**
 * Pre-save hook
 */
UserSchema
  .pre('save', function (next) {
    if (!this.isNew) {
      return next();
    }

    if (!validatePresenceOf(this.hashedPassword) &&
      authTypes.indexOf(this.provider) === -1) {
      next(new Error('Invalid password'));
    } else {
      next();
    }
  });

/*
 * Methods
 */

UserSchema.methods = {
  /**
   * Authenticate - check if the passwords are the same
   *
   * @memberof! UserSchema.methods#
   * @method authenticate
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */
  authenticate: function (plainText) {
    return this.encryptPassword(plainText) === this.hashedPassword;
  },

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */
  makeSalt: function () {
    return crypto.randomBytes(16).toString('base64');
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */
  encryptPassword: function (password) {
    if (!password || !this.salt) {
      return '';
    }

    var salt = new Buffer(this.salt, 'base64');
    return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
  }
};

module.exports = mongoose.model('User', UserSchema);
