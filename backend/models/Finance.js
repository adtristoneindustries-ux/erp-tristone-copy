const mongoose = require('mongoose');

const financeSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  academicYear: { type: String, required: true },
  totalFee: { type: Number, required: true },
  scholarshipDiscount: { type: Number, default: 0 },
  finalPayableFee: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  pendingAmount: { type: Number, required: true },
  scholarships: [{
    scholarshipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Scholarship' },
    amount: Number,
    appliedDate: Date
  }],
  transactions: [{
    type: { type: String, enum: ['Payment', 'Scholarship', 'Fee', 'Refund'] },
    amount: Number,
    date: { type: Date, default: Date.now },
    description: String,
    reference: String,
    paymentMethod: { type: String, enum: ['Online', 'Offline', 'Cash', 'Bank Transfer', 'Cheque', 'N/A', 'UPI', 'Card'] },
    paymentId: String,
    orderId: String,
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Finance', financeSchema);
