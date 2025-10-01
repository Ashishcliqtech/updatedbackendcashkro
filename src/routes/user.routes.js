const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const User = require('../models/user.model');
const Wallet = require('../models/wallet.model');

// @route   GET api/user/profile
// @desc    Get user profile with wallet
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const wallet = await Wallet.findOne({ user: req.user.id });

    // Combine user and wallet data
    const userProfile = {
      ...user.toObject(),
      totalCashback: wallet ? wallet.totalCashback : 0,
      availableCashback: wallet ? wallet.availableCashback : 0,
      pendingCashback: wallet ? wallet.pendingCashback : 0,
    };

    res.json(userProfile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/user/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  const { name, phone, avatar } = req.body;

  const profileFields = {};
  if (name) profileFields.name = name;
  if (phone) profileFields.phone = phone;
  if (avatar) profileFields.avatar = avatar;

  try {
    let user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: profileFields },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/user/notifications
// @desc    Update notification preferences
// @access  Private
router.put('/notifications', auth, async (req, res) => {
    const { email, push, sms } = req.body;

    const notificationFields = {
        notifications: { email, push, sms }
    };

    try {
        let user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: notificationFields },
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route   DELETE api/user
// @desc    Delete user, profile & wallet
// @access  Private
router.delete('/', auth, async (req, res) => {
  try {
    // Also remove user's wallet and other related data
    await Wallet.findOneAndRemove({ user: req.user.id });
    await User.findByIdAndRemove(req.user.id);

    res.json({ msg: 'User deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;