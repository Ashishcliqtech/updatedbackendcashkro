const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  referralCode: {
    type: String,
  },
  totalCashback: {
    type: Number,
    default: 0,
  },
  availableCashback: {
    type: Number,
    default: 0,
  },
  pendingCashback: {
    type: Number,
    default: 0,
  },
  isVerified: {
    type: Boolean,
    default: true, // Assuming verification happens with OTP
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', UserSchema);
