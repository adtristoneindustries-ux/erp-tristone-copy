require('dotenv').config();
const mongoose = require('mongoose');
const Timetable = require('./models/Timetable');
const User = require('./models/User');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB Connected');
};

const createSimpleTimetable = async () => {
  try {
    await connectDB();
    
    await Timetable.deleteMany({});
    
    const staff = await User.find({ role: 'staff' });
    const timeSlots = [
      '9:00-9:45', '9:45-10:30', '10:45-11:30', '11:30-12:15',
      '1:00-1:45', '1:45-2:30', '2:30-3:15', '3:15-4:00'
    ];
    const subjects = ['Tamil', 'English', 'Math', 'Science', 'Social', 'Tamil', 'English', 'Math'];

    for (let classNum = 6; classNum <= 10; classNum++) {
      const schedule = {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: []
      };

      ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].forEach(day => {
        timeSlots.forEach((time, index) => {
          schedule[day].push({
            period: index + 1,
            time,
            subject: subjects[index],
            teacher: staff[index % staff.length]._id
          });
        });
      });

      await Timetable.create({
        class: classNum.toString(),
        section: 'A',
        schedule
      });
    }

    console.log('✅ Created timetables for classes 6-10!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createSimpleTimetable();