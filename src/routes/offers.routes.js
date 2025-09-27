const express = require('express');
const router = express.Router();
const offersController = require('../controllers/offers.controller');
const authMiddleware = require('../middleware/auth.middleware');
const adminMiddleware = require('../middleware/admin.middleware');
const upload = require('../middleware/upload.middleware');

router.get('/', offersController.getOffers);
router.get('/:id', offersController.getOffer);
router.post(
  '/',
  authMiddleware,
  adminMiddleware,
  upload.single('imageUrl'),
  offersController.createOffer
);

module.exports = router;