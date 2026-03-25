const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  academicYear: { type: String, required: true },
  feeType: { type: String, enum: ['Tuition', 'Hostel', 'Transport'], required: true },
  totalAmount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  dueAmount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ['Paid', 'Pending', 'Overdue'], default: 'Pending' },
  payments: [{
    amount: Number,
    date: Date,
    paymentMethod: { type: String, enum: ['Online', 'Offline'], required: true },
    transactionId: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Fee', feeSchema);
