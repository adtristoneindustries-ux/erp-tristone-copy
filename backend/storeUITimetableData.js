require('dotenv').config();
const mongoose = require('mongoose');
const Timetable = require('./models/Timetable');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB Connected');
};

const storeUITimetableData = async () => {
  try {
    await connectDB();
    
    // Clear existing timetables
    await Timetable.deleteMany({});
    
    const staff = [
      { name: 'Rajesh Sharma', subject: 'Tamil' },
      { name: 'Priya Patel', subject: 'Tamil' },
      { name: 'Amit Singh', subject: 'English' },
      { name: 'Sunita Gupta', subject: 'English' },
      { name: 'Vikram Kumar', subject: 'Maths' },
      { name: 'Meera Jain', subject: 'Maths' },
      { name: 'Suresh Reddy', subject: 'Science' },
      { name: 'Kavita Nair', subject: 'Science' },
      { name: 'Ravi Iyer', subject: 'Social' },
      { name: 'Deepa Mehta', subject: 'Social' }
    ];
    
    const subjects = ['Tamil', 'English', 'Maths', 'Science', 'Social'];
    const classes = ['6', '7', '8', '9', '10'];
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const periods = [1, 2, 3, 4, 5, 6, 7, 8];

    console.log('Storing complete timetable data as shown in UI...');

    for (const classNum of classes) {
      const schedule = {};
      
      days.forEach(day => {
        schedule[day] = {};
        
        periods.forEach(period => {
          const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
          const subjectStaff = staff.filter(s => s.subject === randomSubject);
          const selectedStaff = subjectStaff[Math.floor(Math.random() * subjectStaff.length)];
          
          // Store exactly as shown in UI: "1st Period - Maths, Staff: Meera Jain"
          schedule[day][period] = {
            periodDisplay: `${period}${period === 1 ? 'st' : period === 2 ? 'nd' : period === 3 ? 'rd' : 'th'} Period - ${randomSubject}`,
            staffDisplay: `Staff: ${selectedStaff.name}`,
            subject: randomSubject,
            staffName: selectedStaff.name
          };
        });
      });

      await Timetable.create({
        class: classNum,
        section: 'A',
        schedule: schedule
      });

      console.log(`✅ Stored Class ${classNum}A timetable data`);
      
      // Show sample data for first class
      if (classNum === '6') {
        console.log('Sample Monday Period 1:', schedule.Monday[1]);
        console.log('Sample Monday Period 2:', schedule.Monday[2]);
      }
    }

    console.log('\n✅ ALL UI TIMETABLE DATA STORED!');
    console.log('📍 Database: school_erp');
    console.log('📍 Collection: timetables');
    console.log('📍 Format: "1st Period - Maths" + "Staff: Meera Jain"');
    console.log('📍 Classes: 6A, 7A, 8A, 9A, 10A');
    
    process.exit(0);
  } catch (error) {
    console.error('Error storing timetable data:', error);
    process.exit(1);
  }
};

storeUITimetableData();