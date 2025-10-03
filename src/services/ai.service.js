const { GoogleGenerativeAI } = require('@google/generative-ai');
const AI = require('../models/ai.model');

// Load API Key from environment
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get chat history for a user
exports.getChatHistory = async (userId) => {
  let aiChat = await AI.findOne({ userId });
  if (!aiChat) {
    aiChat = new AI({ userId, history: [] });
    await aiChat.save();
  }
  return aiChat.history;
};

// Send a message to Gemini AI
exports.sendMessage = async (userId, message) => {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro-latest' });

    const userHistory = await exports.getChatHistory(userId);

    // --- START: SANITIZATION ---
    // Create a new array containing only the 'role' and 'parts' fields.
    const cleanHistory = userHistory.map(item => ({
        role: item.role,
        parts: item.parts.map(part => ({
            text: part.text
        }))
    }));
    // --- END: SANITIZATION ---

    const chat = model.startChat({
        history: cleanHistory, // Use the sanitized history
        generationConfig: {
            maxOutputTokens: 1000,
        },
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    // Save conversation history
    await AI.findOneAndUpdate(
        { userId },
        {
            $push: {
                history: {
                    $each: [
                        { role: 'user', parts: [{ text: message }] },
                        { role: 'model', parts: [{ text }] },
                    ],
                },
            },
        },
        { new: true, upsert: true }
    );

    return { role: 'model', parts: [{ text }] };
};