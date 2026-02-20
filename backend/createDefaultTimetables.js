require('dotenv').config();
const mongoose = require('mongoose');
const Timetable = require('./models/Timetable');
const User = require('./models/User');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB Connected');
};

const createDefaultTimetables = async () => {
  try {
    await connectDB();
    
    await Timetable.deleteMany({});
    
    const staff = await User.find({ role: 'staff' }).select('name subject');
    console.log('Available staff:', staff.map(s => `${s.name} (${s.subject})`));
    
    const timeSlots = [
      '9:00-9:45', '9:45-10:30', '10:45-11:30', '11:30-12:15',
      '1:00-1:45', '1:45-2:30', '2:30-3:15', '3:15-4:00'
    ];

    // Create timetables for classes 6-10
    for (let classNum = 6; classNum <= 10; classNum++) {
      // Assign one staff per subject per class to avoid conflicts
      const classStaff = {
        Tamil: staff.find(s => s.subject === 'Tamil'),
        English: staff.find(s => s.subject === 'English'), 
        Math: staff.find(s => s.subject === 'Math'),
        Science: staff.find(s => s.subject === 'Science'),
        Social: staff.find(s => s.subject === 'Social')
      };

      // Default subject distribution (8 periods)
      const subjectSchedule = ['Tamil', 'English', 'Math', 'Science', 'Social', 'Tamil', 'English', 'Math'];
      
      const schedule = {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: []
      };

      ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].forEach(day => {
        timeSlots.forEach((time, index) => {
          const subject = subjectSchedule[index];
          const teacher = classStaff[subject];
          
          schedule[day].push({
            period: index + 1,
            time,
            subject,
            teacher: teacher._id
          });
        });
      });

      await Timetable.create({
        class: classNum.toString(),
        section: 'A',
        schedule
      });

      console.log(`✅ Created timetable for Class ${classNum}`);
    }

    console.log('✅ All default timetables created successfully!');
    console.log('Each class has consistent staff assignment per subject');
    process.exit(0);
  } catch (error) {
    console.error('Error creating timetables:', error);
    process.exit(1);
  }
};

createDefaultTimetables();