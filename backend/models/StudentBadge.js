const mongoose = require('mongoose');

const studentBadgeSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  badge: { type: mongoose.Schema.Types.ObjectId, ref: 'Badge', required: true },
  status: { type: String, enum: ['locked', 'pending', 'earned'], default: 'locked' },
  certificateUrl: { type: String },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  earnedDate: { type: Date },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('StudentBadge', studentBadgeSchema);
