const express = require('express');
const router = express.Router();
const offersController = require('../controllers/offers.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Public routes
router.get('/', offersController.getOffers);
router.get('/trending', offersController.getTrendingOffers);
router.get('/featured', offersController.getFeaturedOffers);
router.get('/exclusive', offersController.getExclusiveOffers);
router.get('/search', offersController.searchOffers);
router.get('/:id', offersController.getOfferById);
router.post('/:id/track', authMiddleware, offersController.trackOfferClick);

// Tracking route - can be public or require auth depending on business logic
router.post('/:id/track', authMiddleware, offersController.trackOfferClick);

// Admin routes for CUD operations are in admin.routes.js

module.exports = router;
