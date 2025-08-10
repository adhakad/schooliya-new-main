'use strict';
const express = require('express');
const router = express.Router();
const { StudentFilter,SendManualFeeReminder } = require('../controllers/reminder');
router.post('/student-filter', StudentFilter);
router.post('/', SendManualFeeReminder);
module.exports = router;