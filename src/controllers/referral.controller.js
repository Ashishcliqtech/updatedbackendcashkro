const Referral = require('../models/referral.model');
const User = require('../models/user.model');
const logger = require('../utils/logger');

// @route   GET /api/referrals
// @desc    Get referral data for the authenticated user
// @access  Authenticated
exports.getReferralData = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('referralCode');
        const referral = await Referral.findOne({ user: req.user.id })
            .populate('referredUsers', 'name email createdAt');
        
        if (!referral || !user) {
            return res.status(404).json({ msg: 'Referral data not found for user' });
        }

        res.json({
            referralCode: user.referralCode,
            earnings: referral.earnings,
            referredUsersCount: referral.referredUsers.length
        });
    } catch (err) {
        logger.error('Error in getReferralData:', { error: err.message, stack: err.stack });
        res.status(500).send('Server Error');
    }
};

// @route   POST /api/referrals/generate-link
// @desc    Generate a referral link for the authenticated user
// @access  Authenticated
exports.generateReferralLink = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('referralCode');
        if (!user || !user.referralCode) {
            return res.status(404).json({ msg: 'User or referral code not found' });
        }
        
        const referralLink = `${process.env.FRONTEND_URL}/signup?ref=${user.referralCode}`;
        res.json({ referralLink });
    } catch (err) {
        logger.error('Error in generateReferralLink:', { error: err.message, stack: err.stack });
        res.status(500).send('Server Error');
    }
};

// @route   GET /api/referrals/history
// @desc    Get referral history for the authenticated user
// @access  Authenticated
exports.getReferralHistory = async (req, res) => {
    try {
        const referral = await Referral.findOne({ user: req.user.id })
            .populate('referredUsers', 'name email createdAt');

        if (!referral) {
            return res.status(404).json({ msg: 'Referral history not found' });
        }
        
        res.json(referral.referredUsers);
    } catch (err) {
        logger.error('Error in getReferralHistory:', { error: err.message, stack: err.stack });
        res.status(500).send('Server Error');
    }
};

