const User = require('../models/user.model');
const Store = require('../models/store.model');
const Offer = require('../models/offer.model');
const Category = require('../models/category.model');
const Transaction = require('../models/transaction.model');
const Wallet = require('../models/wallet.model');


// User Management
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ msg: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { role, isActive } = req.body;
        const user = await User.findByIdAndUpdate(req.params.id, { role, isActive }, { new: true }).select('-password');
        if (!user) return res.status(404).json({ msg: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// Store Management
exports.createStore = async (req, res) => {
    try {
        // Implementation from stores.controller.js can be moved or called here
        res.status(501).json({ msg: 'Not implemented' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.updateStore = async (req, res) => {
     try {
        const store = await Store.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!store) return res.status(404).json({ msg: 'Store not found' });
        res.json(store);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.deleteStore = async (req, res) => {
    try {
        const store = await Store.findByIdAndDelete(req.params.id);
        if (!store) return res.status(404).json({ msg: 'Store not found' });
        res.json({ msg: 'Store removed' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};


// Offer Management
exports.createOffer = async (req, res) => {
    try {
        // Implementation from offers.controller.js can be moved or called here
        res.status(501).json({ msg: 'Not implemented' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.updateOffer = async (req, res) => {
    try {
        const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!offer) return res.status(404).json({ msg: 'Offer not found' });
        res.json(offer);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.deleteOffer = async (req, res) => {
    try {
        const offer = await Offer.findByIdAndDelete(req.params.id);
        if (!offer) return res.status(404).json({ msg: 'Offer not found' });
        res.json({ msg: 'Offer removed' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// Category Management
exports.createCategory = async (req, res) => {
    try {
        // Implementation from categories.controller.js can be moved or called here
        res.status(501).json({ msg: 'Not implemented' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!category) return res.status(404).json({ msg: 'Category not found' });
        res.json(category);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) return res.status(404).json({ msg: 'Category not found' });
        res.json({ msg: 'Category removed' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};


// Withdrawal Management
exports.getWithdrawals = async (req, res) => {
    try {
        const withdrawals = await Transaction.find({ type: 'withdrawal_request', status: 'pending' }).populate({
            path: 'wallet',
            populate: {
                path: 'user',
                select: 'name email'
            }
        });
        res.json(withdrawals);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.approveWithdrawal = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.transactionId);
        if (!transaction || transaction.type !== 'withdrawal_request' || transaction.status !== 'pending') {
            return res.status(404).json({ msg: 'Withdrawal request not found or already processed' });
        }

        const wallet = await Wallet.findById(transaction.wallet);
        if (!wallet) return res.status(404).json({ msg: 'Wallet not found' });

        wallet.pendingCashback -= transaction.amount;
        await wallet.save();

        transaction.status = 'completed';
        await transaction.save();

        res.json({ msg: 'Withdrawal approved' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

exports.rejectWithdrawal = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.transactionId);
        if (!transaction || transaction.type !== 'withdrawal_request' || transaction.status !== 'pending') {
            return res.status(404).json({ msg: 'Withdrawal request not found or already processed' });
        }

        const wallet = await Wallet.findById(transaction.wallet);
        if (!wallet) return res.status(404).json({ msg: 'Wallet not found' });

        wallet.pendingCashback -= transaction.amount;
        wallet.availableCashback += transaction.amount;
        await wallet.save();

        transaction.status = 'failed'; // Or 'rejected'
        await transaction.save();

        res.json({ msg: 'Withdrawal rejected' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};
