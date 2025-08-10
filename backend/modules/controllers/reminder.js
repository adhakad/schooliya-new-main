'use strict';
const SchoolModel = require('../models/school');
const StudentModel = require('../models/student');
const FeesCollectionModel = require('../models/fees-collection');
const ReminderLogsModel = require('../models/reminder-logs');
const { sendManualFeeReminder } = require('../services/send-whatsapp-message');


const StudentFilter = async (req, res) => {
    try {
        let {
            adminId,
            minPercentage,
            lastPaymentDays,
            lastReminderDays,
        } = req.body;

        const className = req.body.class;

        const schoolInfo = await SchoolModel.findOne({ adminId });
        if (!schoolInfo) {
            return res.status(404).json({ errorMsg: "School detail not found!" });
        }

        const students = await StudentModel.find({
            adminId,
            class: className
        });

        let count = 0;
        let studentFilterData = [];
        const now = new Date();

        for (const student of students) {
            const fee = await FeesCollectionModel.findOne({
                adminId,
                studentId: student._id,
            });

            if (!fee || fee.AllDueFees <= 0 || fee.AllTotalFees === 0) continue;

            const paidPercentage = (fee.AllPaidFees / fee.AllTotalFees) * 100;
            if (paidPercentage >= minPercentage) continue;

            const lastPay = fee.paymentDate?.[fee.paymentDate.length - 1];
            if (lastPay) {
                const diff = (now - new Date(lastPay)) / (1000 * 60 * 60 * 24);
                if (diff < lastPaymentDays) continue;
            }

            const lastReminder = await ReminderLogsModel.findOne({
                adminId,
                studentId: student._id,
            });

            if (
                lastReminder?.lastReminderSentAt &&
                (now - new Date(lastReminder.lastReminderSentAt)) / (1000 * 60 * 60 * 24) < lastReminderDays
            ) {
                continue;
            }

            let phone = `${student?.parentsContact}`;
            if (!phone) continue;

            studentFilterData.push({
                studentId: student._id,
                adminId: student.adminId,
                fatherName: student.fatherName,
                motherName: student.motherName,
                name: student.name,
                dob: student.dob,
                admissionNo: student.admissionNo,
                parentsContact: student.parentsContact,
                paidAmount: fee.AllPaidFees,
                pendingAmount: fee.AllDueFees
            });

            count++;
        }

        return res.status(200).json({
            filterStudentCount: count,
            studentFilterData: studentFilterData,
            filterStatus: true
        });

    } catch (err) {
        return res.status(500).json({ message: 'Server Error', error: err.message });
    }
};


const SendManualFeeReminder = async (req, res) => {
    const now = new Date();
    try {
        let {
            adminId,
            minPercentage,
            lastPaymentDays,
            lastReminderDays,
        } = req.body;

        const className = req.body.class;

        const schoolInfo = await SchoolModel.findOne({ adminId }, 'schoolName affiliationNumber street city district state');
        if (!schoolInfo) {
            return res.status(404).json({ errorMsg: "School detail not found!" });
        }

        const students = await StudentModel.find({
            adminId,
            class: className
        });

        let count = 0;

        for (const student of students) {
            const fee = await FeesCollectionModel.findOne({
                adminId,
                studentId: student._id,
            });

            if (!fee || fee.AllDueFees <= 0 || fee.AllTotalFees === 0) continue;

            const paidPercentage = (fee.AllPaidFees / fee.AllTotalFees) * 100;
            if (paidPercentage >= minPercentage) continue;

            const lastPay = fee.paymentDate?.[fee.paymentDate.length - 1];
            if (lastPay) {
                const diff = (now - new Date(lastPay)) / (1000 * 60 * 60 * 24);
                if (diff < lastPaymentDays) continue;
            }

            const lastReminder = await ReminderLogsModel.findOne({
                adminId,
                studentId: student._id,
            });

            if (
                lastReminder?.lastReminderSentAt &&
                (now - new Date(lastReminder.lastReminderSentAt)) / (1000 * 60 * 60 * 24) < lastReminderDays
            ) {
                continue;
            }

            let schoolName = `${schoolInfo.schoolName}, ${schoolInfo.city}`;
            let phone = `${student?.parentsContact}`;
            if (!phone) continue;

            const fatherName = student.fatherName;
            const studentName = student.name;
            const pendingAmount = fee.AllDueFees;
            const lastDate = `30-08-2025`;

            const { requestId, sentDateTime } = await sendManualFeeReminder(
                phone,
                schoolName,
                fatherName,
                pendingAmount,
                studentName,
                className,
                lastDate
            );
            if (!requestId) {
                console.warn(`Failed to send SMS to ${phone}`);
                continue;
            }
            const messageLog = {
                requestId: requestId,
                status: 'sent',
                sentAt: sentDateTime
            };

            await ReminderLogsModel.findOneAndUpdate(
                { adminId, studentId: student._id },
                {
                    $set: {
                        lastReminderSentAt: now,
                    },
                    $push: {
                        logs: messageLog
                    }
                },
                { upsert: true }
            );

            count++;
        }
        return res.status(200).json({ message: `${count} reminders sent.` });
    } catch (err) {
        console.error('Error in send manual fee reminder:', err);
        return res.status(500).json({ message: 'Server Error', error: err.message });
    }
};


module.exports = {
    StudentFilter,
    SendManualFeeReminder
}