require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB Connected');
};

const fixStaffPasswords = async () => {
  try {
    await connectDB();
    
    const staff = await User.find({ role: 'staff' });
    
    for (const member of staff) {
      const staffId = member.email.match(/staff(\d+)/)[1];
      const plainPassword = `staff${staffId}`;
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      
      await User.updateOne(
        { _id: member._id },
        { password: hashedPassword }
      );
      
      console.log(`Fixed password for ${member.email}`);
    }
    
    console.log('✅ All staff passwords fixed!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing passwords:', error);
    process.exit(1);
  }
};

fixStaffPasswords();