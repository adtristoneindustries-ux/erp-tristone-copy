const mongoose = require('mongoose');

const scholarshipSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  amount: { type: Number, required: true },
  eligibility: String,
  deadline: Date,
  status: { type: String, enum: ['Active', 'Closed'], default: 'Active' },
  applications: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    appliedDate: Date,
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    documents: [String]
  }]
}, { timestamps: true });

module.exports = mongoose.model('Scholarship', scholarshipSchema);
