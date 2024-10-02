'use strict';
const mongoose = require('mongoose');

const AcademicSessionModel = mongoose.model('academic-session', {
    academicSession: {
        type: String,
        required: true,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = AcademicSessionModel;