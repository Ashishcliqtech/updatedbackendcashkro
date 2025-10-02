const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const notificationController = require('../controllers/notification.controller.js');

// @route   GET /api/notifications/:userId
// @desc    Get all notifications for a user
// @access  Private
router.get('/:userId', auth, notificationController.getUserNotifications);

// @route   PUT /api/notifications/:id/read
// @desc    Mark a notification as read
// @access  Private
router.put('/:id/read', auth, notificationController.markAsRead);

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read-all', auth, notificationController.markAllAsRead);

// @route   POST /api/notifications/:id/click
// @desc    Mark a notification as clicked
// @access  Private
router.post('/:id/click', auth, notificationController.markAsClicked);

module.exports = router;
