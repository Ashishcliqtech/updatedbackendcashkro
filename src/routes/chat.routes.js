
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');

router.post('/', chatController.sendMessage);
router.get('/:userId', chatController.getConversations);
router.get('/messages/:conversationId', chatController.getMessages);

module.exports = router;
