const mongoose = require('mongoose');

const StoreSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  isPopular: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  logo: { type: String, required: true },
  banner_url: { type: String }, 
  url: { type: String, required: true },
  cashback_rate: { type: Number, required: true, default: 0 },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Add a text index for searching
StoreSchema.index({ name: 'text', description: 'text' });

// Virtual to count associated offers
StoreSchema.virtual('totalOffers', {
  ref: 'Offer',
  localField: '_id',
  foreignField: 'store',
  count: true,
});

module.exports = mongoose.model('Store', StoreSchema);