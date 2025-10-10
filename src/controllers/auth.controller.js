const User = require('../models/user.model.js');
const Wallet = require('../models/wallet.model.js');
const Referral = require('../models/referral.model.js');
const redisClient = require('../config/redis.js');
const { sendOtpEmail, sendPasswordResetEmail } = require('../utils/email.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger.js');
require('dotenv').config();

const generateReferralCode = (name) => {
  const namePart = name.slice(0, 4).toUpperCase();
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${namePart}${randomPart}`;
};

// @route   POST /api/auth/send-otp
// @desc    Send OTP for user registration
// @access  Public
exports.sendOtp = async (req, res) => {
  const { name, email, phone, password, referralCode } = req.body;

  if (!name || !email || !phone || !password) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  if (password.length < 6) {
    return res.status(400).json({ msg: 'Password must be at least 6 characters' });
  }

  try {
    let user = await User.findOne({ email });
    if (user) {
      logger.warn(`Registration attempt for existing email: ${email}`);
      return res.status(400).json({ msg: 'User already exists' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otpData = { name, email, phone, password: hashedPassword, referralCode, otp };

    await redisClient.set(`otp:${email}`, JSON.stringify(otpData), {
      EX: 300, // 5 minutes
    });

    await sendOtpEmail(email, otp);
    logger.info(`OTP sent to email: ${email}`);
    res.status(200).json({ msg: 'OTP has been sent to your email.' });
  } catch (err) {
    logger.error(`Error in sendOtp: ${err.message}`);
    res.status(500).send('Server error');
  }
};

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and create user
// @access  Public
exports.verifyOtpAndCreateUser = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const data = await redisClient.get(email);
    if (!data) {
      logger.warn(`Invalid or expired OTP attempt for email: ${email}`);
      return res.status(400).json({ msg: 'Invalid or expired OTP' });
    }

    const otpData = JSON.parse(data);
    if (otpData.otp !== otp) {
      logger.warn(`Invalid OTP provided for email: ${email}`);
      return res.status(400).json({ msg: 'Invalid OTP' });
    }

    const { name, phone, password, referralCode } = otpData;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      referralCode: generateReferralCode(name),
    });

    if (referralCode) {
      const referringUser = await User.findOne({ referralCode });
      if (referringUser) {
        newUser.referredBy = referringUser._id;
        const newReferral = new Referral({
          referrerId: referringUser._id,
          referredId: newUser._id,
          rewardAmount: 100, // Default reward amount
        });
        await newReferral.save();
      } else {
        logger.warn(`Referral code ${referralCode} not found.`);
      }
    }

    await newUser.save();

    const newWallet = new Wallet({ user: newUser._id });
    await newWallet.save();

    const activity = new Activity({
      type: 'user',
      message: `New user registration: ${newUser.email}`,
      user: newUser._id,
    });
    await activity.save();

    await redisClient.del(email);
    logger.info(`User created successfully: ${email}`);

    const payload = {
      user: {
        id: newUser.id,
        role: newUser.role,
      },
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.status(201).json({ token });
  } catch (err) {
    logger.error(`Error in verifyOtpAndCreateUser: ${err.message}`);
    res.status(500).send('Server error');
  }
};

// @route   POST /api/auth/login
// @desc    Authenticate user and get token
// @access  Public
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  try {
    let user = await User.findOne({ email });
    if (!user) {
      logger.warn(`Login failed for email (not found): ${email}`);
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn(`Login failed for email (wrong password): ${email}`);
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    });

    const io = req.app.get('socketio');
    if (io) {
        io.emit('user online', { userId: user.id, role: user.role });
    }


    logger.info(`User logged in successfully: ${email}`);
    res.json({ token });
  } catch (err) {
    logger.error(`Error in login: ${err.message}`);
    res.status(500).send('Server error');
  }
};

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
  
    try {
      const user = await User.findOne({ email });
      if (user) {
          const payload = {
              user: {
                id: user.id,
              },
            };
        
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
              expiresIn: '15m',
            });
        
            await sendPasswordResetEmail(email, token);
            logger.info(`Password reset email sent to: ${email}`);
      } else {
          logger.warn(`Password reset attempt for non-existent email: ${email}`);
      }
  
      res.status(200).json({ msg: 'If a user with that email exists, a password reset link has been sent.' });
    } catch (err) {
      logger.error(`Error in forgotPassword: ${err.message}`);
      res.status(500).send('Server error');
    }
  };
  
  // @route   POST /api/auth/reset-password
  // @desc    Reset user's password
  // @access  Public
  exports.resetPassword = async (req, res) => {
    const { token, password } = req.body;
  
    if (!token || !password) {
      return res.status(400).json({ msg: 'Please provide a token and a new password.' });
    }
  
    if (password.length < 6) {
      return res.status(400).json({ msg: 'Password must be at least 6 characters' });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.user.id;
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      await User.findByIdAndUpdate(userId, { password: hashedPassword });
  
      logger.info(`Password has been reset successfully for user ID: ${userId}`);
      res.status(200).json({ msg: 'Password has been reset successfully.' });
    } catch (err) {
      logger.error(`Error in resetPassword: ${err.message}`);
      res.status(400).json({ msg: 'Invalid or expired token' });
    }
  };