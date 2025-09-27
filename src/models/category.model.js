const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  storeCount: {
    type: Number,
    default: 0,
  },
  offerCount: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model('Category', CategorySchema);