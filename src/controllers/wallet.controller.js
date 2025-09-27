const Wallet = require('../models/wallet.model');
const Transaction = require('../models/transaction.model');

exports.getWallet = async (req, res) => {
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
};

exports.getTransactions = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;

        const wallet = await Wallet.findOne({ user: req.user.id });
        if (!wallet) {
            return res.status(404).json({ msg: 'Wallet not found' });
        }

        const transactions = await Transaction.find({ wallet: wallet._id })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const totalTransactions = await Transaction.countDocuments({ wallet: wallet._id });

        res.json({
            transactions,
            totalPages: Math.ceil(totalTransactions / limit),
            currentPage: page
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.withdraw = async (req, res) => {
    try {
        const { amount, paymentDetails } = req.body;
        const wallet = await Wallet.findOne({ user: req.user.id });

        if (!wallet) {
            return res.status(404).json({ msg: 'Wallet not found' });
        }

        if (wallet.availableCashback < amount) {
            return res.status(400).json({ msg: 'Insufficient balance' });
        }

        wallet.availableCashback -= amount;
        wallet.pendingCashback += amount;
        await wallet.save();

        const newTransaction = new Transaction({
            wallet: wallet._id,
            amount,
            type: 'withdrawal_request',
            status: 'pending',
            description: `Withdrawal request for ${paymentDetails.method}: ${paymentDetails.upild || ''}`,
        });
        await newTransaction.save();

        res.json({ msg: 'Withdrawal request submitted successfully.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
