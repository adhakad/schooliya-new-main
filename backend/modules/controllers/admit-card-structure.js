'use strict';
const AdmitCardStructureModel = require('../models/admit-card-structure');
const AdmitCardModel = require("../models/admit-card");
const StudentModel = require('../models/student');

let GetSingleClassAdmitCardStructure = async (req, res, next) => {
    let adminId = req.params.id;
    let className = req.params.class;
    let stream = req.params.stream;
    if (stream === "stream") {
        stream = "N/A";
    }
    try {
        const singleAdmitCardStr = await AdmitCardStructureModel.findOne({adminId:adminId, class: className,stream:stream });
        if (!singleAdmitCardStr) {
            return res.status(404).json('Fees structure not found !');
        }
        return res.status(200).json(singleAdmitCardStr);
    } catch (error) { 
        return res.status(500).json('Internal Server Error !');
    }
}
let CreateAdmitCardStructure = async (req, res, next) => {
    let className = req.body.class;
    let { adminId, examType, stream } = req.body;
    let { examDate, startTime, endTime } = req.body.type;
    if (stream === "stream") {
        stream = "N/A";
    }

    try {
        const checkAdmitCardStrExist = await AdmitCardStructureModel.findOne({adminId:adminId, class: className, stream: stream });
        if (checkAdmitCardStrExist) {
            return res.status(400).json(`Admit card structure already exist !`);
        }
        const checkAdmitCardExist = await AdmitCardModel.findOne({adminId:adminId, class: className, stream: stream });
        if (checkAdmitCardExist) {
            return res.status(400).json(`Admit card's already exist !`);
        }
        let admitCardStructureData = {
            adminId:adminId,
            class: className,
            examType: examType,
            stream: stream,
            examDate: examDate,
            examStartTime: startTime,
            examEndTime: endTime,
        }
        const checkStudent = await StudentModel.findOne({adminId:adminId, class: className, stream: stream });
        if (!checkStudent) {
            return res.status(404).json('No student was found, please add students !')
        }
        const studentData = await StudentModel.find({adminId:adminId, class: className, stream: stream });
        let studentAdmitCardData = [];
        for (const student of studentData) {
            studentAdmitCardData.push({
                adminId:adminId,
                studentId: student._id,
                class: className,
                stream: stream,
                examType: examType,
            });
        }
        let admitCardStructure = await AdmitCardStructureModel.create(admitCardStructureData);
        let studentAdmitCard = await AdmitCardModel.create(studentAdmitCardData);
        if (admitCardStructure && studentAdmitCard) {
            return res.status(200).json('Admit card structure add successfully.');
        }

    } catch (error) {
        return res.status(500).json('Internal Server Error !');;
    }
}
let DeleteAdmitCardStructure = async (req, res, next) => {
    try {
        const id = req.params.id;
        const admitCard = await AdmitCardStructureModel.findOne({ _id: id });
        const adminId = admitCard.adminId;
        const className = admitCard.class;
        const stream = admitCard.stream;
        const examType = admitCard.examType;
        const deleteAdmitCard = await AdmitCardModel.deleteMany({adminId:adminId, class: className, stream: stream, examType: examType });
        const deleteAdmitCardStructure = await AdmitCardStructureModel.findByIdAndRemove(id);
        if (deleteAdmitCard && deleteAdmitCardStructure) {
            return res.status(200).json('Admit card structure delete successfully.');
        }
    } catch (error) {
        return res.status(500).json('Internal Server Error !');
    }
}
module.exports = {
    GetSingleClassAdmitCardStructure,
    CreateAdmitCardStructure,
    DeleteAdmitCardStructure,
}