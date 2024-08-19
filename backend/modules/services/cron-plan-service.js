'use strict';
const AdminPlan = require('../models/users/admin-plan');

/**
 * यह फ़ंक्शन चेक करता है कि योजनाओं की समाप्ति तिथि समाप्त हो चुकी है या नहीं।
 * यदि समाप्त हो चुकी है, तो expiryStatus को true पर सेट करता है।
 */
const checkAndUpdateExpiredPlans = async () => {
  const currentTime = new Date();

  try {
    // उन योजनाओं को खोजें जिनकी समाप्ति तिथि समाप्त हो चुकी है और expiryStatus अभी false है
    const expiredPlans = await AdminPlan.find({
      expirationDate: { $lte: currentTime },
      expiryStatus: false
    });

    console.log(expiredPlans)

    if (expiredPlans.length > 0) {
      // समाप्त हो चुकी योजनाओं के expiryStatus को true पर सेट करें
      await AdminPlan.updateMany(
        { _id: { $in: expiredPlans.map(plan => plan._id) } },
        { $set: { expiryStatus: true } }
      );
      console.log('Expired plans updated successfully.');
    } else {
      console.log('No plans need to be updated.');
    }
  } catch (error) {
    console.error('Error checking or updating expired plans:', error);
  }
};

module.exports = {
  checkAndUpdateExpiredPlans
};