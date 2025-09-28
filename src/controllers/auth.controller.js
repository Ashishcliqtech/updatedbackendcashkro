const User = require('../models/user.model');
const Wallet = require('../models/wallet.model');
const Referral = require('../models/referral.model');
const redisClient = require('../config/redis');
const { sendOtpEmail, sendPasswordResetEmail } = require('../utils/email');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');
require('dotenv').config();

// @route   POST /api/auth/send-otp
// @desc    Send OTP to user's email for verification during registration
exports.sendOtp = async (req, res) => {
  const { name, email, phone, password, referredByCode } = req.body;

  try {
    let user = await User.findOne({ $or: [{ email }, { phone }] });
    if (user) {
      return res.status(400).json({ msg: 'User with this email or phone already exists' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const otpData = { name, email, phone, password: hashedPassword, referredByCode, otp };

    await redisClient.set(email, JSON.stringify(otpData), { EX: 300 }); // Expires in 5 minutes

    await sendOtpEmail(email, otp);

    res.status(200).json({ msg: 'OTP has been sent to your email.' });
  } catch (err) {
    logger.error('Error in sendOtp:', { error: err.message, stack: err.stack });
    res.status(500).send('Server error');
  }
};

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and create a new user
exports.verifyOtpAndCreateUser = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const data = await redisClient.get(email);
    if (!data) {
      return res.status(400).json({ msg: 'Invalid or expired OTP. Please try again.' });
    }

    const userData = JSON.parse(data);
    if (userData.otp !== otp) {
      return res.status(400).json({ msg: 'Invalid OTP.' });
    }

    const { name, phone, password, referredByCode } = userData;

    let referringUser = null;
    if (referredByCode) {
        referringUser = await User.findOne({ referralCode: referredByCode });
    }

    const newUser = new User({
      name,
      email,
      phone,
      password,
      referralCode: uuidv4(),
      referredBy: referringUser ? referringUser._id : null,
    });

    await newUser.save();
    
    // Create wallet and referral record for the new user
    await Wallet.create({ user: newUser._id });
    await Referral.create({ user: newUser._id });

    // If referred, update the referrer's data
    if (referringUser) {
        await Referral.findOneAndUpdate(
            { user: referringUser._id },
            { $push: { referredUsers: newUser._id } }
        );
        // You can add logic here to credit the referring user's wallet
    }

    await redisClient.del(email);

    const payload = { user: { id: newUser.id, role: newUser.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

    res.status(201).json({ token });
  } catch (err) {
    logger.error('Error in verifyOtpAndCreateUser:', { error: err.message, stack: err.stack });
    res.status(500).send('Server error');
  }
};

// @route   POST /api/auth/login
// @desc    Authenticate user and get token
exports.login = async (req, res) => {
    const { email, password } = req.body;
  
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }
  
      const payload = { user: { id: user.id, role: user.role } };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
  
      res.json({ token });
    } catch (err) {
      logger.error('Error in login:', { error: err.message, stack: err.stack });
      res.status(500).send('Server error');
    }
};
  
// @route   POST /api/auth/forgot-password
// @desc    Send password reset link
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
  
    try {
      const user = await User.findOne({ email });
      if (!user) {
        // To prevent user enumeration, send a generic success message
        return res.status(200).json({ msg: 'If a user with that email exists, a password reset link has been sent.' });
      }
  
      const payload = { user: { id: user.id } };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
  
      await sendPasswordResetEmail(email, token);
  
      res.status(200).json({ msg: 'If a user with that email exists, a password reset link has been sent.' });
    } catch (err) {
      logger.error('Error in forgotPassword:', { error: err.message, stack: err.stack });
      res.status(500).send('Server error');
    }
};
  
// @route   POST /api/auth/reset-password
// @desc    Reset password with a valid token
exports.resetPassword = async (req, res) => {
    const { token, password } = req.body;
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.user.id;
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      await User.findByIdAndUpdate(userId, { password: hashedPassword });
  
      res.status(200).json({ msg: 'Password has been reset successfully.' });
    } catch (err) {
      logger.error('Error in resetPassword:', { error: err.message, stack: err.stack });
      res.status(400).json({ msg: 'Invalid or expired token.' });
    }
};

