const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const notificationController = require('../controllers/notification.controller.js');

// @route   POST /api/notifications/:id/track-open
// @desc    Track when a notification is opened
// @access  Private
router.post('/:id/track-open', authMiddleware, notificationController.trackOpen);

// @route   POST /api/notifications/:id/track-click
// @desc    Track when a notification is clicked
// @access  Private
router.post('/:id/track-click', authMiddleware, notificationController.trackClick);

module.exports = router;
