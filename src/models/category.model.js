const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true, // Good practice to trim whitespace
    },
    description: {
      type: String,
      trim: true,
    },
    icon: {
      type: String, // To store the name of the icon, e.g., 'shirt', 'smartphone'
      required: true,
    },
    // storeCount and offerCount are best handled as virtuals
    // to ensure they are always up-to-date without extra database writes.
  },
  {
    // This option automatically adds createdAt and updatedAt fields
    timestamps: true,
    toJSON: { virtuals: true }, // Ensure virtual fields are included in JSON output
    toObject: { virtuals: true },
  }
);

// Virtual properties to dynamically count associated stores and offers
CategorySchema.virtual('storeCount', {
  ref: 'Store',
  localField: '_id',
  foreignField: 'category',
  count: true,
});

CategorySchema.virtual('offerCount', {
  ref: 'Offer',
  localField: '_id',
  foreignField: 'category',
  count: true,
});

module.exports = mongoose.model('Category', CategorySchema);