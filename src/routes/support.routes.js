const express = require('express');
const router = express.Router();
const supportController = require('../controllers/support.controller');
const  protect  = require('../middleware/auth.middleware');

router.post('/tickets', protect, supportController.createTicket);
router.get('/tickets', protect, supportController.getTickets);
router.get('/tickets/:id', protect, supportController.getTicketById);
router.post('/tickets/:id/messages', protect, supportController.addMessage);

module.exports = router;
