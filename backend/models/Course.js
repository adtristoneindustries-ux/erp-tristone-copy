const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['course', 'club', 'sport'], required: true },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eligibleClasses: [{ type: String }],
  maxCapacity: { type: Number, default: 50 },
  schedule: {
    days: [{ type: String }],
    startTime: { type: String },
    endTime: { type: String },
    text: { type: String }
  },
  location: { type: String },
  status: { type: String, enum: ['active', 'inactive', 'completed'], default: 'active' },
  startDate: { type: Date },
  endDate: { type: Date },
  fee: { type: Number, default: 0 },
  duration: { type: String },
  prerequisites: { type: String },
  image: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
