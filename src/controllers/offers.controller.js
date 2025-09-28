const Offer = require('../models/offer.model');
const logger = require('../utils/logger');

// @route   GET /api/offers
// @desc    Get all offers with filtering and pagination
// @access  Public
exports.getOffers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const { store, category, offerType, sort } = req.query;

    const query = {};
    if (store) query.store = store;
    if (category) query.category = category;
    if (offerType) query.offerType = offerType;

    const sortOptions = {};
    if (sort === 'newest') sortOptions.createdAt = -1;
    if (sort === 'popular') sortOptions.clicks = -1; // Assuming a 'clicks' field

    const offers = await Offer.find(query)
      .populate('store', 'name logo')
      .populate('category', 'name')
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit);
      
    const totalOffers = await Offer.countDocuments(query);

    res.json({
        offers,
        totalPages: Math.ceil(totalOffers / limit),
        currentPage: page,
    });
  } catch (err) {
    logger.error('Error in getOffers:', { error: err.message, stack: err.stack });
    res.status(500).send('Server Error');
  }
};

// @route   GET /api/offers/trending
// @desc    Get trending offers
// @access  Public
exports.getTrendingOffers = async (req, res) => {
    try {
        const offers = await Offer.find({ isTrending: true }).limit(10).populate('store', 'name logo');
        res.json(offers);
    } catch (err) {
        logger.error('Error in getTrendingOffers:', { error: err.message, stack: err.stack });
        res.status(500).send('Server Error');
    }
};

// @route   GET /api/offers/featured
// @desc    Get featured offers
// @access  Public
exports.getFeaturedOffers = async (req, res) => {
    try {
        const offers = await Offer.find({ isFeatured: true }).limit(10).populate('store', 'name logo');
        res.json(offers);
    } catch (err) {
        logger.error('Error in getFeaturedOffers:', { error: err.message, stack: err.stack });
        res.status(500).send('Server Error');
    }
};

// @route   GET /api/offers/exclusive
// @desc    Get exclusive offers
// @access  Public
exports.getExclusiveOffers = async (req, res) => {
    try {
        const offers = await Offer.find({ isExclusive: true }).limit(10).populate('store', 'name logo');
        res.json(offers);
    } catch (err) {
        logger.error('Error in getExclusiveOffers:', { error: err.message, stack: err.stack });
        res.status(500).send('Server Error');
    }
};

// @route   GET /api/offers/search
// @desc    Search for offers
// @access  Public
exports.searchOffers = async (req, res) => {
    try {
        const { q } = req.query;
        const offers = await Offer.find({ $text: { $search: q } }).populate('store', 'name logo');
        res.json(offers);
    } catch (err) {
        logger.error('Error in searchOffers:', { error: err.message, stack: err.stack });
        res.status(500).send('Server Error');
    }
};

// @route   GET /api/offers/:id
// @desc    Get a single offer by its ID
// @access  Public
exports.getOfferById = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate('store').populate('category');
    if (!offer) {
      return res.status(404).json({ msg: 'Offer not found' });
    }
    res.json(offer);
  } catch (err) {
    logger.error('Error in getOfferById:', { error: err.message, stack: err.stack });
    res.status(500).send('Server Error');
  }
};

// @route   POST /api/offers/:id/track
// @desc    Tracks a user's click on an offer
// @access  Public (or Authenticated)
exports.trackOfferClick = async (req, res) => {
    try {
        // In a real application, you would log this click event to a separate
        // analytics service or a dedicated collection. For simplicity, we can
        // increment a counter on the offer itself if one exists.
        // e.g., await Offer.findByIdAndUpdate(req.params.id, { $inc: { clicks: 1 } });
        logger.info(`Offer ${req.params.id} clicked by user ${req.user ? req.user.id : 'guest'}`);
        res.status(200).json({ msg: 'Click tracked' });
    } catch (err) {
        logger.error('Error in trackOfferClick:', { error: err.message, stack: err.stack });
        res.status(500).send('Server Error');
    }
};

