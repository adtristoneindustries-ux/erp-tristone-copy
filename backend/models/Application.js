const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  drive_id: { type: mongoose.Schema.Types.ObjectId, ref: 'PlacementDrive', required: true },
  applied_date: { type: Date, default: Date.now },
  current_status: { 
    type: String, 
    enum: ['Applied', 'Shortlisted', 'Rejected', 'Interview Scheduled', 'On Going', 'Selected', 'Offer Released'],
    default: 'Applied'
  },
  updated_at: { type: Date, default: Date.now }
});

applicationSchema.index({ student_id: 1, drive_id: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
