const express = require('express');
const router = express.Router();
const referralController = require('../controllers/referral.controller');
const authMiddleware = require('../middleware/auth.middleware');

// All referral routes require authentication
router.get('/', authMiddleware, referralController.getReferralData);
router.post('/generate-link', authMiddleware, referralController.generateReferralLink);
router.get('/history', authMiddleware, referralController.getReferralHistory);

module.exports = router;
