// src/routes/health.routes.js
const express = require('express');
const router = express.Router();

// @route   GET /api/health
// @desc    Health check/Keep-Alive endpoint
// @access  Public
router.get('/', (req, res) => {
  // This endpoint is minimal and just sends a 200 OK response quickly.
  res.status(200).send('OK');
});

module.exports = router;