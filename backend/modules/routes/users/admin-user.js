'use strict';
const express = require('express');
const router = express.Router();
const { LoginAdmin, RefreshToken, SignupAdmin,ForgotPassword,VerifyOTP,ResetPassword,GetSingleAdminPlan} = require('../../controllers/users/admin-user');

router.post('/login', LoginAdmin);
router.post('/refresh', RefreshToken);
router.post('/signup', SignupAdmin);
router.post('/forgot-password', ForgotPassword);
router.post('/varify-otp', VerifyOTP);
router.post('/reset-password', ResetPassword);
router.get('/admin-plan/:adminId', GetSingleAdminPlan);

module.exports = router;