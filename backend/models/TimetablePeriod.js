const mongoose = require('mongoose');

const timetablePeriodSchema = new mongoose.Schema({
  className: { type: String, required: true },
  section: { type: String, required: true, default: 'A' },
  day: { type: String, required: true, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
  period: { type: Number, required: true, min: 1, max: 8 },
  time: { type: String, required: true },
  subject: { type: String, required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Compound index to ensure unique period per class/section/day
timetablePeriodSchema.index({ className: 1, section: 1, day: 1, period: 1 }, { unique: true });

module.exports = mongoose.model('TimetablePeriod', timetablePeriodSchema);