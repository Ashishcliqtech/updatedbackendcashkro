const mongoose = require('mongoose');

const ContentSectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: Object,
  },
  imageUrl: {
    type: String,
  },
  page: {
    type: String,
    required: true, // e.g., 'homepage', 'about'
  },
});

module.exports = mongoose.model('ContentSection', ContentSectionSchema);
