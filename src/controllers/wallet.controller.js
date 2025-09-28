const Wallet = require('../models/wallet.model');
const Transaction = require('../models/transaction.model');
const logger = require('../utils/logger');

// @route   GET /api/wallet
// @desc    Get wallet data for the authenticated user
// @access  Authenticated
exports.getWallet = async (req, res) => {
    try {
        const wallet = await Wallet.findOne({ user: req.user.id });
        if (!wallet) {
            return res.status(404).json({ msg: 'Wallet not found' });
        }
        res.json(wallet);
    } catch (err) {
        logger.error('Error in getWallet:', { error: err.message, stack: err.stack });
        res.status(500).send('Server Error');
    }
};

// @route   GET /api/wallet/transactions
// @desc    Get transaction history for the authenticated user
// @access  Authenticated
exports.getTransactions = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;

        const transactions = await Transaction.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const totalTransactions = await Transaction.countDocuments({ user: req.user.id });

        res.json({
            transactions,
            totalPages: Math.ceil(totalTransactions / limit),
            currentPage: page
        });
    } catch (err) {
        logger.error('Error in getTransactions:', { error: err.message, stack: err.stack });
        res.status(500).send('Server Error');
    }
};

// @route   POST /api/wallet/withdraw
// @desc    Create a withdrawal request
// @access  Authenticated
exports.createWithdrawalRequest = async (req, res) => {
    try {
        const { amount, paymentDetails } = req.body; // paymentDetails can be an object with method, upiId, etc.
        const wallet = await Wallet.findOne({ user: req.user.id });

        if (!wallet) {
            return res.status(404).json({ msg: 'Wallet not found' });
        }

        if (wallet.availableCashback < amount) {
            return res.status(400).json({ msg: 'Insufficient available balance for withdrawal' });
        }

        // Move amount from available to pending
        wallet.availableCashback -= amount;
        wallet.pendingCashback += amount;
        await wallet.save();

        // Create a debit transaction to log the withdrawal request
        // The actual money transfer is handled by an admin later
        const newTransaction = new Transaction({
            user: req.user.id,
            amount: -amount, // Negative for debit
            type: 'debit',
            status: 'pending', // Pending admin approval
            description: `Withdrawal request via ${paymentDetails.method}. Details: ${JSON.stringify(paymentDetails)}`,
        });
        await newTransaction.save();

        res.json({ msg: 'Withdrawal request submitted successfully. It will be processed shortly.' });
    } catch (err) {
        logger.error('Error in createWithdrawalRequest:', { error: err.message, stack: err.stack });
        res.status(500).send('Server Error');
    }
};

