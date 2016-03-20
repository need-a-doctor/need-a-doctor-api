'use strict';

var express = require('express');
var controller = require('./doctor.controller.js');

var router = express.Router();

router.get('/', controller.index);
router.get('/grouped-by-date/', controller.getGroupedByDate);
router.get('/:id', controller.detail);
router.get('/by-specialization/:specializationId', controller.getBySpecialization);
router.get('/by-clinic/:clinicId', controller.getByClinic);


module.exports = router;
