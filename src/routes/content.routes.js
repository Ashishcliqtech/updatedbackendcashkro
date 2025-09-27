const express = require('express');
const router = express.Router();
const contentController = require('../controllers/content.controller');
const authMiddleware = require('../middleware/auth.middleware');
const adminMiddleware = require('../middleware/admin.middleware');
const upload = require('../middleware/upload.middleware');

// @route   GET /api/content
// @desc    Get all content sections
// @access  Public
router.get('/', contentController.getContentSections);

// @route   POST /api/content
// @desc    Create a content section with an image upload
// @access  Admin
router.post('/', authMiddleware, adminMiddleware, upload.single('imageUrl'), contentController.createContentSection);

// @route   PUT /api/content/:id
// @desc    Update a content section, with an optional image upload
// @access  Admin
router.put('/:id', authMiddleware, adminMiddleware, upload.single('imageUrl'), contentController.updateContentSection);

// @route   DELETE /api/content/:id
// @desc    Delete a content section
// @access  Admin
router.delete('/:id', authMiddleware, adminMiddleware, contentController.deleteContentSection);

module.exports = router;