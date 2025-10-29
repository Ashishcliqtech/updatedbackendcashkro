// src/controllers/webhook.controller.js
const Click = require('../models/click.model');
const Transaction = require('../models/transaction.model');
const Wallet = require('../models/wallet.model');
const Offer = require('../models/offer.model');
const User = require('../models/user.model');
const Referral = require('../models/referral.model');
const Activity = require('../models/activity.model'); 
const logger = require('../utils/logger');

// --- Helper function for robust purchase status update ---
const updateTransactionStatus = async (transactionId, newStatus, webhookSource) => {
    try {
        const transaction = await Transaction.findOne({ description: new RegExp(`.*${transactionId}.*`), type: 'credit', status: 'pending' });

        if (!transaction) {
            logger.warn(`Transaction ID ${transactionId} not found or is already processed. Source: ${webhookSource}`);
            return { success: false, message: 'Transaction already handled or not found.' };
        }

        // Update status and description
        transaction.status = newStatus;
        transaction.description = `[${webhookSource} - ${newStatus.toUpperCase()}] ${transaction.description}`;
        await transaction.save();

        if (newStatus === 'confirmed') {
            // Move funds from pending to available only if approved
            await Wallet.findOneAndUpdate(
                { user: transaction.user },
                { 
                    $inc: {
                        pendingCashback: -transaction.amount,
                        availableCashback: transaction.amount,
                    }
                }
            );
            logger.info(`Cashback confirmed and funds moved to available for user ${transaction.user}.`);
        } else if (newStatus === 'failed') {
             // If rejected/failed, only remove from pending
             await Wallet.findOneAndUpdate(
                { user: transaction.user },
                { $inc: { pendingCashback: -transaction.amount } }
            );
            logger.warn(`Cashback marked as failed/rejected for user ${transaction.user}.`);
        }
        
        // Log activity
        const activity = new Activity({
            type: 'transaction',
            message: `Cashback transaction ${transactionId} updated to ${newStatus} via ${webhookSource} webhook.`,
            user: transaction.user
        });
        await activity.save();

        return { success: true, transaction };

    } catch (err) {
        logger.error(`Error updating transaction ${transactionId} via ${webhookSource}:`, { error: err.message, stack: err.stack });
        return { success: false, message: 'Server error during status update.' };
    }
};


// @desc    Handle cashback notification from affiliate partner (Initial Purchase)
exports.handlePurchaseWebhook = async (req, res) => {
    // IMPORTANT: Security Check - Implement a secret key verification here
    const { clickId, purchaseAmount, transactionId } = req.body;

    if (!clickId || !purchaseAmount || !transactionId) {
        logger.warn('Webhook payload missing required fields.');
        return res.status(400).json({ msg: 'Missing required webhook data' });
    }

    try {
        // 1. Find the user/offer/store associated with the clickId
        const click = await Click.findOne({ clickId }).populate({
            path: 'offer',
            populate: {
                path: 'store', 
                select: 'name'
            }
        });
        
        if (!click) {
            logger.warn(`Webhook received for unknown or expired clickId: ${clickId}. Ignoring.`);
            return res.status(202).json({ msg: 'Click not found, logged as warning' }); 
        }

        // 2. Check for duplicate transaction (using partner's transactionId in the description)
        const descriptionRegex = new RegExp(`Order #${transactionId}`);
        const duplicateTransaction = await Transaction.findOne({ description: descriptionRegex, type: 'credit' });
        if (duplicateTransaction) {
            logger.warn(`Duplicate purchase webhook received for transactionId: ${transactionId}.`);
            return res.status(202).json({ msg: 'Duplicate transaction received' });
        }

        // 3. Calculate cashback amount
        if (!click.offer || typeof click.offer.cashbackRate !== 'number') {
            logger.error(`Offer details or cashbackRate missing for clickId: ${clickId}`);
            return res.status(400).json({ msg: 'Offer data missing for calculation' });
        }
        
        const cashbackAmount = (purchaseAmount * click.offer.cashbackRate) / 100;

        // 4. Create a PENDING transaction
        const newTransaction = new Transaction({
            user: click.user,
            amount: cashbackAmount,
            type: 'credit',
            status: 'pending', 
            description: `Order #${transactionId} cashback at ${click.offer.store.name} (Click ID: ${clickId})`,
        });
        await newTransaction.save();
        
        // 5. Update the user's wallet: increment pendingCashback and totalCashback
        await Wallet.findOneAndUpdate(
            { user: click.user },
            { $inc: { pendingCashback: cashbackAmount, totalCashback: cashbackAmount } },
            { new: true, upsert: true }
        );

        // 6. Log activity
        const activity = new Activity({
            type: 'transaction',
            message: `New PENDING cashback of ${cashbackAmount} created for user ${click.user} (Order ${transactionId})`,
            user: click.user
          });
        await activity.save();

        logger.info(`Pending cashback of ${cashbackAmount} created for user ${click.user} from transaction ${transactionId}`);
        res.status(201).json({ msg: 'Purchase received. Pending transaction created for admin review.' });

    } catch (err) {
        logger.error('Error in handlePurchaseWebhook:', { error: err.message, stack: err.stack });
        res.status(500).send('Server Error');
    }
};

// @desc    Handle cashback confirmation from affiliate partner
// NOTE: This webhook is designed for partners that send a secondary confirmation event.
exports.handleConfirmationWebhook = async (req, res) => {
    // IMPORTANT: Security Check - Implement a secret key verification here
    const { transactionId } = req.body; 

    if (!transactionId) {
        return res.status(400).json({ msg: 'Missing transactionId in confirmation webhook' });
    }

    try {
        // Find the pending transaction using the partner's ID
        const transaction = await Transaction.findOne({ 
            description: { $regex: transactionId }, 
            status: 'pending', 
            type: 'credit' 
        });

        if (!transaction) {
            logger.warn(`Confirmation webhook received for unknown/non-pending transactionId: ${transactionId}. Ignoring.`);
            return res.status(202).json({ msg: 'No pending transaction found to confirm' });
        }

        // UPDATE: Mark the transaction as confirmed in description for admin clarity
        if (transaction.description.includes('[PARTNER CONFIRMED]')) {
             return res.status(202).json({ msg: 'Transaction already marked confirmed by partner.' });
        }

        transaction.description = `[PARTNER CONFIRMED] ${transaction.description}`;
        await transaction.save();
        
        logger.info(`Partner confirmation recorded for pending transaction ${transaction._id}. Awaiting Admin approval.`);
        
        // Optional: Send a notification to the admin/review team if desired
        
        res.status(200).json({ msg: 'Partner confirmation received and noted on transaction. Awaiting final admin approval.' });

    } catch (err) {
        logger.error('Error in handleConfirmationWebhook:', { error: err.message, stack: err.stack });
        res.status(500).send('Server Error');
    }
};

// @desc    Handle cashback cancellation/rejection from affiliate partner
// NOTE: This webhook is for partners that send a secondary cancellation event.
exports.handleCancellationWebhook = async (req, res) => {
    // IMPORTANT: Security Check - Implement a secret key verification here
    const { transactionId, reason } = req.body; 

    if (!transactionId) {
        return res.status(400).json({ msg: 'Missing transactionId in cancellation webhook' });
    }

    // Use the helper to mark the transaction as failed/rejected
    const result = await updateTransactionStatus(transactionId, 'failed', 'PARTNER CANCELLATION');

    if (result.success) {
        res.status(200).json({ msg: 'Transaction successfully marked as failed and funds removed from pending balance.' });
    } else {
        res.status(202).json({ msg: result.message });
    }
};
