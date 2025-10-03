
const Message = require('../models/message.model');
const Conversation = require('../models/conversation.model');
const User = require('../models/user.model');
const mongoose = require('mongoose');

module.exports = (notificationService) => {
  const getUserConversations = async (req, res) => {
    try {
      const { userId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'Invalid user ID format.' });
      }

      const conversations = await Conversation.find({ participants: userId })
        .populate('participants', 'name email');

      res.status(200).json(conversations);
    } catch (error) {
      console.error('Server error fetching conversations:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  };

  const getConversationMessages = async (req, res) => {
    try {
      const { conversationId } = req.params;
      const messages = await Message.find({ conversationId }).sort('createdAt');
      res.status(200).json(messages);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  const sendMessage = async (req, res) => {
    try {
      const { sender, receiver, message } = req.body;

      let conversation = await Conversation.findOne({
        participants: { $all: [sender, receiver] },
      });

      if (!conversation) {
        conversation = new Conversation({
          participants: [sender, receiver],
        });
        await conversation.save();
      }

      const newMessage = new Message({
        conversationId: conversation._id,
        sender,
        receiver,
        message,
      });

      await newMessage.save();

      conversation.lastMessage = message;
      await conversation.save();

      res.status(201).json(newMessage);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  return {
    getUserConversations,
    getConversationMessages,
    sendMessage,
  };
};
