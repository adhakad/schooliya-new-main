'use strict';
const StudentModel = require('../models/student');
const AdminPlan = require('../models/users/admin-plan');
const FeesStructureModel = require('../models/fees-structure');
const FeesCollectionModel = require('../models/fees-collection');
const AdmitCardModel = require('../models/admit-card');
const ExamResultModel = require('../models/exam-result');
const ClassSubjectModal = require('../models/class-subject');
const IssuedTransferCertificateModel = require('../models/issued-transfer-certificate');
const { DateTime } = require('luxon');

let countStudent = async (req, res, next) => {
    let adminId = req.params.adminId;
    let countStudent = await StudentModel.count({ adminId: adminId });
    return res.status(200).json({ countStudent });
}

let GetStudentPaginationByAdmission = async (req, res, next) => {
    let searchText = req.body.filters.searchText;
    if (searchText == 'NURSERY' || searchText == 'Nursery' || searchText == 'nursery') {
        searchText = 200;
    }
    if (searchText == 'LKG' || searchText == 'lkg' || searchText == 'Lkg') {
        searchText = 201;
    }
    if (searchText == 'UKG' || searchText == 'ukg' || searchText == 'Ukg') {
        searchText = 202;
    }
    let adminId = req.body.adminId;
    let searchObj = {};
    if (searchText) {
        searchObj = /^(?:\d*\.\d{1,2}|\d+)$/.test(searchText) ?
            {
                $or: [
                    { class: searchText },
                    { rollNumber: searchText },
                    { admissionNo: searchText }
                ]
            } :
            {
                $or: [
                    { name: new RegExp(`^${searchText.toString().trim()}`, 'i') },
                    { fatherName: new RegExp(`^${searchText.toString().trim()}`, 'i') },
                    { motherName: new RegExp(`^${searchText.toString().trim()}`, 'i') }
                ]
            }
    }

    try {
        let limit = (req.body.limit) ? parseInt(req.body.limit) : 10;
        let page = req.body.page || 1;
        const studentList = await StudentModel.find({ adminId: adminId, admissionType: 'New' }).find(searchObj).sort({ _id: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();
        const countStudent = await StudentModel.count({ adminId: adminId, admissionType: 'New' });
        let studentData = { countStudent: 0 };
        studentData.studentList = studentList;
        studentData.countStudent = countStudent;
        return res.json(studentData);
    } catch (error) {
        return res.status(500).json('Internal Server Error!');
    }
}
let GetStudentPaginationByAdmissionAndClass = async (req, res, next) => {

    let searchText = req.body.filters.searchText;
    if (searchText == 'NURSERY' || searchText == 'Nursery' || searchText == 'nursery') {
        searchText = 200;
    }
    if (searchText == 'LKG' || searchText == 'lkg' || searchText == 'Lkg') {
        searchText = 201;
    }
    if (searchText == 'UKG' || searchText == 'ukg' || searchText == 'Ukg') {
        searchText = 202;
    }
    let className = req.body.class;
    let searchObj = {};
    if (searchText) {
        searchObj = /^(?:\d*\.\d{1,2}|\d+)$/.test(searchText) ?
            {
                $or: [
                    { class: searchText },
                    { rollNumber: searchText },
                    { admissionNo: searchText }
                ]
            } :
            {
                $or: [
                    { name: new RegExp(`^${searchText.toString().trim()}`, 'i') },
                    { fatherName: new RegExp(`^${searchText.toString().trim()}`, 'i') },
                    { motherName: new RegExp(`^${searchText.toString().trim()}`, 'i') }
                ]
            }
    }
    try {
        let limit = (req.body.limit) ? parseInt(req.body.limit) : 10;
        let page = req.body.page || 1;
        const studentList = await StudentModel.find({ admissionType: 'New' }).find({ class: className }).find(searchObj).sort({ _id: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();
        const countStudent = await StudentModel.count({ admissionType: 'New' }).find({ class: className });
        let studentData = { countStudent: 0 };
        studentData.studentList = studentList;
        studentData.countStudent = countStudent;
        return res.json(studentData);
    } catch (error) {
        return res.status(500).json('Internal Server Error!');
    }
}

// let GetStudentAdmissionEnquiryPagination = async (req, res, next) => {
//     let searchText = req.body.filters.searchText;
//     let searchObj = {};
//     if (searchText) {
//         searchObj = /^(?:\d*\.\d{1,2}|\d+)$/.test(searchText)
//             ? {
//                 $or: [{ contact: searchText }],
//             }
//             : { name: new RegExp(`${searchText.toString().trim()}`, 'i') };
//     }
//     try {
//         let limit = (req.body.limit) ? parseInt(req.body.limit) : 10;
//         let page = req.body.page || 1;
//         const admissionEnquiryList = await AdmissionEnquiryModel.find(searchObj).sort({ _id: -1 })
//             .limit(limit * 1)
//             .skip((page - 1) * limit)
//             .exec();
//         const countAdmissionEnquiry = await AdmissionEnquiryModel.count();
//         let admissionEnquiryData = { countAdmissionEnquiry: 0 };
//         admissionEnquiryData.admissionEnquiryList = admissionEnquiryList;
//         admissionEnquiryData.countAdmissionEnquiry = countAdmissionEnquiry;
//         return res.json(admissionEnquiryData);
//     } catch (error) {
//         return res.status(500).json('Internal Server Error!');
//     }
// }

let GetStudentPaginationByClass = async (req, res, next) => {
    const currentDateIst = DateTime.now().setZone('Asia/Kolkata');
    let isDate = currentDateIst.toFormat('dd-MM-yyyy');
    let searchText = req.body.filters.searchText;
    if (searchText == 'NURSERY' || searchText == 'Nursery' || searchText == 'nursery') {
        searchText = 200;
    }
    if (searchText == 'LKG' || searchText == 'lkg' || searchText == 'Lkg') {
        searchText = 201;
    }
    if (searchText == 'UKG' || searchText == 'ukg' || searchText == 'Ukg') {
        searchText = 202;
    }
    let className = req.body.class;
    let adminId = req.body.adminId;
    let stream = req.body.stream;
    if (stream == "stream") {
        stream = "N/A";
    }
    let searchObj = {};
    if (searchText) {
        searchObj = /^(?:\d*\.\d{1,2}|\d+)$/.test(searchText) ?
            {
                $or: [
                    { class: searchText },
                    { rollNumber: searchText },
                    { admissionNo: searchText }
                ]
            } :
            {
                $or: [
                    { name: new RegExp(`^${searchText.toString().trim()}`, 'i') },
                    { fatherName: new RegExp(`^${searchText.toString().trim()}`, 'i') },
                    { motherName: new RegExp(`^${searchText.toString().trim()}`, 'i') }
                ]
            }
    }
    try {
        let serialNo = 0;
        let lastIssuedTransferCertificate = await IssuedTransferCertificateModel.findOne({}).sort({ _id: -1 });
        if (!lastIssuedTransferCertificate) {
            serialNo = 1 + serialNo;
        }
        if (lastIssuedTransferCertificate) {
            serialNo = lastIssuedTransferCertificate.serialNo + 1;
        }
        let limit = (req.body.limit) ? parseInt(req.body.limit) : 10;
        let page = req.body.page || 1;
        const isStudent = await StudentModel.findOne({ adminId: adminId, class: className, stream: stream });
        if (!isStudent) {
            return res.status(404).json(`Student not found!`);
        }
        const studentList = await StudentModel.find({ adminId: adminId, class: className, stream: stream }).find(searchObj).sort({ _id: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();
        const countStudent = await StudentModel.count({ adminId: adminId, class: className, stream: stream });
        let studentData = { countStudent: 0 };
        studentData.studentList = studentList;
        studentData.countStudent = countStudent;
        studentData.serialNo = serialNo;
        studentData.isDate = isDate;
        return res.json(studentData);
    } catch (error) {
        return res.status(500).json('Internal Server Error!');
    }
}

let GetAllStudentByClass = async (req, res, next) => {
    let stream = req.params.stream;
    if (stream == "stream") {
        stream = "N/A";
    }
    try {
        let singleStudent = await StudentModel.find({ adminId: req.params.id, class: req.params.class, stream: stream }, '-status -__v').sort({ _id: -1 });
        return res.status(200).json(singleStudent);
    } catch (error) {
        return res.status(500).json('Internal Server Error!');
    }
}

let GetSingleStudent = async (req, res, next) => {
    try {
        const singleStudent = await StudentModel.findOne({ _id: req.params.id });
        return res.status(200).json(singleStudent);
    } catch (error) {
        return res.status(500).json('Internal Server Error!');
    }
}

let CreateStudent = async (req, res, next) => {
    let receiptNo = Math.floor(Math.random() * 899999 + 100000);
    const currentDateIst = DateTime.now().setZone('Asia/Kolkata');
    const istDateTimeString = currentDateIst.toFormat('dd-MM-yyyy hh:mm:ss a');
    let { session, medium, adminId, name, rollNumber, admissionClass, aadharNumber, udiseNumber, samagraId, admissionFees, admissionType, stream, admissionNo, dob, doa, gender, category, religion, nationality, bankAccountNo, bankIfscCode, address, lastSchool, fatherName, fatherQualification, fatherOccupation, motherOccupation, parentsContact, familyAnnualIncome, motherName, motherQualification, feesConcession, createdBy } = req.body;
    let className = req.body.class;
    if (stream === "stream") {
        stream = "N/A";
    }
    if (admissionType == 'New') {
        doa = currentDateIst.toFormat('dd-MM-yyyy');
        admissionClass = className;
    } else {
        const parsedDate = DateTime.fromFormat(doa, 'dd-MM-yyyy');
        if (!parsedDate.isValid) {
            doa = DateTime.fromISO(doa).toFormat("dd-MM-yyyy");
        }
    }
    const parsedDate = DateTime.fromFormat(dob, 'dd-MM-yyyy');
    if (!parsedDate.isValid) {
        dob = DateTime.fromISO(dob).toFormat("dd-MM-yyyy");
    }
    let studentData = {
        session, medium, adminId, name, rollNumber, admissionType, stream, admissionNo, class: className, admissionClass, dob: dob, doa: doa, gender, category, religion, nationality, bankAccountNo, bankIfscCode, address, lastSchool, fatherName, fatherQualification, fatherOccupation, motherOccupation, parentsContact, familyAnnualIncome, motherName, motherQualification, feesConcession, createdBy
    }
    try {
        const checkAdminPlan = await AdminPlan.findOne({ adminId: adminId });
        if (!checkAdminPlan) {
            return res.status(404).json(`Invalid entry!`);
        }
        let studentLimit = checkAdminPlan.studentLimit;
        let countStudent = await StudentModel.count({ adminId: adminId });
        if (countStudent == studentLimit || countStudent > studentLimit) {
            return res.status(400).json(`You have exceeded the ${countStudent} student limit for your current plan. Please increase the limit or upgrade to a higher plan to continue!`);
        }
        const checkFeesStr = await FeesStructureModel.findOne({ adminId: adminId, session: session, class: className, stream: stream });
        if (!checkFeesStr) {
            return res.status(404).json(`Please create fees structure for session ${session}!`);
        }
        const checkClassSubject = await ClassSubjectModal.findOne({ adminId: adminId, class: className, stream: stream });
        if (!checkClassSubject) {
            return res.status(404).json(`Please group subjects according to class and stream!`);
        }
        if (aadharNumber!== null && aadharNumber!== undefined) {
            const checkAadharNumber = await StudentModel.findOne({ aadharNumber: aadharNumber });
            if (checkAadharNumber) {
                return res.status(400).json(`Aadhar card number already exist!`);
            }
            studentData.aadharNumber = aadharNumber;
        }

        if (samagraId!== null && samagraId!== undefined) {
            const checkSamagraId = await StudentModel.findOne({ samagraId: samagraId });
            if (checkSamagraId) {
                return res.status(400).json(`Samagra id already exist!`);
            }
            studentData.samagraId = samagraId;
            studentData.extraField = [{samagraId: samagraId}]
        }
        if (udiseNumber!== null && udiseNumber!== undefined) {
            const checkUdiseNumber = await StudentModel.findOne({ udiseNumber: udiseNumber });
            if (checkUdiseNumber) {
                return res.status(400).json(`UDISE Number already exist!`);
            }
        }

        const checkAdmissionNo = await StudentModel.findOne({ adminId: adminId, admissionNo: admissionNo });
        if (checkAdmissionNo) {
            return res.status(400).json(`Admission no already exist!`);
        }

        const checkRollNumber = await StudentModel.findOne({ adminId: adminId, rollNumber: rollNumber, class: className });
        if (checkRollNumber) {
            return res.status(400).json(`Roll number already exist for this class!`);
        }
        if (feesConcession > checkFeesStr.totalFees) {
            return res.status(400).json(`Concession cannot be greater than the total academic session fee!`);
        }
        let totalFees = checkFeesStr.totalFees - feesConcession;
        const admissionFee = checkFeesStr.admissionFees;
        let admissionFeesPayable = false;
        let paidFees = 0;
        let dueFees = totalFees - paidFees;
        if (admissionType == 'New') {
            admissionFeesPayable = true;
            admissionFees = admissionFees;
            totalFees = totalFees + admissionFees;
            paidFees = admissionFees;
            dueFees = totalFees - admissionFees;
        }
        let studentFeesData = {
            adminId: adminId,
            session: session,
            currentSession:session,
            previousSessionFeesStatus: false,
            previousSessionClass: 0,
            previousSessionStream: "empty",
            class: parseInt(className),
            stream: stream,
            admissionFees: admissionFees ? admissionFees : 0,
            admissionFeesPayable: admissionFeesPayable,
            feesConcession: feesConcession,
            allFeesConcession: feesConcession,
            totalFees: totalFees,
            paidFees: paidFees,
            dueFees: dueFees,
            AllTotalFees: totalFees,
            AllPaidFees: paidFees,
            AllDueFees: dueFees,
        }
        if (admissionType == 'New') {
            studentFeesData.admissionFeesReceiptNo = receiptNo;
            studentFeesData.admissionFeesPaymentDate = istDateTimeString;
        }
        let createStudent = await StudentModel.create(studentData);
        if (createStudent) {
            let studentId = createStudent._id;
            studentFeesData.studentId = studentId;
            let createStudentFeesData = await FeesCollectionModel.create(studentFeesData);
            if (createStudentFeesData) {
                let studentAdmissionData = {
                    adminId: adminId,
                    session: session,
                    name: createStudent.name,
                    class: createStudent.class,
                    stream: stream,
                    admissionNo: createStudent.admissionNo,
                    rollNumber: createStudent.rollNumber,
                    dob: createStudent.dob,
                    fatherName: createStudent.fatherName,
                    motherName: createStudent.motherName,
                    admissionType: admissionType,
                    admissionFees: createStudentFeesData.admissionFees,
                    admissionFeesReceiptNo: createStudentFeesData.admissionFeesReceiptNo,
                    admissionFeesPaymentDate: createStudentFeesData.admissionFeesPaymentDate,
                    totalFees: createStudentFeesData.totalFees,
                    paidFees: createStudentFeesData.paidFees,
                    dueFees: createStudentFeesData.dueFees
                }
                return res.status(200).json('Student created successfully.');
            }
        }
    } catch (error) {
        return res.status(500).json('Internal Server Error!');
    }
}

// let CreateStudentAdmissionEnquiry = async (req, res, next) => {
//     const currentDateIst = DateTime.now().setZone('Asia/Kolkata');
//     const doae = currentDateIst.toFormat('dd-MM-yyyy');
//     let { name, session, stream, dob, gender, category, religion, nationality, contact, address, lastSchool, fatherName, fatherQualification, fatherOccupation, fatherContact, fatherAnnualIncome, motherName, motherQualification, motherOccupation, motherContact, motherAnnualIncome } = req.body;
//     let className = req.body.class;
//     if (stream === "stream") {
//         stream = "N/A";
//     }
//     dob = DateTime.fromISO(dob).toFormat("dd-MM-yyyy");
//     const studentData = {
//         name, session, stream, class: className, dob: dob, doae: doae, gender, category, religion, nationality, contact, address, lastSchool, fatherName, fatherQualification, fatherOccupation, fatherContact, fatherAnnualIncome, motherName, motherQualification, motherOccupation, motherContact, motherAnnualIncome
//     }
//     try {
//         const checkContact = await AdmissionEnquiryModel.findOne({ name: name, contact: contact });
//         if (checkContact) {
//             return res.status(400).json(`Name: ${name} phone ${contact} is already fill online admission form, please visit school and confirm your admission!`);
//         }
//         let createAdmissionEnquiryModel = await AdmissionEnquiryModel.create(studentData);
//         if (createAdmissionEnquiryModel) {
//             return res.status(200).json({ successMsg: 'Online admission form submited successfully.' });
//         }
//     } catch (error) {
//         return res.status(500).json('Internal Server Error!');
//     }
// }

let CreateBulkStudentRecord = async (req, res, next) => {
    const currentDateIst = DateTime.now().setZone('Asia/Kolkata');
    const istDateTimeString = currentDateIst.toFormat('dd-MM-yyyy hh:mm:ss a');
    let bulkStudentRecord = req.body.bulkStudentRecord;
    let selectedSession = req.body.session;
    let className = req.body.class;
    let stream = req.body.stream;
    let adminId = req.body.adminId;
    let createdBy = req.body.createdBy;
    className = parseInt(className);
    if (stream === "stream") {
        stream = "N/A";
    }
    const classMappings = {
        "Nursery": 200,
        "LKG": 201,
        "UKG": 202,
        "1st": 1,
        "2nd": 2,
        "3rd": 3,
        "4th": 4,
        "5th": 5,
        "6th": 6,
        "7th": 7,
        "8th": 8,
        "9th": 9,
        "10th": 10,
        "11th": 11,
        "12th": 12,
    };
    bulkStudentRecord.forEach((student) => {
        // student.class = parseInt(classMappings[student.class] || "Unknown");
        student.admissionClass = parseInt(classMappings[student.admissionClass]);
    });
    let studentData = [];
    for (const student of bulkStudentRecord) {
        studentData.push({
            session: selectedSession,
            medium: student.medium,
            adminId: adminId,
            name: student.name,
            rollNumber: student.rollNumber,
            feesConcession: student.feesConcession,
            udiseNumber: student.udiseNumber,
            aadharNumber: student.aadharNumber,
            samagraId: student.samagraId,
            extraField : [{samagraId: student.samagraId}],
            admissionNo: student.admissionNo,
            admissionType: student.admissionType,
            stream: stream,
            class: className,
            admissionClass: student.admissionClass,
            dob: student.dob,
            doa: student.doa,
            gender: student.gender,
            category: student.category,
            religion: student.religion,
            nationality: student.nationality,
            bankAccountNo: student.bankAccountNo,
            bankIfscCode: student.bankIfscCode,
            address: student.address,
            fatherName: student.fatherName,
            fatherQualification: student.fatherQualification,
            motherName: student.motherName,
            motherQualification: student.motherQualification,
            fatherOccupation: student.fatherOccupation,
            motherOccupation: student.motherOccupation,
            parentsContact: student.parentsContact,
            familyAnnualIncome: student.familyAnnualIncome,
            createdBy: createdBy,
        });
    }
    const session = await StudentModel.startSession();
    session.startTransaction();
    try {
        const checkAdminPlan = await AdminPlan.findOne({ adminId: adminId });
        if (!checkAdminPlan) {
            return res.status(404).json(`Invalid entry!`);
        }
        let studentLimit = checkAdminPlan.studentLimit;
        let countStudent = await StudentModel.count({ adminId: adminId });
        let allStudentCount = studentData.length + countStudent;
        if (countStudent == studentLimit || countStudent > studentLimit || allStudentCount > studentLimit) {
            return res.status(400).json(`You have exceeded the ${countStudent} student limit for your current plan. Please increase the limit or upgrade to a higher plan to continue!`);
        }
        if (studentData.length > 100) {
            return res.status(400).json('File too large, Please make sure that file records to less then or equals to 100!');
        }
        const checkFeesStr = await FeesStructureModel.findOne({ adminId: adminId, session: studentData[0].session, class: className, stream: stream });
        if (!checkFeesStr) {
            return res.status(404).json(`Please create fees structure!`);
        }
        const otherClassAdmissionNo = [];
        // for (const student of studentData) {
        //     if (student.class!== className) {
        //         const { admissionNo } = student;
        //         if (admissionNo) {
        //             otherClassAdmissionNo.push(admissionNo);
        //         }
        //         continue;
        //     }
        // }
        // if (otherClassAdmissionNo.length > 0) {
        //     const spreadAdmissionNo = otherClassAdmissionNo.join(', ');
        //     return res.status(400).json(`Admission number(s) ${spreadAdmissionNo} student(s) class is invailid!`);
        // }
        const existRecords = await StudentModel.find({ adminId: adminId }).lean();
        const duplicateAadharNumber = [];
        const duplicateSamagraId = [];
        const duplicateAdmissionNo = [];
        for (const student of studentData) {
            const { admissionNo, aadharNumber, samagraId } = student;
            let aadharNumberExists;
            if (aadharNumber!== null && aadharNumber!== undefined) {
                aadharNumberExists = existRecords.some(record => record.aadharNumber == aadharNumber);
            }
            let samagraIdExists;
            if (samagraId!== null && samagraId!== undefined) {
                samagraIdExists = existRecords.some(record => record.samagraId == samagraId);
            }
            let admissionNoExists;
            if (admissionNo!== null && admissionNo!== undefined) {
                admissionNoExists = existRecords.some(record => record.admissionNo == admissionNo);
            }

            if (aadharNumberExists) {
                duplicateAadharNumber.push(aadharNumber);
            }
            if (samagraIdExists) {
                duplicateSamagraId.push(samagraId);
            }
            if (admissionNoExists) {
                duplicateAdmissionNo.push(admissionNo);
            }
        }
        if (duplicateAadharNumber.length > 0) {
            const spreadAadharNumber = duplicateAadharNumber.join(', ');
            return res.status(400).json(`Aadhar card number(s) ${spreadAadharNumber} already exist!`);
        }
        if (duplicateSamagraId.length > 0) {
            const spreadSamagraId = duplicateSamagraId.join(', ');
            return res.status(400).json(`Samagra id number(s) ${spreadSamagraId} already exist!`);
        }
        if (duplicateAdmissionNo.length > 0) {
            const spreadAdmissionNo = duplicateAdmissionNo.join(', ');
            return res.status(400).json(`Admission number(s) ${spreadAdmissionNo} already exist!`);
        }

        // Helper function to convert string to Title Case
        function toTitleCase(str) {
            return str.replace(/\w\S*/g, (txt) => {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            });
        }

        const existingRecords = await StudentModel.find({ adminId: adminId, class: className }).lean();
        let index = 3;

        for (const student of studentData) {
            const {
                medium,
                name,
                fatherName,
                motherName,
                fatherQualification,
                motherQualification,
                fatherOccupation,
                motherOccupation,
                familyAnnualIncome,
                rollNumber,
                admissionNo,
                feesConcession,
                admissionType,
                admissionClass,
                dob,
                doa,
                gender,
                category,
                religion,
                nationality,
                address
            } = student;

            // Track missing fields
            const missingFields = [];

            if (medium === null || medium === undefined) missingFields.push('medium');
            if (name === null || name === undefined) missingFields.push('name');
            if (fatherName === null || fatherName === undefined) missingFields.push('fatherName');
            if (motherName === null || motherName === undefined) missingFields.push('motherName');
            if (fatherQualification === null || fatherQualification === undefined) missingFields.push('fatherQualification');
            if (motherQualification === null || motherQualification === undefined) missingFields.push('motherQualification');
            if (fatherOccupation === null || fatherOccupation === undefined) missingFields.push('fatherOccupation');
            if (motherOccupation === null || motherOccupation === undefined) missingFields.push('motherOccupation');
            if (familyAnnualIncome === null || familyAnnualIncome === undefined) missingFields.push('familyAnnualIncome');
            if (rollNumber === null || rollNumber === undefined) missingFields.push('rollNumber');
            if (admissionNo === null || admissionNo === undefined) missingFields.push('admissionNo');
            if (feesConcession === null || feesConcession === undefined) missingFields.push('feesConcession');
            if (admissionType === null || admissionType === undefined) missingFields.push('admissionType');
            if (admissionClass === null || admissionClass === undefined || isNaN(admissionClass)) missingFields.push('admissionClass');
            if (dob === null || dob === undefined) missingFields.push('dob');
            if (doa === null || doa === undefined) missingFields.push('doa');
            if (gender === null || gender === undefined) missingFields.push('gender');
            if (category === null || category === undefined) missingFields.push('category');
            if (religion === null || religion === undefined) missingFields.push('religion');
            if (nationality === null || nationality === undefined) missingFields.push('nationality');
            if (address === null || address === undefined) missingFields.push('address');

            // If there are missing fields, return error for current row
            if (missingFields.length > 0) {
                const formattedMissingFields = missingFields.map(toTitleCase); // Convert to Title Case
                return res.status(400).json(`Row ${index} is missing required fields: ( ${formattedMissingFields.join(', ')} ). Please fill in all mandatory fields before continuing!`);
            }
            if (feesConcession > checkFeesStr.totalFees) {
                return res.status(400).json(`Row ${index} shows a fee concession amount greater than the total academic fee!`);
            }

            const rollNumberExists = existingRecords.some(record => record.rollNumber == rollNumber);
            if (rollNumberExists) {
                return res.status(400).json(`Row ${index} has a roll number (${rollNumber}) that already exists. Please fix it before continuing!`);
            }

            index++;
        }


        const createStudent = await StudentModel.create(studentData, { session });
        let admissionFees = checkFeesStr.admissionFees;
        let studentFeesData = [];
        let totalFeesInStr = checkFeesStr.totalFees;
        for (let i = 0; i < createStudent.length; i++) {
            let totalFees = 0;
            let student = createStudent[i];
            totalFees = totalFeesInStr - student.feesConcession;
            let feesObject = {
                adminId: adminId,
                studentId: student._id,
                class: className,
                stream: stream,
                session: studentData[0].session,
                currentSession:studentData[0].session,
                previousSessionFeesStatus: false,
                previousSessionClass: 0,
                previousSessionStream: "empty",
                admissionFeesPayable: false,
                admissionFees: 0,
                totalFees: totalFees,
                feesConcession: student.feesConcession,
                allFeesConcession: student.feesConcession,
                paidFees: 0,
                dueFees: totalFees,
                AllTotalFees: totalFees,
                AllPaidFees: 0,
                AllDueFees: totalFees,
            };
            if (student.admissionType === 'New') {
                feesObject.admissionFeesPayable = true;
                feesObject.admissionFees += admissionFees;
                feesObject.totalFees += admissionFees;
                feesObject.paidFees += admissionFees;
                feesObject.dueFees = feesObject.totalFees - feesObject.paidFees;
                feesObject.AllTotalFees += admissionFees;
                feesObject.AllPaidFees += admissionFees;
                feesObject.AllDueFees = feesObject.totalFees - feesObject.paidFees;
                feesObject.admissionFeesPaymentDate = istDateTimeString;
            }

            studentFeesData.push(feesObject);
        }
        if (createStudent && studentFeesData.length > 0) {
            const createStudentFeesData = await FeesCollectionModel.create(studentFeesData, { session });

            if (createStudentFeesData) {
                await session.commitTransaction();
                session.endSession();
                return res.status(200).json('Student created successfully.');
            }
        }
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json('Error creating student and fees data!');
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json('Internal Server Error!');
    }
}

let UpdateStudent = async (req, res, next) => {
    try {
        const id = req.params.id;
        let { session, medium, adminId, name, rollNumber, admissionClass, aadharNumber, udiseNumber, samagraId, admissionFees, admissionType, stream, admissionNo, dob, doa, gender, category, religion, nationality, bankAccountNo, bankIfscCode, address, lastSchool, fatherName, fatherQualification, fatherOccupation, motherOccupation, parentsContact, familyAnnualIncome, motherName, motherQualification, feesConcession } = req.body;
        const studentData = {
            session, medium, adminId, name, rollNumber, admissionClass, aadharNumber, udiseNumber, samagraId,extraField :[{samagraId: samagraId}], admissionFees, admissionType, stream, admissionNo, dob, doa, gender, category, religion, nationality, bankAccountNo, bankIfscCode, address, lastSchool, fatherName, fatherQualification, fatherOccupation, motherOccupation, parentsContact, familyAnnualIncome, motherName, motherQualification, feesConcession
        }
        const updateStudent = await StudentModel.findByIdAndUpdate(id, { $set: studentData }, { new: true });
        return res.status(200).json('Student updated successfully.');
    } catch (error) {
        return res.status(500).json('Internal Server Error!');
    }
}

let StudentClassPromote = async (req, res, next) => {
    try {
        const studentId = req.params.id;
        let { adminId, session, rollNumber, stream, feesConcession } = req.body;
        if (stream == "stream") {
            stream = "N/A";
        }
        let className = parseInt(req.body.class);
        let checkStudent = await StudentModel.findOne({ _id: studentId });
        if (!checkStudent) {
            return res.status(404).json({ errorMsg: 'Student not found!' });
        }
        let cls = checkStudent.class;
        if (className == cls && className === 12) {
            return res.status(400).json({ errorMsg: `In this school, students cannot be promoted after the ${className}th class!` });
        }
        if (className === 10 && stream == "N/A" || className === 11 && stream == "N/A") {
            return res.status(400).json({ errorMsg: `Invalid stream for this class!` });
        }

        let isSession = checkStudent.session;
        if (session == isSession) {
            return res.status(400).json({ errorMsg: `The student is currently in the ${isSession} session, please choose the academic session for the next year!` });
        }
        if (className == cls && className === 202) {
            className = 1;
        } else {
            className = className + 1;
        }
        const checkFeesStr = await FeesStructureModel.findOne({ adminId: adminId, session: session, class: className, stream: stream });
        if (!checkFeesStr) {
            return res.status(404).json({ errorMsg: `Please create the fee structure for next class for session ${session}!` });
        }
        if (feesConcession > checkFeesStr.totalFees) {
            return res.status(400).json({ errorMsg: `Concession cannot be greater than the total academic session fee!` });
        }
        const studentData = { session: session, rollNumber, class: className, stream, admissionType: 'Old', feesConcession: feesConcession };
        const updateStudent = await StudentModel.findByIdAndUpdate(studentId, { $set: studentData }, { new: true });

        if (updateStudent) {
            await Promise.all([
                AdmitCardModel.findOneAndDelete({ studentId: studentId }),
                ExamResultModel.findOneAndDelete({ studentId: studentId }),
                // FeesCollectionModel.findOneAndDelete({ studentId: studentId }),
            ]);
            let checkFeesStrTotalFees = checkFeesStr.totalFees
            const totalFees = checkFeesStrTotalFees - feesConcession;
            const checkFeesCollection = await FeesCollectionModel.findOne({ adminId: adminId, studentId: studentId });
            if (!checkFeesCollection) {
                return res.status(404).json({ errorMsg: `This student previous session fees record not found!` });
            }
            if (checkFeesCollection) {
                let previousSessionTotalFees = checkFeesCollection.totalFees;
                let previousSessionPaidFees = checkFeesCollection.paidFees;
                let previousSessionDueFees = checkFeesCollection.dueFees;
                if (previousSessionDueFees == 0 && previousSessionTotalFees == previousSessionPaidFees) {
                    const studentFeesData = {
                        adminId: adminId,
                        studentId: studentId,
                        session: session,
                        currentSession:session,
                        previousSessionFeesStatus: false,
                        previousSessionClass: 0,
                        previousSessionStream: "empty",
                        class: className,
                        stream: stream,
                        admissionFees: 0,
                        admissionFeesPayable: false,
                        totalFees: totalFees,
                        paidFees: 0,
                        dueFees: totalFees,
                        AllTotalFees: totalFees,
                        AllPaidFees: 0,
                        AllDueFees: totalFees,
                        feesConcession: feesConcession,
                        allFeesConcession: feesConcession,
                    };
                    let deleteFeesCollection = await FeesCollectionModel.findOneAndDelete({ studentId: studentId });
                    let createStudentFeesData = await FeesCollectionModel.create(studentFeesData);
                    if (createStudentFeesData && deleteFeesCollection) {
                        return res.status(200).json({ successMsg: `The student has successfully been promoted to the class.`, className: className });
                    }

                }
                const previousSessionClass = checkFeesCollection.class;
                const previousSessionStream = checkFeesCollection.stream;
                const id = checkFeesCollection._id;
                const previousSession = checkFeesCollection.session;
                const previousFeesConcession = checkFeesCollection.feesConcession;
                const studentFeesData = {
                    adminId: adminId,
                    studentId,
                    session: session,
                    currentSession:session,
                    previousSessionFeesStatus: true,
                    previousSessionClass: 0,
                    previousSessionStream: "empty",
                    class: className,
                    stream: stream,
                    admissionFees: 0,
                    admissionFeesPayable: false,
                    totalFees: totalFees,
                    paidFees: 0,
                    dueFees: totalFees,
                    AllTotalFees: totalFees + previousSessionTotalFees,
                    AllPaidFees: previousSessionPaidFees,
                    AllDueFees: totalFees + previousSessionDueFees,
                    feesConcession: feesConcession,
                    allFeesConcession: feesConcession + previousFeesConcession,
                };
                const updatedDocument = await FeesCollectionModel.findOneAndUpdate(
                    {
                        _id: id,
                        session: previousSession,
                    },
                    {
                        $set: {
                            currentSession:session,
                            previousSessionClass: previousSessionClass,
                            previousSessionStream: previousSessionStream,
                            class: className,
                            stream: stream,
                            AllTotalFees: totalFees + previousSessionTotalFees,
                            AllPaidFees: previousSessionPaidFees,
                            AllDueFees: totalFees + previousSessionDueFees,
                            allFeesConcession: feesConcession + previousFeesConcession,

                        }
                    },
                    {
                        new: true // Return the updated document
                    });
                let createStudentFeesData = await FeesCollectionModel.create(studentFeesData);
                if (createStudentFeesData) {
                    return res.status(200).json({ successMsg: `The student has successfully been promoted to the class.`, className: className });
                }
            }

        }
    } catch (error) {
        return res.status(500).json({ errorMsg: 'Internal Server Error!' });
    }
}









let StudentClassFail = async (req, res, next) => {
    try {
        const studentId = req.params.id;
        let { adminId, session, rollNumber, stream, feesConcession } = req.body;
        if (stream == "stream") {
            stream = "N/A";
        }
        let className = parseInt(req.body.class);
        let checkStudent = await StudentModel.findOne({ _id: studentId });
        if (!checkStudent) {
            return res.status(404).json({ errorMsg: 'Student not found!' });
        }
        let cls = checkStudent.class;
        // if (className == cls && className === 12) {
        //     return res.status(400).json({ errorMsg: `In this school, students cannot be promoted after the ${className}th class` });
        // }
        // if (className === 10 && stream == "N/A" || className === 11 && stream == "N/A") {
        //     return res.status(400).json({ errorMsg: `Invalid stream for this class!` });
        // }

        let isSession = checkStudent.session;
        if (session == isSession) {
            return res.status(400).json({ errorMsg: `The student is currently in the ${isSession} session, please choose the academic session for the next year!` });
        }
        // if (className == cls && className === 202) {
        //     className = 1;
        // } else {
        //     className = className + 1;
        // }
        const checkFeesStr = await FeesStructureModel.findOne({ adminId: adminId, session: session, class: className, stream: stream });
        if (!checkFeesStr) {
            return res.status(404).json({ errorMsg: `Please create the fee structure for this class for session ${session}!` });
        }
        if (feesConcession > checkFeesStr.totalFees) {
            return res.status(400).json({ errorMsg: `Concession cannot be greater than the total academic session fee!` });
        }
        const studentData = { session: session, rollNumber, class: className, stream, admissionType: 'Old', feesConcession: feesConcession };
        const updateStudent = await StudentModel.findByIdAndUpdate(studentId, { $set: studentData }, { new: true });

        if (updateStudent) {
            await Promise.all([
                AdmitCardModel.findOneAndDelete({ studentId: studentId }),
                ExamResultModel.findOneAndDelete({ studentId: studentId }),
                // FeesCollectionModel.findOneAndDelete({ studentId: studentId }),
            ]);
            let checkFeesStrTotalFees = checkFeesStr.totalFees
            const totalFees = checkFeesStrTotalFees - feesConcession;
            const checkFeesCollection = await FeesCollectionModel.findOne({ adminId: adminId, studentId: studentId });
            if (!checkFeesCollection) {
                return res.status(404).json({ errorMsg: `This student previous session fees record not found!` });
            }
            if (checkFeesCollection) {
                let previousSessionTotalFees = checkFeesCollection.totalFees;
                let previousSessionPaidFees = checkFeesCollection.paidFees;
                let previousSessionDueFees = checkFeesCollection.dueFees;
                if (previousSessionDueFees == 0 && previousSessionTotalFees == previousSessionPaidFees) {
                    const studentFeesData = {
                        adminId: adminId,
                        studentId: studentId,
                        session: session,
                        currentSession:session,
                        previousSessionFeesStatus: false,
                        previousSessionClass: 0,
                        previousSessionStream: "empty",
                        class: className,
                        stream: stream,
                        admissionFees: 0,
                        admissionFeesPayable: false,
                        totalFees: totalFees,
                        paidFees: 0,
                        dueFees: totalFees,
                        AllTotalFees: totalFees,
                        AllPaidFees: 0,
                        AllDueFees: totalFees,
                        feesConcession: feesConcession,
                        allFeesConcession: feesConcession,
                    };
                    let deleteFeesCollection = await FeesCollectionModel.findOneAndDelete({ studentId: studentId });
                    let createStudentFeesData = await FeesCollectionModel.create(studentFeesData);
                    if (createStudentFeesData && deleteFeesCollection) {
                        return res.status(200).json({ successMsg: `The student has successfully been promoted to the class.`, className: className });
                    }

                }
                const previousSessionClass = checkFeesCollection.class;
                const previousSessionStream = checkFeesCollection.stream;
                const id = checkFeesCollection._id;
                const previousSession = checkFeesCollection.session;
                const previousFeesConcession = checkFeesCollection.feesConcession;
                const studentFeesData = {
                    adminId: adminId,
                    studentId,
                    session: session,
                    currentSession:session,
                    previousSessionFeesStatus: true,
                    previousSessionClass: 0,
                    previousSessionStream: "empty",
                    class: className,
                    stream: stream,
                    admissionFees: 0,
                    admissionFeesPayable: false,
                    totalFees: totalFees,
                    paidFees: 0,
                    dueFees: totalFees,
                    AllTotalFees: totalFees + previousSessionTotalFees,
                    AllPaidFees: previousSessionPaidFees,
                    AllDueFees: totalFees + previousSessionDueFees,
                    feesConcession: feesConcession,
                    allFeesConcession: feesConcession + previousFeesConcession,
                };
                const updatedDocument = await FeesCollectionModel.findOneAndUpdate(
                    {
                        _id: id,
                        session: previousSession,
                    },
                    {
                        $set: {
                            currentSession:session,
                            previousSessionClass: previousSessionClass,
                            previousSessionStream: previousSessionStream,
                            class: className,
                            stream: stream,
                            AllTotalFees: totalFees + previousSessionTotalFees,
                            AllPaidFees: previousSessionPaidFees,
                            AllDueFees: totalFees + previousSessionDueFees,
                            allFeesConcession: feesConcession + previousFeesConcession,

                        }
                    },
                    {
                        new: true // Return the updated document
                    });
                let createStudentFeesData = await FeesCollectionModel.create(studentFeesData);
                if (createStudentFeesData) {
                    return res.status(200).json({ successMsg: `The student has successfully been fail to the class.`, className: className });
                }
            }

        }
    } catch (error) {
        return res.status(500).json({ errorMsg: 'Internal Server Error!' });
    }
}







let ChangeStatus = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { statusValue } = req.body;
        let status = statusValue == 1 ? 'Active' : 'Inactive'
        const studentData = {
            status: status
        }
        const updateStatus = await StudentModel.findByIdAndUpdate(id, { $set: studentData }, { new: true });
        return res.status(200).json('Student updated successfully.');
    } catch (error) {
        return res.status(500).json('Internal Server Error!');
    }
}

let DeleteStudent = async (req, res, next) => {
    try {
        const id = req.params.id;
        const deleteStudent = await StudentModel.findByIdAndRemove(id);
        if (deleteStudent) {
            const [deleteAdmitCard, deleteExamResult, deleteFeesCollection] = await Promise.all([
                AdmitCardModel.deleteOne({ studentId: id }),
                ExamResultModel.deleteOne({ studentId: id }),
                FeesCollectionModel.deleteMany({ studentId: id }),
            ]);

            if (deleteAdmitCard || deleteExamResult || deleteFeesCollection) {
                return res.status(200).json('Student deleted successfully.');
            }
            return res.status(200).json('Student deleted successfully.');
        }
    } catch (error) {
        return res.status(500).json('Internal Server Error!');
    }
}
// let DeleteAdmissionEnquiry = async (req, res, next) => {
//     try {
//         const id = req.params.id;
//         const admissionEnquiry = await AdmissionEnquiryModel.findByIdAndRemove(id);
//         return res.status(200).json('Student Online admission form delete successfully.');
//     } catch (error) {
//         return res.status(500).json('Internal Server Error!');
//     }
// }

module.exports = {
    countStudent,
    GetStudentPaginationByAdmission,
    GetStudentPaginationByAdmissionAndClass,
    // GetStudentAdmissionEnquiryPagination,
    GetStudentPaginationByClass,
    GetAllStudentByClass,
    GetSingleStudent,
    CreateStudent,
    // CreateStudentAdmissionEnquiry,
    CreateBulkStudentRecord,
    UpdateStudent,
    StudentClassPromote,
    StudentClassFail,
    ChangeStatus,
    DeleteStudent,
    // DeleteAdmissionEnquiry
}