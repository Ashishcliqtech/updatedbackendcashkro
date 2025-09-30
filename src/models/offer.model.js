const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  url: { type: String, required: true },
  offerType: { type: String, enum: ['cashback', 'coupon', 'deal'], required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  isTrending: { type: Boolean, default: false },
  isExclusive: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  cashbackRate: { type: Number },
  couponCode: { type: String },
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  imageUrl: { type: String },
  expiryDate: { type: Date },
  originalPrice: { type: Number },
  discountedPrice: { type: Number },
  terms: { type: [String], default: [] }, 
  minOrderValue: { type: Number, default: 0 }, 
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

offerSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

module.exports = mongoose.model('Offer', offerSchema);