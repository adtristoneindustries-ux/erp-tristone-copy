const mongoose = require('mongoose');
const User = require('./models/User');
const StudentAttendance = require('./models/StudentAttendance');
const StaffAttendance = require('./models/StaffAttendance');
require('dotenv').config();

const createSimpleAttendance = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/school_erp');
    console.log('Connected to MongoDB');

    // Clear existing attendance
    await StudentAttendance.deleteMany({});
    await StaffAttendance.deleteMany({});
    console.log('Cleared existing attendance records');

    // Get users
    const students = await User.find({ role: 'student' });
    const staff = await User.find({ role: 'staff' });

    console.log(`Found ${students.length} students and ${staff.length} staff`);

    const studentRecords = [];
    const staffRecords = [];
    const today = new Date();

    // Create one record per student
    for (const student of students) {
      studentRecords.push({
        student: student._id,
        studentName: student.name,
        studentEmail: student.email,
        studentClass: student.class,
        date: today,
        status: 'present',
        remarks: ''
      });
    }

    // Create one record per staff
    for (const staffMember of staff) {
      staffRecords.push({
        staff: staffMember._id,
        staffName: staffMember.name,
        staffEmail: staffMember.email,
        staffSubject: staffMember.subject,
        date: today,
        status: 'present',
        remarks: ''
      });
    }

    await StudentAttendance.insertMany(studentRecords);
    await StaffAttendance.insertMany(staffRecords);

    console.log(`✅ Created ${studentRecords.length} student attendance records`);
    console.log(`✅ Created ${staffRecords.length} staff attendance records`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating attendance:', error);
    process.exit(1);
  }
};

createSimpleAttendance();