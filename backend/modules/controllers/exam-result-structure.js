'use strict';
const MarksheetTemplateStructureModel = require('../models/marksheet-template-structure');
const MarksheetTemplateModel = require('../models/marksheet-template');
const ExamResultModel = require('../models/exam-result');
const ClassSubjectModel = require('../models/class-subject');
const StudentModel = require('../models/student');

let GetSingleClassMarksheetTemplateByStream = async (req, res, next) => {
    let adminId = req.params.id;
    let className = req.params.class;
    let stream = req.params.stream;
    if (stream === "stream") {
        stream = "N/A";
    }
    let streamMsg = `${stream} stream`;
    try {
        const marksheetTemplate = await MarksheetTemplateModel.findOne({ adminId: adminId, class: className, stream: stream });
        if (!marksheetTemplate) {
            return res.status(404).json(`Class ${className} ${streamMsg} template not found!`);
        }
        return res.status(200).json(marksheetTemplate);
    } catch (error) {
        return res.status(500).json('Internal Server Error!');;
    }
}

let GetSingleClassMarksheetTemplateStructureByStream = async (req, res, next) => {
    let adminId = req.params.id;
    let className = req.params.class;
    let stream = req.params.stream;
    if (stream === "stream") {
        stream = "N/A";
    }
    let streamMsg = '';
    try {
        const classSubjectList = await ClassSubjectModel.findOne({ adminId: adminId, class: className, stream: stream }, 'subject');
        if (!classSubjectList) {
            return res.status(404).json('This class and subject group not found!');
        }
        const marksheetTemplate = await MarksheetTemplateModel.findOne({ adminId: adminId, class: className, stream: stream });
        if (!marksheetTemplate) {
            if (stream === "N/A") {

                streamMsg = ``;
            }
            return res.status(404).json(`Marksheet template not found!`);
        }
        const templateName = marksheetTemplate.templateName;
        const marksheetTemplateStructure = await MarksheetTemplateStructureModel.findOne({ templateName: templateName });
        if (!marksheetTemplateStructure) {
            if (stream === "N/A") {
                streamMsg = ``;
            }
            return res.status(404).json(`Marksheet template structure not found!`);
        }
        return res.status(200).json({ marksheetTemplateStructure: marksheetTemplateStructure, classSubjectList: classSubjectList });
    } catch (error) {
        return res.status(500).json('Internal Server Error!');
    }
}
let GetSingleMarksheetTemplateById = async (req, res, next) => {
    let id = req.params.id;
    try {
        const marksheetTemplate = await MarksheetTemplateModel.findOne({ _id:id });
        if (!marksheetTemplate) {
            return res.status(404).json(`Template not found!`);
        }
        return res.status(200).json(marksheetTemplate);
    } catch (error) {
        return res.status(500).json('Internal Server Error!');;
    }
}

let CreateExamResultStructure = async (req, res, next) => {
    let className = req.body.class;
    let { adminId, stream, templateName, templateUrl } = req.body;
    if (stream === "stream") {
        stream = "N/A";
    }
    try {
        let student = await StudentModel.findOne({ adminId: adminId, class: className, stream: stream });
        if (!student) {
            return res.status(404).json('No student was found in this class, please add students!');
        }
        const checkExamExist = await MarksheetTemplateModel.findOne({ adminId: adminId, class: className, stream: stream });
        if (checkExamExist) {
            return res.status(400).json(`This class template ${checkExamExist.templateName} already exist!`);
        }
        const marksheetStructure = await MarksheetTemplateStructureModel.findOne({ templateName });
        if (!marksheetStructure) {
            return res.status(404).json(`Marksheet structure not found!`);
        }
        const classSubject = await ClassSubjectModel.findOne({ adminId: adminId, class: className, stream: stream });
        if (!classSubject) {
            return res.status(404).json(`Class subject group not found!`);
        }
        function generateExamStructure(examStructure, classSubjects) {
            for (const termKey in examStructure) {
                const termData = examStructure[termKey];
        
                // Dynamic fields ko direct assign karo aur delete karo
                for (const key in termData) {
                    if (typeof termData[key] !== 'object') {
                        const value = termData[key];
                        termData[key] = classSubjects.subject.map(sub => ({ [sub.subject]: value }));
                    }
                }
            }
            return examStructure;
        }
        const updatedExamStructure = generateExamStructure(marksheetStructure.examStructure, classSubject);
        let subjects = [...classSubject.subject];
        let marksheetTemplateData = {
            adminId: adminId,
            class: className,
            stream: stream,
            templateName: templateName,
            templateUrl: templateUrl,
            examStructure: updatedExamStructure,
            subjects:subjects
        };
        let marksheetTemplate = await MarksheetTemplateModel.create(marksheetTemplateData)
        return res.status(200).json('Marksheet template created successfully.');

    } catch (error) {
        return res.status(500).json('Internal Server Error!');;
    }
}

// let CreateExamResultStructure = async (req, res, next) => {

//     // TEMPLATE T5 OR T6 SECTION

