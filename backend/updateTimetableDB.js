require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB Connected');
};

const updateTimetable = async (className, day, period, subject, staffName) => {
  try {
    await connectDB();
    
    const db = mongoose.connection.db;
    
    // Update the specific period in database
    const updateQuery = {};
    updateQuery[`schedule.${day}.${period}`] = {
      periodDisplay: `${period}${period === 1 ? 'st' : period === 2 ? 'nd' : period === 3 ? 'rd' : 'th'} Period - ${subject}`,
      staffDisplay: `Staff: ${staffName}`,
      subject: subject,
      staffName: staffName
    };
    
    const result = await db.collection('timetables').updateOne(
      { class: className, section: 'A' },
      { $set: updateQuery }
    );
    
    if (result.modifiedCount > 0) {
      console.log(`✅ Updated Class ${className}A ${day} Period ${period} to ${subject} with ${staffName}`);
    } else {
      console.log('❌ No document found to update');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating timetable:', error);
    process.exit(1);
  }
};

// Example usage: node updateTimetableDB.js 6 Monday 1 English "Amit Singh"
const [,, className, day, period, subject, staffName] = process.argv;

if (!className || !day || !period || !subject || !staffName) {
  console.log('Usage: node updateTimetableDB.js <class> <day> <period> <subject> <staffName>');
  console.log('Example: node updateTimetableDB.js 6 Monday 1 English "Amit Singh"');
  process.exit(1);
}

updateTimetable(className, day, period, subject, staffName);