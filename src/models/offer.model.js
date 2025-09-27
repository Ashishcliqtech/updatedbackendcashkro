const mongoose = require('mongoose');

const OfferSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true,
  },
  cashbackRate: {
    type: Number,
    required: true,
  },
  originalPrice: Number,
  discountedPrice: Number,
  couponCode: String,
  offerType: {
    type: String,
    enum: ['cashback', 'coupon', 'deal'],
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  isExclusive: {
    type: Boolean,
    default: false,
  },
  isTrending: {
    type: Boolean,
    default: false,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  terms: [String],
  minOrderValue: Number,
});

module.exports = mongoose.model('Offer', OfferSchema);