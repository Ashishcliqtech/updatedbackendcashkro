const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// The route is now /signup, which will handle the OTP sending process
router.post('/signup', authController.signup);
router.post('/verify-otp', authController.verifyOtpAndSignup);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;