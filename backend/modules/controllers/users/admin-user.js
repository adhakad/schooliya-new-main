'use strict';
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const speakeasy = require('speakeasy');
const tokenService = require('../../services/admin-token');
const AdminUserModel = require('../../models/users/admin-user');
const AdminPlanModel = require('../../models/users/admin-plan');
const PaymentModel = require('../../models/payment');
const OTPModel = require('../../models/otp');

const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: `dhakaddeepak9340700360@gmail.com`,
        pass: 'cbgcwsgpajyhvztj'
    },
});


let LoginAdmin = async (req, res, next) => {
    try {
        let { email, password } = req.body;
        let admin = await AdminUserModel.findOne({ email: email });
        if (!admin) {
            return res.status(404).json({ errorMsg: 'Username or password invalid !' });
        }
        if (!admin.verified) {
            return res.status(400).json({ errorMsg: `Your plan purchase process is incomplete. Please complete the purchase process to enjoy Schooliya's services.` });
        }
        let adminId = admin._id;
        let adminPlan = await AdminPlanModel.findOne({ adminId: adminId });
        if (!adminPlan) {
            return res.status(404).json({ errorMsg: `Your plan purchase process is incomplete. Please complete the purchase process to enjoy Schooliya's services.` });
        }

        if (adminPlan.expiryStatus === true) {
            return res.status(400).json({ errorMsg: `Your ${adminPlan.activePlan} plan has expired. Please purchase your plan to continue enjoying Schooliya's services.` });
        }
        const passwordMatch = await bcrypt.compare(password, admin.password);
        if (!passwordMatch) {
            return res.status(400).json({ errorMsg: 'Username or password invalid !' });
        }
        const payload = { id: admin._id, email: admin.email };
        const accessToken = await tokenService.getAccessToken(payload);
        const refreshToken = await tokenService.getRefreshToken(payload);
        return res.status(200).json({ adminInfo: admin, accessToken, refreshToken });
        // }
        // return res.status(400).json({ errorMsg: 'Login error !' })
    } catch (error) {
        return res.status(500).json({ errorMsg: 'Internal Server Error !' });
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
            res.status(403).send('token Unavailable!!')
        }
    } catch (err) {
        res.status(500).json(err)
    }
}

let SignupAdmin = async (req, res, next) => {
    const secret = speakeasy.generateSecret({ length: 20 });
    const { email, password, name, mobile, city, state, address, pinCode, schoolName, affiliationNumber } = req.body;
    try {
        const existingUser = await AdminUserModel.findOne({ email });
        if (existingUser) {
            if (!existingUser.verified) {
                await OTPModel.deleteMany({ email });
                const token = speakeasy.totp({
                    secret: secret.base32,
                    encoding: 'base32'
                });
                await OTPModel.create({ email, secret: secret.base32 });
                sendEmail(email, token);
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
                    return res.status(400).json({ verified: true, paymentMode: false, errorMsg: `Your ${existingUserPlan.activePlan} plan is already active, enjoy your services.` });
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
            OTPModel.create({ email, secret: secret.base32 })
        ]);
        const token = speakeasy.totp({
            secret: createdOTP.secret,
            encoding: 'base32'
        });
        sendEmail(email, token);
        return res.status(200).json({ successMsg: 'Admin registered successfully.', email });
    } catch (error) {
        return res.status(500).json({ errorMsg: 'Internal Server Error!' });
    }
}

let ForgotPassword = async (req, res, next) => {
    const secret = speakeasy.generateSecret({ length: 20 });
    try {
        const { email } = req.body;
        const admin = await AdminUserModel.findOne({ email: email });
        if (!admin) {
            return res.status(404).json({ errorMsg: 'Email address not found !' });
        }
        if (!admin.verified) {
            return res.status(400).json({ errorMsg: `Your plan purchase process is incomplete. Please complete the purchase process to enjoy Schooliya's services.` });
        }
        let adminId = admin._id;
        let adminPlan = await AdminPlanModel.findOne({ adminId: adminId });
        if (!adminPlan) {
            return res.status(404).json({ errorMsg: `Your plan purchase process is incomplete. Please complete the purchase process to enjoy Schooliya's services.` });
        }
        if (adminPlan.expiryStatus === true) {
            return res.status(400).json({ errorMsg: `Your ${adminPlan.activePlan} plan has expired. Please purchase your plan to continue enjoying Schooliya's services.` });
        }
        const createdOTP = await OTPModel.create({ email, secret: secret.base32 });
        const token = speakeasy.totp({
            secret: createdOTP.secret,
            encoding: 'base32'
        });
        sendEmail(email, token);
        return res.status(200).json({ successMsg: 'Forgot password otp send successfully.', email: email });

    } catch (error) {
        return res.status(500).json({ errorMsg: 'Internal Server Error !' });
    }
}

async function sendEmail(email, token) {
    const mailOptions = {
        from: { name: 'Schooliya', address: 'dhakaddeepak9340700360@gmail.com' },
        to: email,
        subject: 'OTP for Email Verification',
        html: `<div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
        <p style="color: #666;">You have requested an OTP to verify your Schooliya account. If this was you, please input the code below to continue.</p>
        <p style="color: #000;margin:10px;letter-spacing:2px;"><strong>${token}</strong></p>
    </div>`
    };
    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        res.status(500).json({ errorMsg: 'Error sending email !' });
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

        const verified = speakeasy.totp.verify({
            secret: otp.secret,
            encoding: 'base32',
            token: userEnteredOTP,
            window: 6
        });

        if (!verified) {
            return res.status(400).json({ errorMsg: "Invalid OTP" });

        }
        const objectId = user._id;
        let update = await AdminUserModel.findByIdAndUpdate(objectId, { $set: { verified: true } }, { new: true });
        if (update) {
            return res.status(200).json({ successMsg: "Congratulations! Your email has been successfully verified. You can now proceed with your payment.", verified: true, adminInfo: user });
        }
    } catch (err) {
        return res.status(500).json({ errorMsg: "Internal server error" });
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
            return res.status(200).json({ successMsg: 'Reset password successfully.' });
        }
    } catch (error) {
        return res.status(500).json({ errorMsg: 'Internal Server Error !' });
    }
}

module.exports = {
    LoginAdmin,
    RefreshToken,
    SignupAdmin,
    ForgotPassword,
    ResetPassword,
    VerifyOTP,
}