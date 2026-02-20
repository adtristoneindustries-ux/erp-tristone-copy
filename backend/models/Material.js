const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  fileUrl: { type: String, required: true },
  fileName: String,
  fileSize: Number,
  fileType: String,
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  class: { type: String, required: true },
  section: { type: String, required: true },
  isNewMaterial: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Material', materialSchema);
