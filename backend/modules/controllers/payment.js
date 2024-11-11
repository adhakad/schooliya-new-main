'use strict';
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { DateTime } = require('luxon');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const Payment = require('../models/payment');
const AdminPlan = require('../models/users/admin-plan');
const tokenService = require('../services/admin-token');
const {SMTP_API_KEY, SMTP_HOST,SENDER_EMAIL_ADDRESS, KEY_ID, KEY_SECRET } = process.env;
const smtp_host = SMTP_HOST;
const smtp_api_key = SMTP_API_KEY;
const sender_email_address = SENDER_EMAIL_ADDRESS;
const key_id = KEY_ID;
const key_secret = KEY_SECRET;

const razorpay = new Razorpay({
  key_id: key_id,
  key_secret: key_secret,
});

const transporter = nodemailer.createTransport({
  host: smtp_host,
    port: 587,
    secure: false,
    auth: {
        user: `apikey`,
        pass: smtp_api_key
    },
});


let CreatePayment = async (req, res) => {
  const { adminId, activePlan, amount, currency } = req.body;
  const paymentData = {
    amount: amount * 100,
    currency: currency,
  };
  try {
    const order = await razorpay.orders.create(paymentData);
    const payment = new Payment({
      adminId: adminId,
      activePlan: activePlan,
      orderId: order.id,
      amount: amount,
      currency,
    });
    await payment.save();
    console.log(payment)
    res.status(200).json({ order });
  } catch (error) {
    res.status(500).json({ errorMsg: 'Payment creation failed !' });
  }
};

let ValidatePayment = async (req, res) => {
  const { payment_id: paymentId, order_id: orderId, signature, email, id, activePlan, amount, currency, studentLimit } = req.body;
  const adminInfo = { id, email, activePlan, amount, currency };
  const paymentInfo = { paymentId, orderId, adminId: id, activePlan, amount, currency, status: 'success' };
  const secretKey = 'FSOyW8CV7EWDkj7ogD1jFgTX';
  const body = `${orderId}|${paymentId}`;
  
  try {
    const expectedSignature = crypto.createHmac("sha256", secretKey).update(body).digest("hex");
    if (expectedSignature !== signature) {
      return res.status(400).json({ errorMsg: 'Invailid signature!' });
    }
    
    const newPayment = await Payment.create(paymentInfo);
    console.log(newPayment)
    let expirationDate;
    const currentTime = new Date();
    const thirtyOneDaysInMillis =   31 * 24 * 60 * 60 * 1000;

    const existingAdminPlan = await AdminPlan.findOne({ adminId: id });
    if (existingAdminPlan) {
      const currentExpirationDate = new Date(existingAdminPlan.expirationDate);
      const oneMonthBeforeExpiration = new Date(currentExpirationDate.getTime() - thirtyOneDaysInMillis);
      
      if (currentTime >= oneMonthBeforeExpiration) {
        expirationDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); 
      } else {
        const remainingTime = currentExpirationDate - currentTime;
        expirationDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 + remainingTime);
      }
    } else {
      expirationDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    }

    const updatedAdminPlan = await AdminPlan.findOneAndUpdate(
      { adminId: id },
      {
        $set: {
          paymentId,
          orderId,
          email,
          activePlan,
          amount,
          currency,
          studentLimit,
          paymentStatus: true,
          expirationDate,
          expiryStatus: false
        }
      },
      { upsert: true, new: true }
    );

    if (!updatedAdminPlan) {
      return res.status(400).json({ errorMsg: 'Failed to create or update admin plan!' });
    }

    sendEmail(email);
    const payload = { id, email };
    const accessToken = await tokenService.getAccessToken(payload);
    const refreshToken = await tokenService.getRefreshToken(payload);

    return res.status(200).json({ success: true,accessToken, refreshToken, adminInfo, successMsg: 'Payment successfully Received.' });
  } catch (error) {
    return res.status(500).json({ errorMsg: 'Error validating payment!' });
  }
};

