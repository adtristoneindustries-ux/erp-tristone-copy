const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  requestMessage: { type: String },
  responseMessage: { type: String },
  enrolledAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
