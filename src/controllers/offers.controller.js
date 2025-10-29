const Offer = require('../models/offer.model');
const Click = require('../models/click.model.js'); 
const Transaction = require('../models/transaction.model'); // Added Transaction model
const Wallet = require('../models/wallet.model'); // Added Wallet model
const Activity = require('../models/activity.model'); // Added Activity model
const { v4: uuidv4 } = require('uuid'); 
const logger = require('../utils/logger');
const { calculateCashback } = require('../utils/cashbackCalculator');

/**
 * Helper function to create a pending transaction and update the wallet immediately upon click.
 * NOTE: This implementation assumes a mock purchase amount or requires the client to pass
 * the expected amount if a click-to-pending model is used.
 * For this best practice update, we are using a placeholder amount.
 */
const createPendingCashback = async (userId, offer, clickId) => {
    try {
        // --- BEST PRACTICE NOTE ---
        // In a real system, the actual purchase amount is unknown at the time of click.
        // For demonstration/testing, we use a placeholder amount (e.g., 500)
        const mockPurchaseAmount = 500; // Mock purchase for immediate pending status
        
        // Ensure offer object is fully populated before calculating
        if (!offer || !offer.store || !offer.category || typeof offer.cashbackRate !== 'number') {
            logger.error('Cannot create pending cashback: Missing offer details or cashback rate.', { offerId: offer._id });
            return null;
        }
        
        // Calculate the NET cashback based on mock purchase and default rules
        const calculationResult = calculateCashback(
            mockPurchaseAmount, 
            'Bronze', 
            offer.category.name 
        );
        
        if (!calculationResult.isEligible) {
            logger.warn(`Click event ineligible for mock pending cashback. Reason: ${calculationResult.details}`);
            return null;
        }

        const { netCashback, grossCashback, platformFee } = calculationResult;

        // 1. Create a PENDING transaction
        const newTransaction = new Transaction({
            user: userId,
            amount: netCashback, // Storing the NET amount for consistency
            type: 'credit',
            status: 'pending', 
            description: 
                `PENDING from click on ${offer.store.name} (Mock: ${mockPurchaseAmount.toFixed(2)}) ` +
                `| Gross: ${grossCashback.toFixed(2)} | Fee: ${platformFee.toFixed(2)} | Net: ${netCashback.toFixed(2)}`,
        });
        await newTransaction.save();
        
        // 2. Update the user's wallet: increment pendingCashback and totalCashback
        await Wallet.findOneAndUpdate(
            { user: userId },
            { $inc: { pendingCashback: netCashback, totalCashback: netCashback } },
            { new: true, upsert: true }
        );

        // 3. Log activity
        const activity = new Activity({
            type: 'transaction',
            message: `New PENDING NET cashback of ${netCashback.toFixed(2)} created for user ${userId} on click (Offer: ${offer._id})`,
            user: userId
        });
        await activity.save();

        logger.info(`Pending transaction created on click. User: ${userId}, Net Amount: ${netCashback.toFixed(2)}`);
        return newTransaction;
    } catch (error) {
        logger.error('Error creating pending cashback on click:', { error: error.message, stack: error.stack });
        return null;
    }
};

// @route   GET /api/offers
// @desc    Get all offers with filtering and pagination
// @access  Public
exports.getOffers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const { store, category, offerType, search, sortBy, sortOrder, minCashback } = req.query;

    const query = {};
    if (store) query.store = store;
    if (category) query.category = category;
    if (offerType) query.offerType = offerType;
    if (minCashback) query.cashbackRate = { $gte: parseInt(minCashback, 10) };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const sortOptions = {};
    if (sortBy === 'expiry') sortOptions.expiryDate = sortOrder === 'asc' ? 1 : -1;
    else if (sortBy === 'cashback') sortOptions.cashbackRate = sortOrder === 'desc' ? -1 : 1;
    else sortOptions.createdAt = -1; // Default sort by newest

    const offers = await Offer.find(query)
      .populate('store', 'name logo')
      .populate('category', 'name')
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit);
      
    const totalOffers = await Offer.countDocuments(query);

    res.json({
        offers,
        total: totalOffers,
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
// @desc    Tracks a user's click on an offer, creates a PENDING transaction, and redirects
// @access  Authenticated
exports.trackOfferClick = async (req, res) => {
    try {
        const offerId = req.params.id;
        const userId = req.user.id; 

        // Populate store along with the offer to ensure data integrity
        const offer = await Offer.findById(offerId).populate('store');
        if (!offer) {
            logger.warn(`trackOfferClick: Offer not found for ID ${offerId}`);
            return res.status(404).json({ msg: 'Offer not found' });
        }

        // 1. Generate a unique ID for this specific click
        const clickId = uuidv4();

        // 2. Create the Click record linking the user to the offer/store
        const newClick = new Click({
            user: userId,
            offer: offerId,
            store: offer.store._id,
            clickId: clickId,
        });
        await newClick.save();
        
        // 3. *** NEW LOGIC: Create PENDING Transaction on Click ***
        // Only attempt to create cashback if the offer type is 'cashback'
        if (offer.offerType === 'cashback') {
            await createPendingCashback(userId, offer, clickId);
        } else {
            logger.info(`Offer ${offerId} is not a cashback type (${offer.offerType}). Skipping pending transaction creation.`);
        }


        // 4. Construct the final affiliate URL with the clickId for tracking
        const baseUrl = offer.url || offer.store.url;
        let trackingUrl;

        try {
            trackingUrl = new URL(baseUrl);
            trackingUrl.searchParams.append('subid', clickId); 
        } catch (e) {
             logger.error(`Error processing URL for offer ${offerId}: ${e.message}`);
             trackingUrl = { href: baseUrl }; 
        }


        logger.info(`Offer ${offerId} clicked by user ${userId} with clickId ${clickId}. Redirecting to: ${trackingUrl.href}`);
        
        // Respond with the URL for the frontend to handle redirection
        res.status(200).json({ redirectUrl: trackingUrl.href });

    } catch (err) {
        logger.error('Error in trackOfferClick:', { error: err.message, stack: err.stack });
        res.status(500).send('Server Error');
    }
};
