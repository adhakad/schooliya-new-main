const StudentModel = require('../models/student');
const FeesCollectionModel = require('../models/fees-collection');
const ReminderModel = require('../models/reminder');
const { feesReminderMessage } = require('../services/send-whatsapp-message');
const phone = '9340700360';

const value = [
    "Green Valley School, Guna, Madhya Pradesh",
    "Bhanvar Singh",
    "15000",
    "BhagyaShree Chohan",
    "8TH",
    "24-07-2025",
];

const sendManualFeeReminder = async (req, res) => {
    try {
        const {
            adminId,
            className,
            stream = 'n/a',
            minPercentage,
            lastPaymentDays,
            lastReminderDays,
        } = req.body;

        const now = new Date();

        const students = await StudentModel.find({
            adminId,
            class: className,
            stream,
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

            const lastReminder = await ReminderModel.findOne({
                adminId,
                studentId: student._id,
            });

            if (
                lastReminder &&
                (now - new Date(lastReminder.lastReminderSentAt)) / (1000 * 60 * 60 * 24) < lastReminderDays
            ) {
                continue;
            }

            await feesReminderMessage(phone, value)

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

        return res.status(200).json({ message: `✅ ${count} reminders sent.` });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { sendManualFeeReminder };
