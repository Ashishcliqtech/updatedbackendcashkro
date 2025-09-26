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

module.exports = app;