const mongoose = require('mongoose');

const placementApplicationSchema = new mongoose.Schema({
  drive_id: { type: mongoose.Schema.Types.ObjectId, ref: 'PlacementDrive', required: true },
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  applied_date: { type: Date, default: Date.now },
  current_status: { 
    type: String, 
    enum: ['Applied', 'Shortlisted', 'Rejected', 'Interview Scheduled', 'On Going', 'Selected', 'Offer Released'], 
    default: 'Applied' 
  },
  status_history: [{
    status: String,
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updated_at: { type: Date, default: Date.now },
    remarks: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('PlacementApplication', placementApplicationSchema);
