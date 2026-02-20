require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB Connected');
};

const generateStaff = () => {
  const firstNames = ['Rajesh', 'Priya', 'Amit', 'Sunita', 'Vikram', 'Meera', 'Suresh', 'Kavita', 'Ravi', 'Deepa'];
  const lastNames = ['Sharma', 'Patel', 'Singh', 'Gupta', 'Kumar', 'Jain', 'Reddy', 'Nair', 'Iyer', 'Mehta'];
  const subjects = ['Tamil', 'English', 'Math', 'Science', 'Social'];
  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'];
  
  const staff = [];

  for (let i = 1; i <= 10; i++) {
    const firstName = firstNames[i - 1];
    const lastName = lastNames[i - 1];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const staffId = i.toString().padStart(3, '0');
    
    staff.push({
      name: `${firstName} ${lastName}`,
      email: `staff${staffId}@school.com`,
      password: `staff${staffId}`,
      role: 'staff',
      phone: `9${Math.floor(Math.random() * 900000000) + 100000000}`,
      address: `${Math.floor(Math.random() * 999) + 1}, ${lastName} Colony, ${city}`,
      dateOfBirth: new Date(1980 + Math.floor(Math.random() * 15), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      joiningDate: new Date(2020 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      qualification: ['B.Ed', 'M.Ed', 'M.A', 'M.Sc', 'B.Tech'][Math.floor(Math.random() * 5)],
      experience: Math.floor(Math.random() * 15) + 1,
      subject: subjects[Math.floor((i - 1) / 2)],
      employeeId: `EMP${staffId}`,
      department: ['Science', 'Mathematics', 'Languages', 'Social Studies', 'Computer Science'][Math.floor(Math.random() * 5)],
      designation: ['Teacher', 'Senior Teacher', 'Head Teacher'][Math.floor(Math.random() * 3)],
      salary: 25000 + Math.floor(Math.random() * 50000),
      emergencyContact: `9${Math.floor(Math.random() * 900000000) + 100000000}`,
      bloodGroup: ['A+', 'B+', 'AB+', 'O+', 'A-', 'B-', 'AB-', 'O-'][Math.floor(Math.random() * 8)],
      nationality: 'Indian',
      maritalStatus: ['Single', 'Married'][Math.floor(Math.random() * 2)]
    });
  }
  return staff;
};

const seedStaff = async () => {
  try {
    await connectDB();
    
    // Remove existing staff (keep admin and students)
    await User.deleteMany({ role: 'staff' });
    
    const staffMembers = generateStaff();
    await User.insertMany(staffMembers);
    
    console.log('✅ 10 Staff members created successfully!');
    console.log('Staff IDs: staff001 to staff010');
    
    // Show summary
    const count = await User.countDocuments({ role: 'staff' });
    console.log(`Total Staff: ${count}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding staff:', error);
    process.exit(1);
  }
};

seedStaff();