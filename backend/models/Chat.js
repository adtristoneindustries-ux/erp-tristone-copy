const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  chatType: {
    type: String,
    enum: ['student-teacher', 'parent-teacher', 'teacher-student', 'teacher-parent'],
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

chatSchema.index({ sender: 1, receiver: 1 });
chatSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Chat', chatSchema);
