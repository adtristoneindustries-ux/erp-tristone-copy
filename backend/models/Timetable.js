const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  class: { type: String, required: true },
  section: { type: String, default: 'A' },
  schedule: {
    Monday: [{
      period: Number,
      time: String,
      subject: String,
      teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }],
    Tuesday: [{
      period: Number,
      time: String,
      subject: String,
      teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }],
    Wednesday: [{
      period: Number,
      time: String,
      subject: String,
      teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }],
    Thursday: [{
      period: Number,
      time: String,
      subject: String,
      teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }],
    Friday: [{
      period: Number,
      time: String,
      subject: String,
      teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }]
  }
}, { timestamps: true });

module.exports = mongoose.model('Timetable', timetableSchema);
