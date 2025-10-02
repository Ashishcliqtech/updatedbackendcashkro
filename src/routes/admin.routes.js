const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const categoriesController = require('../controllers/categories.controller');
const contentController = require('../controllers/content.controller');
const authMiddleware = require('../middleware/auth.middleware');
const adminMiddleware = require('../middleware/admin.middleware');
const upload = require('../middleware/upload.middleware');

// All routes in this file are protected by auth and admin middleware
router.use(authMiddleware, adminMiddleware);

// --- User Management ---
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

const storeUpload = upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'banner_url', maxCount: 1 }
]);

// --- Store Management ---
router.post('/stores', storeUpload, adminController.createStore);
router.put('/stores/:id', storeUpload, adminController.updateStore);
router.delete('/stores/:id', adminController.deleteStore);

// --- Offer Management ---
router.post('/offers', upload.single('imageUrl'), adminController.createOffer);
router.put('/offers/:id', upload.single('imageUrl'), adminController.updateOffer);
router.delete('/offers/:id', adminController.deleteOffer);

// --- Category Management ---
router.post('/categories', categoriesController.createCategory);
router.put('/categories/:id', categoriesController.updateCategory);
router.delete('/categories/:id', categoriesController.deleteCategory);

// --- Content Management ---
router.post('/content', upload.single('imageUrl'), contentController.createContent);
router.put('/:id', upload.single('imageUrl'), contentController.updateContent);
router.delete('/content/:id', contentController.deleteContent);

// --- Notification Management ---
router.post('/notifications', adminController.createNotification);
router.get('/notifications/stats', adminController.getAllNotificationStats);
router.get('/notifications/:id/stats', adminController.getNotificationStats);


module.exports = router;
