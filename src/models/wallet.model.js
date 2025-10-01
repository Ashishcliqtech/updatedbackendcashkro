const mongoose = require('mongoose');

const WalletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
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
  withdrawnCashback: {
    type: Number,
    default: 0,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Wallet', WalletSchema);