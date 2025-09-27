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
app.use('/api/content', require('./src/routes/content.routes'));
app.use('/api/stores', require('./src/routes/stores.routes'));
app.use('/api/offers', require('./src/routes/offers.routes'));
app.use('/api/categories', require('./src/routes/categories.routes'));

module.exports = app;