const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(express.json());
app.use(cors());

// Define Routes
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/user', require('./src/routes/user.routes'));
app.use('/api/categories', require('./src/routes/categories.routes'));
app.use('/api/content', require('./src/routes/content.routes'));
app.use('/api/offers', require('./src/routes/offers.routes'));
app.use('/api/referrals', require('./src/routes/referral.routes'));
app.use('/api/stores', require('./src/routes/stores.routes'));
app.use('/api/wallet', require('./src/routes/wallet.routes'));

// Admin Routes (Optional, can be a separate app or protected area)
// For this project, we assume admin routes are part of the same app
// and protected by middleware. The provided structure already has this.
app.use('/api/admin', require('./src/routes/admin.routes'));


module.exports = app;
