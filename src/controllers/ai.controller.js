const aiService = require('../services/ai.service');

exports.getChatHistory = async (req, res) => {
    try {
        const history = await aiService.getChatHistory(req.user.id);
        res.status(200).json({ history });
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve chat history.' });
    }
};

exports.sendMessage = async (req, res) => {
    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ error: 'Message is required.' });
    }

    try {
        const response = await aiService.sendMessage(req.user.id, message);
        res.status(200).json({ response });
    } catch (error) {
        res.status(500).json({ error: 'Failed to communicate with the AI.' });
    }
};
