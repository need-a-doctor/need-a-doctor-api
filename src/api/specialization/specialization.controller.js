'use strict';

var Logger = require('../../services/logger.service');
var Specialization = require('./specialization.model');

var controller = {
  index: index
};

module.exports = controller;

function index (req, res) {
  Specialization
    .find()
    .sort({name: 1})
    .lean()
    .then(function (expertises) {
      res.json(expertises);
    })
    .catch(function (err) {
      Logger.error('ExpertiseController::index() - get list failed', {
        error: err
      });
      res.status(500).send();
    });
}
