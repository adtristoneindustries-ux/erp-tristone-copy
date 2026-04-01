const mongoose = require('mongoose');

const academicCalendarSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['Holiday', 'Exam', 'Event', 'Meeting'], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  description: { type: String },
  academicYear: { type: String, required: true },
  affectsAll: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('AcademicCalendar', academicCalendarSchema);
