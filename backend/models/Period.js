const mongoose = require('mongoose');

const periodSchema = new mongoose.Schema({
  className: { type: String, required: true },
  section: { type: String, required: true, default: 'A' },
  day: { type: String, required: true, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
  periodNumber: { type: Number, required: true, min: 1, max: 8 },
  time: { type: String, required: true },
  subject: { type: String, required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Compound index to ensure unique periods per class/section/day/period
periodSchema.index({ className: 1, section: 1, day: 1, periodNumber: 1 }, { unique: true });

module.exports = mongoose.model('Period', periodSchema);