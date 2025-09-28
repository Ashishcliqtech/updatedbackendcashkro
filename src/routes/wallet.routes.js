const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const walletController = require('../controllers/wallet.controller');

// All wallet routes require authentication
router.get('/', authMiddleware, walletController.getWallet);
router.get('/transactions', authMiddleware, walletController.getTransactions);
router.post('/withdraw', authMiddleware, walletController.createWithdrawalRequest);

module.exports = router;
