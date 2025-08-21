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
    let isDate = currentDateIst.toFormat('dd/MM/yyyy');
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
        stream = "n/a";
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
        stream = "n/a";
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
    const istDateTimeString = currentDateIst.toFormat('dd/MM/yyyy hh:mm:ss a');
    let { session, medium, adminId, name, rollNumber, admissionClass, aadharNumber, udiseNumber, samagraId, admissionFees, admissionType, stream, admissionNo, dob, doa, gender, category, religion, nationality, bankAccountNo, bankIfscCode, address, lastSchool, fatherName, fatherQualification, fatherOccupation, motherOccupation, parentsContact, familyAnnualIncome, motherName, motherQualification, feesConcession, createdBy } = req.body;
    let className = req.body.class;
    if (stream === "stream") {
        stream = "n/a";
    }
    if (admissionType == 'New') {
        doa = currentDateIst.toFormat('dd/MM/yyyy');
        admissionClass = className;
    } else {
        const parsedDate = DateTime.fromFormat(doa, 'dd/MM/yyyy');
        if (!parsedDate.isValid) {
            doa = DateTime.fromISO(doa).toFormat("dd/MM/yyyy");
        }
    }
    const parsedDate = DateTime.fromFormat(dob, 'dd/MM/yyyy');
    if (!parsedDate.isValid) {
        dob = DateTime.fromISO(dob).toFormat("dd/MM/yyyy");
    }
    let studentData = {
        session, medium, adminId, name, rollNumber, admissionType, stream, admissionNo, class: className, admissionClass, dob: dob, doa: doa, gender, category, religion, nationality, bankAccountNo, bankIfscCode, address, lastSchool, fatherName, fatherQualification, fatherOccupation, motherOccupation, parentsContact, familyAnnualIncome, motherName, motherQualification, feesConcession, createdBy
    }
    try {
        if (!adminId) {
            return res.status(404).json(`Invalid entry!`);
        }
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
        if (aadharNumber !== null && aadharNumber !== undefined) {
            const checkAadharNumber = await StudentModel.findOne({ aadharNumber: aadharNumber });
            if (checkAadharNumber) {
                return res.status(400).json(`Aadhar card number already exist!`);
            }
            studentData.aadharNumber = aadharNumber;
        }

        if (samagraId !== null && samagraId !== undefined) {
            const checkSamagraId = await StudentModel.findOne({ samagraId: samagraId });
            if (checkSamagraId) {
                return res.status(400).json(`Samagra id already exist!`);
            }
            studentData.samagraId = samagraId;
            studentData.extraField = [{ samagraId: samagraId }]
        }
        if (udiseNumber !== null && udiseNumber !== undefined) {
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
            currentSession: session,
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
                return res.status(200).json('Student created successfully');
            }
        }
    } catch (error) {
        return res.status(500).json('Internal Server Error!');
    }
}










