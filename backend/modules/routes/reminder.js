'use strict';
const express = require('express');
const router = express.Router();
const { StudentFilter, StudentFilterCreate, SendManualFeeReminder } = require('../controllers/reminder');
router.post('/student-filter', StudentFilter);
router.post('/filter-create', StudentFilterCreate);
router.post('/', SendManualFeeReminder);
module.exports = router;