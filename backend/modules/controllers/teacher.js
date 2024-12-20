'use strict';
const fs = require('fs');
const AdminPlan = require('../models/users/admin-plan');
const TeacherModel = require('../models/teacher');
const TeacherUserModel = require('../models/users/teacher-user');

let countTeacher = async (req, res, next) => {
    let adminId = req.params.adminId;
    let countTeacher = await TeacherModel.count({adminId:adminId});
    return res.status(200).json({ countTeacher });
}
let GetTeacherById = async (req, res, next) => {
    let adminId = req.params.adminId;
    let teacherUserId = req.params.teacherUserId;
    const checkTeacher = await TeacherUserModel.findOne({ _id: teacherUserId, adminId: adminId, });
    if (!checkTeacher) {
        return res.status(400).json("Invailid access !")
    }
    let teacherId = checkTeacher.teacherId;
    const teacher = await TeacherModel.findOne({ _id: teacherId, adminId: adminId, });
    if (!teacher) {
        return res.status(400).json("Invailid access !")
    }
    return res.status(200).json(teacher);
}
let GetTeacherPagination = async (req, res, next) => {
    let searchText = req.body.filters.searchText;
    let adminId = req.body.adminId;
    let searchObj = {};
    if (searchText) {
        searchObj = /^(?:\d*\.\d{1,2}|\d+)$/.test(searchText)
            ? {
                $or: [{ teacherUserId: searchText }],
            }
            : { name: new RegExp(`${searchText.toString().trim()}`, 'i') };
    }

    try {
        let limit = (req.body.limit) ? parseInt(req.body.limit) : 10;
        let page = req.body.page || 1;
        const teacherList = await TeacherModel.find({ adminId: adminId }).find(searchObj).sort({ _id: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();
        const countTeacher = await TeacherModel.count();

        let teacherData = { countTeacher: 0 };
        teacherData.teacherList = teacherList;
        teacherData.countTeacher = countTeacher;
        return res.json(teacherData);
    } catch (error) {
        return res.status(500).json('Internal Server Error !');
    }
}

let CreateTeacher = async (req, res, next) => {
    let otp = Math.floor(Math.random() * 899999 + 100000);
    const { adminId, name, teacherUserId, education } = req.body;
    try {
        const checkAdminPlan = await AdminPlan.findOne({ adminId: adminId });
        if (!checkAdminPlan) {
            return res.status(404).json(`Invalid Entry`);
        }
        let teacherLimit = checkAdminPlan.teacherLimit;
        let countTeacher = await TeacherModel.count({ adminId: adminId });
        if (countTeacher == teacherLimit || countTeacher > teacherLimit) {
            return res.status(400).json(`You have exceeded the ${countTeacher} teacher limit for your current plan. Please increase the limit or upgrade to a higher plan to continue.`);
        }
        const checkTeacher = await TeacherModel.findOne({ adminId: adminId, teacherUserId: teacherUserId });
        if (checkTeacher) {
            return res.status(400).json("Teacher user id already exist !")
        }
        const teacherData = {
            adminId: adminId,
            name: name,
            teacherUserId: teacherUserId,
            education: education,
            otp: otp,
        }
        const createTeacher = await TeacherModel.create(teacherData);
        return res.status(200).json('Teacher created successfully.');
    } catch (error) {
        return res.status(500).json('Internal Server Error !');
    }
}
let TeacherPermission = async (req, res, next) => {
    try {
        const adminId = req.params.id;
        const teacherId = req.params.teacherId;
        let { marksheetPermission, admitCardPermission, studentPermission, admissionPermission, feeCollectionPermission,promoteFailPermission,transferCertificatePermission } = req.body.type;
        const checkTeacher = await TeacherModel.findOne({ _id: teacherId, adminId: adminId });
        if (!checkTeacher) {
            return res.status(400).json("Invalid Request !")
        }
        let marksheetClass = [];
        let studentClass = [];
        let admissionClass = [];
        let admitCardClass = [];
        let feeCollectionClass = [];
        let promoteFailClass = [];
        let transferCertificateClass = [];
        if (marksheetPermission.length > 0) {
            for (let i = 0; i < marksheetPermission.length; i++) {
                let className = parseInt(Object.keys(marksheetPermission[i])[0]);
                marksheetClass.push(className);
            }
        }
        if (admissionPermission.length > 0) {
            for (let i = 0; i < admissionPermission.length; i++) {
                let className = parseInt(Object.keys(admissionPermission[i])[0]);
                admissionClass.push(className);
            }
        }
        if (studentPermission.length > 0) {
            for (let i = 0; i < studentPermission.length; i++) {
                let className = parseInt(Object.keys(studentPermission[i])[0]);
                studentClass.push(className);
            }
        }

        if (admitCardPermission) {
            for (let i = 0; i < admitCardPermission.length; i++) {
                let className = parseInt(Object.keys(admitCardPermission[i])[0]);
                admitCardClass.push(className);
            }
        }

        if (feeCollectionPermission) {
            for (let i = 0; i < feeCollectionPermission.length; i++) {
                let className = parseInt(Object.keys(feeCollectionPermission[i])[0]);
                feeCollectionClass.push(className);
            }
        }
        if (promoteFailPermission) {
            for (let i = 0; i < promoteFailPermission.length; i++) {
                let className = parseInt(Object.keys(promoteFailPermission[i])[0]);
                promoteFailClass.push(className);
            }
        }
        if (transferCertificatePermission) {
            for (let i = 0; i < transferCertificatePermission.length; i++) {
                let className = parseInt(Object.keys(transferCertificatePermission[i])[0]);
                transferCertificateClass.push(className);
            }
        }

        const teacherData = {
            marksheetPermission: {
                status: marksheetClass.length > 0 ? true : false,
                classes: marksheetClass.length > 0 ? marksheetClass : [0],
            },
            admitCardPermission: {
                status: admitCardClass.length > 0 ? true : false,
                classes: admitCardClass.length > 0 ? admitCardClass : [0],
            },
            studentPermission: {
                status: studentClass.length > 0 ? true : false,
                classes: studentClass.length > 0 ? studentClass : [0],
            },
            admissionPermission: {
                status: admissionClass.length > 0 ? true : false,
                classes: admissionClass.length > 0 ? admissionClass : [0],
            },
            feeCollectionPermission: {
                status: feeCollectionClass.length > 0 ? true : false,
                classes: feeCollectionClass.length > 0 ? feeCollectionClass : [0],
            },
            promoteFailPermission: {
                status: promoteFailClass.length > 0 ? true : false,
                classes: promoteFailClass.length > 0 ? promoteFailClass : [0],
            },
            transferCertificatePermission: {
                status: transferCertificateClass.length > 0 ? true : false,
                classes: transferCertificateClass.length > 0 ? transferCertificateClass : [0],
            },
        };

        const updateTeacher = await TeacherModel.findByIdAndUpdate(teacherId, { $set: teacherData }, { new: true });
        return res.status(200).json('Teacher permissions set successfully.');
    } catch (error) {
        return res.status(500).json('Internal Server Error !');
    }
}
let UpdateTeacher = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { adminId, name, education } = req.body;
        const teacherData = {
            adminId: adminId,
            name: name,
            education: education
        }
        const updateTeacher = await TeacherModel.findByIdAndUpdate(id, { $set: teacherData }, { new: true });
        return res.status(200).json('Teacher updated successfully.');
    } catch (error) {
        return res.status(500).json('Internal Server Error !');
    }
}
let ChangeStatus = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { statusValue } = req.body;
        let status = statusValue == 1 ? 'Active' : 'Inactive'
        const teacherData = {
            status: status
        }
        const updateStatus = await TeacherModel.findByIdAndUpdate(id, { $set: teacherData }, { new: true });
        return res.status(200).json('Teacher update successfully.');
    } catch (error) {
        return res.status(500).json('Internal Server Error !');
    }
}
let DeleteTeacher = async (req, res, next) => {
    try {
        const id = req.params.id;
        const deleteTeacher = await TeacherModel.findByIdAndRemove(id);
        const deleteTeacherUser = await TeacherUserModel.findByIdAndDelete({ _id: id })
        return res.status(200).json('Teacher delete successfully.');
    } catch (error) {
        return res.status(500).json('Internal Server Error !');
    }
}

module.exports = {
    GetTeacherById,
    countTeacher,
    GetTeacherPagination,
    CreateTeacher,
    UpdateTeacher,
    TeacherPermission,
    ChangeStatus,
    DeleteTeacher,
}