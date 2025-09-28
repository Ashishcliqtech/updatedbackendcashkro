const express = require('express');
const router = express.Router();
const storesController = require('../controllers/stores.controller');

// Public routes
router.get('/', storesController.getStores);
router.get('/popular', storesController.getPopularStores);
router.get('/featured', storesController.getFeaturedStores);
router.get('/search', storesController.searchStores);
router.get('/:id', storesController.getStoreById);

// Admin routes for CUD operations are in admin.routes.js

module.exports = router;
