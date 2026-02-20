require('dotenv').config();
const mongoose = require('mongoose');
const Timetable = require('./models/Timetable');
const User = require('./models/User');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB Connected');
};

const storeTimetableData = async () => {
  try {
    await connectDB();
    
    // Clear existing timetables
    await Timetable.deleteMany({});
    
    const staff = await User.find({ role: 'staff' });
    const subjects = ['Tamil', 'English', 'Maths', 'Science', 'Social'];
    const classes = ['6', '7', '8', '9', '10']; // Only A sections
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const periods = [1, 2, 3, 4, 5, 6, 7, 8];

    console.log('Storing timetables for classes 6A to 10A...');

    for (const classNum of classes) {
      const schedule = {};
      
      // Create schedule for each day
      days.forEach(day => {
        schedule[day] = {};
        
        // Create schedule for each period
        periods.forEach(period => {
          const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
          const subjectStaff = staff.filter(s => s.subject === randomSubject);
          
          let selectedStaff;
          if (subjectStaff.length > 0) {
            selectedStaff = subjectStaff[Math.floor(Math.random() * subjectStaff.length)];
          } else {
            selectedStaff = staff[Math.floor(Math.random() * staff.length)];
          }
          
          schedule[day][period] = {
            subject: randomSubject,
            staff: selectedStaff._id
          };
        });
      });

      // Store in database
      await Timetable.create({
        class: classNum,
        section: 'A',
        schedule: schedule
      });

      console.log(`✅ Stored Class ${classNum}A timetable in database`);
      console.log(`   - 5 days: ${days.join(', ')}`);
      console.log(`   - 8 periods per day`);
      console.log(`   - Subjects: ${subjects.join(', ')}`);
      console.log(`   - Staff assigned for each period`);
    }

    console.log('\n✅ ALL TIMETABLE DATA STORED SUCCESSFULLY!');
    console.log('📍 Database: school_erp');
    console.log('📍 Collection: timetables');
    console.log('📍 Classes: 6A, 7A, 8A, 9A, 10A');
    console.log('📍 Each class has: 5 days × 8 periods = 40 total periods');
    console.log('📍 Each period has: Subject + Staff assignment');
    
    process.exit(0);
  } catch (error) {
    console.error('Error storing timetables:', error);
    process.exit(1);
  }
};

storeTimetableData();