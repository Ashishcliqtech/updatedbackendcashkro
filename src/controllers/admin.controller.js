
const User = require('../models/user.model');
const Store = require('../models/store.model');
const Offer = require('../models/offer.model');
const Notification = require('../models/notification.model');
const { getIo } = require('../utils/socket');
const logger = require('../utils/logger');
const Wallet = require('../models/wallet.model');
const Referral = require('../models/referral.model');
const Transaction = require('../models/transaction.model');
const Click = require('../models/click.model.js');
const NotificationService = require('../services/notification.service');
const Conversation = require('../models/conversation.model');

// --- User Management ---

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        logger.error('Error in getAllUsers (admin):', { error: err.message, stack: err.stack });
        res.status(500).send('Server Error');
    }
};

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        logger.error('Error in getUserById (admin):', { error: err.message, stack: err.stack });
        res.status(500).send('Server Error');
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { role, status } = req.body;
        const updatedFields = {};
        if (role) updatedFields.role = role;
        if (status) updatedFields.status = status;

        const user = await User.findByIdAndUpdate(req.params.id, updatedFields, { new: true }).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        logger.error('Error in updateUser (admin):', { error: err.message, stack: err.stack });
        res.status(500).send('Server Error');
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        await Wallet.deleteOne({ user: req.params.id });
        await Referral.deleteOne({ user: req.params.id });
        await Transaction.deleteMany({ user: req.params.id });
        await user.deleteOne();
        res.json({ msg: 'User and all associated data removed' });
    } catch (err) {
        logger.error('Error in deleteUser (admin):', { error: err.message, stack: err.stack });
        res.status(500).send('Server Error');
    }
};


// --- Store Management ---

exports.createStore = async (req, res) => {
  try {
    const storeData = { ...req.body };
    
    if (req.files && req.files.logo) {
      storeData.logo = req.files.logo[0].path;
    }
    if (req.files && req.files.banner_url) {
      storeData.banner_url = req.files.banner_url[0].path;
    }

    const store = new Store(storeData);
    await store.save();
    res.status(201).json(store);
  } catch (err) {
    logger.error('Error in createStore:', { error: err.message, stack: err.stack });
    res.status(500).send('Server Error');
  }
};

exports.updateStore = async (req, res) => {
  try {
    let store = await Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ msg: 'Store not found' });
    }

    const updates = { ...req.body };

    if (req.files && req.files.logo) {
      updates.logo = req.files.logo[0].path;
    }
    if (req.files && req.files.banner_url) {
      updates.banner_url = req.files.banner_url[0].path;
    }

    store = await Store.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true });
    res.json(store);
  } catch (err) {
    logger.error('Error in updateStore:', { error: err.message, stack: err.stack });
    res.status(500).send('Server Error');
  }
};

exports.deleteStore = async (req, res) => {
    try {
        let store = await Store.findById(req.params.id);
        if (!store) {
            return res.status(404).json({ msg: 'Store not found' });
        }
        await store.deleteOne();
        res.json({ msg: 'Store removed' });
    } catch (err) {
        logger.error('Error in deleteStore:', { error: err.message, stack: err.stack });
        res.status(500).send('Server Error');
    }
};


// --- Offer Management ---

exports.createOffer = async (req, res) => {
  try {
    const offerData = { ...req.body };

    if (req.file) {
      offerData.imageUrl = req.file.path;
    }

    if (offerData.isTrending) offerData.isTrending = offerData.isTrending === 'true';
    if (offerData.isExclusive) offerData.isExclusive = offerData.isExclusive === 'true';
    if (offerData.isFeatured) offerData.isFeatured = offerData.isFeatured === 'true';

    if (offerData.terms && typeof offerData.terms === 'string') {
      offerData.terms = offerData.terms.split(',').map(term => term.trim());
    }

    const offer = new Offer(offerData);
    await offer.save();
    res.status(201).json(offer);
  } catch (err) {
    logger.error('Error in createOffer:', { error: err.message, stack: err.stack });
    res.status(500).send('Server Error');
  }
};

exports.updateOffer = async (req, res) => {
  try {
    let offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ msg: 'Offer not found' });
    }

    const updates = { ...req.body };

    if (req.file) {
      updates.imageUrl = req.file.path;
    }
    
    if (updates.isTrending) updates.isTrending = updates.isTrending === 'true';
    if (updates.isExclusive) updates.isExclusive = updates.isExclusive === 'true';
    if (updates.isFeatured) updates.isFeatured = updates.isFeatured === 'true';

    if (updates.terms && typeof updates.terms === 'string') {
      updates.terms = updates.terms.split(',').map(term => term.trim());
    }

    offer = await Offer.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true });
    res.json(offer);
  } catch (err) {
    logger.error('Error in updateOffer:', { error: err.message, stack: err.stack });
    res.status(500).send('Server Error');
  }
};

exports.deleteOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ msg: 'Offer not found' });
    }
    await offer.deleteOne();
    res.json({ msg: 'Offer removed' });
  } catch (err) {
    logger.error('Error in deleteOffer:', { error: err.message, stack: err.stack });
    res.status(500).send('Server Error');
  }
};

// --- Notification Management ---

exports.sendNotification = async (req, res) => {
  const { type, title, message, userId } = req.body;

  try {
    const notificationData = {
      type,
      title,
      message,
      recipient: userId
    };

    const io = getIo();
    const notificationService = new NotificationService(io);
    const notification = await notificationService.createNotification(notificationData);

    res.status(201).json(notification);
  } catch (err) {
    logger.error('Error sending notification:', { error: err.message, stack: err.stack });
    res.status(500).send('Server Error');
  }
};

exports.getNotificationStats = async (req, res) => {
  try {
    const totalSent = await Notification.countDocuments();
    const totalRead = await Notification.countDocuments({ isRead: true });
    const totalClicks = await Notification.countDocuments({ isClicked: true });

    const stats = {
      totalSent,
      totalRead,
      readRate: totalSent > 0 ? (totalRead / totalSent) : 0,
      totalClicks,
      clickThroughRate: totalSent > 0 ? (totalClicks / totalSent) : 0,
    };

    res.json(stats);
  } catch (err) {
    logger.error('Error getting notification stats:', { error: err.message, stack: err.stack });
    res.status(500).send('Server Error');
  }
};

// --- Chat Management ---
exports.startChatWithUser = async (req, res) => {
  const { adminId, userId } = req.body;

  try {
    // Find an existing conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [adminId, userId] },
    });

    // If no conversation exists, create a new one
    if (!conversation) {
      conversation = new Conversation({
        participants: [adminId, userId],
      });
      await conversation.save();
    }

    // Return the conversation, populated with participant details
    const populatedConversation = await Conversation.findById(conversation._id).populate('participants');

    res.status(200).json(populatedConversation);
  } catch (err) {
    logger.error('Error in startChatWithUser (admin):', { error: err.message, stack: err.stack });
    res.status(500).send('Server Error');
  }
};
