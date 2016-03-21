'use strict';

var express = require('express');
var controller = require('./user.controller.js');
var receptionController = require('../reception/reception.controller.js');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.post('/', controller.create);

router.get('/me', auth.isAuthenticated(), controller.me);
router.put('/me', auth.isAuthenticated(), controller.update);
router.post('/me/password', auth.isAuthenticated(), controller.changePassword);

router.get('/me/clinic', auth.isAuthenticated(), controller.getClinic);
router.put('/me/clinic', auth.isAuthenticated(), controller.updateClinic);
router.get('/me/clinic/doctors', auth.isAuthenticated(), controller.getDoctors);
router.post('/me/clinic/doctors', auth.isAuthenticated(), controller.createDoctor);
router.get('/me/clinic/doctors/:id', auth.isAuthenticated(), controller.getDoctor);
router.put('/me/clinic/doctors/:id', auth.isAuthenticated(), controller.updateDoctor);
router.delete('/me/clinic/doctors/:id', auth.isAuthenticated(), controller.deleteDoctor);

router.get('/me/receptions', auth.isAuthenticated(), receptionController.index);
router.get('/me/receptions/:receptionId', auth.isAuthenticated(), receptionController.detail);
router.post('/me/receptions', auth.isAuthenticated(), receptionController.createReception);
router.delete('/me/receptions/:receptionId', auth.isAuthenticated(), receptionController.deleteReception);

// don't forget to change `config.urls.verifyEndpointUrl` together with route
// src/config/environment/index.js
router.get('/verify/:hash', controller.verify);

module.exports = router;
