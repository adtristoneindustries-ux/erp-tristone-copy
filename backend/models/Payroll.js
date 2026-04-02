const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  staff: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  month: { type: String, required: true },
  year: { type: Number, required: true },
  basicSalary: { type: Number, required: true },
  allowances: { type: Number, default: 0 },
  deductions: { type: Number, default: 0 },
  netSalary: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
  paidOn: { type: Date },
  remarks: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Payroll', payrollSchema);
