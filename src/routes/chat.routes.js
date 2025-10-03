
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');

module.exports = (notificationService) => {
  const chatController = require('../controllers/chat.controller')(notificationService);

  // All chat routes are protected
  router.use(authMiddleware);

  // Start a new chat session
  router.post('/start', chatController.startChat);

  // Get user's conversations
  router.get('/conversations/:userId', chatController.getUserConversations);

  // Get conversation messages
  router.get('/messages/:conversationId', chatController.getConversationMessages);

  // Send a message
  router.post('/send', chatController.sendMessage);

  return router;
};
