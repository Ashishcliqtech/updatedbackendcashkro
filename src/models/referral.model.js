const mongoose = require('mongoose');

const ReferralSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  referredUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  earnings: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model('Referral', ReferralSchema);
