// src/controllers/webhook.controller.js
const Click = require('../models/click.model');
const Transaction = require('../models/transaction.model');
const Wallet = require('../models/wallet.model');
const Offer = require('../models/offer.model');
const User = require('../models/user.model');
const Referral = require('../models/referral.model');
const logger = require('../utils/logger');

// @desc    Handle cashback notification from affiliate partner
exports.handlePurchaseWebhook = async (req, res) => {
    // Note: You should add a layer of security to verify that this webhook
    // is genuinely from your affiliate partner (e.g., by checking a secret key).
    
    const { clickId, purchaseAmount, transactionId } = req.body;

    try {
        // 1. Find the user from the clickId
        const click = await Click.findOne({ clickId }).populate('offer');
        if (!click) {
            logger.warn(`Webhook received for unknown clickId: ${clickId}`);
            return res.status(404).json({ msg: 'Click not found' });
        }

        // 2. Calculate cashback
        const cashbackAmount = (purchaseAmount * click.offer.cashbackRate) / 100;

        // 3. Create a pending transaction
        const newTransaction = new Transaction({
            user: click.user,
            amount: cashbackAmount,
            type: 'credit',
            status: 'pending',
            description: `Cashback for order at ${click.offer.store.name}`,
        });
        await newTransaction.save();
        
        // 4. Update the user's wallet
        await Wallet.findOneAndUpdate(
            { user: click.user },
            { $inc: { pendingCashback: cashbackAmount, totalCashback: cashbackAmount } }
        );

        logger.info(`Pending cashback of ${cashbackAmount} created for user ${click.user} from transaction ${transactionId}`);
        res.status(200).json({ msg: 'Webhook received and processed' });

    } catch (err) {
        logger.error('Error in handlePurchaseWebhook:', { error: err.message, stack: err.stack });
        res.status(500).send('Server Error');
    }
};

// @desc    Handle cashback confirmation from affiliate partner
exports.handleConfirmationWebhook = async (req, res) => {
    const { transactionId } = req.body; // Assuming the partner sends back their transactionId

    try {
        // Find the transaction (in a real app, you'd have a way to map their transactionId to yours)
        const transaction = await Transaction.findOne({ description: { $regex: transactionId } });

        if (!transaction || transaction.status !== 'pending') {
            return res.status(404).json({ msg: 'Pending transaction not found' });
        }

        // Update transaction status
        transaction.status = 'confirmed';
        await transaction.save();

        // Update wallet: move from pending to available
        await Wallet.findOneAndUpdate(
            { user: transaction.user },
            { 
                $inc: {
                    pendingCashback: -transaction.amount,
                    availableCashback: transaction.amount,
                }
            }
        );

        // ** Referral Bonus Logic **
        const user = await User.findById(transaction.user);
        const transactionCount = await Transaction.countDocuments({ user: user._id, status: 'confirmed' });

        if (transactionCount === 1 && user.referredBy) {
            const referrer = await User.findById(user.referredBy);
            const referralBonus = 50; // Example bonus amount

            // Award bonus to referrer
            await Wallet.findOneAndUpdate({ user: referrer._id }, { $inc: { availableCashback: referralBonus, totalCashback: referralBonus } });
            await Referral.findOneAndUpdate({ user: referrer._id }, { $inc: { earnings: referralBonus } });
            
            // Log a transaction for the referrer
            await new Transaction({ user: referrer._id, amount: referralBonus, type: 'credit', status: 'confirmed', description: 'Referral Bonus' }).save();

            logger.info(`Awarded referral bonus to ${referrer.email}`);
        }
        
        logger.info(`Confirmed cashback for transaction ${transaction._id}`);
        res.status(200).json({ msg: 'Cashback confirmed' });

    } catch (err) {
        logger.error('Error in handleConfirmationWebhook:', { error: err.message, stack: err.stack });
        res.status(500).send('Server Error');
    }
};