'use strict';

var Logger = require('../../services/logger.service');
var Doctor = require('./doctor.model');

var controller = {
  index: index,
  detail: detail,
  getBySpecialization: getBySpecialization,
  getByClinic: getByClinic
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
