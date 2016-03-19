/**
 * Created by alexander on 19.03.16.
 */
'use strict';

var express = require('express');
var controller = require('./reception.controller.js');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.use(auth.isAuthenticated());

router.get('/me/clinic/:userId/reception', controller.index);
router.get('/me/clinic/:userId/reception/:reseptionId', controller.detail);
router.post('/me/clinic/:userId/reception', controller.createReception);
router.delete('/me/clinic/:userId/reception/:receptionId', controller.deleteReception);
router.put('/me/clinic/:userId/reception/:receptionId', controller.updateReseption);

module.exports = router;
