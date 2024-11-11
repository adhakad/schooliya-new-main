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
        const singleFeesStr = await FeesStructureModel.findOne({ adminId: adminId, class: className, stream: stream });
        if (!singleFeesStr) {
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
let GetSingleSessionFeesStructure = async (req, res, next) => {
    let adminId = req.params.id;
    let session = req.params.session;
    try {
        const singleFeesStr = await FeesStructureModel.find({ adminId: adminId, session: session });
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
    let { adminId, stream, session, admissionFees, totalFees } = req.body;
    let feesType = req.body.type.feesType;
    if (stream === "stream") {
        stream = "N/A";
    }
    console.log("a")
    let feesTypeTotal = feesType.reduce((total, obj) => {
        let value = Object.values(obj)[0];
        return total + value;
    }, 0);
    console.log("b")
    try {
        const checkClassExist = await ClassModel.findOne({ class: className });
        if (!checkClassExist) {
            return res.status(404).json('Invalid Class !');
        }
        const checkFeesStructure = await FeesStructureModel.findOne({ adminId: adminId, session: session, class: className, stream: stream });
        if (checkFeesStructure) {
            return res.status(400).json(`Fee structure already exist for session ${session} !`);
        }
        console.log("c")
        if (totalFees !== feesTypeTotal) {
            return res.status(400).json(`Total fees is not equal to all fees particulars total !`);
        }
        console.log("d")
        let feesStructureData = {
            adminId: adminId,
            class: className,
            stream: stream,
            session,
            admissionFees: admissionFees,
            totalFees: totalFees,
            feesType: feesType,
        }
        console.log("e")
        let feesStructure = await FeesStructureModel.create(feesStructureData);
        console.log("f")
        if (feesStructure) {
            console.log("g")
            let admissionFees = feesStructure.admissionFees;
            let checkStudent = await StudentModel.find({ adminId: adminId, session, class: className, stream: stream });
            console.log("h")
            if (checkStudent) {
                console.log("i")
                let studentFeesData = [];
                for (let i = 0; i < checkStudent.length; i++) {
                    let totalFees = feesStructure.totalFees - checkStudent[i].feesConcession;
                    let feesObject = {
                        adminId: adminId,
                        studentId: checkStudent[i]._id,
                        session,
                        class: className,
                        stream: stream,
                        previousSessionFeesStatus: false,
                        previousSessionClass: 0,
                        previousSessionStream: "empty",
                        admissionFeesPayable: false,
                        admissionFees: 0,
                        totalFees: totalFees,
                        paidFees: 0,
                        dueFees: totalFees,
                        AllTotalFees: totalFees,
                        AllPaidFees: 0,
                        AllDueFees: totalFees,
                        feesConcession: checkStudent[i].feesConcession,
                        allFeesConcession: checkStudent[i].feesConcession,
                    };

                    if (checkStudent.admissionType === 'New') {
                        feesObject.admissionFeesPayable = true;
                        feesObject.totalFees += admissionFees;
                        feesObject.dueFees += admissionFees;
                        feesObject.AllTotalFees += admissionFees;
                        feesObject.AllPaidFees += admissionFees;
                        feesObject.AllDueFees = feesObject.totalFees - feesObject.paidFees;
                    }

                    studentFeesData.push(feesObject);
                }
                console.log("j")
                if (checkStudent && studentFeesData.length > 0) {
                    console.log("k")
                    const checkStudentFeesData = await FeesCollectionModel.create(studentFeesData);
                    console.log("l")
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
    GetSingleSessionFeesStructure,
    GetSingleClassFeesStructureByStream,
    CreateFeesStructure,
    DeleteFeesStructure

}