async function sendEmail(email) {
  const mailOptions = {
    from: { name: 'Schooliya', address: sender_email_address },
    to: email,
    subject: 'Payment Confirmation & Invoice from Schooliya',
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f3f4f6; padding: 30px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px 40px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
          <h1 style="color: #8C52FF; text-align: center; margin-bottom: 0;">Schooliya</h1>
          <h4 style="color: #333; text-align: center; font-weight: normal; margin-top: 5px;">Payment Confirmation & Invoice</h4>
          <hr style="border: 0; height: 1px; background: #ddd; margin: 20px 0;">
          
          <p style="color: #555; font-size: 16px;">Hello,</p>
          <p style="color: #555; font-size: 16px; line-height: 1.6;">
            We are excited to confirm that we have received your payment. Your Schooliya account is now active and ready to use. Below is a summary of your transaction.
          </p>

          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-top: 20px; border: 1px solid #e3e5e8;">
            <h3 style="color: #333; margin: 0; font-size: 18px;">Invoice Summary</h3>
            <table style="width: 100%; font-size: 15px; color: #333; margin-top: 10px; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #ddd;">Invoice Number:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #ddd; text-align: right;">SH_12345</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #ddd;">Payment Date:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #ddd; text-align: right;">01/11/2024</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #ddd;">Amount Paid:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #ddd; text-align: right;">₹2999</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #ddd;">Plan Type:</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #ddd; text-align: right;">Basic</td>
              </tr>
            </table>
          </div>

          <p style="color: #555; font-size: 16px; line-height: 1.6; margin-top: 20px;">
            Thank you for choosing Schooliya! If you have any questions, please feel free to reach out to us at 
            <a href="mailto:support@schooliya.com" style="color: #8C52FF; text-decoration: none;">support@schooliya.com</a>.
          </p>
          
          <p style="color: #555; font-size: 16px; margin-top: 30px; text-align: center;">
            Warm regards,<br>
            <strong>Schooliya Team</strong>
          </p>
        </div>
      </div>
    `
  };
  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    res.status(500).json({ errorMsg: 'Error sending email!' });
  }
}

// async function sendEmail(email) {
//     const mailOptions = {
//       from: { name: 'Schooliya', address: sender_email_address },
//       to: email,
//       subject: 'Payment Confirmation & Invoice from Schooliya',
//       html: `
//         <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
//           <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 8px;">
//             <h2 style="color: #8C52FF; text-align: center;">Schooliya</h2>
//             <p style="color: #666;">Hello ${email},</p>
//             <p style="color: #666;">We are excited to confirm that we have received your payment. Your Schooliya account is now active and ready to use.</p>
//             <hr style="border: 0; height: 1px; background: #ddd;">
//             <h3 style="color: #333;">Invoice Summary</h3>
//             <table style="width: 100%; font-size: 14px; color: #333; border-collapse: collapse;">
//               <tr>
//                 <td style="padding: 8px; border: 1px solid #ddd;">Invoice Number:</td>
//                 <td style="padding: 8px; border: 1px solid #ddd;">SH_12345</td>
//               </tr>
//               <tr>
//                 <td style="padding: 8px; border: 1px solid #ddd;">Payment Date:</td>
//                 <td style="padding: 8px; border: 1px solid #ddd;">01/11/2024</td>
//               </tr>
//               <tr>
//                 <td style="padding: 8px; border: 1px solid #ddd;">Amount Paid:</td>
//                 <td style="padding: 8px; border: 1px solid #ddd;">2999</td>
//               </tr>
//               <tr>
//                 <td style="padding: 8px; border: 1px solid #ddd;">Plan Type:</td>
//                 <td style="padding: 8px; border: 1px solid #ddd;">Basic</td>
//               </tr>
//             </table>
//             <hr style="border: 0; height: 1px; background: #ddd;">
//             <p style="color: #666;">Thank you for choosing Schooliya! If you have any questions, please reach out to us at <a href="mailto:support@schooliya.com" style="color: #8C52FF;">support@schooliya.com</a>.</p>
//             <p style="color: #666;">Warm regards,<br>Schooliya Team</p>
//           </div>
//         </div>
//       `
//     };
//     try {
//     await transporter.sendMail(mailOptions);
//   } catch (error) {
//     res.status(500).json({ errorMsg: 'Error sending email !' });
//   }
// }
module.exports = {
  CreatePayment,
  ValidatePayment
}