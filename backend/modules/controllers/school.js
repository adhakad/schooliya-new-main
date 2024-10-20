'use strict';
const { CLOUDINARY_CLOUD_NAMAE, CLOUDINARY_CLOUD_API_KEY, CLOUDINARY_CLOUD_API_SECRET } = process.env;
const SchoolModel = require('../models/school');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const cloudinary_cloud_name = CLOUDINARY_CLOUD_NAMAE;
const cloudinary_cloud_api_key = CLOUDINARY_CLOUD_API_KEY;
const cloudinary_cloud_api_secret = CLOUDINARY_CLOUD_API_SECRET

cloudinary.config({
    cloud_name: cloudinary_cloud_name,
    api_key: cloudinary_cloud_api_key,
    api_secret: cloudinary_cloud_api_secret
})

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
    const { adminId, schoolName, affiliationNumber, schoolCode, foundedYear, board, medium, street, city, district, state, country, pinCode, phoneOne, phoneSecond, email } = req.body;

    try {
        let countSchool = await SchoolModel.count({ adminId: adminId });
        if (countSchool > 0) {
            return res.status(400).json('School detail already exists!');
        }
        const result = await cloudinary.uploader.upload(req.file.path);
        fs.unlinkSync(req.file.path);
        let schoolData = {
            adminId,
            schoolName,
            schoolLogo: result.secure_url,
            schoolLogoPublicId: result.public_id,
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
            phoneSecond,
            email
        };
        const createSchool = await SchoolModel.create(schoolData);
        if (createSchool) {
            return res.status(200).json('School created successfully.');
        }
    } catch (error) {
        return res.status(500).json('Internal Server Error!');
    }
}

let UpdateSchool = async (req, res, next) => {
    try {
        const id = req.params.id;
        let {
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
            phoneSecond,
            email
        } = req.body;
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
        if (phoneSecond && phoneSecond !== 'null' && phoneSecond.trim() !== '') {
            schoolData.phoneSecond = phoneSecond;
        } else {
            schoolData.phoneSecond = null;
        }
        const singleSchool = await SchoolModel.findById(id);
        if (!singleSchool) {
            return res.status(404).json('School not found.');
        }
        if (req.file && req.file.path) {
            if (singleSchool.schoolLogoPublicId) {
                await cloudinary.uploader.destroy(singleSchool.schoolLogoPublicId);
            }
            const result = await cloudinary.uploader.upload(req.file.path);
            fs.unlinkSync(req.file.path);
            schoolData.schoolLogo = result.secure_url;
            schoolData.schoolLogoPublicId = result.public_id;
        }
        const updateSchool = await SchoolModel.findByIdAndUpdate(id, { $set: schoolData }, { new: true });
        if (updateSchool) {
            return res.status(200).json('School updated successfully.');
        } else {
            return res.status(404).json('School not found.');
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json('Internal Server Error!');
    }
};
let DeleteSchool = async (req, res, next) => {
    try {
        const id = req.params.id;
        const singleSchool = await SchoolModel.findOne({ _id: id });
        await cloudinary.uploader.destroy(singleSchool.schoolLogoPublicId);
        const deleteSchool = await SchoolModel.findByIdAndRemove(id);
        if (deleteSchool) {
            return res.status(200).json('School deleted successfully.');
        }
    } catch (error) {
        return res.status(500).json('Internal Server Error!');
    }
}

module.exports = {
    GetSingleSchoolNameLogo,
    GetSingleSchool,
    CreateSchool,
    UpdateSchool,
    DeleteSchool,
}
