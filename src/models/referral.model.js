const mongoose = require('mongoose');

const ReferralSchema = new mongoose.Schema({
  referrerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  referredId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'EXPIRED'],
    default: 'PENDING',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
});

module.exports = mongoose.model('Referral', ReferralSchema);