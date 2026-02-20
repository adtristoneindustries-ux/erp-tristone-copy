const mongoose = require('mongoose');

const announcementReadSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  announcement: { type: mongoose.Schema.Types.ObjectId, ref: 'Announcement', required: true },
  readAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Compound index to ensure one read record per user per announcement
announcementReadSchema.index({ user: 1, announcement: 1 }, { unique: true });

module.exports = mongoose.model('AnnouncementRead', announcementReadSchema);