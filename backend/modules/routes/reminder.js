'use strict';
const express = require('express');
const router = express.Router();
const { SendManualFeeReminder } = require('../controllers/reminder');
router.post('/', SendManualFeeReminder);
module.exports = router;