const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categories.controller');
const authMiddleware = require('../middleware/auth.middleware');
const adminMiddleware = require('../middleware/admin.middleware');

// Public routes
router.get('/', categoriesController.getAllCategories);
router.get('/:id', categoriesController.getCategoryById);
router.get('/:id/offers', categoriesController.getOffersByCategory);
router.get('/:id/stores', categoriesController.getStoresByCategory);

// Admin routes for CUD operations are in admin.routes.js

module.exports = router;
