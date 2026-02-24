require('dotenv').config();
const mongoose = require('mongoose');
const Hostel = require('./models/Hostel');
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

const seedHostel = async () => {
  try {
    await connectDB();

    // Find a student user
    const student = await User.findOne({ role: 'student' });
    
    if (!student) {
      console.log('❌ No student found. Please seed users first.');
      process.exit(1);
    }

    // Clear existing hostel data
    await Hostel.deleteMany({});
    console.log('🗑️  Cleared existing hostel data');

    // Create sample hostel data
    const hostelData = {
      student: student._id,
      hostelName: 'Sunrise Hostel',
      roomNumber: 'H-204',
      roomType: 'Double Sharing',
      roommates: 2,
      wardenName: 'Mrs. Kavita Sharma',
      wardenContact: '+1 234 567 8920',
      wardenEmail: 'warden.sunrise@eduportal.com',
      officeHours: '8:00 AM - 8:00 PM',
      laundrySchedule: [
        { day: 'Monday', time: '10 AM' },
        { day: 'Wednesday', time: '10 AM' },
        { day: 'Friday', time: '10 AM' },
        { day: 'Sunday', time: '2 PM' }
      ],
      notices: [
        {
          title: 'Hostel Meeting',
          message: 'Hostel Meeting on Oct 20, 5 PM - Recreation Hall'
        }
      ]
    };

    await Hostel.create(hostelData);
    console.log('✅ Hostel data seeded successfully');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding hostel data:', error);
    process.exit(1);
  }
};

seedHostel();
