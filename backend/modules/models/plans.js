'use strict';
const mongoose = require('mongoose');

const PlansModel = mongoose.model('plan', {
    plans: {
        type: String,
        required: true,
        trim: true,
    },
    price: {
        type: Number,
        required: true,
        trim: true,
    },
    studentLimit: {
        type: Number,
        required: true,
        trim: true
    },
    perStudentIncrementPrice: {
        type: Number,
        required: true,
        trim: true,
    },
    studentIncrementRange: {
        type: Number,
        required: true,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = PlansModel;