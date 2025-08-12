'use strict';
const SchoolModel = require('../models/school');
const StudentModel = require('../models/student');
const FeesCollectionModel = require('../models/fees-collection');
const ReminderLogsModel = require('../models/reminder-logs');
const ReminderFilterModel = require('../models/reminder-filter');
const WhatsappMessageWalletModel = require('../models/wallet/whatsapp-message-wallet');
const { sendManualFeeReminder } = require('../services/send-whatsapp-message');
const { checkWhatsappLimit, updateWhatsappUsage } = require('../services/whatsapp-message-wallet');


const StudentFilter = async (req, res) => {
    try {
        let {
            adminId,
            minPercentage,
            lastPaymentDays,
            lastReminderDays,
            class: className
        } = req.body;

        const now = new Date();
        const schoolInfo = await SchoolModel.findOne({ adminId });
        if (!schoolInfo) {
            return res.status(404).json({ errorMsg: "School detail not found!" });
        }
        const students = await StudentModel.find({ adminId, class: className }).lean();
        if (!students.length) {
            return res.status(200).json({
                filterStudentCount: 0,
                studentFilterData: [],
                allFilters: { className, minPercentage, lastPaymentDays, lastReminderDays },
                filterStatus: false
            });
        }

        const studentIds = students.map(s => s._id);
        const feesData = await FeesCollectionModel.find({
            adminId,
            studentId: { $in: studentIds }
        }).lean();
        const reminderLogs = await ReminderLogsModel.find({
            adminId,
            studentId: { $in: studentIds }
        }).lean();

        // Convert reminder logs to Map for quick lookup
        const reminderMap = new Map();
        reminderLogs.forEach(log => {
            reminderMap.set(log.studentId.toString(), log);
        });

        // Convert fees data to Map for quick lookup
        const feesMap = new Map();
        feesData.forEach(fee => {
            feesMap.set(fee.studentId.toString(), fee);
        });

        let studentFilterData = [];
        for (const student of students) {
            const fee = feesMap.get(student._id.toString());
            if (minPercentage !== 0) {
                if (!fee || fee.AllDueFees <= 0 || fee.AllTotalFees === 0) continue;

                const paidPercentage = Number(((fee.AllPaidFees / fee.AllTotalFees) * 100).toFixed(2));
                if (paidPercentage >= minPercentage) continue;
                if (!fee || fee.AllDueFees <= 0 || fee.AllTotalFees === 0) continue;
            }
            if (minPercentage == 0) {
                if (!fee || fee.AllDueFees <= 0) continue;
            }

            const lastPay = fee.paymentDate?.[fee.paymentDate.length - 1];
            if (lastPaymentDays > 0 && lastPay) {
                const daysSincePay = (now - new Date(lastPay)) / (1000 * 60 * 60 * 24);
                if (daysSincePay < lastPaymentDays) continue;
            }

            const reminder = reminderMap.get(student._id.toString());
            if (lastReminderDays > 0 && reminder?.lastReminderSentAt) {
                const daysSinceReminder = (now - new Date(reminder.lastReminderSentAt)) / (1000 * 60 * 60 * 24);
                if (daysSinceReminder < lastReminderDays) continue;
            }
            if (!student.parentsContact) continue;

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
        }
        return res.status(200).json({
            filterStudentCount: studentFilterData.length,
            studentFilterData,
            allFilters: { className, minPercentage, lastPaymentDays, lastReminderDays },
            filterStatus: studentFilterData.length > 0
        });

    } catch (err) {
        console.error('Error in StudentFilter:', err);
        return res.status(500).json({ message: 'Server Error', error: err.message });
    }
};


const StudentFilterCreate = async (req, res) => {
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
        const allFiltersData = {
            adminId: adminId,
            class: className,
            minPercentage: minPercentage,
            lastPaymentDays: lastPaymentDays,
            lastReminderDays: lastReminderDays
        }
        const createReminderFilter = await ReminderFilterModel.create(allFiltersData);
        return res.status(200).json('Fee reminder filters created successfully');
    } catch (err) {
        return res.status(500).json({ message: 'Server Error', error: err.message });
    }
};

