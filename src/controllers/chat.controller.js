
const Message = require('../models/message.model');
const Conversation = require('../models/conversation.model');
const User = require('../models/user.model');
const NotificationService = require('../services/notification.service');

exports.sendMessage = async (req, res) => {
  try {
    const { sender, receiver, message } = req.body;

    let conversation = await Conversation.findOne({
      participants: { $all: [sender, receiver] },
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [sender, receiver],
      });

      const receiverUser = await User.findById(receiver);
      if (receiverUser && receiverUser.role === 'admin') {
        const senderUser = await User.findById(sender);
        const io = req.app.get('socketio');
        const notificationService = new NotificationService(io);
        const notificationData = {
          recipient: receiver,
          title: 'New Chat',
          message: `You have a new chat from ${senderUser.username}.`,
          type: 'CHAT',
          data: {
            conversationId: conversation._id.toString()
          }
        };
        await notificationService.createNotification(notificationData);
      }
    }

    const newMessage = new Message({
      conversationId: conversation._id,
      sender,
      receiver,
      message,
    });

    await newMessage.save();

    conversation.lastMessage = message;
    conversation.lastMessageTimestamp = Date.now();
    await conversation.save();

    const io = req.app.get('socketio');
    io.to(receiver).emit('new message', newMessage);

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getConversations = async (req, res) => {
  try {
    const { userId } = req.params;
    const conversations = await Conversation.find({
      participants: userId,
    }).populate('participants');
    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = await Message.find({ conversationId }).sort('timestamp');
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
