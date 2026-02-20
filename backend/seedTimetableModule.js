require('dotenv').config();
const mongoose = require('mongoose');
const Timetable = require('./models/Timetable');
const User = require('./models/User');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB Connected');
};

const createTimetableModule = async () => {
  try {
    await connectDB();
    
    // Clear existing timetables
    await Timetable.deleteMany({});
    
    const staff = await User.find({ role: 'staff' }).select('name subject');
    const subjects = ['Tamil', 'English', 'Maths', 'Science', 'Social'];
    const classes = ['6', '7', '8', '9', '10'];
    const sections = ['A', 'B'];
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const periods = [1, 2, 3, 4, 5, 6, 7, 8];

    console.log('Creating timetables for all classes...');

    for (const classNum of classes) {
      for (const section of sections) {
        const schedule = {};
        
        days.forEach(day => {
          schedule[day] = {};
          
          periods.forEach(period => {
            const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
            const subjectStaff = staff.filter(s => s.subject === randomSubject);
            const randomStaff = subjectStaff[Math.floor(Math.random() * subjectStaff.length)];
            
            schedule[day][period] = {
              subject: randomSubject,
              staff: randomStaff._id
            };
          });
        });

        await Timetable.create({
          class: classNum,
          section: section,
          schedule: schedule
        });

        console.log(`✅ Created timetable for Class ${classNum}${section}`);
      }
    }

    console.log('✅ All timetables created successfully!');
    console.log('Classes: 6A, 6B, 7A, 7B, 8A, 8B, 9A, 9B, 10A, 10B');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating timetables:', error);
    process.exit(1);
  }
};

createTimetableModule();