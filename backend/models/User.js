const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'] },
  email: { type: String, required: [true, 'Email is required'], unique: true },
  password: { type: String, required: function() { return this.isNew; } },
  role: { type: String, enum: ['admin', 'staff', 'student', 'librarian'], required: true },
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
  community: String,
  motherTongue: String,
  identificationMark1: String,
  identificationMark2: String,
  gender: String,
  
  // Parent/Guardian Details
  fatherName: String,
  fatherOccupation: String,
  fatherQualification: String,
  fatherIncome: String,
  fatherContact: String,
  fatherPhone: String,
  fatherEmail: String,
  fatherAadhaar: String,
  motherName: String,
  motherOccupation: String,
  motherQualification: String,
  motherIncome: String,
  motherContact: String,
  motherPhone: String,
  motherEmail: String,
  motherAadhaar: String,
  guardianName: String,
  guardianRelationship: String,
  guardianContact: String,
  guardianOccupation: String,
  
  // Contact Information
  studentPhone: String,
  studentEmail: String,
  emergencyContactName: String,
  emergencyContactNumber: String,
  alternateContact: String,
  
  // Address Details
  permanentAddress: String,
  currentAddress: String,
  sameAsPermanent: Boolean,
  city: String,
  district: String,
  state: String,
  pincode: String,
  country: { type: String, default: 'India' },
  
  // Medical & Health Information
  medicalConditions: String,
  allergies: String,
  disability: Boolean,
  disabilityDetails: String,
  height: String,
  weight: String,
  vaccinationStatus: String,
  doctorName: String,
  doctorContact: String,
  healthInsurance: String,
  
  // Academic Details
  academicYear: String,
  stream: String,
  previousSchool: String,
  previousClass: String,
  mediumOfInstruction: String,
  secondLanguage: String,
  scholarshipCategory: String,
  feeConcessionDetails: String,
  
  // Hostel Details
  hostelRequired: Boolean,
  hostelName: String,
  roomNumber: String,
  bedNumber: String,
  wardenName: String,
  wardenContact: String,
  roomType: String,
  messPlan: String,
  messType: String,
  hostelAdmissionDate: Date,
  hostelFee: String,
  parentConsentForm: Boolean,
  
  // Transport Details
  transportRequired: Boolean,
  routeNumber: String,
  pickupPoint: String,
  driverName: String,
  driverContact: String,
  busNumber: String,
  transportFee: String,
  busRoute: String,
  boardingPoint: String,
  dropPoint: String,
  
  // Bank Details
  bankName: String,
  accountHolder: String,
  accountNumber: String,
  ifscCode: String,
  branchName: String,
  upiId: String,
  
  // Auto-generated fields
  studentId: String,
  rfidCode: String,
  // Staff-specific fields
  dob: Date,
  department: String,
  staffId: String,
  qualification: String,
  loginAccess: { type: Boolean, default: true },
  permissionLevel: { type: String, default: 'Staff' },
  status: { type: String, default: 'Active' },
  
  // Enhanced Staff Details
  fullName: String,
  employeeCode: String,
  panNumber: String,
  maritalStatus: String,
  designation: String,
  employmentType: String,
  dateOfJoining: Date,
  yearsOfExperience: Number,
  previousInstitution: String,
  specialization: String,
  subjectsHandling: [String],
  classAssigned: [String],
  sectionAssigned: [String],
  employeeStatus: String,
  
  // Salary & Payroll
  basicSalary: Number,
  allowances: Number,
  pfNumber: String,
  esiNumber: String,
  taxDeduction: String,
  salaryAccountNumber: String,
  uanNumber: String,
  
  // Teaching Related
  classIncharge: Boolean,
  isHOD: Boolean,
  timetableAssigned: Boolean,
  labIncharge: Boolean,
  mentorAssignedClasses: [String],
  
  // Hostel/Accommodation
  accommodationRequired: Boolean,
  accommodationRoomNumber: String,
  accommodationBlock: String,
  accommodationWardenName: String,
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
  }],
  // Discipline records
  disciplineRecords: [{
    offenseType: String,
    actionStatus: String,
    description: String,
    date: { type: Date, default: Date.now },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  // Online status
  isOnline: { type: Boolean, default: false },
  lastSeen: Date,
  socketId: String,
  
  // Placement-specific fields
  year: Number,
  cgpa: Number,
  arrears_count: { type: Number, default: 0 },
  resume_url: String,
  skills: [String],
  portfolio_link: String,
  hasPlacementAccess: { type: Boolean, default: false },
  // Enrolled activities (clubs, courses, sports)
  enrolledActivities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Activity' }]
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
