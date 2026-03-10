const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  icon: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  autoCalculate: { type: Boolean, default: false },
  calculationType: { type: String, enum: ['perfect_attendance', 'manual'], default: 'manual' }
}, { timestamps: true });

module.exports = mongoose.model('Badge', badgeSchema);
