'use strict';
const mongoose = require('mongoose');

const StudentModel = mongoose.model('student', {
    session: {
        type: String,
        required: true,
        trim: true,
    },
    medium: {
        type: String,
        required: true,
        trim: true
    },
    adminId: {
        type: String,
        required: true,
        trim: true
    },
    admissionNo: {
        type: Number,
        required: true,
        trim: true,
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    class: {
        type: Number,
        required: true,
        trim: true
    },
    stream: {
        type: String,
        required: true,
        trim: true
    },
    admissionClass: {
        type: Number,
        required: true,
        trim: true
    },
    rollNumber: {
        type: Number,
        required: true,
        trim: true,
    },
    admissionType: {
        type: String,
        required: true,
        trim: true
    },
    dob: {
        type: String,
        required: true,
        trim: true
    },
    doa: {
        type: String,
        required: true,
        trim: true
    },
    gender: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    religion: {
        type: String,
        required: true,
        trim: true
    },
    nationality: {
        type: String,
        required: true,
        trim: true
    },
    udiseNumber: {
        type: Number,
        trim: true,

    },
    aadharNumber: {
        type: Number,
        trim: true,
    },
    samagraId: {
        type: Number,
        trim: true,
    },
    bankAccountNo: {
        type: Number,
        trim: true,
    },
    bankIfscCode: {
        type: String,
        trim: true,
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    lastSchool: {
        type: String,
        trim: true
    },
    fatherName: {
        type: String,
        required: true,
        trim: true
    },
    fatherQualification: {
        type: String,
        required: true,
        trim: true
    },
    motherName: {
        type: String,
        required: true,
        trim: true
    },
    motherQualification: {
        type: String,
        required: true,
        trim: true
    },
    parentsOccupation: {
        type: String,
        required: true,
        trim: true
    },
    parentsContact: {
        type: Number,
        trim: true
    },
    parentsAnnualIncome: {
        type: String,
        required: true,
        trim: true
    },
    discountAmountInFees: {
        type: Number,
        required: true,
        trim: true,
    },
    status: {
        type: String,
        required: true,
        trim: true,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    createdBy: {
        type: String,
        required: true,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
module.exports = StudentModel;