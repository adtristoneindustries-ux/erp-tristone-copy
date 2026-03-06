const mongoose = require('mongoose');

const bookIssueSchema = new mongoose.Schema({
  book_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  member_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  issued_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  issue_date: { type: Date, required: true, default: Date.now },
  due_date: { type: Date, required: true },
  return_date: { type: Date },
  fine_amount: { type: Number, default: 0 },
  fine_paid: { type: Boolean, default: false },
  status: { type: String, enum: ['issued', 'returned', 'lost', 'damaged', 'renewed'], default: 'issued' },
  renewal_count: { type: Number, default: 0 },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('BookIssue', bookIssueSchema);
