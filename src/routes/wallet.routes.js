const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const Wallet = require('../models/wallet.model');
const Transaction = require('../models/transaction.model');

// @route   GET api/wallet
// @desc    Get user's wallet
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user.id });
    if (!wallet) {
      return res.status(404).json({ msg: 'Wallet not found' });
    }
    res.json(wallet);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/wallet/transactions
// @desc    Get user's transactions
// @access  Private
router.get('/transactions', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/wallet/withdraw
// @desc    Request a withdrawal
// @access  Private
router.post('/withdraw', auth, async (req, res) => {
  const { amount, method, accountDetails } = req.body;

  try {
    const wallet = await Wallet.findOne({ user: req.user.id });

    if (!wallet || wallet.availableCashback < amount) {
      return res.status(400).json({ msg: 'Insufficient balance' });
    }

    // Create a withdrawal transaction (you might want a separate collection for this)
    const transaction = new Transaction({
      user: req.user.id,
      amount: -amount, 
      type: 'debit',
      status: 'pending',
      description: `Withdrawal via ${method}`,
    });
    await transaction.save();

    // Update wallet
    wallet.availableCashback -= amount;
    wallet.withdrawnCashback += amount;
    await wallet.save();

    res.json({ msg: 'Withdrawal request submitted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;