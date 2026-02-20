const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  className: { 
    type: String, 
    required: [true, 'Class name is required'],
    trim: true,
    maxlength: [10, 'Class name cannot exceed 10 characters']
  },
  classCode: { 
    type: String, 
    required: [true, 'Class code is required'], 
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: [20, 'Class code cannot exceed 20 characters']
  },
  section: {
    type: String,
    required: [true, 'Section is required'],
    trim: true,
    maxlength: [5, 'Section cannot exceed 5 characters']
  },
  classTeacher: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    validate: {
      validator: async function(v) {
        if (!v) return true;
        const user = await mongoose.model('User').findById(v);
        return user && user.role === 'staff';
      },
      message: 'Class teacher must be a staff member'
    }
  },
  totalStudents: {
    type: Number,
    default: 0,
    min: [0, 'Total students cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
classSchema.index({ className: 1, section: 1 });
classSchema.index({ classCode: 1 });
classSchema.index({ classTeacher: 1 });
classSchema.index({ isActive: 1 });

// Compound index for unique class-section combination
classSchema.index({ className: 1, section: 1 }, { unique: true });

module.exports = mongoose.model('Class', classSchema);