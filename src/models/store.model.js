const mongoose = require('mongoose');

const StoreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  logo: {
    type: String,
    required: true,
  },
  banner: String,
  description: {
    type: String,
    required: true,
  },
  cashbackRate: {
    type: Number,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  isPopular: {
    type: Boolean,
    default: false,
  },
  totalOffers: {
    type: Number,
    default: 0,
  },
  website: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Store', StoreSchema);