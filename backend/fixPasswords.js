require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB Connected');
};

const fixPasswords = async () => {
  try {
    await connectDB();
    
    const students = await User.find({ role: 'student' });
    
    for (const student of students) {
      const rollNumber = student.rollNumber;
      const plainPassword = `student${rollNumber}`;
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      
      await User.updateOne(
        { _id: student._id },
        { password: hashedPassword }
      );
      
      console.log(`Fixed password for ${student.email}`);
    }
    
    console.log('✅ All student passwords fixed!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing passwords:', error);
    process.exit(1);
  }
};

fixPasswords();