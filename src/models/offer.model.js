const mongoose = require('mongoose');

const OfferSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  offerType: {
    type: String,
    enum: ['cashback', 'coupon', 'deal'],
    required: true,
  },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  isTrending: { type: Boolean, default: false },
  isExclusive: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  cashbackRate: { type: Number, default: 0 },
  couponCode: { type: String, trim: true },
  imageUrl: { type: String },
  expiryDate: { type: Date },
  originalPrice: { type: Number },
  discountedPrice: { type: Number },
  terms: [{ type: String }], // Added for terms and conditions
  minOrderValue: { type: Number, default: 0 }, // Added for minimum order value
}, {
  timestamps: true, // Automatically add createdAt and updatedAt
});

// Add a text index for searching
OfferSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Offer', OfferSchema);
