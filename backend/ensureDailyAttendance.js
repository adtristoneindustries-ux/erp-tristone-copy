const mongoose = require('mongoose');
const User = require('./models/User');
const StaffAttendance = require('./models/StaffAttendance');
require('dotenv').config();

const ensureDailyAttendance = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/school_erp');
    console.log('Connected to MongoDB');

    // Clear existing attendance
    await StaffAttendance.deleteMany({});
    console.log('Cleared existing staff attendance');

    // Get all staff
    const staff = await User.find({ role: 'staff' });
    console.log(`Found ${staff.length} staff members`);

    // Create today's attendance records
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendanceRecords = [];
    for (const staffMember of staff) {
      attendanceRecords.push({
        staff: staffMember._id,
        staffName: staffMember.name,
        staffEmail: staffMember.email,
        staffSubject: staffMember.subject,
        date: today,
        status: 'present',
        remarks: ''
      });
    }

    await StaffAttendance.insertMany(attendanceRecords);
    console.log(`✅ Created ${attendanceRecords.length} staff attendance records for today`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

ensureDailyAttendance();