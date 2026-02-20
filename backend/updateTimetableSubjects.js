require('dotenv').config();
const mongoose = require('mongoose');
const Timetable = require('./models/Timetable');
const User = require('./models/User');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB Connected');
};

const updateTimetableSubjects = async () => {
  try {
    await connectDB();
    
    // Clear existing timetables
    await Timetable.deleteMany({});
    
    // Get staff by subject
    const tamilStaff = await User.find({ role: 'staff', subject: 'Tamil' });
    const englishStaff = await User.find({ role: 'staff', subject: 'English' });
    const mathStaff = await User.find({ role: 'staff', subject: 'Math' });
    const scienceStaff = await User.find({ role: 'staff', subject: 'Science' });
    const socialStaff = await User.find({ role: 'staff', subject: 'Social' });
    
    const subjects = ['Tamil', 'English', 'Math', 'Science', 'Social'];
    const timeSlots = [
      '9:00-9:45', '9:45-10:30', '10:45-11:30', '11:30-12:15',
      '1:00-1:45', '1:45-2:30', '2:30-3:15', '3:15-4:00'
    ];

    // Create timetable for each class (6-10)
    for (let classNum = 6; classNum <= 10; classNum++) {
      const schedule = {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: []
      };

      ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].forEach(day => {
        // Ensure no duplicate subjects per day
        const daySubjects = [...subjects, 'Tamil', 'English', 'Math']; // 8 periods total
        
        timeSlots.forEach((time, index) => {
          const subject = daySubjects[index];
          let teacher;
          
          // Assign teacher based on subject
          switch(subject) {
            case 'Tamil':
              teacher = tamilStaff[Math.floor(Math.random() * tamilStaff.length)];
              break;
            case 'English':
              teacher = englishStaff[Math.floor(Math.random() * englishStaff.length)];
              break;
            case 'Math':
              teacher = mathStaff[Math.floor(Math.random() * mathStaff.length)];
              break;
            case 'Science':
              teacher = scienceStaff[Math.floor(Math.random() * scienceStaff.length)];
              break;
            case 'Social':
              teacher = socialStaff[Math.floor(Math.random() * socialStaff.length)];
              break;
          }
          
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
    }

    console.log('✅ Updated timetables for all classes (6-10) with new subjects!');
    console.log('Subjects: Tamil, English, Math, Science, Social');
    console.log('2 staff members per subject assigned');
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating timetables:', error);
    process.exit(1);
  }
};

updateTimetableSubjects();