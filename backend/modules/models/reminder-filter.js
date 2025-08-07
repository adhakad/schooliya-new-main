'use strict';
const mongoose = require('mongoose');

const ReminderLogsModel = mongoose.model('reminder-filter', {
    adminId: {
        type: String,
        required: true,
        trim: true
    },
    class: {
        type: Number,
        required: true,
        trim: true
    },
    lastReminderSentAt: {
        type: Date,
        default: Date.now,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = ReminderLogsModel;
