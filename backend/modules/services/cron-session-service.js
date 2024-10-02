'use strict';
const AcademicSessionModel = require('../models/academic-session');

// Function to update academic session
const checkAndUpdateAcademicSession = async () => {
  const currentYear = new Date().getFullYear();
  const newSession = `${currentYear}-${currentYear + 1}`; // Current academic session

  try {
    // Update or create new session for the current year
    await AcademicSessionModel.updateOne(
      {}, // Match any existing session
      { academicSession: newSession, createdAt: new Date() }, // Update the session and createdAt fields
      { upsert: true } // If session doesn't exist, create a new one
    );
    console.log('Academic session updated to:', newSession);
  } catch (error) {
    console.error('Error updating academic session:', error);
  }
};

module.exports = { checkAndUpdateAcademicSession };
