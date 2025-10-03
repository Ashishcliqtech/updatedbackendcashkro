
const Message = require('../models/message.model');
const Conversation = require('../models/conversation.model');
const User = require('../models/user.model');
const mongoose = require('mongoose');

module.exports = (notificationService) => {

  const startChat = async (req, res) => {
    try {
      const { userId, adminId } = req.body;

      // Ensure the user starting the chat is the one making the request
      if (req.user.id !== userId) {
        return res.status(403).json({ msg: 'You can only start a chat for yourself.' });
      }

      let conversation = await Conversation.findOne({
        participants: { $all: [userId, adminId] },
      });

      if (!conversation) {
        conversation = new Conversation({
          participants: [userId, adminId],
        });
        await conversation.save();
      }

      res.status(201).json(conversation);
    } catch (error) {
      console.error('Server error starting chat:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  };


  const getUserConversations = async (req, res) => {
    try {
      const { userId } = req.params;

      // Ensure the user is fetching their own conversations
      if (req.user.id !== userId) {
        return res.status(403).json({ msg: 'You can only fetch your own conversations.' });
      }

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

      const conversation = await Conversation.findById(conversationId);

      if (!conversation) {
        return res.status(404).json({ msg: 'Conversation not found.' });
      }

      // Ensure the user is a participant of the conversation
      if (!conversation.participants.includes(req.user.id)) {
        return res.status(403).json({ msg: 'You are not authorized to view this conversation.' });
      }


      const messages = await Message.find({ conversationId }).sort('createdAt');
      res.status(200).json(messages);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  const sendMessage = async (req, res) => {
    try {
      const { sender, receiver, message, conversationId } = req.body;

      // Ensure the sender is the logged-in user
      if (req.user.id !== sender) {
        return res.status(403).json({ msg: 'You can only send messages as yourself.' });
      }

      let conversation;
      if (conversationId) {
        conversation = await Conversation.findById(conversationId);
      } else {
        conversation = await Conversation.findOne({
          participants: { $all: [sender, receiver] },
        });
      }


      if (!conversation) {
        // Create a new conversation if it doesn't exist
        conversation = new Conversation({
          participants: [sender, receiver],
        });
        await conversation.save();
      }

      // Ensure the sender is a participant of the conversation
      if (!conversation.participants.includes(sender)) {
        return res.status(403).json({ msg: 'You are not a participant of this conversation.' });
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
    startChat,
    getUserConversations,
    getConversationMessages,
    sendMessage,
  };
};
