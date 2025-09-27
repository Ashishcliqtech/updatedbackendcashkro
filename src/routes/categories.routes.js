const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categories.controller');
const authMiddleware = require('../middleware/auth.middleware');
const adminMiddleware = require('../middleware/admin.middleware');

router.get('/', categoriesController.getCategories);
router.post('/', authMiddleware, adminMiddleware, categoriesController.createCategory);

module.exports = router;