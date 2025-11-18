// src/controllers/webhook.controller.js
const logger = require('../utils/logger');

// @desc    Handle cashback notification from affiliate partner (Initial Purchase)
exports.handlePurchaseWebhook = async (req, res) => {
    logger.info('Purchase webhook received, but automatic processing is disabled.');
    res.status(200).json({ msg: 'Webhook received but not processed.' });
};

// @desc    Handle cashback confirmation from affiliate partner
exports.handleConfirmationWebhook = async (req, res) => {
    logger.info('Confirmation webhook received, but automatic processing is disabled.');
    res.status(200).json({ msg: 'Webhook received but not processed.' });
};

// @desc    Handle cashback cancellation/rejection from affiliate partner
exports.handleCancellationWebhook = async (req, res) => {
    logger.info('Cancellation webhook received, but automatic processing is disabled.');
    res.status(200).json({ msg: 'Webhook received but not processed.' });
};
