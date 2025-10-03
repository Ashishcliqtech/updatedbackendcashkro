const mongoose = require('mongoose');

const aiSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    history: [
        {
            role: {
                type: String,
                enum: ['user', 'model'],
                required: true,
            },
            parts: [
                {
                    text: {
                        type: String,
                        required: true,
                    },
                },
            ],
        },
    ],
});

module.exports = mongoose.model('AI', aiSchema);
