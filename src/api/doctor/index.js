'use strict';

var express = require('express');
var controller = require('./task.controller.js');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.use(auth.isAuthenticated());

router.get('/', controller.index);
router.get('/:id', controller.detail);
router.get('/:id/work', controller.detailWork);

module.exports = router;