const CreateBulkStudentRecord = async (req, res, next) => {
    const { bulkStudentRecord, session: selectedSession, class: classNameParam, stream: streamParam, adminId, createdBy } = req.body;
    const currentDateIst = DateTime.now().setZone('Asia/Kolkata');
    const istDateTimeString = currentDateIst.toFormat('dd/MM/yyyy hh:mm:ss a');

    const className = parseInt(classNameParam);
    const stream = streamParam === "stream" ? "n/a" : streamParam;

    const classMappings = {
        "nursery": 200, "lkg": 201, "ukg": 202, "1st": 1, "2nd": 2, "3rd": 3, "4th": 4, "5th": 5, "6th": 6,
        "7th": 7, "8th": 8, "9th": 9, "10th": 10, "11th": 11, "12th": 12,
    };

    const fieldsToParseInt = ["udiseNumber", "aadharNumber", "samagraId", "bankAccountNo", "parentsContact", "feesConcession", "familyAnnualIncome"];
    const validGenders = new Set(['male', 'female', 'other']);
    const validCategories = new Set(['general', 'obc', 'sc', 'st', 'ews', 'other']);

    const toTitleCase = (str) => str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

    const session = await StudentModel.startSession();
    session.startTransaction();

    try {
        // --- Initial Validations (Fail Fast) ---
        if (!bulkStudentRecord || bulkStudentRecord.length === 0) {
            return res.status(400).json('No student records provided.');
        }
        if (bulkStudentRecord.length > 200) {
            return res.status(400).json('File too large. Please make sure that file records are less than or equal to 200!');
        }

        // --- Parallelize Initial Database Checks ---
        const [checkAdminPlan, countStudent, checkFeesStr, existingRecords] = await Promise.all([
            AdminPlan.findOne({ adminId }),
            StudentModel.countDocuments({ adminId }),
            FeesStructureModel.findOne({ adminId, session: selectedSession, class: className, stream }),
            StudentModel.find({ adminId }).lean() // Fetch all existing records once
        ]);

        if (!checkAdminPlan) {
            return res.status(404).json('Invalid admin plan entry!');
        }
        if (!checkFeesStr) {
            return res.status(404).json('Please create a fees structure for the selected class and session!');
        }

        const studentLimit = checkAdminPlan.studentLimit;
        const allStudentCount = bulkStudentRecord.length + countStudent;

        if (allStudentCount > studentLimit) {
            return res.status(400).json(`Your current plan allows up to ${studentLimit} students. Adding these ${bulkStudentRecord.length} students would exceed your limit. Please increase the limit or upgrade to a higher plan to continue! You currently have ${countStudent} students.`);
        }

        // --- Prepare Sets for Fast Lookups of Existing Data ---
        const existingAdmissionNos = new Set(existingRecords.map(r => r.admissionNo).filter(Boolean));
        const existingAadharNumbers = new Set(existingRecords.map(r => r.aadharNumber).filter(Boolean));
        const existingSamagraIds = new Set(existingRecords.map(r => r.samagraId).filter(Boolean));
        const existingRollNumbersInClass = new Set(existingRecords.filter(r => r.class === className).map(r => r.rollNumber).filter(Boolean));

        // --- Process and Validate Each Student Record in a Single Pass ---
        const studentDataToInsert = [];
        const feesDataToInsert = [];

        // Sets to track uniqueness within the current batch
        const batchAdmissionNos = new Set();
        const batchAadharNumbers = new Set();
        const batchSamagraIds = new Set();
        const batchRollNumbers = new Set();

        for (let i = 0; i < bulkStudentRecord.length; i++) {
            const student = { ...bulkStudentRecord[i] }; // Shallow copy

            // --- Data Parsing and Normalization ---
            const classKey = (student.admissionClass || "").toString().toLowerCase().trim();
            student.admissionClass = parseInt(classMappings[classKey]);
            student.admissionNo = parseInt(student.admissionNo);
            student.admissionType = student.admissionType.toLowerCase();
            student.rollNumber = parseInt(student.rollNumber);

            for (const field of fieldsToParseInt) {
                if (student[field] !== null && student[field] !== undefined) {
                    student[field] = parseInt(student[field]);
                }
            }

            // --- Field Presence & Data Type Validation ---
            const requiredFields = [
                'medium', 'name', 'fatherName', 'motherName', 'fatherQualification',
                'motherQualification', 'fatherOccupation', 'motherOccupation',
                'familyAnnualIncome', 'rollNumber', 'admissionNo', 'feesConcession',
                'admissionType', 'admissionClass', 'dob', 'doa', 'gender', 'category',
                'religion', 'nationality', 'address'
            ];

            const missingFields = requiredFields.filter(field =>
                student[field] === null || student[field] === undefined ||
                (typeof student[field] === 'string' && student[field].trim() === '') ||
                (field === 'admissionClass' && isNaN(student[field]))
            );

            if (missingFields.length > 0) {
                const formattedMissingFields = missingFields.map(toTitleCase);
                throw new Error(`Row ${i + 3} is missing required fields: ( ${formattedMissingFields.join(', ')} ). Please fill in all mandatory fields before continuing!`);
            }
            // --- Uniqueness Checks (Existing DB + Current Batch) ---
            if (student.admissionNo && (existingAdmissionNos.has(student.admissionNo) || batchAdmissionNos.has(student.admissionNo))) {
                throw new Error(`Row ${i + 3} has an Admission number (${student.admissionNo}) that already exists. Please fix it before continuing!`);
            }
            if (student.rollNumber && (existingRollNumbersInClass.has(student.rollNumber) || batchRollNumbers.has(student.rollNumber))) {
                throw new Error(`Row ${i + 3} has a Roll number (${student.rollNumber}) that already exists in this class. Please fix it before continuing!`);
            }
            if (student.aadharNumber && (existingAadharNumbers.has(student.aadharNumber) || batchAadharNumbers.has(student.aadharNumber))) {
                throw new Error(`Row ${i + 3} has an Aadhar number (${student.aadharNumber}) that already exists. Please fix it before continuing!`);
            }
            if (student.samagraId && (existingSamagraIds.has(student.samagraId) || batchSamagraIds.has(student.samagraId))) {
                throw new Error(`Row ${i + 3} has a Samagra ID (${student.samagraId}) that already exists. Please fix it before continuing!`);
            }
            // --- Data Content Validation (using normalized values) ---
            const normalizedGender = String(student.gender).toLowerCase();
            const normalizedCategory = String(student.category).toLowerCase();

            if (!validGenders.has(normalizedGender)) {
                throw new Error(`Row ${i + 3} has invalid value for Gender: "${student.gender}". Allowed values are: (Male, Female, Other).`);
            }
            if (!validCategories.has(normalizedCategory)) {
                throw new Error(`Row ${i + 3} has invalid value for Category: "${student.category}". Allowed values are: (General, OBC, SC, ST, EWS, Other).`);
            }
            // Validate feesConcession is a valid number AND then check its value
            if (isNaN(student.feesConcession)) {
                throw new Error(`Row ${i + 3} has an invalid value for Fee Concession: "${bulkStudentRecord[i].feesConcession}". It must be a valid number.`);
            }

            if (student.feesConcession < 0) {
                throw new Error(`Row ${i + 3} has a negative fee concession amount (${student.feesConcession}). Please provide a non-negative value.`);
            }

            if (student.feesConcession > checkFeesStr.totalFees) {
                throw new Error(`Row ${i + 3} shows a fee concession amount (${student.feesConcession}) greater than the total academic fee (${checkFeesStr.totalFees})!`);
            }

            // Add to batch sets to prevent duplicates *within the current bulk upload*
            if (student.admissionNo) batchAdmissionNos.add(student.admissionNo);
            if (student.aadharNumber) batchAadharNumbers.add(student.aadharNumber);
            if (student.samagraId) batchSamagraIds.add(student.samagraId);
            if (student.rollNumber) batchRollNumbers.add(student.rollNumber); // Check roll number uniqueness for current class

            // Prepare student data for insertion
            const studentObj = {
                session: selectedSession, medium: student.medium, adminId: adminId, name: student.name,
                rollNumber: student.rollNumber, feesConcession: student.feesConcession, udiseNumber: student.udiseNumber,
                aadharNumber: student.aadharNumber, samagraId: student.samagraId,
                extraField: [{ samagraId: student.samagraId }], // Consider if this is truly needed or can be removed
                admissionNo: student.admissionNo, admissionType: student.admissionType, stream: stream,
                class: className, admissionClass: student.admissionClass, dob: student.dob, doa: student.doa,
                gender: student.gender, category: student.category, religion: student.religion,
                nationality: student.nationality, bankAccountNo: student.bankAccountNo,
                bankIfscCode: student.bankIfscCode, address: student.address, fatherName: student.fatherName,
                fatherQualification: student.fatherQualification, motherName: student.motherName,
                motherQualification: student.motherQualification, fatherOccupation: student.fatherOccupation,
                motherOccupation: student.motherOccupation, parentsContact: student.parentsContact,
                familyAnnualIncome: student.familyAnnualIncome, createdBy: createdBy,
            };
            studentDataToInsert.push(studentObj);
        }

        // --- Bulk Insertion of Students ---
        const createdStudents = await StudentModel.insertMany(studentDataToInsert, { session });

        // --- Prepare Fees Data (using the _ids from newly created students) ---
        for (const student of createdStudents) {
            let totalFees = checkFeesStr.totalFees - student.feesConcession;
            const feesObject = {
                adminId: adminId, studentId: student._id, class: className, stream: stream,
                session: selectedSession, currentSession: selectedSession, previousSessionFeesStatus: false,
                previousSessionClass: 0, previousSessionStream: "empty", admissionFeesPayable: false,
                admissionFees: 0, totalFees: totalFees, feesConcession: student.feesConcession,
                allFeesConcession: student.feesConcession, paidFees: 0, dueFees: totalFees,
                AllTotalFees: totalFees, AllPaidFees: 0, AllDueFees: totalFees,
            };

            if (student.admissionType === 'new') {
                feesObject.admissionFeesPayable = true;
                feesObject.admissionFees = checkFeesStr.admissionFees;
                feesObject.totalFees += checkFeesStr.admissionFees;
                feesObject.paidFees = checkFeesStr.admissionFees;
                feesObject.dueFees = feesObject.totalFees - feesObject.paidFees;
                feesObject.AllTotalFees += checkFeesStr.admissionFees;
                feesObject.AllPaidFees = checkFeesStr.admissionFees;
                feesObject.AllDueFees = feesObject.AllTotalFees - feesObject.AllPaidFees;
                feesObject.admissionFeesPaymentDate = istDateTimeString;
            }
            feesDataToInsert.push(feesObject);
        }

        // --- Bulk Insertion of Fees Data ---
        await FeesCollectionModel.insertMany(feesDataToInsert, { session });

        // --- Commit Transaction and Respond ---
        await session.commitTransaction();
        session.endSession();
        return res.status(200).json('Student records and fees data created successfully!');

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json(error.message || 'Internal Server Error while creating student records. Please try again later.'); // Return specific error message to client
    }
};

