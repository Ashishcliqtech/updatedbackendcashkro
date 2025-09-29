const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categories.controller');

// PUBLIC ROUTES ======================================
// No authentication required

// @route   GET /api/categories
// @desc    Get all categories with store and offer counts
// @access  Public
router.get('/', categoriesController.getAllCategories);

// @route   GET /api/categories/:id
// @desc    Get a single category by ID
// @access  Public
router.get('/:id', categoriesController.getCategoryById);

// @route   GET /api/categories/:id/offers
// @desc    Get all offers for a specific category
// @access  Public
router.get('/:id/offers', categoriesController.getOffersByCategory);

// @route   GET /api/categories/:id/stores
// @desc    Get all stores for a specific category
// @access  Public
router.get('/:id/stores', categoriesController.getStoresByCategory);

module.exports = router;