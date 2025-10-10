const mongoose = require('mongoose');

const ContentSectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  page: {
    type: String,
    required: true, // e.g., 'homepage', 'about'
    trim: true,
  },
  contentType: {
    type: String,
    required: true,
    trim: true,
    enum: ['hero', 'banner', 'text', 'faq', 'testimonial'],
    default: 'text',
  },
  content: {
    type: mongoose.Schema.Types.Mixed, // Allows for flexible content (JSON)
    required: true,
  },
  imageUrl: {
    type: String,
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft',
  },
}, {
  timestamps: true,
});

ContentSectionSchema.index({ page: 1, status: 1 });

module.exports = mongoose.model('ContentSection', ContentSectionSchema);
