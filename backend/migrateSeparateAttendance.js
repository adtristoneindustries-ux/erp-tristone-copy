const mongoose = require('mongoose');
const User = require('./models/User');
const StudentAttendance = require('./models/StudentAttendance');
const StaffAttendance = require('./models/StaffAttendance');
require('dotenv').config();

const migrateSeparateAttendance = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/school_erp');
    console.log('Connected to MongoDB');

    // Clear existing separate collections
    await StudentAttendance.deleteMany({});
    await StaffAttendance.deleteMany({});
    console.log('Cleared existing separate attendance collections');

    // Get all students and staff
    const students = await User.find({ role: 'student' }).limit(10);
    const staff = await User.find({ role: 'staff' }).limit(5);

    const studentRecords = [];
    const staffRecords = [];

    // Create attendance for last 10 days
    for (let i = 0; i < 10; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      // Student attendance
      for (const student of students) {
        const status = Math.random() > 0.2 ? 'present' : 'absent';
        studentRecords.push({
          student: student._id,
          date: date,
          status: status,
          remarks: status === 'absent' ? 'Sick leave' : ''
        });
      }

      // Staff attendance
      for (const staffMember of staff) {
        const status = Math.random() > 0.1 ? 'present' : 'absent';
        staffRecords.push({
          staff: staffMember._id,
          date: date,
          status: status,
          remarks: status === 'absent' ? 'Personal leave' : ''
        });
      }
    }

    await StudentAttendance.insertMany(studentRecords);
    await StaffAttendance.insertMany(staffRecords);

    console.log(`✅ Created ${studentRecords.length} student attendance records`);
    console.log(`✅ Created ${staffRecords.length} staff attendance records`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error migrating attendance:', error);
    process.exit(1);
  }
};

migrateSeparateAttendance();