'use strict';
const FeesStructureModel = require('../models/fees-structure');
const ClassModel = require('../models/class');
const FeesCollectionModel = require('../models/fees-collection');
const StudentModel = require('../models/student');

let GetSingleClassFeesStructureByStream = async (req, res, next) => {
    let adminId = req.params.id;
    let className = req.params.class;
    let stream = req.params.stream;
    if (stream === "stream") {
        stream = "N/A";
    }
    try {
        const singleFeesStr = await FeesStructureModel.findOne({adminId:adminId, class: className,stream:stream });
        if(!singleFeesStr){
            return res.status(404).json('Fee Structure not found !')
        }
        return res.status(200).json(singleFeesStr);
    } catch (error) {
        return res.status(500).json('Internal Server Error !');
    }
}
let GetSingleClassFeesStructure = async (req, res, next) => {
    let adminId = req.params.id;
    try {
        const singleFeesStr = await FeesStructureModel.find({ adminId: adminId });
        if (!singleFeesStr) {
            return res.status(404).json('Fee Structure not found !')
        }
        return res.status(200).json(singleFeesStr);
    } catch (error) {
        return res.status(500).json('Internal Server Error !');
    }
}

let CreateFeesStructure = async (req, res, next) => {
    let className = req.body.class;
    let { adminId, stream, admissionFees, totalFees } = req.body;
    let feesType = req.body.type.feesType;
    if (stream === "stream") {
        stream = "N/A";
    }
    let feesTypeTotal = feesType.reduce((total, obj) => {
        let value = Object.values(obj)[0];
        return total + value;
    }, 0);
    try {
        const checkClassExist = await ClassModel.findOne({ class: className });
        if (!checkClassExist) {
            return res.status(404).json('Invalid Class !');
        }
        const checkFeesStructure = await FeesStructureModel.findOne({ adminId: adminId, class: className, stream: stream });
        if (checkFeesStructure) {
            return res.status(400).json(`Fee structure already exist !`);
        }
        if (totalFees !== feesTypeTotal) {
            return res.status(400).json(`Total fees is not equal to all fees particulars total !`);
        }
        let feesStructureData = {
            adminId: adminId,
            class: className,
            stream: stream,
            admissionFees: admissionFees,
            totalFees: totalFees,
            feesType: feesType,
        }
        let feesStructure = await FeesStructureModel.create(feesStructureData);
        if (feesStructure) {
            let admissionFees = feesStructure.admissionFees;
            let checkStudent = await StudentModel.find({ adminId: adminId, class: className, stream: stream });
            
            if (checkStudent) {
                let studentFeesData = [];
                for (let i = 0; i < checkStudent.length; i++) {
                    let totalFees = feesStructure.totalFees - checkStudent[i].discountAmountInFees;
                    let feesObject = {
                        adminId:adminId,
                        studentId: checkStudent[i]._id,
                        class: className,
                        stream:stream,
                        admissionFeesPayable: false,
                        admissionFees: 0,
                        totalFees: totalFees,
                        paidFees: 0,
                        dueFees: totalFees,
                        discountAmountInFees: checkStudent[i].discountAmountInFees,
                    };

                    if (checkStudent.admissionType === 'New') {
                        feesObject.admissionFeesPayable = true;
                        feesObject.totalFees += admissionFees;
                        feesObject.dueFees += admissionFees;
                    }

                    studentFeesData.push(feesObject);
                }
                if (checkStudent && studentFeesData.length > 0) {
                    const checkStudentFeesData = await FeesCollectionModel.create(studentFeesData);
                    if (checkStudentFeesData) {
                        return res.status(200).json('Fees structure add successfully.');
                    }
                }
            }
            return res.status(200).json('Fees structure add successfully.');
        }
    } catch (error) {
        return res.status(500).json('Internal Server Error !');
    }
}

let DeleteFeesStructure = async (req, res, next) => {
    try {
        const id = req.params.id;
        const feesStructure = await FeesStructureModel.findById(id);
        if (!feesStructure) {
            return res.status(404).json('Fees structure not found!');
        }
        const adminId = feesStructure.adminId;
        const [deleteFeesRecord, deleteFeesStructure] = await Promise.all([
            FeesCollectionModel.deleteMany({ adminId: adminId }),
            FeesStructureModel.findByIdAndRemove(id),
        ]);
        if (deleteFeesRecord.deletedCount > 0 || deleteFeesStructure) {
            return res.status(200).json('Fees structure deleted successfully.');
        } else {
            return res.status(500).json('Failed to delete Fees structure.');
        }
    } catch (error) {
        return res.status(500).json('Internal Server Error!');
    }
}

module.exports = {
    GetSingleClassFeesStructure,
    GetSingleClassFeesStructureByStream,
    CreateFeesStructure,
    DeleteFeesStructure

}