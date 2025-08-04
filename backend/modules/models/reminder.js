'use strict';
const mongoose = require('mongoose');

const ReminderModel = mongoose.model('reminder', {
    adminId: {
        type: String,
        required: true,
        trim: true
    },
    studentId: {
        type: String,
        required: true,
        trim: true,
    },
    createdBy: {
        type: String,
        trim: true,
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

module.exports = ReminderModel;
