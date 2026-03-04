const mongoose = require('mongoose');

const placementDriveSchema = new mongoose.Schema({
  company_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  job_role: { type: String, required: true },
  salary_lpa: { type: Number, required: true },
  eligibility_cgpa: { type: Number, required: true },
  arrears_limit: { type: Number, required: true },
  required_skills: [{ type: String }],
  drive_date: { type: Date, required: true },
  application_deadline: { type: Date, required: true },
  eligible_departments: [{ type: String }],
  eligible_years: [{ type: Number }],
  status: { type: String, enum: ['open', 'closed', 'ongoing'], default: 'open' },
  assigned_officer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('PlacementDrive', placementDriveSchema);
