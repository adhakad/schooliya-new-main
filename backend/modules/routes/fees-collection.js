'use strict';
const express = require('express');
const router = express.Router();
const {GetSingleStudentFeesCollectionById,GetPayableSingleStudentFeesCollectionById,GetAllStudentFeesCollectionByClass,CreateFeesCollection} = require('../controllers/fees-collection');


router.get('/student/:studentId',GetSingleStudentFeesCollectionById);
router.get('/payable/student/:studentId',GetPayableSingleStudentFeesCollectionById);
router.get('/admin/:id/class/:class/stream/:stream',GetAllStudentFeesCollectionByClass);

router.post('/',CreateFeesCollection);
// router.post('/admission-fees',CreateAdmissionFeesCollection);

module.exports = router;