const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const userController = require('../controllers/user.controller');

router.post('/send-otp', authController.sendOtp);
router.post('/verify-otp', authController.verifyOtpAndCreateUser);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// This endpoint logically belongs to a user's own data,
// but the prompt placed it under auth. A more RESTful place is /api/user/profile.
// Included here to match the prompt exactly.
router.get('/user/profile', authMiddleware, userController.getUserProfile);

module.exports = router;
