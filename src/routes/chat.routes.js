
const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth.middleware');

module.exports = (notificationService) => {
  const chatController = require('../controllers/chat.controller')(notificationService);

  // Get user's conversations
  router.get('/conversations', protect, chatController.getUserConversations);

  // Start a new conversation
  router.post('/conversations', protect, chatController.startNewConversation);

  // Get conversation messages
  router.get('/conversations/:conversationId/messages', protect, chatController.getConversationMessages);

  // Send a message
  router.post('/conversations/:conversationId/messages', protect, chatController.sendMessage);

  return router;
};
