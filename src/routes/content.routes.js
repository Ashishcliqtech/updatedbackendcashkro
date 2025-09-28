const express = require('express');
const router = express.Router();
const contentController = require('../controllers/content.controller');
const authMiddleware = require('../middleware/auth.middleware');
const adminMiddleware = require('../middleware/admin.middleware');
const upload = require('../middleware/upload.middleware');

// Public route
router.get('/', contentController.getAllContent);

// Admin routes for CUD operations are in admin.routes.js

module.exports = router;
