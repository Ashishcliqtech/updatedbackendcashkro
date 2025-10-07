const User = require('../models/user.model');
const Referral = require('../models/referral.model');

exports.getReferralDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const referrals = await Referral.find({ referrerId: userId });

    const referredUsersCount = referrals.length;
    const completedReferrals = referrals.filter(r => r.status === 'COMPLETED');
    
    //This is a static value for now, and should be updated to be dynamic
    const earnings = completedReferrals.length * 10; 

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