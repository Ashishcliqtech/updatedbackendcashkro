const User = require('../models/user.model');
const logger = require('../utils/logger');

// @route   GET /api/user/profile
// @desc    Get current user's profile
exports.getUserProfile = async (req, res) => {
  try {
    // req.user.id is attached from the auth middleware
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    logger.error('Error in getUserProfile:', { error: err.message, stack: err.stack });
    res.status(500).send('Server Error');
  }
};

