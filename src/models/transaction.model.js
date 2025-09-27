const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  wallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ['credit', 'debit', 'withdrawal_request'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed', 'completed'],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  offer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Offer',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Transaction', TransactionSchema);
