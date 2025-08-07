// const mongoose = require('mongoose');

// const MessageLogSchema = new mongoose.Schema({
//     requestId: {
//         type: String,
//         required: true,
//         trim: true
//     },
//     status: {
//         type: String,
//         enum: ['sent', 'delivered', 'read', 'failed'],
//         default: 'sent'
//     },
//     sentAt: {
//         type: Date,
//     },
//     deliveredAt: {
//         type: Date
//     },
//     readAt: {
//         type: Date
//     }
// }, { _id: false });

// const ReminderLogsSchema = new mongoose.Schema({
//     adminId: {
//         type: String,
//         required: true,
//         trim: true
//     },
//     studentId: {
//         type: String,
//         required: true,
//         trim: true
//     },
//     logs: {
//         type: [MessageLogSchema],
//         default: []
//     },
//     lastReminderSentAt: {
//         type: Date,
//         default: Date.now
//     },
//     createdAt: {
//         type: Date,
//         default: Date.now
//     }
// });

// module.exports = mongoose.model('reminder-log', ReminderLogsSchema);
'use strict';
const mongoose = require('mongoose');

const MessageLogSchema = {
    _id: false,
    requestId: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['sent', 'delivered', 'read', 'failed'],
        default: 'sent'
    },
    sentAt: {
        type: Date
    },
    deliveredAt: {
        type: Date
    },
    readAt: {
        type: Date
    }
};

const ReminderLogsModel = mongoose.model('reminder-logs', {
    adminId: {
        type: String,
        required: true,
        trim: true
    },
    studentId: {
        type: String,
        required: true,
        trim: true
    },
    logs: {
        type: [MessageLogSchema],
        default: []
    },
    lastReminderSentAt: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
module.exports = ReminderLogsModel;
