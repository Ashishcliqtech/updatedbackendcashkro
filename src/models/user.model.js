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
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'banned'],
    default: 'active'
  },
  referralCode: {
    type: String,
    unique: true,
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  notifications: {
    email: {
      deals: { type: Boolean, default: true },
      cashback: { type: Boolean, default: true },
      referrals: { type: Boolean, default: true },
    },
    push: {
      deals: { type: Boolean, default: true },
      cashback: { type: Boolean, default: true },
      referrals: { type: Boolean, default: true },
    },
  },
  lastSeen: {
      type: Date,
      default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Virtual to populate wallet data
UserSchema.virtual('wallet', {
  ref: 'Wallet',
  localField: '_id',
  foreignField: 'user',
  justOne: true,
});

module.exports = mongoose.model('User', UserSchema);
