const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
  applicantName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  applyingForClass: { type: String, required: true },
  academicYear: { type: String, required: true },
  previousSchool: { type: String },
  previousClass: { type: String },
  parentName: { type: String, required: true },
  parentPhone: { type: String, required: true },
  address: { type: String },
  status: { type: String, enum: ['Pending', 'Reviewed', 'Accepted', 'Rejected'], default: 'Pending' },
  remarks: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Admission', admissionSchema);
