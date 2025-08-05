'use strict';
const express = require('express');
const router = express.Router();
const { sendManualFeeReminder } = require('../controllers/reminder');
router.post('/',sendManualFeeReminder);
module.exports = router;