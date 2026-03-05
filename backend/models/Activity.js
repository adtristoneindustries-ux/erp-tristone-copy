const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ['course', 'club', 'sport'], required: true },
  description: String,
  icon: String,
  memberCount: { type: Number, default: 0 },
  maxMembers: Number,
  activities: [{
    title: String,
    description: String,
    date: Date,
    location: String
  }],
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);
