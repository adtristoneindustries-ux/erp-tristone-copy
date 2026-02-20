const mongoose = require('mongoose');
require('dotenv').config();

const migrateAttendance = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/school_erp');
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const attendanceCollection = db.collection('attendances');
    
    // Find all attendance records that have 'student' field
    const oldRecords = await attendanceCollection.find({ student: { $exists: true } }).toArray();
    
    console.log(`Found ${oldRecords.length} records to migrate`);
    
    for (const record of oldRecords) {
      // Update the record to use new schema
      await attendanceCollection.updateOne(
        { _id: record._id },
        {
          $set: {
            user: record.student,
            userType: 'student'
          },
          $unset: {
            student: ""
          }
        }
      );
    }
    
    console.log('✅ Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

migrateAttendance();