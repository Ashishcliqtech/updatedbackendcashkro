const mongoose = require('mongoose');

const WalletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
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
});

module.exports = mongoose.model('Wallet', WalletSchema);
