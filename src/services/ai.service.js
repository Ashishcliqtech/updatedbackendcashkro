const { GoogleGenerativeAI } = require('@google/generative-ai');
const AI = require('../models/ai.model');

// Load API Key from environment (must match the key from your screenshot)
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
  // ✅ Use free tier supported model
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  // Initialize chat with previous history
  const chat = model.startChat({
    history: await exports.getChatHistory(userId),
  });

  // Send user message
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
