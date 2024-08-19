'use strict';
const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
  adminId: {
    type: String,
    required: true,
    trim: true
  },
  schoolName: {
    type: String,
    required: true,
    trim: true,
  },
  schoolLogo: {
    type: String,
    required: true,
    trim: true,
},
  affiliationNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  schoolCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  foundedYear: {
    type: Number,
    required: true,
  },
  board: {
    type: String,
    required: true,
    trim: true,
  },
  medium: {
    type: String,
    required: true,
    trim: true,
  },
  street: {
    type: String,
    required: true,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  district: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: String,
    required: true,
    trim: true,
  },
  country: {
    type: String,
    required: true,
    default: 'India',
  },
  pinCode: {
    type: Number,
    required: true,
    trim: true,
  },
  phoneOne: {
    type: Number,
    required: true,
    trim: true,
  },
  phoneSecond: {
    type: Number,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
},

});

const School = mongoose.model('School', schoolSchema);

module.exports = School;