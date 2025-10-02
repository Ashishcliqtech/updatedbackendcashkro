const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['deal', 'cashback', 'withdrawal', 'referral', 'support', 'system', 'offer'], required: true },
  isRead: { type: Boolean, default: false },
  isClicked: { type: Boolean, default: false },
  clickedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
