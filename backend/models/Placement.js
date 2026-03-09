const mongoose = require('mongoose');

const placementSchema = new mongoose.Schema({
  company: { type: String, required: true },
  position: { type: String, required: true },
  package: Number,
  description: String,
  requirements: String,
  deadline: Date,
  status: { type: String, enum: ['Open', 'Closed'], default: 'Open' },
  applications: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    appliedDate: Date,
    status: { type: String, enum: ['Applied', 'Shortlisted', 'Selected', 'Rejected'], default: 'Applied' },
    resume: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Placement', placementSchema);
