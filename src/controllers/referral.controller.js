const User = require('../models/user.model');
const Referral = require('../models/referral.model');

exports.getReferralDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const referrals = await Referral.find({ referrer: userId });

    const referredUsersCount = referrals.length;
    const completedReferrals = referrals.filter(r => r.status === 'COMPLETED');
    
    const earnings = completedReferrals.reduce((total, r) => total + r.rewardAmount, 0);

    res.status(200).json({
      referralCode: user.referralCode,
      referralLink: `https://www.savemoney.com/signup?ref=${user.referralCode}`,
      earnings,
      referredUsersCount,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching referral dashboard data', error });
  }
};

exports.getReferralHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const referrals = await Referral.find({ referrer: userId })
      .populate('referredUser', 'name')
      .sort({ createdAt: -1 });

    const referralHistory = referrals.map(referral => ({
      referredUserName: referral.referredUser ? referral.referredUser.name : 'Deleted User',
      status: referral.status,
      rewardAmount: referral.rewardAmount,
      date: referral.createdAt
    }));

    res.status(200).json({ referrals: referralHistory });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching referral history', error });
  }
};