const express = require('express');
const router = express.Router();
const storesController = require('../controllers/stores.controller');
const authMiddleware = require('../middleware/auth.middleware');
const adminMiddleware = require('../middleware/admin.middleware');
const upload = require('../middleware/upload.middleware');

router.get('/', storesController.getStores);
router.get('/:id', storesController.getStore);
router.post(
  '/',
  authMiddleware,
  adminMiddleware,
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'banner', maxCount: 1 },
  ]),
  storesController.createStore
);

module.exports = router;