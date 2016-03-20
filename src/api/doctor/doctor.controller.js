'use strict';

var _ = require('lodash');
var Logger = require('../../services/logger.service');
var Doctor = require('./doctor.model');
var moment = require('moment');

var controller = {
  index: index,
  detail: detail,
  getBySpecialization: getBySpecialization,
  getByClinic: getByClinic,
  getGroupedByDate: getGroupedByDate,
  getDoctorGroupedByDate: getDoctorGroupedByDate
};

module.exports = controller;

/**
 * @typedef TaskResponse
 * @property {Object} meta - meta data about this request
 * @property {Object} meta.paging - meta data about pagination params
 * @property {Number} meta.paging.total - the total number of tasks available
 * @property {Number} meta.paging.amount - the number of tasks returned by this query
 * @property {Number} meta.paging.offset - the offset from the beginning of the dataset
 * @property {Number} meta.paging.limit - the limit requested by the caller
 * @property {Object} meta.filter - meta data about filter params
 * @property {String} meta.filter.stream - results restricted to this stream
 * @property {Number} meta.filter.min - results restricted to tasks below a certain value
 * @property {Number} meta.filter.max - results restricted to tasks above a certain value
 * @property {Object} data - The array of Task objects
 */

/**
 * Return a list of tasks
 *
 * @function - return a list of {@link TaskSchema}
 * @memberof TaskSchema
 * @api public
 * @arg {Object} req - the HTTP request body
 * @arg {String} req.query.stream - filter by streamquery.
 * @arg {Number} req.query.offset - start at offset
 * @arg {Number} req.query.min - filter by minimum task value
 * @arg {Number} req.query.max - filter by maximum task value
 * @arg {String} req.query.sortBy  - sort results by this field
 * @arg {String} req.query.order - sort order can be asc or desc, default is desc
 * @return {TaskResponse}
 */
function index (req, res) {
  Doctor
    .find()
    .sort({
      name: 1
    })
    .populate('specializations')
    .lean()
    .then(function (doctors) {
      res.json(doctors);
    })
    .catch(function (err) {
      Logger.error('DoctorController::index() - get list failed', {
        error: err
      });
      res.status(500).send();
    });
}

/**
 * @function - Get a single Task - :restriction: 'owner' or admin'
 * @memberof TaskSchema
 * @arg id - the _id of the Task
 * @returns data - the Task
 */
function detail (req, res) {
  Doctor
    .findOne({
      _id: req.params.id
    })
    .populate('specializations')
    .lean()
    .then(function (doctor) {
      res.json(doctor);
    })
    .catch(function (err) {
      Logger.error('DoctorController::detail() - get doctor failed', {
        error: err
      });
      res.status(500).send();
    });
}

function getBySpecialization (req, res) {
  Doctor
    .find({
      specializations: req.params.specializationId
    })
    .sort({
      name: 1
    })
    .populate('specializations')
    .lean()
    .then(function (doctors) {
      res.json(doctors);
    })
    .catch(function (err) {
      Logger.error('DoctorController::getBySpecialization() - get list failed',
        {
          error: err
        });
      res.status(500).send();
    });
}

function getByClinic (req, res) {
  var params = {clinic: req.params.clinicId};
  Doctor
    .find(params)
    .sort({name: 1})
    .populate('specializations')
    .lean()
    .then(function (doctors) {
      res.json(doctors);
    })
    .catch(function (err) {
      Logger.error('DoctorController::getByClinic() - get list failed', {
        error: err
      });
      res.status(500).send();
    });
}

function getGroupedByDate (req, res) {
  Doctor
    .find()
    .sort({name: 1})
    .populate('clinic')
    .populate('specializations')
    .populate('receptions')
    //.populate({
    //  path: 'receptions',
    //  match: {
    //      date: {
    //        '$gte': startDate,
    //        '$lt': endDate
    //      }
    //    }
    //})
    .lean()
    .then(function (doctors) {
      _getResponceForDoctorSchedule(req, res, doctors);
    })
    .catch(function (err) {
      Logger.error('DoctorController::getGroupedByDate() - get list failed', {
        error: err
      });
      res.status(500).send();
    });
}

function getDoctorGroupedByDate (req, res) {
  var startDate = new Date();
  var endDate = new Date();
  endDate.setTime(startDate.getTime() + 10 * 1000 * 60 * 60 * 24);
  Doctor
    .findOne({
      _id: req.params.id
    })
    .populate('clinic')
    .populate('specializations')
    .populate('receptions')
    .lean()
    .then(function (doctor) {
      var response = [];
      for (var d = new Date(startDate.getTime()); d <= endDate; d.setTime(d.getTime() + 1000 * 60 * 60 * 24)) {
        var entity = {
          date: d,
          doctor: _createReceptionsForDoctor(doctor, d)
        };
        response.push(entity);
      }
      res.json(response);
    })
    .catch(function (err) {
      Logger.error('DoctorController::getGroupedByDate() - get list failed', {
        error: err
      });
      res.status(500).send();
    });
}

function _getFilteredDoctor (doctors, date) {
  return _(doctors)
    .forEach(function (doctor) {
      _createReceptionsForDoctor(doctor, date);
    })
    .value();
}

function _getResponceForDoctorSchedule (req, res, doctors) {
  var startDate = new Date();
  var endDate = new Date();
  endDate.setTime(startDate.getTime() + 10 * 1000 * 60 * 60 * 24);

  var response = [];

  for (var d = new Date(startDate.getTime()); d <= endDate; d.setTime(d.getTime() + 1000 * 60 * 60 * 24)) {
    var entity = {
      date: startDate,
      doctors: _getFilteredDoctor(req, doctors, d)
    };
    response.push(entity);
  }
  res.json(response);
}

function _createReceptionsForDoctor (doctor, date) {
  var receptions = [];
  for (var i = 9; i <= 18; i += 2) {
    var startTime = moment(date);
    startTime.hour(i);
    startTime.minute(0);
    startTime.millisecond(0);
    var reception = _.find(doctor.receptions, function () {
      //return moment(o.date).isSame(startTime.toDate());
      return false;
    });

    if (reception && reception.length() > 0) {
      //receptions.push({
      //  _id: reception._id,
      //  time: startTime,
      //  isBusy: true,
      //  isCurrentUser: req.user._id == reception.user
      //});
    } else {
      receptions.push({
        time: startTime,
        isBusy: false,
        isCurrentUser: false
      });
    }
  }
  doctor.receptions = receptions;
  return doctor;
}
