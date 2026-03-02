require('dotenv').config();
const mongoose = require('mongoose');
const { TransportRoute, StudentTransport } = require('./models/Transport');
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

const seedTransport = async () => {
  try {
    await connectDB();

    // Clear existing data
    await TransportRoute.deleteMany({});
    await StudentTransport.deleteMany({});

    // Create transport routes
    const routes = [
      {
        routeNumber: 'Route 5',
        busNumber: 'EDP-205',
        driverName: 'Mr. Rajesh Kumar',
        driverContact: '+1 234 567 8910',
        pickupPoint: 'Main Street Junction',
        pickupTime: '7:30 AM',
        dropTime: '3:30 PM',
        routePath: 'Main Street → School Road → EduPortal Campus',
        stops: [
          { name: 'Main Street Junction', time: '7:30 AM' },
          { name: 'School Road', time: '7:45 AM' },
          { name: 'EduPortal Campus', time: '8:00 AM' }
        ],
        active: true
      },
      {
        routeNumber: 'Route 3',
        busNumber: 'EDP-103',
        driverName: 'Mr. Suresh Patel',
        driverContact: '+1 234 567 8920',
        pickupPoint: 'Park Avenue',
        pickupTime: '7:15 AM',
        dropTime: '3:45 PM',
        routePath: 'Park Avenue → Central Square → EduPortal Campus',
        stops: [
          { name: 'Park Avenue', time: '7:15 AM' },
          { name: 'Central Square', time: '7:35 AM' },
          { name: 'EduPortal Campus', time: '8:00 AM' }
        ],
        active: true
      },
      {
        routeNumber: 'Route 7',
        busNumber: 'EDP-307',
        driverName: 'Mr. Amit Singh',
        driverContact: '+1 234 567 8930',
        pickupPoint: 'Lake View Road',
        pickupTime: '7:00 AM',
        dropTime: '4:00 PM',
        routePath: 'Lake View Road → Highway Junction → EduPortal Campus',
        stops: [
          { name: 'Lake View Road', time: '7:00 AM' },
          { name: 'Highway Junction', time: '7:30 AM' },
          { name: 'EduPortal Campus', time: '8:00 AM' }
        ],
        active: true
      }
    ];

    const createdRoutes = await TransportRoute.insertMany(routes);
    console.log('✅ Transport routes created');

    // Assign transport to students
    const students = await User.find({ role: 'student' }).limit(10);
    
    if (students.length > 0) {
      const assignments = students.map((student, index) => ({
        student: student._id,
        route: createdRoutes[index % createdRoutes.length]._id,
        pickupPoint: createdRoutes[index % createdRoutes.length].pickupPoint,
        status: 'active'
      }));

      await StudentTransport.insertMany(assignments);
      console.log(`✅ Transport assigned to ${students.length} students`);
    }

    console.log('✅ Transport seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding transport:', error);
    process.exit(1);
  }
};

seedTransport();
