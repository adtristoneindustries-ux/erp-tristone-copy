require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Subject = require('./models/Subject');
const Class = require('./models/Class');
const Attendance = require('./models/Attendance');
const Mark = require('./models/Mark');
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
    const staff1 = await User.create({
      name: 'John Teacher',
      email: 'staff@school.com',
      password: 'staff123',
      role: 'staff',
      phone: '9876543210',
      staffId: 'ST-2024-001'
    });

    const staff2 = await User.create({
      name: 'Sarah Wilson',
      email: 'sarah@school.com',
      password: 'staff123',
      role: 'librarian',
      phone: '9876543211',
      staffId: 'ST-2024-002',
      department: 'Library',
      qualification: 'M.Lib.Sc',
      experience: '5 years',
      joiningDate: new Date('2020-01-15'),
      address: '456 Oak Street, City'
    });

    const canteenStaff = await User.create({
      name: 'Rajesh Kumar',
      email: 'rajesh@school.com',
      password: 'staff123',
      role: 'staff',
      phone: '9876543222',
      gender: 'Male',
      dob: '1990-05-15',
      staffId: 'ST-2024-003',
      department: 'Cafeteria',
      qualification: 'B.Sc Hotel Management',
      designation: 'Canteen Manager',
      employmentType: 'Permanent',
      joiningDate: new Date('2020-01-15'),
      yearsOfExperience: 8,
      specialization: 'Food Service Management',
      basicSalary: 25000,
      address: '123 Main Street, City',
      permanentAddress: '123 Main Street, City',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600001',
      country: 'India',
      bloodGroup: 'O+',
      maritalStatus: 'Married',
      nationality: 'Indian',
      panNumber: 'ABCDE1234F',
      aadhaarNumber: '123456789012',
      emergencyContactName: 'Priya Kumar',
      emergencyContactNumber: '9876543223',
      bankName: 'State Bank of India',
      salaryAccountNumber: '12345678901234',
      ifscCode: 'SBIN0001234',
      branchName: 'Chennai Main Branch',
      pfNumber: 'PF123456',
      esiNumber: 'ESI123456',
      uanNumber: 'UAN123456',
      status: 'Active',
      loginAccess: true
    });

    const canteenStaff2 = await User.create({
      name: 'Raj Patel',
      email: 'raj@school.com',
      password: 'staff123',
      role: 'staff',
      phone: '9876543333',
      gender: 'Male',
      dob: '1992-08-20',
      staffId: 'ST-2024-004',
      department: 'Cafeteria',
      qualification: 'Diploma in Culinary Arts',
      designation: 'Assistant Canteen Manager',
      employmentType: 'Permanent',
      joiningDate: new Date('2021-06-10'),
      yearsOfExperience: 5,
      specialization: 'Food Preparation & Service',
      basicSalary: 20000,
      address: '456 Park Avenue, City',
      permanentAddress: '456 Park Avenue, City',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600002',
      country: 'India',
      bloodGroup: 'B+',
      maritalStatus: 'Single',
      nationality: 'Indian',
      panNumber: 'BCDEF5678G',
      aadhaarNumber: '987654321098',
      emergencyContactName: 'Ramesh Patel',
      emergencyContactNumber: '9876543334',
      bankName: 'HDFC Bank',
      salaryAccountNumber: '98765432109876',
      ifscCode: 'HDFC0005678',
      branchName: 'Chennai T Nagar',
      pfNumber: 'PF789012',
      esiNumber: 'ESI789012',
      uanNumber: 'UAN789012',
      status: 'Active',
      loginAccess: true
    });

    const staff = staff1; // For backward compatibility

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
    console.log('Staff 1: staff@school.com / staff123');
    console.log('Staff 2: sarah@school.com / staff123');
    console.log('Canteen Staff: rajesh@school.com / staff123');
    console.log('Canteen Staff 2: raj@school.com / staff123');
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
