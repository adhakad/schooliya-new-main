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
        let schoolData = { adminId, schoolName, schoolLogo: req.file.filename, affiliationNumber, schoolCode, foundedYear, board, medium, street, city, district, state, country, pinCode, phoneOne, email };
        if(phoneSecond){
            schoolData.phoneSecond;
        }

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

        // Extract school details from request body
        let { adminId, schoolName, affiliationNumber, schoolCode, foundedYear, board, medium, street, city, district, state, country, pinCode, phoneOne, phoneSecond, email } = req.body;

        // Prepare the school data object
        let schoolData = {
            adminId,
            schoolName,
            affiliationNumber,
            schoolCode,
            foundedYear,
            board,
            medium,
            street,
            city,
            district,
            state,
            country,
            pinCode,
            phoneOne,
            email
        };

        // Include phoneSecond if available
        if (phoneSecond) {
            schoolData.phoneSecond = phoneSecond;
        }

        // Check if a new school logo file is uploaded and set it
        if (req.file && req.file.filename) {
            schoolData.schoolLogo = req.file.filename;
        }

        console.log(schoolData.schoolLogo)
        // Update the school information
        const updateSchool = await SchoolModel.findByIdAndUpdate(id, { $set: schoolData }, { new: true });

        // If the update was successful, send success response
        if (updateSchool) {
            return res.status(200).json('School updated successfully.');
        } else {
            return res.status(404).json('School not found.');
        }
    } catch (error) {
        console.error(error);  // Log the error for debugging
        return res.status(500).json('Internal Server Error!');
    }
};

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