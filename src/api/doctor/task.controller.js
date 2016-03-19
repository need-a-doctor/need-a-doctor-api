'use strict';

var _ = require('lodash');

var Logger = require('../../services/logger.service');
var Task = require('./task.model');

var controller = {
  index: index,
  detail: detail,
  detailWork: detailWork
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
  var start = new Date().getTime();

  Task
    .find(_getFindParams(req.query))
    .sort(_getSortParams(req.query))
    .populate(_getPopulateParams())
    .lean()
    .then(function (tasks) {
      res.json(_getFilteredAndLimitedTasks(req, tasks));
    })
    .catch(function (err) {
      res.status(400).send(err);
    })
    .finally(function () {
      Logger.debug('TaskController::index() - timing', {
        time: new Date().getTime() - start
      });
    });
}

/**
 * @function - Get a single Task - :restriction: 'owner' or admin'
 * @memberof TaskSchema
 * @arg id - the _id of the Task
 * @returns data - the Task
 */
function detail (req, res) {
  Task
    .findById(req.params.id)
    .populate({
      path: 'job',
      select: {
        title: -1,
        owner: -1,
        input: -1,
        amount: -1,
        workers: -1
      },
      populate: [
        {
          path: 'owner',
          select: {name: -1},
          model: 'User'
        },
        {
          path: 'input.taxonomies',
          model: 'Taxonomy'
        }
      ]
    })
    .lean()
    .then(function (task) {
      if (!task) {
        return res.status(404).send('Not found');
      }

      task.taxonomiesSize = 0;
      task.corpusSize = 0;
      task.workersPlacesLeft = task.job.workers - task.workerResponses.length;

      delete task.job.input.taxonomies;
      delete task.job.input.corpus;
      delete task.workerResponses;
      delete task.corpus;

      res.status(200).json(task);
    })
    .catch(function (err) {
      res.status(400).json(err);
    });
}

/**
 * @function - Return details of a single task for the worker who is working on it
 * @memberof TaskSchema
 * @arg id - the _id of the Task
 * @returns data - the Task
 */
function detailWork (req, res) {
  Task
    .findOne({
      _id: req.params.id,
      'workerResponses.worker': req.user._id
    })
    .populate({
      path: 'job',
      select: {
        title: -1,
        owner: -1,
        input: -1,
        amount: -1
      },
      populate: [
        {
          path: 'input.taxonomies',
          model: 'Taxonomy'
        }
      ]
    })
    .lean()
    .then(function (task) {
      if (!task) {
        return res.status(404).send('Not found');
      }

      task.categories = 0;
      task.taxonomies = task.job.input.taxonomies;

      delete task.job.input.corpus;
      delete task.job.input.taxonomies;
      delete task.workerResponses;

      res.status(200).json(task);
    })
    .catch(function (err) {
      Logger.error('TaskController::detailWork() - error in "findOne"', {
        error: err
      });

      res.status(400).json(err);
    });
}

/**
 * Returns object with Where options, which has been got from "req.query.min", "req.query.max" and some default options
 * @param req Default HTTP Request object
 * @returns {{fieldName1: value, fieldNameN: value}}
 */
function _getFindParams (params) {
  var whereParams = {
    completedAt: null
  };

  if (params.min || params.max) {
    whereParams.amount = {};
  }

  if (params.min) {
    whereParams.amount.$gte = parseInt(params.min);
  }
  if (params.max) {
    whereParams.amount.$lte = parseInt(params.max);
  }

  return whereParams;
}

/**
 * Returns object with Sort options, which has been got from "req.query.sortBy" and "req.query.order"
 * @param req Default HTTP Request object
 * @returns {{fieldName:order}}
 */
function _getSortParams (params) {
  var sortParams = {};

  if (params.order === 'asc') {
    sortParams[params.sortBy || 'createdAt'] = 1;
  } else {
    sortParams[params.sortBy || 'createdAt'] = -1;
  }

  return sortParams;
}

/**
 * Returns object with populate settings for all needed fields, excluding extra fields.
 * @returns {{Mongoose Populate Object}}
 */
function _getPopulateParams () {
  return {
    path: 'job',
    model: 'Job',
    select: {
      title: 1,
      owner: 1,
      stream: 1,
      workers: 1,
      payment: 1,
      input: 1,
      amountByPhrase: 1,
      tasks: 1
    },
    populate: [
      {
        path: 'owner',
        model: 'User',
        select: {
          name: 1,
          google: 1
        }
      },
      {
        path: 'payment',
        model: 'Payment',
        select: {
          id: 1
        }
      }
    ]
  };
}

/**
 * Filters and cuts array of {@link TaskSchema} to return available list of tasks for current user
 * @param allTasks Array of {@link TaskSchema}
 * @returns {
 *   {
 *     meta:{
 *       paging:{
 *         total:Number,
 *         amount:Number,
 *         offset:Number
 *       },
 *       filter:{
 *         stream:String,
 *         min:Number,
 *         max:Number
 *       }
 *     },
 *     data: [TaskSchema]
 *   }
 * }
 */
function _getFilteredAndLimitedTasks (req, tasks) {
  var filteredTasks = [];

  _.forEach(tasks, function (task) {
    if (!task.job.payment) { // don't return unpaid tasks
      return;
    }
    if (task.job.stream !== req.query.stream) {
      return;
    }
    var userWorkerResponse = _.find(task.workerResponses, function (response) {
      return req.user._id.equals(response.worker);
    });
    if (userWorkerResponse) { // user already work on this task
      return;
    }
    if (task.workerResponses &&
      (task.workerResponses.length >= task.job.workers)) { // enough workers
      return;
    }

    task.taxonomiesSize = task.job.input.taxonomies.length;
    task.corpusSize = task.corpus.length;
    task.workersPlacesLeft = task.job.workers - task.workerResponses.length;
    task.job = {
      title: task.job.title,
      owner: task.job.owner,
      amountByPhrase: task.job.amountByPhrase,
      tasksAmount: task.job.tasks.length
    };

    delete task.workerResponses;
    delete task.corpus;

    filteredTasks.push(task);
  });

  var offset = parseInt(req.query.offset) || 0;
  var limit = 10;
  var limitedTasks = filteredTasks.slice(offset, offset + limit);

  return {
    meta: {
      paging: {
        total: filteredTasks.length,
        amount: limitedTasks.length,
        offset: offset
      },
      filter: {
        stream: req.query.stream,
        min: req.query.min,
        max: req.query.max
      }
    },
    data: limitedTasks
  };
}