//     const gradeMinMarks = [
//         { "A1": 91 }, { "A2": 81 }, { "B1": 71 }, { "B2": 61 },
//         { "C1": 51 }, { "C2": 41 }, { "D": 33 }, { "F": 0 }
//     ];
//     const gradeMaxMarks = [
//         { "A1": 100 }, { "A2": 90 }, { "B1": 80 }, { "B2": 70 },
//         { "C1": 60 }, { "C2": 50 }, { "D": 40 }, { "F": 32 }
//     ];
//     const coScholastic = ['work education', 'arts education','discipline'];
//     const templateData = {
//         templateName: "T6",
//         examStructure: {
//             term1: {
//                 theoryMaxMarks: 80,
//                 theoryPassMarks: 27,
//                 periodicTestMaxMarks: 10,
//                 noteBookMaxMarks: 5,
//                 subjectEnrichmentMaxMarks: 5,
//                 gradeMinMarks: gradeMinMarks,
//                 gradeMaxMarks: gradeMaxMarks,
//                 coScholastic: coScholastic,
//             },
//             term2: {
//                 theoryMaxMarks: 80,
//                 theoryPassMarks: 27,
//                 periodicTestMaxMarks: 10,
//                 noteBookMaxMarks: 5,
//                 subjectEnrichmentMaxMarks: 5,
//                 gradeMinMarks: gradeMinMarks,
//                 gradeMaxMarks: gradeMaxMarks,
//                 coScholastic: coScholastic,
//             }
//         }
//     }

//     // // TEMPLATE T3 OR T4 SECTION

//     // const gradeMinMarks = [
//     //     { "A1": 91 }, { "A2": 81 }, { "B1": 71 }, { "B2": 61 },
//     //     { "C1": 51 }, { "C2": 41 }, { "D": 33 }, { "F": 0 }
//     // ];
//     // const gradeMaxMarks = [
//     //     { "A1": 100 }, { "A2": 90 }, { "B1": 80 }, { "B2": 70 },
//     //     { "C1": 60 }, { "C2": 50 }, { "D": 40 }, { "F": 32 }
//     // ];
//     // const coScholastic = ['work education', 'arts education','discipline'];
//     // const templateData = {
//     //     templateName: "T3",
//     //     examStructure: {
//     //         term1: {
//     //             theoryMaxMarks: 80,
//     //             theoryPassMarks: 27,
//     //             practicalMaxMarks: 20,
//     //             gradeMinMarks: gradeMinMarks,
//     //             gradeMaxMarks: gradeMaxMarks,
//     //             coScholastic: coScholastic,
//     //         },
//     //         term2: {
//     //             theoryMaxMarks: 80,
//     //             theoryPassMarks: 27,
//     //             practicalMaxMarks: 20,
//     //             gradeMinMarks: gradeMinMarks,
//     //             gradeMaxMarks: gradeMaxMarks,
//     //             coScholastic: coScholastic,
//     //         }
//     //     }
//     // }

//     // // TEMPLATE T2 SECTION

//     // const gradeMinMarks = [
//     //     { "A+": 91 }, { "A": 81 }, { "B+": 71 }, { "B": 61 },
//     //     { "C+": 51 }, { "C": 41 }, { "D": 33 }, { "F": 0 }
//     // ];
//     // const gradeMaxMarks = [
//     //     { "A+": 100 }, { "A": 90 }, { "B+": 80 }, { "B": 70 },
//     //     { "C+": 60 }, { "C": 50 }, { "D": 40 }, { "F": 32 }
//     // ];
//     // const coScholastic = ['work education', 'arts education', 'discipline'];
//     // const templateData = {
//     //     templateName: "T2",
//     //     examStructure: {
//     //         term1: {
//     //             theoryMaxMarks: 75,
//     //             theoryPassMarks: 25,
//     //             practicalMaxMarks: 25,
//     //             gradeMinMarks: gradeMinMarks,
//     //             gradeMaxMarks: gradeMaxMarks,
//     //             coScholastic: coScholastic,
//     //         },

//     //     }
//     // }


//     // // TEMPLATE T1 SECTION

//     // const gradeMinMarks = [
//     //     { "A+": 91 }, { "A": 81 }, { "B+": 71 }, { "B": 61 },
//     //     { "C+": 51 }, { "C": 41 }, { "D": 33 }, { "F": 0 }
//     // ];
//     // const gradeMaxMarks = [
//     //     { "A+": 100 }, { "A": 90 }, { "B+": 80 }, { "B": 70 },
//     //     { "C+": 60 }, { "C": 50 }, { "D": 40 }, { "F": 32 }
//     // ];
//     // const coScholastic = ['work education', 'arts education', 'discipline'];
//     // const templateData = {
//     //     templateName: "T1",
//     //     examStructure: {
//     //         term1: {
//     //             theoryMaxMarks: 100,
//     //             theoryPassMarks: 33,
//     //             gradeMinMarks: gradeMinMarks,
//     //             gradeMaxMarks: gradeMaxMarks,
//     //             coScholastic: coScholastic,
//     //         },

//     //     }
//     // }



//     try {

//         let examResultStructure = await MarksheetTemplateStructureModel.create(templateData)
//         return res.status(200).json('Exam result structure structure add successfully.');

//     } catch (error) {
//         return res.status(500).json('Internal Server Error !');;
//     }
// }

let DeleteResultStructure = async (req, res, next) => {
    try {
        const id = req.params.id;
        const resultStr = await MarksheetTemplateModel.findOne({ _id: id });

        if (!resultStr) {
            return res.status(404).json('Marksheet template not found!');
        }

        const { adminId, class: className, stream, templateName } = resultStr;
        const deleteOps = await Promise.all([
            MarksheetTemplateModel.findByIdAndRemove(id),
            ExamResultModel.deleteMany({ adminId: adminId, class: className, stream: stream })
        ]);

        const [deleteResultStructure, deleteResult] = deleteOps;


        return res.status(200).json('Marksheet template deleted successfully.');

    } catch (error) {
        return res.status(500).json('Internal Server Error!');
    }
};


module.exports = {
    GetSingleClassMarksheetTemplateByStream,
    GetSingleClassMarksheetTemplateStructureByStream,
    GetSingleMarksheetTemplateById,
    CreateExamResultStructure,
    DeleteResultStructure

}