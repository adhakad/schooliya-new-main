'use strict';
const StudentModel = require('../models/student');
const FeesCollectionModel = require('../models/fees-collection');
const ReminderModel = require('../models/reminder');
const { feesReminderMessage } = require('../services/send-whatsapp-message');


const sendManualFeeReminder = async (req, res) => {
    try {
        let {
            adminId,
            stream,
            minPercentage,
            lastPaymentDays,
            lastReminderDays,
        } = req.body;

        const className = req.body.class;

        if (stream === "stream") {
            stream = "n/a";
        }

        const now = new Date();
        const students = await StudentModel.find({
            adminId,
            class: className,
            stream,
        });
        let count = 0;

        for (const student of students) {
            const fee = await FeesCollectionModel.findOne({
                adminId:adminId,
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
            const lastReminder = await ReminderModel.findOne({
                adminId:adminId,
                studentId: student._id,
            });
            if (
                lastReminder?.lastReminderSentAt &&
                (now - new Date(lastReminder.lastReminderSentAt)) / (1000 * 60 * 60 * 24) < lastReminderDays
            ) {
                continue;
            }
            const schoolName = "Green Valley School, Guna";

            let phone = student?.parentsContact;
            if (!phone) continue;
            phone = `${phone}`;

            const fatherName = `${student.fatherName}`;
            const studentName = `${student.name}`;
            const pendingAmount = `${fee.AllDueFees}`;
            const lastDate = `30-08-2025`;
            await feesReminderMessage(
                phone,
                schoolName,
                fatherName,
                pendingAmount,
                studentName,
                className,
                lastDate
            );
            await ReminderModel.findOneAndUpdate(
                { adminId, studentId: student._id },
                {
                    lastReminderSentAt: now,
                    createdAt: now,
                },
                { upsert: true }
            );

            count++;
        }

        // return res.status(200).json({ message: `✅ ${count} reminders sent.` });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    sendManualFeeReminder
}