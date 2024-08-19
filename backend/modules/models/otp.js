'use strict';
const mongoose = require('mongoose');

const OTPModel = mongoose.model('otp', {
    email: {
        type: String,
        required: true,
        trim: true,
      },
      secret: {
        type: String,
        required: true,
        trim: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 5,
      },
});

module.exports = OTPModel;