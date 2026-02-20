const mongoose = require('mongoose');

const markReadSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mark: { type: mongoose.Schema.Types.ObjectId, ref: 'Mark', required: true },
  readAt: { type: Date, default: Date.now }
}, { timestamps: true });

markReadSchema.index({ user: 1, mark: 1 }, { unique: true });

module.exports = mongoose.model('MarkRead', markReadSchema);