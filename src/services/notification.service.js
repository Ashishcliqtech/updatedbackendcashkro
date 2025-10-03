const User = require('../models/user.model');
const Notification = require('../models/notification.model');
const jwt = require('jsonwebtoken');

class NotificationService {
  constructor(io) {
    this.io = io;
    this.users = {};
  }

  init() {
    this.io.on('connection', (socket) => {
      console.log('A user connected');

      socket.on('authenticate', async (token) => {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          this.users[decoded.id] = socket.id;
          console.log(`User ${decoded.id} authenticated and connected`);
        } catch (err) {
          console.log('Authentication error', err.message);
          socket.disconnect();
        }
      });

      socket.on('disconnect', () => {
        for (const userId in this.users) {
          if (this.users[userId] === socket.id) {
            delete this.users[userId];
            console.log(`User ${userId} disconnected`);
            break;
          }
        }
      });
    });
  }

  async createNotification(notificationData) {
    const { recipient, ...data } = notificationData;

    let userIds = [];
    if (recipient === 'all') {
      const users = await User.find({}, '_id');
      userIds = users.map(user => user._id);
    } else {
      userIds = Array.isArray(recipient) ? recipient : [recipient];
    }

    const notifications = await Promise.all(userIds.map(async (userId) => {
      const notification = new Notification({
        ...data,
        recipient: userId,
      });
      await notification.save();

      // 2. Push to connected user
      if (this.users[userId]) {
        this.io.to(this.users[userId]).emit('new_notification', notification);
      }
      
      return notification;
    }));

    return notifications;
  }
}

module.exports = NotificationService;
