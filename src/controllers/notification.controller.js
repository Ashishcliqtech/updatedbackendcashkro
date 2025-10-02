const Notification = require('../models/notification.model');
const User = require('../models/user.model');

// @route   GET /api/notifications/:userId
// @desc    Get all notifications for a user
// @access  Private
exports.getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.params.userId }).sort({ createdAt: -1 });
    
    // Update the user's lastSeen timestamp
    await User.findByIdAndUpdate(req.params.userId, { lastSeen: new Date() });

    res.json(notifications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   PUT /api/notifications/:id/read
// @desc    Mark a notification as read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ msg: 'Notification not found' });
    }

    // Ensure the user owns the notification
    if (notification.recipient.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ msg: 'Notification marked as read' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user.id, isRead: false }, { isRead: true });

    res.json({ msg: 'All notifications marked as read' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   POST /api/notifications/:id/click
// @desc    Mark a notification as clicked
// @access  Private
exports.markAsClicked = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ msg: 'Notification not found' });
    }

    // Ensure the user owns the notification
    if (notification.recipient.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    notification.isClicked = true;
    notification.isRead = true; // A click also implies the notification was read
    await notification.save();

    res.json({ msg: 'Notification click recorded' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
