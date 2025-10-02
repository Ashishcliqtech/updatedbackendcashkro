const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const User = require('../models/user.model');
const Wallet = require('../models/wallet.model');
const bcrypt = require('bcryptjs');
const _ = require('lodash');

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
// @desc    Update user profile with avatar
// @access  Private
router.put('/profile', [auth, upload.single('avatar')], async (req, res) => {
  const { name, phone } = req.body;

  const profileFields = {};
  if (name) profileFields.name = name;
  if (phone) profileFields.phone = phone;
  if (req.file) {
    profileFields.avatar = req.file.path;
  }

  try {
    let user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: profileFields },
      { new: true }
    ).select('-password');

     if (!user) {
        return res.status(404).json({ msg: 'User not found' });
    }
    
    const wallet = await Wallet.findOne({ user: req.user.id });
    
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

// @route   GET api/user/notifications/settings
// @desc    Get user notification settings
// @access  Private
router.get('/notifications/settings', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('notifications');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user.notifications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/user/notifications/settings
// @desc    Update notification settings
// @access  Private
router.put('/notifications/settings', auth, async (req, res) => {
  const newSettings = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Deep merge the new settings into the existing ones
    const updatedSettings = _.merge(user.notifications, newSettings);
    
    user.notifications = updatedSettings;
    await user.save();

    res.json(user.notifications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/user/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', auth, async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid old password' });
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();
        res.json({ msg: 'Password changed successfully' });
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
    await Wallet.findOneAndRemove({ user: req.user.id });
    await User.findByIdAndRemove(req.user.id);

    res.json({ msg: 'User deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
