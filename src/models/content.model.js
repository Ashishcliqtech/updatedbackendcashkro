const mongoose = require('mongoose');

const ContentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['hero', 'featured', 'highlighted', 'banner', 'testimonial'],
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'scheduled'],
    default: 'active',
  },
  content: {
    title: String,
    subtitle: String,
    description: String,
    imageUrl: String,
    buttonText: String,
    buttonLink: String,
  },
  position: {
    type: Number,
    default: 0,
  },
  devices: {
    type: [String],
    enum: ['desktop', 'tablet', 'mobile'],
    default: ['desktop', 'tablet', 'mobile'],
  },
  scheduledDate: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastModified: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Content', ContentSchema);