let UpdateStudent = async (req, res, next) => {
    try {
        const id = req.params.id;
        let { session, medium, adminId, name, rollNumber, admissionClass, aadharNumber, udiseNumber, samagraId, admissionFees, admissionType, stream, admissionNo, dob, doa, gender, category, religion, nationality, bankAccountNo, bankIfscCode, address, lastSchool, fatherName, fatherQualification, fatherOccupation, motherOccupation, parentsContact, familyAnnualIncome, motherName, motherQualification, feesConcession } = req.body;
        const studentData = {
            session, medium, adminId, name, rollNumber, admissionClass, aadharNumber, udiseNumber, samagraId, extraField: [{ samagraId: samagraId }], admissionFees, admissionType, stream, admissionNo, dob, doa, gender, category, religion, nationality, bankAccountNo, bankIfscCode, address, lastSchool, fatherName, fatherQualification, fatherOccupation, motherOccupation, parentsContact, familyAnnualIncome, motherName, motherQualification, feesConcession
        }
        const updateStudent = await StudentModel.findByIdAndUpdate(id, { $set: studentData }, { new: true });
        return res.status(200).json('Student updated successfully');
    } catch (error) {
        return res.status(500).json('Internal Server Error!');
    }
}

let StudentClassPromote = async (req, res, next) => {
    try {
        const studentId = req.params.id;
        let { adminId, session, rollNumber, stream, feesConcession } = req.body;
        if (stream == "stream") {
            stream = "n/a";
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
        if (className === 10 && stream == "n/a" || className === 11 && stream == "n/a") {
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
                        currentSession: session,
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
                        return res.status(200).json({ successMsg: `The student has successfully been promoted to the class`, className: className });
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
                    currentSession: session,
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
                            currentSession: session,
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
                    return res.status(200).json({ successMsg: `The student has successfully been promoted to the class`, className: className });
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
            stream = "n/a";
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
        // if (className === 10 && stream == "n/a" || className === 11 && stream == "n/a") {
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
                        currentSession: session,
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
                        return res.status(200).json({ successMsg: `The student has successfully been promoted to the class`, className: className });
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
                    currentSession: session,
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
                            currentSession: session,
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
                    return res.status(200).json({ successMsg: `The student has successfully been fail to the class`, className: className });
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
        return res.status(200).json('Student updated successfully');
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
                return res.status(200).json('Student deleted successfully');
            }
            return res.status(200).json('Student deleted successfully');
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