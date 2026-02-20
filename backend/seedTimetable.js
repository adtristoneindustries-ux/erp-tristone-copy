require('dotenv').config();
const mongoose = require('mongoose');
const Timetable = require('./models/Timetable');
const User = require('./models/User');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB Connected');
};

const createSampleTimetable = async () => {
  try {
    await connectDB();
    
    // Clear existing timetables
    await Timetable.deleteMany({});
    
    // Get staff members
    const staff = await User.find({ role: 'staff' }).limit(5);
    
    const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Hindi', 'History', 'Geography'];
    const timeSlots = [
      '9:00-9:45', '9:45-10:30', '10:45-11:30', '11:30-12:15',
      '1:00-1:45', '1:45-2:30', '2:30-3:15', '3:15-4:00'
    ];

    // Create timetable for Class 6
    const class6Schedule = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: []
    };

    ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].forEach(day => {
      timeSlots.forEach((time, index) => {
        class6Schedule[day].push({
          period: index + 1,
          time,
          subject: subjects[index % subjects.length],
          teacher: staff[index % staff.length]._id
        });
      });
    });

    await Timetable.create({
      class: '6',
      section: 'A',
      schedule: class6Schedule
    });

    console.log('✅ Sample timetable created for Class 6!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating timetable:', error);
    process.exit(1);
  }
};

createSampleTimetable();