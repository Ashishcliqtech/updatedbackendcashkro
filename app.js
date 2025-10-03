
const express = require('express');
const cors = require('cors');
const http = require('http');
const connectDB = require('./src/config/db');
const { initSocket } = require('./src/utils/socket');
const { initChat } = require('./src/utils/chat');
const onlineController = require('./src/controllers/online.controller');
const NotificationService = require('./src/services/notification.service');

const app = express();
const server = http.createServer(app);

// Connect Database
connectDB();

// Init Middleware
app.use(express.json());
app.use(cors());

// Initialize Socket.io
const io = initSocket(server);
app.set('socketio', io);
initChat(io);
onlineController.setup(io);
const notificationService = new NotificationService(io);
notificationService.init();

// Define Routes
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/user', require('./src/routes/user.routes'));
app.use('/api/categories', require('./src/routes/categories.routes'));
app.use('/api/content', require('./src/routes/content.routes'));
app.use('/api/offers', require('./src/routes/offers.routes'));
app.use('/api/referrals', require('./src/routes/referral.routes'));
app.use('/api/stores', require('./src/routes/stores.routes'));
app.use('/api/wallet', require('./src/routes/wallet.routes'));
app.use('/api/webhook', require('./src/routes/webhook.routes.js'));
app.use('/api/notifications', require('./src/routes/notification.routes.js'));
app.use('/api/chat', require('./src/routes/chat.routes')(notificationService));
app.use('/api/online', require('./src/routes/online.routes'));
app.use('/api/ai', require('./src/routes/ai.routes'));

// Admin Routes
app.use('/api/admin', require('./src/routes/admin.routes'));

module.exports = { app, server };
