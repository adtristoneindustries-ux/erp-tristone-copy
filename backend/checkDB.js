const mongoose = require('mongoose');
require('dotenv').config();

const checkDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/school_erp');
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Check collections
    const collections = await db.listCollections().toArray();
    console.log('\n📁 Collections found:');
    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(`  - ${col.name}: ${count} documents`);
    }
    
    // Show sample data
    console.log('\n📋 Sample Staff Attendance:');
    const staffSample = await db.collection('staffattendances').findOne();
    if (staffSample) {
      console.log(`  Staff: ${staffSample.staffName} (${staffSample.staffEmail})`);
      console.log(`  Date: ${new Date(staffSample.date).toLocaleDateString()}`);
      console.log(`  Status: ${staffSample.status}`);
    }
    
    console.log('\n📋 Sample Student Attendance:');
    const studentSample = await db.collection('studentattendances').findOne();
    if (studentSample) {
      console.log(`  Student: ${studentSample.studentName} (${studentSample.studentEmail})`);
      console.log(`  Date: ${new Date(studentSample.date).toLocaleDateString()}`);
      console.log(`  Status: ${studentSample.status}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkDB();