'use strict';
const { SMTP_API_KEY, SMTP_HOST, SENDER_EMAIL_ADDRESS } = process.env;
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const speakeasy = require('speakeasy');
const tokenService = require('../../services/admin-token');
const AdminUserModel = require('../../models/users/admin-user');
const AdminPlanModel = require('../../models/users/admin-plan');
const PaymentModel = require('../../models/payment');
const OTPModel = require('../../models/otp');
const smtp_host = SMTP_HOST;
const smtp_api_key = SMTP_API_KEY;
const sender_email_address = SENDER_EMAIL_ADDRESS;

const transporter = nodemailer.createTransport({
    host: smtp_host,
    port: 587,
    secure: false,
    auth: {
        user: `apikey`,
        pass: smtp_api_key
    },
});


let LoginAdmin = async (req, res, next) => {
    try {
        let { email, password } = req.body;
        let admin = await AdminUserModel.findOne({ email: email });
        if (!admin) {
            return res.status(404).json({ errorMsg: 'Username or password invalid!' });
        }
        if (!admin.verified) {
            return res.status(400).json({ errorMsg: `Your plan purchase process is incomplete. Please complete the purchase process to enjoy Schooliya's services!` });
        }
        let adminId = admin._id;
        let adminPlan = await AdminPlanModel.findOne({ adminId: adminId });
        if (!adminPlan) {
            return res.status(404).json({ errorMsg: `Your plan purchase process is incomplete. Please complete the purchase process to enjoy Schooliya's services!` });
        }

        if (adminPlan.expiryStatus === true) {
            return res.status(400).json({ errorMsg: `Your ${adminPlan.activePlan} plan has expired. Please purchase your plan to continue enjoying Schooliya's services!` });
        }
        const passwordMatch = await bcrypt.compare(password, admin.password);
        if (!passwordMatch) {
            return res.status(400).json({ errorMsg: 'Username or password invalid!' });
        }
        const payload = { id: admin._id, email: admin.email };
        const accessToken = await tokenService.getAccessToken(payload);
        const refreshToken = await tokenService.getRefreshToken(payload);
        return res.status(200).json({ adminInfo: admin, accessToken, refreshToken });
        // }
        // return res.status(400).json({ errorMsg: 'Login error !' })
    } catch (error) {
        return res.status(500).json({ errorMsg: 'Internal Server Error!' });
    }
}

let RefreshToken = async (req, res, next) => {
    try {
        const { token } = req.body
        if (token) {
            const payload = await tokenService.verifyRefreshToken(token)
            const accessToken = await tokenService.getAccessToken(payload)
            res.send({ accessToken })
        }
        else {
            res.status(403).send('Token unavailable!')
        }
    } catch (err) {
        res.status(500).json(err)
    }
}

let SignupAdmin = async (req, res, next) => {
    function generateSecureOTP() {
        const otp = crypto.randomInt(100000, 1000000); // Generates a number between 100000 and 999999
        return otp;
    }
    const secureOtp = generateSecureOTP();

    const { email, password, name, mobile, city, state, address, pinCode, schoolName, affiliationNumber } = req.body;
    try {
        const existingUser = await AdminUserModel.findOne({ email });
        if (existingUser) {
            if (!existingUser.verified) {
                await OTPModel.deleteMany({ email });
                await OTPModel.create({ email, secureOtp: secureOtp });
                sendEmail(email, secureOtp);
                return res.status(400).json({ verified: false, paymentMode: true, email });
            }
            if (existingUser.verified) {
                let adminId = existingUser._id;
                const existingUserPlan = await AdminPlanModel.findOne({ adminId: adminId });
                if (!existingUserPlan) {
                    return res.status(400).json({ verified: true, paymentMode: true, email, adminInfo: existingUser });
                }
                if (existingUserPlan) {
                    if (existingUserPlan.expiryStatus == true) {
                        return res.status(400).json({ verified: true, paymentMode: true, email, adminInfo: existingUser });
                    }
                    return res.status(400).json({ verified: true, paymentMode: false, errorMsg: `Your ${existingUserPlan.activePlan} plan is already active, enjoy your services!` });
                }
            }

        }
        let schoolId = 0;
        let lastIssuedSchoolId = await AdminUserModel.findOne({}).sort({ _id: -1 });
        if (!lastIssuedSchoolId) {
            schoolId = 100001 + schoolId;
        }
        if (lastIssuedSchoolId) {
            schoolId = lastIssuedSchoolId.schoolId + 1;
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const userData = {
            email,
            password: hashedPassword,
            name,
            mobile,
            city,
            state,
            address,
            pinCode,
            schoolName,
            affiliationNumber,
            schoolId: schoolId
        };

        const [createdUser, createdOTP] = await Promise.all([
            AdminUserModel.create(userData),
            OTPModel.create({ email, secureOtp: secureOtp })
        ]);
        sendEmail(email, secureOtp);
        return res.status(200).json({ successMsg: 'Admin registered successfully.', email });
    } catch (error) {
        return res.status(500).json({ errorMsg: 'Internal Server Error!' });
    }
}

let ForgotPassword = async (req, res, next) => {
    function generateSecureOTP() {
        const otp = crypto.randomInt(100000, 1000000); // Generates a number between 100000 and 999999
        return otp;
    }
    const secureOtp = generateSecureOTP();
    try {
        const { email } = req.body;
        const admin = await AdminUserModel.findOne({ email: email });
        if (!admin) {
            return res.status(404).json({ errorMsg: 'Email address not found!' });
        }
        if (!admin.verified) {
            return res.status(400).json({ errorMsg: `Your plan purchase process is incomplete. Please complete the purchase process to enjoy Schooliya's services!` });
        }
        let adminId = admin._id;
        let adminPlan = await AdminPlanModel.findOne({ adminId: adminId });
        if (!adminPlan) {
            return res.status(404).json({ errorMsg: `Your plan purchase process is incomplete. Please complete the purchase process to enjoy Schooliya's services!` });
        }
        if (adminPlan.expiryStatus === true) {
            return res.status(400).json({ errorMsg: `Your ${adminPlan.activePlan} plan has expired. Please purchase your plan to continue enjoying Schooliya's services!` });
        }
        await OTPModel.deleteMany({ email });
        const createdOTP = await OTPModel.create({ email, secureOtp: secureOtp });
        sendEmail(email, secureOtp);
        return res.status(200).json({ successMsg: 'Forgot password otp send successfully.', email: email });

    } catch (error) {
        return res.status(500).json({ errorMsg: 'Internal Server Error!' });
    }
}

async function sendEmail(email, secureOtp) {
    const mailOptions = {
        from: { name: 'Schooliya', address: sender_email_address },
        to: email,
        subject: 'Your OTP for Email Verification',
        html: `<div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px; border-radius: 10px; max-width: 600px; margin: auto;">
            <p style="color: #555; font-size: 16px;">
                We received a request to verify your email address for your Schooliya account. Please use the OTP below to complete your verification:
            </p>
            <p style="font-size: 22px; color: #000; text-align: center; letter-spacing: 2px; margin: 20px 0;"><strong>${secureOtp}</strong></p>
            <p style="color: #555; font-size: 16px;">
                If you didn’t request this, please ignore this email.
            </p>
            <p style="color: #555; font-size: 16px;">
                Best regards,<br/>
                The Schooliya Team
            </p>
        </div>`
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        res.status(500).json({ errorMsg: 'Error sending email!' });
    }
}


let VerifyOTP = async (req, res, next) => {

    try {
        const email = req.body.email;
        const userEnteredOTP = parseInt(req.body.otp);
        const user = await AdminUserModel.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ errorMsg: "Email does not exist!" });
        }
        const otp = await OTPModel.findOne({ email: email });
        if (!otp) {
            return res.status(404).json({ errorMsg: "Your OTP has expired!" });
        }
        if (userEnteredOTP !== otp.secureOtp) {
            return res.status(400).json({ errorMsg: "Invalid OTP!" });

        }
        if (userEnteredOTP == otp.secureOtp) {
            const objectId = user._id;
            let update = await AdminUserModel.findByIdAndUpdate(objectId, { $set: { verified: true } }, { new: true });
            if (update) {
                return res.status(200).json({ successMsg: "Congratulations! Your email has been successfully verified. You can now proceed with your payment.", verified: true, adminInfo: user });
            }
        }
    } catch (err) {
        return res.status(500).json({ errorMsg: "Internal server error!" });
    }
}

let ResetPassword = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const user = await AdminUserModel.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ errorMsg: "Email does not exist!" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const resetAdminUserInfo = {
            password: hashedPassword,
        }
        const objectId = user._id;
        const updateAdminUser = await AdminUserModel.findByIdAndUpdate(objectId, { $set: resetAdminUserInfo }, { new: true });
        if (updateAdminUser) {
            return res.status(200).json({ successMsg: 'Password reset successfully.' });
        }
    } catch (error) {
        return res.status(500).json({ errorMsg: 'Internal Server Error!' });
    }
}
let GetSingleAdminUser = async (req, res, next) => {
    try {
        const singleAdminPlan = await AdminPlanModel.findOne({ adminId: req.params.adminId });
        const objectId = singleAdminPlan.adminId;
        const singleAdminUser = await AdminUserModel.findOne({ _id: objectId });
        return res.status(200).json(singleAdminUser);
    } catch (error) {
        return res.status(500).json('Internal Server Error!');
    }
}
let GetSingleAdminPlan = async (req, res, next) => {
    try {
        const singleAdminPlan = await AdminPlanModel.findOne({ adminId: req.params.adminId });
        return res.status(200).json(singleAdminPlan);
    } catch (error) {
        return res.status(500).json('Internal Server Error!');
    }
}

module.exports = {
    LoginAdmin,
    RefreshToken,
    SignupAdmin,
    ForgotPassword,
    ResetPassword,
    VerifyOTP,
    GetSingleAdminPlan,
    GetSingleAdminUser
}