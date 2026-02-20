require('dotenv').config();
const mongoose = require('mongoose');

const updateDB = async (className, day, period, subject, staffName) => {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  
  const updateField = `schedule.${day}.${period}`;
  const updateValue = {
    periodDisplay: `${period}${period == 1 ? 'st' : period == 2 ? 'nd' : period == 3 ? 'rd' : 'th'} Period - ${subject}`,
    staffDisplay: `Staff: ${staffName}`,
    subject: subject,
    staffName: staffName
  };
  
  await db.collection('timetables').updateOne(
    { class: className, section: 'A' },
    { $set: { [updateField]: updateValue } }
  );
  
  console.log(`✅ Updated Class ${className}A ${day} Period ${period}: ${subject} - ${staffName}`);
  process.exit(0);
};

// Get parameters from command line or use defaults for testing
const className = process.argv[2] || '6';
const day = process.argv[3] || 'Monday';
const period = process.argv[4] || '1';
const subject = process.argv[5] || 'English';
const staffName = process.argv[6] || 'Amit Singh';

updateDB(className, day, period, subject, staffName);