const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  examName: {
    type: String,
    required: true,
    trim: true
  },
  examType: {
    type: String,
    enum: ['Major Exam', 'Minor Test', 'Quiz', 'Unit Test', 'Mid Term', 'Final Exam'],
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  hall: {
    type: String,
    required: true
  },
  invigilators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  totalMarks: {
    type: Number,
    default: 100
  },
  instructions: {
    type: String,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['Scheduled', 'Ongoing', 'Completed', 'Cancelled'],
    default: 'Scheduled'
  }
}, {
  timestamps: true
});

examSchema.index({ class: 1, date: 1 });
examSchema.index({ date: 1, status: 1 });

module.exports = mongoose.model('Exam', examSchema);
