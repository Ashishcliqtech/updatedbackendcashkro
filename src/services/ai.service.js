const { GoogleGenerativeAI } = require('@google/generative-ai');
const AI = require('../models/ai.model');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.getChatHistory = async (userId) => {
    let aiChat = await AI.findOne({ userId });
    if (!aiChat) {
        aiChat = new AI({ userId, history: [] });
        await aiChat.save();
    }
    return aiChat.history;
};

exports.sendMessage = async (userId, message) => {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.0-pro'});

    const chat = model.startChat({
        history: await exports.getChatHistory(userId),
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    await AI.findOneAndUpdate(
        { userId },
        { $push: { history: { $each: [{ role: 'user', parts: [{ text: message }] }, { role: 'model', parts: [{ text }] }] } } },
        { new: true, upsert: true }
    );

    return { role: 'model', parts: [{ text }] };
};
