const mongoose = require('mongoose');

const staffAttendanceSchema = new mongoose.Schema({
  staff: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  staffName: { type: String, required: true },
  staffEmail: { type: String, required: true },
  staffSubject: { type: String },
  date: { type: Date, required: true },
  inTime: { type: String },
  outTime: { type: String },
  totalHours: { type: String },
  status: { type: String, enum: ['present', 'absent', 'late', 'on-leave'], required: true },
  leaveType: { type: String },
  remarks: String
}, { timestamps: true });

module.exports = mongoose.model('StaffAttendance', staffAttendanceSchema);