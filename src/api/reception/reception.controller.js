/**
 * Created by alexander on 19.03.16.
 */
'use strict';

//var _ = require('lodash');

var Reception = require('./reception.model');
var Doctor = require('./../doctor/doctor.model');

var controller = {
  index: index,
  detail: detail,
  createReception: createReception,
  deleteReception: deleteReception
};

module.exports = controller;

function index (req, res) {
  Reception
    .find({user: req.user._id})
    .skip(req.query.offset)
    .limit(10)
    .sort('name')
    .then(function (receptions) {
      res.json(/*_getFilteredAndLimitedReception(req, */receptions/*)*/);
    })
    .catch(function (err) {
      handleError(res, err);
    });
}

function detail (req, res) {
  Reception
    .findOne({id: req.query.receptionId})
    .then(function (reception) {
      res.json(reception);
    })
    .catch(function (err) {
      handleError(res, err);
    });
}

function createReception (req, res) {
  var reception = new Reception({
    time: req.body.time,
    date: req.body.date,
    user: req.user._id,
    schedule: req.body.schedule,
    doctor: req.body.doctor
  });

  reception.save(function (err, receptionNew) {
    if (err) {
      return handleError(res, err);
    }
    Doctor
      .findOne(req.body.doctor)
      .populate('receptions')
      .then(function (doctor) {
        doctor.receptions.push(receptionNew._id);
        doctor.save(function (errD) {
          if (errD) {
            return handleError(res, errD);
          }
          return res.status(200).send();
        });
      })
      .catch(function (errDoc) {
        handleError(res, errDoc);
      });
  });
}

function deleteReception (req, res) {
  Reception.remove({_id: req.query.reseptionId}, function (err) {
    if (err) {
      return handleError(res, err);
    }
    // removed!
    return res.status(204).send();
  });
}


//function _getFilteredAndLimitedReception (req, receptions) {
//  var filteredReception = [];
//
//  filteredReception = receptions;
//
//  return {
//    meta: {
//      paging: {
//        total: filteredReception.length,
//        amount: filteredReception.length,
//        offset: parseInt(req.query.offset) || 0
//      }
//    },
//    data: filteredReception
//  };
//}

function handleError (res, err) {
  return res.status(400).send(err);
}
