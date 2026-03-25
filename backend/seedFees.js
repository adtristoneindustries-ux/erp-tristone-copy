const mongoose = require('mongoose');
const Fee = require('./models/Fee');
const User = require('./models/User');
const Hostel = require('./models/Hostel');
const { StudentTransport } = require('./models/Transport');
require('dotenv').config();

const seedFees = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing fees
    await Fee.deleteMany({});
    console.log('🗑️  Cleared existing fees');

    // Get all students
    const students = await User.find({ role: 'student' });
    console.log(`📚 Found ${students.length} students`);

    const fees = [];
    const currentYear = '2024-2025';

    for (const student of students) {
      // Create Tuition Fee for all students
      fees.push({
        student: student._id,
        academicYear: currentYear,
        feeType: 'Tuition',
        totalAmount: 50000,
        paidAmount: Math.random() > 0.3 ? 50000 : Math.floor(Math.random() * 30000),
        dueAmount: 0,
        dueDate: new Date('2025-03-31'),
        status: 'Pending',
        payments: []
      });

      // Check if student has hostel
      const hasHostel = await Hostel.findOne({ student: student._id });
      if (hasHostel) {
        const hostelPaid = Math.random() > 0.5 ? 30000 : Math.floor(Math.random() * 20000);
        fees.push({
          student: student._id,
          academicYear: currentYear,
          feeType: 'Hostel',
          totalAmount: 30000,
          paidAmount: hostelPaid,
          dueAmount: 30000 - hostelPaid,
          dueDate: new Date('2025-03-31'),
          status: hostelPaid === 30000 ? 'Paid' : 'Pending',
          payments: hostelPaid > 0 ? [{
            amount: hostelPaid,
            date: new Date('2024-12-15'),
            paymentMethod: Math.random() > 0.5 ? 'Online' : 'Offline',
            transactionId: Math.random() > 0.5 ? `TXN${Date.now()}${Math.floor(Math.random() * 1000)}` : 'N/A'
          }] : []
        });
      }

      // Check if student has transport
      const hasTransport = await StudentTransport.findOne({ student: student._id });
      if (hasTransport) {
        const transportPaid = Math.random() > 0.5 ? 15000 : Math.floor(Math.random() * 10000);
        fees.push({
          student: student._id,
          academicYear: currentYear,
          feeType: 'Transport',
          totalAmount: 15000,
          paidAmount: transportPaid,
          dueAmount: 15000 - transportPaid,
          dueDate: new Date('2025-03-31'),
          status: transportPaid === 15000 ? 'Paid' : 'Pending',
          payments: transportPaid > 0 ? [{
            amount: transportPaid,
            date: new Date('2024-12-20'),
            paymentMethod: Math.random() > 0.5 ? 'Online' : 'Offline',
            transactionId: Math.random() > 0.5 ? `TXN${Date.now()}${Math.floor(Math.random() * 1000)}` : 'N/A'
          }] : []
        });
      }
    }

    // Update dueAmount and status for tuition fees
    fees.forEach(fee => {
      if (fee.feeType === 'Tuition') {
        fee.dueAmount = fee.totalAmount - fee.paidAmount;
        fee.status = fee.dueAmount === 0 ? 'Paid' : 'Pending';
        if (fee.paidAmount > 0) {
          fee.payments = [{
            amount: fee.paidAmount,
            date: new Date('2024-12-10'),
            paymentMethod: Math.random() > 0.5 ? 'Online' : 'Offline',
            transactionId: Math.random() > 0.5 ? `TXN${Date.now()}${Math.floor(Math.random() * 1000)}` : 'N/A'
          }];
        }
      }
    });

    await Fee.insertMany(fees);
    console.log(`✅ Created ${fees.length} fee records`);
    console.log('✅ Fee seeding completed successfully!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding fees:', error);
    process.exit(1);
  }
};

seedFees();
