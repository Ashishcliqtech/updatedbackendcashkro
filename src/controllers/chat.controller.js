
const Message = require('../models/message.model');
const Conversation = require('../models/conversation.model');
const User = require('../models/user.model');

module.exports = (notificationService) => {
  const getUserConversations = async (req, res) => {
    try {
      const conversations = await Conversation.find({
        participants: req.user._id,
      }).populate('participants');
      res.status(200).json(conversations);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  const startNewConversation = async (req, res) => {
    try {
      const { recipientId } = req.body;
      const senderId = req.user._id;

      let conversation = await Conversation.findOne({
        participants: { $all: [senderId, recipientId] },
      });

      if (!conversation) {
        conversation = new Conversation({
          participants: [senderId, recipientId],
        });

        const recipientUser = await User.findById(recipientId);
        if (recipientUser && recipientUser.role === 'admin') {
          const senderUser = await User.findById(senderId);
          const notificationData = {
            recipient: recipientId,
            title: 'New Chat',
            message: `You have a new chat from ${senderUser.username}.`,
            type: 'CHAT',
            data: {
              conversationId: conversation._id.toString(),
            },
          };
          await notificationService.createNotification(notificationData);
        }
        await conversation.save();
      }

      res.status(201).json(conversation);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  const getConversationMessages = async (req, res) => {
    try {
      const { conversationId } = req.params;
      const messages = await Message.find({ conversationId }).sort('timestamp');
      res.status(200).json(messages);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  const sendMessage = async (req, res) => {
    try {
      const { conversationId } = req.params;
      const { message } = req.body;
      const sender = req.user._id;

      const conversation = await Conversation.findById(conversationId);

      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }

      const receiver = conversation.participants.find(
        (p) => p.toString() !== sender.toString()
      );

      const newMessage = new Message({
        conversationId,
        sender,
        receiver,
        message,
      });

      await newMessage.save();

      conversation.lastMessage = message;
      conversation.lastMessageTimestamp = Date.now();
      await conversation.save();

      const io = req.app.get('socketio');
      io.to(receiver.toString()).emit('new message', newMessage);

      res.status(201).json(newMessage);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  return {
    getUserConversations,
    startNewConversation,
    getConversationMessages,
    sendMessage,
  };
};
