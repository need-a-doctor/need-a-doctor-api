/**
 * Created by alexander on 19.03.16.
 */
'use strict';

//var _ = require('lodash');

var Logger = require('../../services/logger.service');
var Reception = require('./reception.model');

var controller = {
  index: index,
  detail: detail,
  createReception: createReception,
  deleteReception: deleteReception,
  updateReception: updateReseption
};

module.exports = controller;

function index (req, res) {
  var start = new Date().getTime();
  Reception
    .find({user: req.user._id})
    .skip(req.query.offset)
    .limit(req.query.max)
    .sort('name')
    .then(function (receptions) {
      res.json(_getFilteredAndLimitedReception(req, receptions));
    })
    .catch(function (err) {
      res.status(400).send(err);
    })
    .finally(function () {
      Logger.debug('ReceptionController::index() - timing', {
        time: new Date().getTime() - start
      });
    });
}

function detail (req, res) {
  var start = new Date().getTime();
  Reception
    .findOne({id: req.query.receptionId})
    .then(function (reception) {
      res.json(reception);
    })
    .catch(function (err) {
      res.status(400).send(err);
    })
    .finally(function () {
      Logger.debug('ReceptionController::index() - timing', {
        time: new Date().getTime() - start
      });
    });
}

function createReception (req, res) {
  var reception = new Reception({
    time: req.body.time,
    user: req.user._id,
    schedule: req.body.schedule,
    doctor: req.body.doctor
  });
  reception.save(function (err) {
    if (err) {
      return res.status(500).send('Uoops! ' + err);
    }
    // saved!
    return res.status(200).send();
  });
}

function deleteReception (req, res) {
  Reception.remove({id: req.query.reseptionId}, function (err) {
    if (err) {
      return res.status(500).send('Uoops! ' + err);
    }
    // removed!
    return res.status(200).send();
  });
}

function updateReseption (req, res) {
  return res.status(200).send();
}


function _getFilteredAndLimitedReception (req, receptions) {
  var filteredReception = [];

  filteredReception = receptions;

  var offset = parseInt(req.query.offset) || 0;
  var limit = 10;
  filteredReception = filteredReception.slice(offset, offset + limit);

  return {
    meta: {
      paging: {
        total: filteredReception.length,
        amount: filteredReception.length,
        offset: offset
      },
      filter: {
        stream: req.query.stream,
        min: req.query.min,
        max: req.query.max
      }
    },
    data: filteredReception
  };
}
