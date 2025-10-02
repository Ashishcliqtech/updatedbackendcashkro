const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['deal', 'cashback', 'withdrawal', 'referral', 'support', 'system'], required: true },
  actionUrl: { type: String }, // For deep linking within the app
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  isClicked: { type: Boolean, default: false },
  clickedAt: { type: Date },
  channels: [{ type: String, enum: ['in-app', 'email', 'push', 'sms'] }],
  // for scheduled notifications
  status: { type: String, enum: ['sent', 'scheduled', 'draft'], default: 'sent' },
  sentAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
