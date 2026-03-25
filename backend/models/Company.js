const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  company_name: { type: String, required: true },
  hr_name: { type: String, required: true },
  hr_contact: { type: String, required: true },
  hr_email: { type: String, required: true },
  location: { type: String, required: true },
  assigned_officer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);
