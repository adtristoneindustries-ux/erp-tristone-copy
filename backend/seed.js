require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Subject = require('./models/Subject');
const Class = require('./models/Class');
const Attendance = require('./models/Attendance');
const Mark = require('./models/Mark');
const Material = require('./models/Material');
const Announcement = require('./models/Announcement');
const Timetable = require('./models/Timetable');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB Connected');
};

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Subject.deleteMany({});
    await Class.deleteMany({});
    await Attendance.deleteMany({});
    await Mark.deleteMany({});
    await Material.deleteMany({});
    await Announcement.deleteMany({});
    await Timetable.deleteMany({});

    // Create Admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@school.com',
      password: 'admin123',
      role: 'admin',
      phone: '1234567890'
    });

    // Create Staff
    const staff = await User.create({
      name: 'John Teacher',
      email: 'staff@school.com',
      password: 'staff123',
      role: 'staff',
      phone: '9876543210'
    });

    // Create Students for Class 10A and 10B
    const studentsData = [
      // Class 10A
      { name: 'Alice Johnson', email: 'student@school.com', class: '10', section: 'A', rollNumber: '101' },
      { name: 'Bob Smith', email: 'bob@school.com', class: '10', section: 'A', rollNumber: '102' },
      { name: 'Carol Davis', email: 'carol@school.com', class: '10', section: 'A', rollNumber: '103' },
      { name: 'David Wilson', email: 'david@school.com', class: '10', section: 'A', rollNumber: '104' },
      { name: 'Emma Brown', email: 'emma@school.com', class: '10', section: 'A', rollNumber: '105' },
      
      // Class 10B
      { name: 'Frank Miller', email: 'frank@school.com', class: '10', section: 'B', rollNumber: '201' },
      { name: 'Grace Taylor', email: 'grace@school.com', class: '10', section: 'B', rollNumber: '202' },
      { name: 'Henry Anderson', email: 'henry@school.com', class: '10', section: 'B', rollNumber: '203' },
      { name: 'Ivy Thomas', email: 'ivy@school.com', class: '10', section: 'B', rollNumber: '204' },
      { name: 'Jack Jackson', email: 'jack@school.com', class: '10', section: 'B', rollNumber: '205' }
    ];

    const students = [];
    for (const studentData of studentsData) {
      const student = await User.create({
        ...studentData,
        password: 'student123',
        role: 'student'
      });
      students.push(student);
    }

    // Create Classes
    const classes = await Class.insertMany([
      { className: '10', classCode: 'CLS10A', section: 'A', classTeacher: staff._id },
      { className: '10', classCode: 'CLS10B', section: 'B', classTeacher: staff._id },
      { className: '11', classCode: 'CLS11A', section: 'A', classTeacher: staff._id },
      { className: '11', classCode: 'CLS11B', section: 'B', classTeacher: staff._id },
      { className: '12', classCode: 'CLS12A', section: 'A', classTeacher: staff._id }
    ]);

    // Create Subjects
    const subjects = await Subject.insertMany([
      { name: 'Mathematics', code: 'MATH101', class: '10', teacher: staff._id },
      { name: 'Physics', code: 'PHY101', class: '10', teacher: staff._id },
      { name: 'Chemistry', code: 'CHEM101', class: '10', teacher: staff._id },
      { name: 'English', code: 'ENG101', class: '10', teacher: staff._id }
    ]);

    // Create Attendance
    const today = new Date();
    const attendancePromises = [];
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const attendanceDate = new Date(today);
      attendanceDate.setDate(today.getDate() - i); // Different dates to avoid duplicates
      
      attendancePromises.push(
        Attendance.create({
          user: student._id,
          userType: 'student',
          date: attendanceDate,
          status: 'present',
          subject: subjects[0]._id
        })
      );
    }
    await Promise.all(attendancePromises);

    // Create Marks
    for (const student of students) {
      for (const subject of subjects) {
        await Mark.create({
          student: student._id,
          subject: subject._id,
          examType: 'Midterm',
          marks: Math.floor(Math.random() * 30) + 70,
          totalMarks: 100,
          grade: 'A'
        });
      }
    }

    // Create Materials
    await Material.insertMany([
      {
        title: 'Mathematics Chapter 1 - Algebra',
        description: 'Introduction to Algebra with solved examples',
        fileUrl: 'https://drive.google.com/file/d/sample-math-pdf/view',
        fileType: 'PDF',
        subject: subjects[0]._id,
        uploadedBy: staff._id,
        class: '10',
        section: 'A',
        isNewMaterial: true
      },
      {
        title: 'Physics Video Lecture',
        description: 'Newton Laws of Motion explained with animations',
        fileUrl: 'https://youtube.com/watch?v=sample-physics-video',
        fileType: 'Video',
        subject: subjects[1]._id,
        uploadedBy: staff._id,
        class: '10',
        section: 'All Sections',
        isNewMaterial: true
      },
      {
        title: 'Chemistry Lab Manual',
        description: 'Complete lab procedures and safety guidelines',
        fileUrl: 'https://drive.google.com/file/d/sample-chemistry-doc/view',
        fileType: 'Document',
        subject: subjects[2]._id,
        uploadedBy: staff._id,
        class: '10',
        section: 'B',
        isNewMaterial: true
      },
      {
        title: 'English Grammar Reference',
        description: 'Comprehensive grammar rules and exercises',
        fileUrl: 'https://example.com/english-grammar.pdf',
        fileType: 'PDF',
        subject: subjects[3]._id,
        uploadedBy: staff._id,
        class: '10',
        section: 'All Sections',
        isNewMaterial: true
      }
    ]);

    // Create Announcements
    await Announcement.create({
      title: 'Welcome to New Academic Year',
      content: 'We wish all students a great academic year ahead!',
      targetRole: 'all',
      createdBy: admin._id
    });

    // Create Timetable
    await Timetable.insertMany([
      {
        class: '10',
        section: 'A',
        schedule: {
          Monday: [
            { period: 1, time: '9:00 AM - 10:00 AM', subject: 'Mathematics', teacher: staff._id },
            { period: 2, time: '10:00 AM - 11:00 AM', subject: 'Physics', teacher: staff._id },
            { period: 3, time: '11:00 AM - 12:00 PM', subject: 'Chemistry', teacher: staff._id }
          ],
          Tuesday: [
            { period: 1, time: '9:00 AM - 10:00 AM', subject: 'English', teacher: staff._id },
            { period: 2, time: '10:00 AM - 11:00 AM', subject: 'Mathematics', teacher: staff._id }
          ]
        }
      },
      {
        class: '10',
        section: 'B',
        schedule: {
          Monday: [
            { period: 1, time: '9:00 AM - 10:00 AM', subject: 'Physics', teacher: staff._id },
            { period: 2, time: '10:00 AM - 11:00 AM', subject: 'Chemistry', teacher: staff._id }
          ]
        }
      }
    ]);

    console.log('✅ Database seeded successfully!');
    console.log('\nDemo Credentials:');
    console.log('Admin: admin@school.com / admin123');
    console.log('Staff: staff@school.com / staff123');
    console.log('Student: student@school.com / student123');
    console.log('\nStudents created in:');
    console.log('- Class 10A: 5 students');
    console.log('- Class 10B: 5 students');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
