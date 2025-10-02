const Notification = require('../models/notification.model');

// @route   POST /api/notifications/:id/track-open
// @desc    Track when a notification is opened
// @access  Private
exports.trackOpen = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ msg: 'Notification not found' });
    }

    res.json(notification);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   POST /api/notifications/:id/track-click
// @desc    Track when a notification is clicked
// @access  Private
exports.trackClick = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { isClicked: true, clickedAt: new Date(), isRead: true, readAt: new Date() }, // Also mark as read
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ msg: 'Notification not found' });
    }

    // Redirect to the action URL if it exists
    if (notification.actionUrl) {
      return res.redirect(notification.actionUrl);
    }

    res.json(notification);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
