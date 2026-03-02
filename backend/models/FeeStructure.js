const mongoose = require('mongoose');

const feeStructureSchema = new mongoose.Schema({
  class: { type: String, required: true },
  academicYear: { type: String, required: true },
  components: [{
    name: { type: String, required: true },
    amount: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

feeStructureSchema.index({ class: 1, academicYear: 1 }, { unique: true });

module.exports = mongoose.model('FeeStructure', feeStructureSchema);
