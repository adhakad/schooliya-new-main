'use strict';
const StudentModel = require('../models/student');
const FeesStructureModel = require('../models/fees-structure');
const FeesCollectionModel = require('../models/fees-collection');
const AdmitCardModel = require('../models/admit-card');
const ExamResultModel = require('../models/exam-result');
const ClassSubjectModal = require('../models/class-subject');
const IssuedTransferCertificateModel = require('../models/issued-transfer-certificate');
const { DateTime } = require('luxon');

let countStudent = async (req, res, next) => {
    let countStudent = await StudentModel.count();
    return res.status(200).json({ countStudent });
}

let GetStudentPaginationByAdmission = async (req, res, next) => {
    let searchText = req.body.filters.searchText;
    let className = req.body.class;
    let adminId = req.body.adminId;
    let searchObj = {};
    if (searchText) {
        searchObj = /^(?:\d*\.\d{1,2}|\d+)$/.test(searchText) ? { $or: [{ class: searchText }, { rollNumber: searchText }, { admissionNo: searchText }] } : { name: new RegExp(`${searchText.toString().trim()}`, 'i') }
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
        return res.status(500).json('Internal Server Error !');
    }
}
let GetStudentPaginationByAdmissionAndClass = async (req, res, next) => {

    let searchText = req.body.filters.searchText;
    let className = req.body.class;
    let searchObj = {};
    if (searchText) {
        searchObj = /^(?:\d*\.\d{1,2}|\d+)$/.test(searchText) ? { $or: [{ class: searchText }, { rollNumber: searchText }, { admissionNo: searchText }] } : { name: new RegExp(`${searchText.toString().trim()}`, 'i') }
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
        return res.status(500).json('Internal Server Error !');
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
//         return res.status(500).json('Internal Server Error !');
//     }
// }

let GetStudentPaginationByClass = async (req, res, next) => {
    const currentDateIst = DateTime.now().setZone('Asia/Kolkata');
    let isDate = currentDateIst.toFormat('dd-MM-yyyy');
    let searchText = req.body.filters.searchText;
    let className = req.body.class;
    let adminId = req.body.adminId;
    let stream = req.body.stream;
    if (stream == "stream") {
        stream = "N/A";
    }
    let searchObj = {};
    if (searchText) {
        searchObj = /^(?:\d*\.\d{1,2}|\d+)$/.test(searchText) ? { $or: [{ class: searchText }, { rollNumber: searchText }, { admissionNo: searchText }] } : { name: new RegExp(`${searchText.toString().trim()}`, 'i') }
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
            return res.status(404).json(`Student Not Found !`);
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
        return res.status(500).json('Internal Server Error !');
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
        return res.status(500).json('Internal Server Error !');
    }
}

let GetSingleStudent = async (req, res, next) => {
    try {
        const singleStudent = await StudentModel.findOne({ _id: req.params.id });
        return res.status(200).json(singleStudent);
    } catch (error) {
        return res.status(500).json('Internal Server Error !');
    }
}

let CreateStudent = async (req, res, next) => {
    let receiptNo = Math.floor(Math.random() * 899999 + 100000);
    const currentDateIst = DateTime.now().setZone('Asia/Kolkata');
    const istDateTimeString = currentDateIst.toFormat('dd-MM-yyyy hh:mm:ss a');
    let { session, medium, adminId, name, rollNumber, admissionClass, aadharNumber, udiseNumber, samagraId, admissionFees, admissionType, stream, admissionNo, dob, doa, gender, category, religion, nationality, bankAccountNo, bankIfscCode, address, lastSchool, fatherName, fatherQualification, parentsOccupation, parentsContact, parentsAnnualIncome, motherName, motherQualification, discountAmountInFees, createdBy } = req.body;
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
        session, medium, adminId, name, rollNumber, admissionType, stream, admissionNo, class: className, admissionClass, dob: dob, doa: doa, gender, category, religion, nationality, bankAccountNo, bankIfscCode, address, lastSchool, fatherName, fatherQualification, parentsOccupation, parentsContact, parentsAnnualIncome, motherName, motherQualification, discountAmountInFees, createdBy
    }
    try {
        const checkFeesStr = await FeesStructureModel.findOne({ adminId: adminId, class: className, stream: stream });
        if (!checkFeesStr) {
            return res.status(404).json(`Please create fees structure !`);
        }
        const checkClassSubject = await ClassSubjectModal.findOne({ adminId: adminId, class: className, stream: stream });
        if (!checkClassSubject) {
            return res.status(404).json(`Please group subjects according to class and stream !`);
        }
        if (aadharNumber !== null && aadharNumber !== undefined) {
            const checkAadharNumber = await StudentModel.findOne({ aadharNumber: aadharNumber });
            if (checkAadharNumber) {
                return res.status(400).json(`Aadhar card number already exist !`);
            }
            studentData.aadharNumber = aadharNumber;
        }

        if (samagraId !== null && samagraId !== undefined) {
            const checkSamagraId = await StudentModel.findOne({ samagraId: samagraId });
            if (checkSamagraId) {
                return res.status(400).json(`Samagra id already exist !`);
            }
            studentData.samagraId = samagraId;
        }
        if (udiseNumber !== null && udiseNumber !== undefined) {
            const checkUdiseNumber = await StudentModel.findOne({ udiseNumber: udiseNumber });
            if (checkUdiseNumber) {
                return res.status(400).json(`UDISE Number already exist !`);
            }
        }

        const checkAdmissionNo = await StudentModel.findOne({ adminId: adminId, admissionNo: admissionNo });
        if (checkAdmissionNo) {
            return res.status(400).json(`Admission no already exist !`);
        }

        const checkRollNumber = await StudentModel.findOne({ adminId: adminId, rollNumber: rollNumber, class: className });
        if (checkRollNumber) {
            return res.status(400).json(`Roll number already exist for this class !`);
        }
        let totalFees = checkFeesStr.totalFees - discountAmountInFees;
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
            class: parseInt(className),
            stream: stream,
            admissionFees: admissionFees ? admissionFees : 0,
            admissionFeesPayable: admissionFeesPayable,
            discountAmountInFees: discountAmountInFees,
            totalFees: totalFees,
            paidFees: paidFees,
            dueFees: dueFees,
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
                    session: createStudent.session,
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
        return res.status(500).json('Internal Server Error !');
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
//             return res.status(400).json(`Name: ${name} phone ${contact} is already fill online admission form, please visit school and confirm your admission !`);
//         }
//         let createAdmissionEnquiryModel = await AdmissionEnquiryModel.create(studentData);
//         if (createAdmissionEnquiryModel) {
//             return res.status(200).json({ successMsg: 'Online admission form submited successfully.' });
//         }
//     } catch (error) {
//         return res.status(500).json('Internal Server Error !');
//     }
// }

let CreateBulkStudentRecord = async (req, res, next) => {
    let bulkStudentRecord = req.body.bulkStudentRecord;
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
            session: student.session,
            medium: student.medium,
            adminId: adminId,
            name: student.name,
            rollNumber: student.rollNumber,
            discountAmountInFees: student.discountAmountInFees,
            udiseNumber: student.udiseNumber,
            aadharNumber: student.aadharNumber,
            samagraId: student.samagraId,
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
            parentsOccupation: student.parentsOccupation,
            parentsContact: student.parentsContact,
            parentsAnnualIncome: student.parentsAnnualIncome,
            createdBy: createdBy,
        });
    }
    const session = await StudentModel.startSession();
    session.startTransaction();
    try {

        if (studentData.length > 100) {
            return res.status(400).json('File too large, Please make sure that file records to less then or equals to 100 !');
        }
        const otherClassAdmissionNo = [];
        // for (const student of studentData) {
        //     if (student.class !== className) {
        //         const { admissionNo } = student;
        //         if (admissionNo) {
        //             otherClassAdmissionNo.push(admissionNo);
        //         }
        //         continue;
        //     }
        // }
        // if (otherClassAdmissionNo.length > 0) {
        //     const spreadAdmissionNo = otherClassAdmissionNo.join(', ');
        //     return res.status(400).json(`Admission number(s) ${spreadAdmissionNo} student(s) class is invailid !`);
        // }
        const existRecords = await StudentModel.find({ adminId: adminId, class: className, stream: stream }).lean();
        const duplicateAadharNumber = [];
        const duplicateSamagraId = [];
        const duplicateAdmissionNo = [];
        for (const student of studentData) {
            const { admissionNo, aadharNumber, samagraId } = student;
            let aadharNumberExists;
            if (aadharNumber !== null && aadharNumber !== undefined) {
                aadharNumberExists = existRecords.some(record => record.aadharNumber == aadharNumber);
            }
            let samagraIdExists;
            if (samagraId !== null && samagraId !== undefined) {
                samagraIdExists = existRecords.some(record => record.samagraId == samagraId);
            }
            let admissionNoExists;
            if (admissionNo !== null && admissionNo !== undefined) {
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
            return res.status(400).json(`Aadhar card number(s) ${spreadAadharNumber} already exist !`);
        }
        if (duplicateSamagraId.length > 0) {
            const spreadSamagraId = duplicateSamagraId.join(', ');
            return res.status(400).json(`Samagra id number(s) ${spreadSamagraId} already exist !`);
        }
        if (duplicateAdmissionNo.length > 0) {
            const spreadAdmissionNo = duplicateAdmissionNo.join(', ');
            return res.status(400).json(`Admission number(s) ${spreadAdmissionNo} already exist !`);
        }

        const existingRecords = await StudentModel.find({ adminId: adminId, class: className }).lean();
        const unFillRows = [];
        const duplicateRollNumber = [];
        let index = 3;
        for (const student of studentData) {
            const {
                medium,
                name,
                fatherName,
                motherName,
                fatherQualification,
                motherQualification,
                parentsOccupation,
                parentsAnnualIncome,
                rollNumber,
                admissionNo,
                discountAmountInFees,
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
            if (
                medium !== null && medium !== undefined &&
                name !== null && name !== undefined &&
                fatherName !== null && fatherName !== undefined &&
                motherName !== null && motherName !== undefined &&
                fatherQualification !== null && fatherQualification !== undefined &&
                motherQualification !== null && motherQualification !== undefined &&
                parentsOccupation !== null && parentsOccupation !== undefined &&
                parentsAnnualIncome !== null && parentsAnnualIncome !== undefined &&
                rollNumber !== null && rollNumber !== undefined &&
                admissionNo !== null && admissionNo !== undefined &&
                discountAmountInFees !== null && discountAmountInFees !== undefined &&
                admissionType !== null && admissionType !== undefined &&
                admissionClass !== null && admissionClass !== undefined && !isNaN(admissionClass) && //this line generate error
                dob !== null && dob !== undefined &&
                doa !== null && doa !== undefined &&
                gender !== null && gender !== undefined &&
                category !== null && category !== undefined &&
                religion !== null && religion !== undefined &&
                nationality !== null && nationality !== undefined &&
                address !== null && address !== undefined
            ) {

                // At least one field is filled
            } else {
                unFillRows.push(index);
            }

            const rollNumberExists = existingRecords.some(record => record.rollNumber == rollNumber);
            if (rollNumberExists) {
                duplicateRollNumber.push(rollNumber);
            }
            index++;
        }
        if (unFillRows.length > 0) {
            const spreadIndex = unFillRows.join(', ');
            return res.status(400).json(`
                Row(s) ${spreadIndex} are missing required information. Please fill in all mandatory fields before continuing !`);
        }
        if (duplicateRollNumber.length > 0) {
            const spreadRollNumber = duplicateRollNumber.join(', ');
            return res.status(400).json(`Roll number(s) ${spreadRollNumber} already exist for this class !`);
        }
        const checkFeesStr = await FeesStructureModel.findOne({ adminId: adminId, class: className, stream: stream });
        if (!checkFeesStr) {
            return res.status(404).json(`Please create fees structure !`);
        }

        const createStudent = await StudentModel.create(studentData, { session });

        let admissionFees = checkFeesStr.admissionFees;
        let studentFeesData = [];
        let totalFeesInStr = checkFeesStr.totalFees;
        for (let i = 0; i < createStudent.length; i++) {
            let totalFees = 0;
            let student = createStudent[i];
            totalFees = totalFeesInStr - student.discountAmountInFees;
            let feesObject = {
                adminId: adminId,
                studentId: student._id,
                class: className,
                stream: stream,
                admissionFeesPayable: false,
                admissionFees: 0,
                totalFees: totalFees,
                discountAmountInFees: student.discountAmountInFees,
                paidFees: 0,
                dueFees: totalFees,
            };

            if (student.admissionType === 'New') {
                feesObject.admissionFeesPayable = true;
                feesObject.totalFees += admissionFees;
                feesObject.dueFees += admissionFees;
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
        return res.status(500).json('Error creating student and fees data.');
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        return res.status(500).json('Internal Server Error!');
    }
}

let UpdateStudent = async (req, res, next) => {
    try {
        const id = req.params.id;
        let { name, rollNumber, aadharNumber, samagraId, session, admissionType, stream, admissionNo, dob, gender, category, religion, nationality, address, fatherName, fatherQualification, fatherOccupation, fatherContact, fatherAnnualIncome, motherName, motherQualification, motherOccupation, motherContact, motherAnnualIncome } = req.body;
        const studentData = {
            name, rollNumber, aadharNumber, samagraId, session, admissionType, stream, admissionNo, class: className, dob: dob, doa: doa, gender, category, religion, nationality, address, fatherName, fatherQualification, fatherOccupation, fatherContact, fatherAnnualIncome, motherName, motherQualification, motherOccupation, motherContact, motherAnnualIncome
        }
        const updateStudent = await StudentModel.findByIdAndUpdate(id, { $set: studentData }, { new: true });
        return res.status(200).json('Student update successfully.');
    } catch (error) {
        return res.status(500).json('Internal Server Error !');
    }
}

let StudentClassPromote = async (req, res, next) => {
    try {
        const studentId = req.params.id;
        let { adminId, session, rollNumber, stream,discountAmountInFees } = req.body;
        if (stream == "stream") {
            stream = "N/A";
        }
        let className = parseInt(req.body.class);
        let checkStudent = await StudentModel.findOne({ _id: studentId });
        if (!checkStudent) {
            return res.status(404).json({ errorMsg: 'Student not found' });
        }
        let cls = checkStudent.class;
        if (className == cls && className === 12) {
            return res.status(400).json({ errorMsg: `In this school, students cannot be promoted after the ${className}th class` });
        }
        if (className === 10 && stream == "N/A" || className === 11 && stream == "N/A") {
            return res.status(400).json({ errorMsg: `Invalid stream for this class !` });
        }

        let isSession = checkStudent.session;
        if (session == isSession) {
            return res.status(400).json({ errorMsg: `The student is currently in the ${isSession} session, please choose the academic session for the next year.` });
        }
        if (className == cls && className === 202) {
            className = 1;
        }else{
            className = className + 1;
        }
        const checkFeesStr = await FeesStructureModel.findOne({ adminId: adminId, class: className,stream:stream });
        if (!checkFeesStr) {
            return res.status(404).json({ errorMsg: 'Please create fees structure for this class', className: className });
        }
        const studentData = { rollNumber, class: className, stream, admissionType: 'Old',discountAmountInFees:discountAmountInFees };
        const updateStudent = await StudentModel.findByIdAndUpdate(studentId, { $set: studentData }, { new: true });
        if (updateStudent) {
            await Promise.all([
                AdmitCardModel.findOneAndDelete({ studentId: studentId }),
                ExamResultModel.findOneAndDelete({ studentId: studentId }),
                FeesCollectionModel.findOneAndDelete({ studentId: studentId }),
            ]);
            let checkFeesStrTotalFees = checkFeesStr.totalFees
            const totalFees = checkFeesStrTotalFees - discountAmountInFees;
            const studentFeesData = {
                adminId: adminId,
                studentId,
                class: className,
                stream:stream,
                admissionFees: 0,
                admissionFeesPayable: false,
                totalFees: totalFees,
                paidFees: 0,
                dueFees: totalFees,
                discountAmountInFees:discountAmountInFees,
            };
            let createStudentFeesData = await FeesCollectionModel.create(studentFeesData);
            if (createStudentFeesData) {
                return res.status(200).json({ successMsg: `The student has successfully been promoted to the class`, className: className });
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
        return res.status(200).json('Student update successfully.');
    } catch (error) {
        return res.status(500).json('Internal Server Error !');
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
                FeesCollectionModel.deleteOne({ studentId: id }),
            ]);

            if (deleteAdmitCard || deleteExamResult || deleteFeesCollection) {
                return res.status(200).json('Student delete successfully.');
            }
            return res.status(200).json('Student delete successfully.');
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
    ChangeStatus,
    DeleteStudent,
    // DeleteAdmissionEnquiry
}