const mongoose = require('mongoose');

const scholarshipSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  scholarshipType: { type: String, required: true, enum: ['Merit', 'Government', 'Sports', 'Minority', 'Management', 'Other'] },
  academicYear: { type: String, required: true },
  applicationDate: { type: Date, default: Date.now },
  status: { type: String, default: 'Pending', enum: ['Pending', 'Verified', 'Approved', 'Rejected'] },
  documents: [{ name: String, url: String }],
  reason: { type: String, required: true },
  familyIncome: Number,
  previousScholarship: Boolean,
  staffRemarks: String,
  staffVerifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  staffVerifiedDate: Date,
  adminRemarks: String,
  adminApprovedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  adminApprovedDate: Date,
  amount: Number,
  amountType: { type: String, enum: ['Fixed', 'Percentage'] },
  validFrom: Date,
  validTo: Date,
  eligibilityScore: Number,
  autoEligible: Boolean,
  renewalStatus: { type: String, enum: ['New', 'Renewal', 'Expired'], default: 'New' },
  auditLog: [{
    action: String,
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
    remarks: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Scholarship', scholarshipSchema);
