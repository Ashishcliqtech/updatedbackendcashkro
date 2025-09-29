// src/models/click.model.js
const mongoose = require('mongoose');

const ClickSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  offer: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer', required: true },
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  clickId: { type: String, required: true, unique: true }, // A unique ID you generate
}, {
  timestamps: true,
});

module.exports = mongoose.model('Click', ClickSchema);