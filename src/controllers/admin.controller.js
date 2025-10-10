
const User = require('../models/user.model');
const Store = require('../models/store.model');
const Offer = require('../models/offer.model');
const Notification = require('../models/notification.model');
const Conversation = require('../models/conversation.model');
const Click = require('../models/click.model');
const Transaction = require('../models/transaction.model');
const Referral = require('../models/referral.model');
const Activity = require('../models/activity.model');


exports.getRecentActivities = async (req, res) => {
  try {
    const activities = await Activity.find().sort({ createdAt: -1 }).limit(10).populate('user', 'name');
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const storeCount = await Store.countDocuments();
    const offerCount = await Offer.countDocuments();
    const clickCount = await Click.countDocuments();
    const transactionCount = await Transaction.countDocuments();
    const referralCount = await Referral.countDocuments();

    const cashbackData = await Transaction.aggregate([
      {
        $group: {
          _id: null,
          totalCashback: { $sum: '$amount' }
        }
      }
    ]);

    res.json({
      users: userCount,
      stores: storeCount,
      offers: offerCount,
      clicks: clickCount,
      transactions: transactionCount,
      referrals: referralCount,
      totalCashback: cashbackData.length > 0 ? cashbackData[0].totalCashback : 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// --- User Management ---
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Store Management ---
exports.createStore = async (req, res) => {
  try {
    const storeData = req.body;
    if (req.files && req.files.logo) {
      storeData.logo = req.files.logo[0].path;
    }
    if (req.files && req.files.banner_url) {
      storeData.banner_url = req.files.banner_url[0].path;
    }
    const store = new Store(storeData);
    await store.save();
    res.status(201).json(store);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateStore = async (req, res) => {
  try {
    const storeData = req.body;
    if (req.files && req.files.logo) {
      storeData.logo = req.files.logo[0].path;
    }
    if (req.files && req.files.banner_url) {
      storeData.banner_url = req.files.banner_url[0].path;
    }

    const store = await Store.findByIdAndUpdate(req.params.id, storeData, { new: true });
    if (!store) return res.status(404).json({ message: 'Store not found' });
    res.json(store);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteStore = async (req, res) => {
  try {
    const store = await Store.findByIdAndDelete(req.params.id);
    if (!store) return res.status(404).json({ message: 'Store not found' });
    res.json({ message: 'Store deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Offer Management ---
exports.createOffer = async (req, res) => {
  try {
    const offerData = req.body;
    if (req.file) {
      offerData.imageUrl = req.file.path;
    }
    const offer = new Offer(offerData);
    await offer.save();
    res.status(201).json(offer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateOffer = async (req, res) => {
  try {
    const offerData = req.body;
    if (req.file) {
      offerData.imageUrl = req.file.path;
    }
    const offer = await Offer.findByIdAndUpdate(req.params.id, offerData, { new: true });
    if (!offer) return res.status(404).json({ message: 'Offer not found' });
    res.json(offer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteOffer = async (req, res) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);
    if (!offer) return res.status(404).json({ message: 'Offer not found' });
    res.json({ message: 'Offer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Notification Management ---
exports.sendNotification = async (req, res) => {
  try {
    // Logic to send notification
    res.status(200).json({ message: 'Notification sent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getNotificationStats = async (req, res) => {
  try {
    // Logic to get notification stats
    res.status(200).json({ stats: 'some stats' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- Chat Management ---
exports.startChatWithUser = async (req, res) => {
  try {
    const { userId, adminId } = req.body;

    let conversation = await Conversation.findOne({
      participants: { $all: [userId, adminId] },
    });

    if (conversation) {
      return res.status(200).json(conversation);
    }

    const newConversation = new Conversation({
      participants: [userId, adminId],
    });

    await newConversation.save();

    res.status(201).json(newConversation);
  } catch (error) {
    console.error('Error starting chat:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
