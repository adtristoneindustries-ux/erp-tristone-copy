require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB Connected');
};

const generateStudents = () => {
  const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Ananya', 'Diya', 'Priya', 'Kavya', 'Aanya', 'Sara', 'Ira', 'Myra', 'Riya', 'Kiara'];
  const lastNames = ['Sharma', 'Verma', 'Gupta', 'Singh', 'Kumar', 'Patel', 'Jain', 'Agarwal', 'Mehta', 'Shah', 'Reddy', 'Nair', 'Iyer', 'Rao', 'Mishra', 'Pandey', 'Tiwari', 'Joshi', 'Saxena', 'Malhotra'];
  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'];
  
  const students = [];
  let rollCounter = 1;

  for (let classNum = 6; classNum <= 10; classNum++) {
    for (let studentNum = 1; studentNum <= 10; studentNum++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const city = cities[Math.floor(Math.random() * cities.length)];
      const age = classNum + 5 + Math.floor(Math.random() * 2); // Age based on class
      
      const rollPadded = rollCounter.toString().padStart(3, '0');
      
      students.push({
        name: `${firstName} ${lastName}`,
        email: `student${rollPadded}@school.com`,
        password: `student${rollPadded}`,
        role: 'student',
        class: classNum.toString(),
        section: 'A',
        rollNumber: rollPadded,
        age: age,
        dateOfBirth: new Date(2024 - age, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        phone: `9${Math.floor(Math.random() * 900000000) + 100000000}`,
        address: `${Math.floor(Math.random() * 999) + 1}, ${lastName} Street, ${city}`,
        fatherName: `Mr. ${lastNames[Math.floor(Math.random() * lastNames.length)]} ${lastName}`,
        motherName: `Mrs. ${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastName}`,
        bloodGroup: ['A+', 'B+', 'AB+', 'O+', 'A-', 'B-', 'AB-', 'O-'][Math.floor(Math.random() * 8)],
        admissionDate: new Date(2024, 3, Math.floor(Math.random() * 30) + 1),
        previousSchool: `${cities[Math.floor(Math.random() * cities.length)]} Public School`,
        emergencyContact: `9${Math.floor(Math.random() * 900000000) + 100000000}`,
        nationality: 'Indian',
        religion: ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist'][Math.floor(Math.random() * 5)],
        category: ['General', 'OBC', 'SC', 'ST'][Math.floor(Math.random() * 4)]
      });
      rollCounter++;
    }
  }
  return students;
};

const seedStudents = async () => {
  try {
    await connectDB();
    
    // Remove existing students (keep admin and staff)
    await User.deleteMany({ role: 'student' });
    
    const students = generateStudents();
    await User.insertMany(students);
    
    console.log('✅ 50 Students created successfully!');
    console.log('Classes 6-10, 10 students each');
    console.log('Roll numbers: 001-050');
    
    // Show summary by class
    for (let classNum = 6; classNum <= 10; classNum++) {
      const count = await User.countDocuments({ role: 'student', class: classNum.toString() });
      console.log(`Class ${classNum}: ${count} students`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding students:', error);
    process.exit(1);
  }
};

seedStudents();