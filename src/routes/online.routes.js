
const express = require('express');
const router = express.Router();
const onlineController = require('../controllers/online.controller');

router.get('/', onlineController.getOnlineUsers);

module.exports = router;
