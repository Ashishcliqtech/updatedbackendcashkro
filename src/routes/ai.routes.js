const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const auth = require('../middleware/auth.middleware');

router.get('/chat/history', auth, aiController.getChatHistory);
router.post('/chat/send', auth, aiController.sendMessage);

module.exports = router;
