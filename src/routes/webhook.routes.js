// src/routes/webhook.routes.js
const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhook.controller');

// These routes should be public but protected by a secret key check inside the controller
router.post('/purchase', webhookController.handlePurchaseWebhook);
router.post('/confirmation', webhookController.handleConfirmationWebhook);

module.exports = router;