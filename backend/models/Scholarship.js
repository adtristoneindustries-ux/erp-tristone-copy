const mongoose = require('mongoose');

const scholarshipSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  type: { type: String, enum: ['Merit', 'Government', 'Sports', 'Minority', 'Management', 'Other'], default: 'Merit' },
  amount: { type: Number, required: true },
  amountType: { type: String, enum: ['Fixed', 'Percentage'], default: 'Fixed' },
  academicYear: { type: String, required: true },
  deadline: Date,
  eligibilityCriteria: {
    minAttendance: { type: Number, default: 0 },
    maxFamilyIncome: { type: Number, default: 0 },
    minCGPA: { type: Number, default: 0 },
    classes: [String],
    description: String
  },
  status: { type: String, enum: ['Active', 'Closed'], default: 'Active' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const applicationSchema = new mongoose.Schema({
  scholarship: { type: mongoose.Schema.Types.ObjectId, ref: 'Scholarship', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  academicYear: String,
  reason: String,
  familyIncome: Number,
  previousScholarship: { type: Boolean, default: false },
  status: { type: String, enum: ['Pending', 'Verified', 'Approved', 'Rejected'], default: 'Pending' },
  staffRemarks: String,
  adminRemarks: String,
  approvedAmount: Number,
  approvedAmountType: String,
  validFrom: Date,
  validTo: Date,
  appliedDate: { type: Date, default: Date.now },
  verifiedDate: Date,
  approvedDate: Date
}, { timestamps: true });

const Scholarship = mongoose.model('Scholarship', scholarshipSchema);
const ScholarshipApplication = mongoose.model('ScholarshipApplication', applicationSchema);

module.exports = { Scholarship, ScholarshipApplication };
