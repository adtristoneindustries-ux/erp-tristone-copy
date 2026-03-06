const mongoose = require('mongoose');

const bookReservationSchema = new mongoose.Schema({
  book_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  member_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reservation_date: { type: Date, required: true, default: Date.now },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'cancelled', 'fulfilled'], default: 'pending' },
  processed_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  processed_date: { type: Date },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('BookReservation', bookReservationSchema);
