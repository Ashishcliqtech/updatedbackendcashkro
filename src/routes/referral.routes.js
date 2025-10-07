
      const express = require('express');
      const router = express.Router();
      const referralController = require('../controllers/referral.controller');
      const  protect  = require('../middleware/auth.middleware');

      router.get('/dashboard', protect, referralController.getReferralDashboard);
      router.get('/history', protect, referralController.getReferralHistory);

      module.exports = router;
      