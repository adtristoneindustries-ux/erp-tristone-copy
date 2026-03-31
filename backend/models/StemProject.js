const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  dueDate: { type: Date },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date }
});

const submissionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileUrl: { type: String },
  description: { type: String },
  content: { type: String },
  submittedAt: { type: Date, default: Date.now },
  grade: { type: String },
  feedback: { type: String },
  gradedAt: { type: Date },
  gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const stemProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['Robotics', 'AI/ML', 'IoT', 'Web Development', 'Mobile Apps', '3D Printing', 'Electronics', 'Science', 'Other'],
    required: true
  },
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'intermediate' },
  status: { type: String, enum: ['active', 'completed', 'archived'], default: 'active' },
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  maxStudents: { type: Number, default: 30, min: 1 },
  startDate: { type: Date },
  endDate: { type: Date },
  objectives: { type: String },
  requirements: { type: String },
  resources: { type: String },
  milestones: [milestoneSchema],
  submissions: [submissionSchema],
  enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('StemProject', stemProjectSchema);
