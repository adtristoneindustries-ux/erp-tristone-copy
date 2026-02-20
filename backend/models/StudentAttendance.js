const mongoose = require('mongoose');

const studentAttendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentName: { type: String, required: true },
  studentEmail: { type: String, required: true },
  studentClass: { type: String },
  date: { type: Date, required: true },
  status: { type: String, enum: ['present', 'absent', 'late'], required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  remarks: String
}, { timestamps: true });

module.exports = mongoose.model('StudentAttendance', studentAttendanceSchema);