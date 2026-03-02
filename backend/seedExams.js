require('dotenv').config();
const mongoose = require('mongoose');
const Exam = require('./models/Exam');
const Class = require('./models/Class');
const Subject = require('./models/Subject');
const User = require('./models/User');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedExams = async () => {
  try {
    await connectDB();

    // Clear existing exams
    await Exam.deleteMany({});
    console.log('🗑️  Cleared existing exams');

    // Get admin user
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('❌ Admin user not found');
      return;
    }

    // Get classes (10, 11, 12)
    const class10 = await Class.findOne({ className: '10' });
    const class11 = await Class.findOne({ className: '11' });
    const class12 = await Class.findOne({ className: '12' });

    // Get subjects
    const subjects = await Subject.find({});
    
    // Get staff for invigilators
    const staff = await User.find({ role: 'staff' }).limit(5);

    if (!class10 && !class11 && !class12) {
      console.log('❌ No classes found. Please create classes first.');
      return;
    }

    if (subjects.length === 0) {
      console.log('❌ No subjects found. Please create subjects first.');
      return;
    }

    if (staff.length === 0) {
      console.log('❌ No staff found. Please create staff first.');
      return;
    }

    const exams = [];
    const classes = [class10, class11, class12].filter(c => c);

    // Create exams for each class
    for (const classDoc of classes) {
      const classSubjects = subjects.slice(0, 5); // Take first 5 subjects
      
      let currentDate = new Date();
      currentDate.setDate(currentDate.getDate() + 7); // Start from next week

      for (let i = 0; i < classSubjects.length; i++) {
        const subject = classSubjects[i];
        const staffMember = staff[i % staff.length];

        exams.push({
          examName: `Mid Term Examination 2024`,
          examType: 'Mid Term',
          subject: subject._id,
          class: classDoc._id,
          date: new Date(currentDate),
          startTime: '09:00',
          endTime: '12:00',
          duration: 3,
          hall: `Hall ${String.fromCharCode(65 + (i % 3))}`,
          invigilators: [staffMember._id],
          totalMarks: 100,
          createdBy: admin._id,
          status: 'Scheduled'
        });

        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    await Exam.insertMany(exams);
    console.log(`✅ Created ${exams.length} sample exams`);
    console.log('✅ Exam seeding completed!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding exams:', error);
    process.exit(1);
  }
};

seedExams();
