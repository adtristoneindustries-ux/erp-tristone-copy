const mongoose = require('mongoose');
const User = require('./models/User');
const Attendance = require('./models/Attendance');
require('dotenv').config();

const seedAttendance = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/school_erp');
    console.log('Connected to MongoDB');

    // Get all students and staff
    const students = await User.find({ role: 'student' }).limit(10);
    const staff = await User.find({ role: 'staff' }).limit(5);

    console.log(`Found ${students.length} students and ${staff.length} staff`);

    // Clear existing attendance
    await Attendance.deleteMany({});
    console.log('Cleared existing attendance records');

    const attendanceRecords = [];

    // Create attendance for last 10 days
    for (let i = 0; i < 10; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      // Student attendance
      for (const student of students) {
        const status = Math.random() > 0.2 ? 'present' : 'absent'; // 80% present
        attendanceRecords.push({
          user: student._id,
          userType: 'student',
          date: date,
          status: status,
          remarks: status === 'absent' ? 'Sick leave' : ''
        });
      }

      // Staff attendance
      for (const staffMember of staff) {
        const status = Math.random() > 0.1 ? 'present' : 'absent'; // 90% present
        attendanceRecords.push({
          user: staffMember._id,
          userType: 'staff',
          date: date,
          status: status,
          remarks: status === 'absent' ? 'Personal leave' : ''
        });
      }
    }

    await Attendance.insertMany(attendanceRecords);
    console.log(`✅ Created ${attendanceRecords.length} attendance records`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding attendance:', error);
    process.exit(1);
  }
};

seedAttendance();