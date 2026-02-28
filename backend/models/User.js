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
  
  // Enhanced Student Details
  aadhaarNumber: String,
  emisNumber: String,
  casteCategory: { type: String, enum: ['OC', 'BC', 'MBC', 'SC', 'ST', ''] },
  
  // Parent/Guardian Details
  fatherName: String,
  fatherOccupation: String,
  fatherPhone: String,
  fatherEmail: String,
  motherName: String,
  motherOccupation: String,
  motherPhone: String,
  motherEmail: String,
  guardianName: String,
  guardianContact: String,
  
  // Address Details
  permanentAddress: String,
  currentAddress: String,
  city: String,
  district: String,
  state: String,
  pincode: String,
  
  // Academic Details
  previousSchool: String,
  previousClass: String,
  mediumOfInstruction: String,
  secondLanguage: String,
  
  // Transport Details
  busRoute: String,
  boardingPoint: String,
  dropPoint: String,
  
  // Hostel Details
  roomNumber: String,
  wardenName: String,
  messType: String,
  parentConsentForm: Boolean,
  
  // Auto-generated fields
  studentId: String,
  rfidCode: String,
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
    type: { 
      type: String, 
      enum: ['birthCertificate', 'aadhaarCard', 'communityCertificate', 'incomeCertificate', 
             'passportPhoto', 'previousMarksheet', 'transferCertificate', 'bankPassbook',
             'idProof', 'certification', 'experience', 'resume', 'other'] 
    },
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
