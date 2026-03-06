const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  isbn: { type: String, required: true, unique: true },
  author: { type: String, required: true },
  publisher: { type: String, required: true },
  edition: { type: String },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'BookCategory', required: true },
  language: { type: String, default: 'English' },
  total_copies: { type: Number, required: true, default: 1 },
  available_copies: { type: Number, required: true, default: 1 },
  rack_number: { type: String },
  shelf_number: { type: String },
  cover_image: { type: String },
  description: { type: String },
  barcode: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);