const SendManualFeeReminder = async (req, res) => {
    const now = new Date();

    try {
        const { adminId, students } = req.body; // students = array of { studentId }
        const studentIds = students.map(s => s.studentId);
        const totalMessages = students.length; // 1 student = 1 message

        /** 🔹 Step 1: Check WhatsApp Message Limit */
        const limitCheck = await checkWhatsappLimit(adminId, totalMessages);
        if (!limitCheck.isAllowed) {
            return res.status(400).json({ errorMsg: limitCheck.message });
        }
        /** 1️⃣ School Info */
        const schoolInfo = await SchoolModel.findOne(
            { adminId },
            "schoolName affiliationNumber street city district state"
        );
        if (!schoolInfo) {
            return res.status(404).json({ errorMsg: "School detail not found!" });
        }

        /** 2️⃣ Fetch Required Data in Bulk (Only Given IDs) */
        const [studentList, feeRecords, reminderLogs] = await Promise.all([
            StudentModel.find(
                { adminId, _id: { $in: studentIds } },
                "name fatherName parentsContact class"
            ),
            FeesCollectionModel.find(
                { adminId, studentId: { $in: studentIds } },
                "studentId AllDueFees AllTotalFees AllPaidFees paymentDate"
            ),
            ReminderLogsModel.find(
                { adminId, studentId: { $in: studentIds } },
                "studentId lastReminderSentAt"
            )
        ]);

        /** 3️⃣ Quick Lookup Maps */
        const feeMap = new Map(feeRecords.map(fee => [fee.studentId.toString(), fee]));
        const reminderMap = new Map(reminderLogs.map(log => [log.studentId.toString(), log]));

        /** 4️⃣ Prepare WhatsApp Reminder Tasks */
        const whatsappTasks = [];
        const reminderUpdates = [];
        let sentCount = 0;

        for (const student of studentList) {
            const studentId = student._id.toString();
            const feeData = feeMap.get(studentId) || {};

            if (!student.parentsContact) {
                console.warn(`Skipping ${student.name}: No parent contact found.`);
                continue;
            }

            // Prepare a WhatsApp reminder sending task
            whatsappTasks.push(async () => {
                const { requestId, sentDateTime } = await sendManualFeeReminder(
                    student.parentsContact,
                    `${schoolInfo.schoolName}, ${schoolInfo.city}`,
                    student.fatherName,
                    feeData.AllDueFees,
                    student.name,
                    student.class,
                    "30-08-2025"
                );

                if (requestId) {
                    sentCount++;
                    reminderUpdates.push({
                        updateOne: {
                            filter: { adminId, studentId },
                            update: {
                                $set: { lastReminderSentAt: now },
                                $push: {
                                    logs: {
                                        requestId,
                                        status: "sent",
                                        sentAt: sentDateTime
                                    }
                                }
                            },
                            upsert: true
                        }
                    });
                }
            });
        }

        /** 5️⃣ Send WhatsApp Reminders (Concurrency Limited) */
        await runWithConcurrencyLimit(whatsappTasks, 20);

        /** 6️⃣ Update Reminder Logs in Bulk */
        if (reminderUpdates.length > 0) {
            await ReminderLogsModel.bulkWrite(reminderUpdates);
        }

        if (sentCount > 0) {
            await updateWhatsappUsage(adminId, sentCount);
        }
        const reminderMessage = sentCount === 1
            ? `1  student has been successfully sent a whatsapp fee reminder.`
            : `${sentCount}  students have been successfully sent whatsapp fee reminders.`;

        return res.status(200).json({ message: reminderMessage });

    } catch (err) {
        console.error("Error in sending manual fee reminder:", err);
        return res.status(500).json({ message: "Server Error", error: err.message });
    }
};

/** Helper: Run async tasks with concurrency limit */
async function runWithConcurrencyLimit(tasks, limit) {
    const running = new Set();
    for (const task of tasks) {
        const promise = task().finally(() => running.delete(promise));
        running.add(promise);
        if (running.size >= limit) {
            await Promise.race(running);
        }
    }
    await Promise.all(running);
}




module.exports = {
    StudentFilter,
    StudentFilterCreate,
    SendManualFeeReminder
}