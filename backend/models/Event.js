const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: String, required: true },
  location: { type: String, required: true },
  coordinator: { type: String, required: true },
  status: { type: String, enum: ['Planning', 'Upcoming', 'Completed', 'Cancelled'], default: 'Planning' },
  description: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
