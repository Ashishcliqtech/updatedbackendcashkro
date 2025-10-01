const Store = require('../models/store.model');
const Offer = require('../models/offer.model');
const logger = require('../utils/logger');

// @route   GET /api/stores
// @desc    Get all stores with filtering and pagination
// @access  Public
exports.getStores = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const { category } = req.query;

    const query = {};
    if (category) query.category = category;

    const stores = await Store.find(query)
      .populate('category', 'name')
      .populate('totalOffers') 
      .skip((page - 1) * limit)
      .limit(limit);
      
    const totalStores = await Store.countDocuments(query);

    res.json({
        stores,
        totalPages: Math.ceil(totalStores / limit),
        currentPage: page,
    });
  } catch (err) {
    logger.error('Error in getStores:', { error: err.message, stack: err.stack });
    res.status(500).send('Server Error');
  }
};

// @route   GET /api/stores/popular
// @desc    Get popular stores
// @access  Public
exports.getPopularStores = async (req, res) => {
    try {
        const stores = await Store.find({ isPopular: true }).limit(10);
        res.json(stores);
    } catch (err) {
        logger.error('Error in getPopularStores:', { error: err.message, stack: err.stack });
        res.status(500).send('Server Error');
    }
};

// @route   GET /api/stores/featured
// @desc    Get featured stores
// @access  Public
exports.getFeaturedStores = async (req, res) => {
    try {
        const stores = await Store.find({ isFeatured: true }).limit(10);
        res.json(stores);
    } catch (err) {
        logger.error('Error in getFeaturedStores:', { error: err.message, stack: err.stack });
        res.status(500).send('Server Error');
    }
};

// @route   GET /api/stores/search
// @desc    Search for stores
// @access  Public
exports.searchStores = async (req, res) => {
    try {
        const { q } = req.query;
        // Create a text index on the 'name' and 'description' fields in your Store model for this to work
        const stores = await Store.find({
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } }
            ]
        }).populate('category', 'name');
        res.json(stores);
    } catch (err) {
        logger.error('Error in searchStores:', { error: err.message, stack: err.stack });
        res.status(500).send('Server Error');
    }
};


// @route   GET /api/stores/:id
// @desc    Get a single store by its ID
// @access  Public
exports.getStoreById = async (req, res) => {
  try {
    // Find the store by its ID and populate its category information
    const store = await Store.findById(req.params.id).populate('category');
    if (!store) {
      return res.status(404).json({ msg: 'Store not found' });
    }

    // Find all offers that belong to this store
    const offers = await Offer.find({ store: req.params.id }).populate('store', 'name logo');

    // Return both the store and its offers in one response
    res.json({ store, offers });
  } catch (err) {
    logger.error('Error in getStoreById:', { error: err.message, stack: err.stack });
    if(err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Store not found' });
    }
    res.status(500).send('Server Error');
  }
};


