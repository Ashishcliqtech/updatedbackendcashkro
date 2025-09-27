const User = require('../models/user.model');

// @route   GET /api/user/profile
// @desc    Get current user's profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    // req.user.id is attached by the auth middleware from the token
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
