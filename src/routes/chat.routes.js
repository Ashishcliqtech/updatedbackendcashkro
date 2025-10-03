
const express = require('express');
const router = express.Router();

module.exports = (notificationService) => {
  const chatController = require('../controllers/chat.controller')(notificationService);

  // Get user's conversations
  router.get('/conversations/:userId', chatController.getUserConversations);

  // Get conversation messages
  router.get('/messages/:conversationId', chatController.getConversationMessages);

  // Send a message
  router.post('/send', chatController.sendMessage);

  return router;
};
