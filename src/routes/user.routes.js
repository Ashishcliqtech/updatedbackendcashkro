const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const userController = require('../controllers/user.controller');

// @route   GET /api/user/profile
// @desc    Get current user's profile (Preferred RESTful location)
// @access  Authenticated
router.get('/profile', authMiddleware, userController.getUserProfile);

module.exports = router;
