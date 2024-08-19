'use strict';
const fs = require('fs');
const SchoolModel = require('../models/school');

let GetSingleSchoolNameLogo = async (req, res, next) => {
    try {
        const singleSchool = await SchoolModel.findOne({}, 'schoolName foundedYear');
        if (singleSchool) {
            return res.status(200).json(singleSchool);
        }
    } catch (error) {
        return res.status(500).json('Internal Server Error !');
    }
}
let GetSingleSchool = async (req, res, next) => {
    try {
        const singleSchool = await SchoolModel.findOne({ adminId: req.params.id });
        if (singleSchool) {
            return res.status(200).json(singleSchool);
        }
    } catch (error) {
        return res.status(500).json('Internal Server Error !');
    }
}
let CreateSchool = async (req, res, next) => {
    let { adminId, schoolName, affiliationNumber, schoolCode, foundedYear, board, medium, street, city, district, state, country, pinCode, phoneOne, phoneSecond, email } = req.body;
    const schoolData = { adminId, schoolName, schoolLogo: req.file.filename, affiliationNumber, schoolCode, foundedYear, board, medium, street, city, district, state, country, pinCode, phoneOne, phoneSecond, email };
    try {
        let countSchool = await SchoolModel.count({ adminId: adminId });
        if (countSchool > 0) {
            return res.status(400).json('School detail already exist !');
        }
        let school = await SchoolModel.findOne({ adminId: adminId, affiliationNumber: affiliationNumber, schoolCode: schoolCode });
        if (school) {
            return res.status(400).json('School detail already exist !');
        }
        const createSchool = await SchoolModel.create(schoolData);
        if (createSchool) {
            return res.status(200).json('School created successfully.');
        }
    } catch (error) {
        return res.status(500).json('Internal Server Error !');
    }
}
let UpdateSchool = async (req, res, next) => {
    try {
        const id = req.params.id;
        const schoolData = {
            title: req.body.title
        }
        const updateSchool = await SchoolModel.findByIdAndUpdate(id, { $set: schoolData }, { new: true });
        if (updateSchool) {
            return res.status(200).json('School update successfully.');
        }
    } catch (error) {
        return res.status(500).json('Internal Server Error !');
    }
}
let DeleteSchool = async (req, res, next) => {
    try {
        const id = req.params.id;
        const singleSchool = await SchoolModel.findOne({_id:id});
        const singleImage = singleSchool.schoolLogo;
        await fs.unlinkSync('./public/school-logo/'+singleImage);
        const deleteSchool = await SchoolModel.findByIdAndRemove(id);
        if (deleteSchool) {
            return res.status(200).json('School delete successfully.');
        }
    } catch (error) {
        return res.status(500).json('Internal Server Error !');
    }
}

module.exports = {
    GetSingleSchoolNameLogo,
    GetSingleSchool,
    CreateSchool,
    UpdateSchool,
    DeleteSchool,
}