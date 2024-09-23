'use strict';
const express = require('express');
const router = express.Router();
const { GetStudentFeesCollectionBySession, GetPayableSingleStudentFeesCollectionById, GetSingleStudentFeesCollectionByStudentId, GetSingleStudentFeesCollectionById, GetAllStudentFeesCollectionByClass, CreateFeesCollection } = require('../controllers/fees-collection');


router.get('/admin/:adminId/student/fees-statemant/:id', GetSingleStudentFeesCollectionByStudentId);
router.get('/admin/:adminId/session/:session', GetStudentFeesCollectionBySession);
router.get('/statemant/:id', GetSingleStudentFeesCollectionById);
router.get('/payable/student/:studentId', GetPayableSingleStudentFeesCollectionById);
router.get('/admin/:id/class/:class/stream/:stream', GetAllStudentFeesCollectionByClass);

router.post('/', CreateFeesCollection);
// router.post('/admission-fees',CreateAdmissionFeesCollection);

module.exports = router;