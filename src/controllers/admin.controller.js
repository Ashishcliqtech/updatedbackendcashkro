const User = require('../models/user.model');
const Store = require('../models/store.model');
const Offer = require('../models/offer.model');
const logger = require('../utils/logger');
const Wallet = require('../models/wallet.model');
const Referral = require('../models/referral.model');
const Transaction = require('../models/transaction.model');

// --- User Management ---

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Admin
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        logger.error('Error in getAllUsers (admin):', { error: err.message, stack: err.stack });
        res.status(500).send('Server Error');
    }
};

// @route   GET /api/admin/users/:id
// @desc    Get a single user by ID
// @access  Admin
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

// @route   PUT /api/admin/users/:id
// @desc    Update a user's role or status
// @access  Admin
exports.updateUser = async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        logger.error('Error in updateUser (admin):', { error: err.message, stack: err.stack });
        res.status(500).send('Server Error');
    }
};

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
// @access  Admin
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        // Also delete associated data
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

// @route   POST /api/admin/stores
// @desc    Create a new store
// @access  Admin
exports.createStore = async (req, res) => {
  const { name, description, url, category, isPopular, isFeatured, cashback_rate } = req.body;
  
  try {
    const storeData = {
      name,
      description,
      url,
      category,
      isPopular: isPopular === 'true',
      isFeatured: isFeatured === 'true',
      cashback_rate,
      logo: req.files.logo ? req.files.logo[0].path : '',
      banner_url: req.files.banner_url ? req.files.banner_url[0].path : '',
    };

    const store = new Store(storeData);
    await store.save();
    res.status(201).json(store);
  } catch (err) {
    logger.error('Error in createStore:', { error: err.message, stack: err.stack });
    res.status(500).send('Server Error');
  }
};

exports.updateStore = async (req, res) => {
  const { name, description, url, category, isPopular, isFeatured, cashback_rate } = req.body;
  
  try {
    let store = await Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ msg: 'Store not found' });
    }

    const updates = {
      name,
      description,
      url,
      category,
      isPopular: isPopular === 'true',
      isFeatured: isFeatured === 'true',
      cashback_rate,
    };

    if (req.files.logo) {
      updates.logo = req.files.logo[0].path;
    }
    if (req.files.banner_url) {
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

// @route   POST /api/admin/offers
// @desc    Create a new offer
// @access  Admin
exports.createOffer = async (req, res) => {
    try {
      const newOffer = new Offer({
        ...req.body,
        imageUrl: req.file ? req.file.path : undefined,
      });
      const offer = await newOffer.save();
      res.status(201).json(offer);
    } catch (err) {
      logger.error('Error in createOffer (admin):', { error: err.message, stack: err.stack });
      res.status(500).send('Server Error');
    }
};

// @route   PUT /api/admin/offers/:id
// @desc    Update an offer
// @access  Admin
exports.updateOffer = async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (req.file) {
            updateData.imageUrl = req.file.path;
        }
        const offer = await Offer.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true });
        if (!offer) return res.status(404).json({ msg: 'Offer not found' });
        res.json(offer);
    } catch (err) {
        logger.error('Error in updateOffer (admin):', { error: err.message, stack: err.stack });
        res.status(500).send('Server Error');
    }
};

// @route   DELETE /api/admin/offers/:id
// @desc    Delete an offer
// @access  Admin
exports.deleteOffer = async (req, res) => {
    try {
        const offer = await Offer.findById(req.params.id);
        if (!offer) return res.status(404).json({ msg: 'Offer not found' });
        await offer.deleteOne();
        res.json({ msg: 'Offer removed' });
    } catch (err) {
        logger.error('Error in deleteOffer (admin):', { error: err.message, stack: err.stack });
        res.status(500).send('Server Error');
    }
};

