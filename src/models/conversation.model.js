
const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  lastMessage: {
    type: String,
  },
  lastMessageTimestamp: {
    type: Date,
  },
});

module.exports = mongoose.model('Conversation', conversationSchema);
