const User = require('../models/user.model.js');
const Wallet = require('../models/wallet.model.js');
const Referral = require('../models/referral.model.js');
const redisClient = require('../config/redis.js');
const { sendOtpEmail } = require('../utils/email.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger.js');
require('dotenv').config();

// Correctly named function to send OTP, matching the original intent
exports.sendOtp = async (req, res) => {
  const { name, email, phone, password, referredByCode } = req.body;

  if (!password) {
    return res.status(400).json({ msg: 'Password is required' });
  }

  try {
    let user = await User.findOne({ email });
    if (user) {
      logger.warn(`Registration attempt for existing email: ${email}`);
      return res.status(400).json({ msg: 'User already exists' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpData = { name, email, phone, password, referredByCode, otp };

    await redisClient.set(email, JSON.stringify(otpData), {
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

// Correctly named function to verify OTP and create the user

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

    const { name, phone, password, referredByCode } = otpData;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      referralCode: uuidv4(), // Generate a unique referral code for the new user
    });

    // START of new logic
    // Check if the user was referred by someone
    if (referredByCode) {
      const referringUser = await User.findOne({ referralCode: referredByCode });
      if (referringUser) {
        newUser.referredBy = referringUser._id;
        // The logic to update the referrer's document will be handled
        // when the new user makes their first transaction.
      } else {
        logger.warn(`Referral code ${referredByCode} not found.`);
      }
    }

    // Save the new user to get their _id
    await newUser.save();

    // Create a wallet for the new user
    const newWallet = new Wallet({ user: newUser._id });
    await newWallet.save();

    // Create a referral document for the new user
    const newReferral = new Referral({ user: newUser._id });
    await newReferral.save();
    // END of new logic

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

// Login function - ensured it is correctly exported
exports.login = async (req, res) => {
  const { email, password } = req.body;

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
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    logger.info(`User logged in successfully: ${email}`);
    res.json({ token });
  } catch (err) {
    logger.error(`Error in login: ${err.message}`);
    res.status(500).send('Server error');
  }
};

// Forgot Password function
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    // We send a generic message to prevent email enumeration
    if (user) {
        const payload = {
            user: {
              id: user.id,
            },
          };
      
          const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '15m', // 15 minutes
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

// Reset Password function
exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;

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
