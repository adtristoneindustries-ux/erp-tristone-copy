const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'staff', 'student'], required: true },
  phone: String,
  address: String,
  dateOfBirth: Date,
  joiningDate: { type: Date, default: Date.now },
  subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
  subject: String,
  class: String,
  section: String,
  rollNumber: String,
  profileImage: String,
  profilePicture: String,
  // Student-specific fields
  bloodGroup: String,
  admissionDate: Date,
  admissionNumber: String,
  religion: String,
  nationality: String,
  emergencyContact: String,
  medicalConditions: String,
  fatherName: String,
  fatherOccupation: String,
  fatherPhone: String,
  fatherEmail: String,
  motherName: String,
  motherOccupation: String,
  motherPhone: String,
  motherEmail: String,
  // Staff-specific fields
  gender: String,
  dob: Date,
  department: String,
  staffId: String,
  qualification: String,
  loginAccess: { type: Boolean, default: true },
  permissionLevel: { type: String, default: 'Staff' },
  status: { type: String, default: 'Active' },
  // Document storage fields
  passportPhoto: {
    data: String, // base64 encoded image
    contentType: String,
    filename: String,
    uploadDate: { type: Date, default: Date.now }
  },
  documents: [{
    type: { type: String, enum: ['idProof', 'certification', 'experience', 'resume', 'other'] },
    name: String,
    filename: String,
    data: String, // base64 encoded for images/small files
    contentType: String,
    size: Number,
    uploadDate: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
