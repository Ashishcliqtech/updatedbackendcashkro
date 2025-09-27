const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middleware/auth.middleware');
const adminMiddleware = require('../middleware/admin.middleware');
const upload = require('../middleware/upload.middleware');

// User Management
router.get('/users', authMiddleware, adminMiddleware, adminController.getAllUsers);
router.get('/users/:id', authMiddleware, adminMiddleware, adminController.getUserById);
router.put('/users/:id', authMiddleware, adminMiddleware, adminController.updateUser);

// Store Management
router.post('/stores', authMiddleware, adminMiddleware, upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'banner', maxCount: 1 }]), adminController.createStore);
router.put('/stores/:id', authMiddleware, adminMiddleware, adminController.updateStore);
router.delete('/stores/:id', authMiddleware, adminMiddleware, adminController.deleteStore);

// Offer Management
router.post('/offers', authMiddleware, adminMiddleware, upload.single('imageUrl'), adminController.createOffer);
router.put('/offers/:id', authMiddleware, adminMiddleware, adminController.updateOffer);
router.delete('/offers/:id', authMiddleware, adminMiddleware, adminController.deleteOffer);

// Category Management
router.post('/categories', authMiddleware, adminMiddleware, adminController.createCategory);
router.put('/categories/:id', authMiddleware, adminMiddleware, adminController.updateCategory);
router.delete('/categories/:id', authMiddleware, adminMiddleware, adminController.deleteCategory);

// Withdrawal Management
router.get('/withdrawals', authMiddleware, adminMiddleware, adminController.getWithdrawals);
router.post('/withdrawals/:transactionId/approve', authMiddleware, adminMiddleware, adminController.approveWithdrawal);
router.post('/withdrawals/:transactionId/reject', authMiddleware, adminMiddleware, adminController.rejectWithdrawal);

module.exports = router;
