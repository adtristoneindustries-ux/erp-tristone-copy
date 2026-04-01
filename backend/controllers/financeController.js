const Finance = require('../models/Finance');
const FeeStructure = require('../models/FeeStructure');
const User = require('../models/User');
const crypto = require('crypto');
const Razorpay = require('razorpay');

// Initialize Razorpay
let razorpay;
try {
  const Razorpay = require('razorpay');
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_9WseLWHrhkpBef',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'YOUR_SECRET_KEY'
  });
} catch (error) {
  console.log('Razorpay not initialized:', error.message);
}

exports.getFinance = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'student') query.student = req.user.id;
    else if (req.query.studentId) query.student = req.query.studentId;
    if (req.query.academicYear) query.academicYear = req.query.academicYear;

    const finance = await Finance.find(query)
      .populate('student', 'name email rollNumber class')
      .populate('scholarships.scholarshipId')
      .sort('-createdAt');

    res.json({ success: true, data: finance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateFinance = async (req, res) => {
  try {
    const { studentId, academicYear, totalFee } = req.body;
    let finance = await Finance.findOne({ student: studentId, academicYear });

    if (!finance) {
      finance = new Finance({
        student: studentId,
        academicYear,
        totalFee,
        finalPayableFee: totalFee,
        pendingAmount: totalFee,
        transactions: [{ type: 'Fee', amount: totalFee, description: 'Annual Fee Set' }]
      });
    } else {
      finance.totalFee = totalFee;
      finance.finalPayableFee = totalFee - finance.scholarshipDiscount;
      finance.pendingAmount = finance.finalPayableFee - finance.paidAmount;
    }

    await finance.save();
    res.json({ success: true, data: finance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.recordPayment = async (req, res) => {
  try {
    const { financeId, amount, description } = req.body;
    const finance = await Finance.findById(financeId);
    if (!finance) return res.status(404).json({ success: false, message: 'Finance record not found' });

    finance.paidAmount += amount;
    finance.pendingAmount = finance.finalPayableFee - finance.paidAmount;
    finance.transactions.push({ type: 'Payment', amount, description: description || 'Fee Payment' });

    await finance.save();
    req.app.get('io').emit('financeUpdate', { studentId: finance.student });
    res.json({ success: true, data: finance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFinanceAnalytics = async (req, res) => {
  try {
    const totalRevenue = await Finance.aggregate([{ $group: { _id: null, total: { $sum: '$paidAmount' } } }]);
    const totalPending = await Finance.aggregate([{ $group: { _id: null, total: { $sum: '$pendingAmount' } } }]);
    const totalScholarship = await Finance.aggregate([{ $group: { _id: null, total: { $sum: '$scholarshipDiscount' } } }]);

    res.json({
      success: true,
      data: {
        totalRevenue: totalRevenue[0]?.total || 0,
        totalPending: totalPending[0]?.total || 0,
        totalScholarship: totalScholarship[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createFeeStructure = async (req, res) => {
  try {
    const { className, academicYear, components } = req.body;
    const totalAmount = components.reduce((sum, c) => sum + c.amount, 0);

    const existing = await FeeStructure.findOne({ class: className, academicYear });
    if (existing) {
      // Update existing fee structure
      existing.components = components;
      existing.totalAmount = totalAmount;
      await existing.save();
      
      // Update all student finance records for this class
      const students = await User.find({ 
        $or: [
          { class: new RegExp(`^${className}-`, 'i') },
          { class: className }
        ],
        role: 'student' 
      });
      const studentIds = students.map(s => s._id);

      await Finance.updateMany(
        { student: { $in: studentIds }, academicYear },
        [{
          $set: {
            totalFee: totalAmount,
            finalPayableFee: { $subtract: [totalAmount, '$scholarshipDiscount'] },
            pendingAmount: { $subtract: [{ $subtract: [totalAmount, '$scholarshipDiscount'] }, '$paidAmount'] }
          }
        }]
      );
      
      return res.json({ success: true, data: existing, message: 'Fee structure updated successfully', studentsUpdated: studentIds.length });
    }

    const feeStructure = await FeeStructure.create({ class: className, academicYear, components, totalAmount });
    
    const students = await User.find({ 
      $or: [
        { class: new RegExp(`^${className}-`, 'i') },
        { class: className }
      ],
      role: 'student' 
    });
    
    const financeRecords = [];
    for (const student of students) {
      const existingFinance = await Finance.findOne({ student: student._id, academicYear });
      if (!existingFinance) {
        // Check for approved scholarships for this student
        let scholarshipDiscount = 0;
        const scholarshipData = [];
        
        try {
          const Scholarship = require('../models/Scholarship');
          const scholarships = await Scholarship.find({ 
            student: student._id, 
            status: 'Approved',
            academicYear 
          });
          
          scholarships.forEach(scholarship => {
            let discountAmount = 0;
            if (scholarship.amountType === 'Percentage') {
              discountAmount = (totalAmount * scholarship.amount) / 100;
            } else {
              discountAmount = scholarship.amount;
            }
            scholarshipDiscount += discountAmount;
            scholarshipData.push({
              scholarshipId: scholarship._id,
              amount: discountAmount,
              appliedDate: scholarship.appliedDate
            });
          });
        } catch (scholarshipError) {
          console.log('Scholarship model not found or error:', scholarshipError.message);
          // Continue without scholarships if model doesn't exist
        }
        
        const finalPayable = totalAmount - scholarshipDiscount;
        
        financeRecords.push({
          student: student._id,
          academicYear,
          totalFee: totalAmount,
          scholarshipDiscount,
          finalPayableFee: finalPayable,
          pendingAmount: finalPayable,
          scholarships: scholarshipData,
          transactions: [{ 
            type: 'Fee', 
            amount: totalAmount, 
            description: `Fee Structure Applied for Class ${className}`,
            paymentMethod: 'N/A'
          }]
        });
      }
    }

    if (financeRecords.length > 0) {
      await Finance.insertMany(financeRecords);
    }

    res.json({ success: true, data: feeStructure, studentsAssigned: financeRecords.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFeeStructures = async (req, res) => {
  try {
    const structures = await FeeStructure.find().sort('-createdAt');
    res.json({ success: true, data: structures });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateFeeStructure = async (req, res) => {
  try {
    const { id } = req.params;
    const { components } = req.body;
    const totalAmount = components.reduce((sum, c) => sum + c.amount, 0);

    const feeStructure = await FeeStructure.findByIdAndUpdate(
      id,
      { components, totalAmount },
      { new: true, runValidators: true }
    );

    if (!feeStructure) {
      return res.status(404).json({ success: false, message: 'Fee structure not found' });
    }

    const students = await User.find({ 
      $or: [
        { class: new RegExp(`^${feeStructure.class}-`, 'i') },
        { class: feeStructure.class }
      ],
      role: 'student' 
    });
    const studentIds = students.map(s => s._id);

    await Finance.updateMany(
      { student: { $in: studentIds }, academicYear: feeStructure.academicYear },
      [{
        $set: {
          totalFee: totalAmount,
          finalPayableFee: { $subtract: [totalAmount, '$scholarshipDiscount'] },
          pendingAmount: { $subtract: [{ $subtract: [totalAmount, '$scholarshipDiscount'] }, '$paidAmount'] }
        }
      }]
    );

    res.json({ success: true, data: feeStructure });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteFeeStructure = async (req, res) => {
  try {
    const { id } = req.params;
    const feeStructure = await FeeStructure.findById(id);
    
    if (!feeStructure) {
      return res.status(404).json({ success: false, message: 'Fee structure not found' });
    }

    // Find all students in this class
    const students = await User.find({ 
      $or: [
        { class: new RegExp(`^${feeStructure.class}-`, 'i') },
        { class: feeStructure.class }
      ],
      role: 'student' 
    });
    const studentIds = students.map(s => s._id);

    // Delete all finance records for these students in this academic year
    await Finance.deleteMany({
      student: { $in: studentIds },
      academicYear: feeStructure.academicYear
    });

    // Delete the fee structure
    await FeeStructure.findByIdAndDelete(id);

    res.json({ 
      success: true, 
      message: 'Fee structure and associated finance records deleted successfully',
      studentsAffected: studentIds.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createOrder = async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(500).json({ success: false, message: 'Payment service not available' });
    }
    
    const { amount, financeId } = req.body;
    
    const options = {
      amount: amount * 100, // amount in paise
      currency: 'INR',
      receipt: `receipt_${financeId}_${Date.now()}`
    };
    
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, financeId, amount } = req.body;
    
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'YOUR_SECRET_KEY')
      .update(sign.toString())
      .digest('hex');
    
    if (razorpay_signature === expectedSign) {
      const finance = await Finance.findById(financeId);
      if (!finance) return res.status(404).json({ success: false, message: 'Finance record not found' });
      
      finance.paidAmount += amount;
      finance.pendingAmount = finance.finalPayableFee - finance.paidAmount;
      finance.transactions.push({ 
        type: 'Payment', 
        amount, 
        description: 'Online Payment via Razorpay',
        paymentMethod: 'Online',
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id
      });
      
      await finance.save();
      req.app.get('io').emit('financeUpdate', { studentId: finance.student });
      res.json({ success: true, message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid signature' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.recordOfflinePayment = async (req, res) => {
  try {
    const { financeId, amount, description } = req.body;
    const finance = await Finance.findById(financeId);
    if (!finance) return res.status(404).json({ success: false, message: 'Finance record not found' });

    finance.paidAmount += amount;
    finance.pendingAmount = finance.finalPayableFee - finance.paidAmount;
    finance.transactions.push({ 
      type: 'Payment', 
      amount, 
      description: description || 'Offline Payment',
      paymentMethod: 'Offline',
      recordedBy: req.user.id
    });

    await finance.save();
    req.app.get('io').emit('financeUpdate', { studentId: finance.student });
    res.json({ success: true, data: finance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.downloadReceipt = async (req, res) => {
  try {
    const PDFDocument = require('pdfkit');
    const finance = await Finance.findById(req.params.id).populate('student', 'name email rollNumber class');
    if (!finance) return res.status(404).json({ success: false, message: 'Finance record not found' });

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=receipt-${finance.student.rollNumber}.pdf`);
    doc.pipe(res);

    // Header
    doc.fontSize(20).text('FEE RECEIPT', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Receipt Date: ${new Date().toLocaleDateString()}`, { align: 'right' });
    doc.moveDown();

    // Student Details
    doc.fontSize(12).text('Student Details:', { underline: true });
    doc.fontSize(10).text(`Name: ${finance.student.name}`);
    doc.text(`Roll Number: ${finance.student.rollNumber}`);
    doc.text(`Class: ${finance.student.class}`);
    doc.text(`Email: ${finance.student.email}`);
    doc.text(`Academic Year: ${finance.academicYear}`);
    doc.moveDown();

    // Fee Summary
    doc.fontSize(12).text('Fee Summary:', { underline: true });
    doc.fontSize(10).text(`Total Fee: ₹${finance.totalFee.toLocaleString()}`);
    if (finance.scholarshipDiscount > 0) {
      doc.text(`Scholarship Discount: -₹${finance.scholarshipDiscount.toLocaleString()}`);
    }
    doc.text(`Final Payable Fee: ₹${finance.finalPayableFee.toLocaleString()}`);
    doc.text(`Amount Paid: ₹${finance.paidAmount.toLocaleString()}`, { color: 'green' });
    doc.text(`Pending Amount: ₹${finance.pendingAmount.toLocaleString()}`, { color: finance.pendingAmount > 0 ? 'red' : 'green' });
    doc.moveDown();

    // Payment History
    doc.fontSize(12).text('Payment History:', { underline: true });
    const payments = finance.transactions.filter(t => t.type === 'Payment');
    if (payments.length > 0) {
      payments.forEach((payment, i) => {
        doc.fontSize(10).text(`${i + 1}. Date: ${new Date(payment.date).toLocaleString()}`);
        doc.text(`   Amount: ₹${payment.amount.toLocaleString()}`);
        doc.text(`   Payment Method: ${payment.paymentMethod || 'N/A'}`);
        doc.text(`   Description: ${payment.description}`);
        if (payment.paymentId) doc.text(`   Transaction ID: ${payment.paymentId}`);
        doc.moveDown(0.5);
      });
    } else {
      doc.fontSize(10).text('No payments recorded yet.');
    }

    doc.end();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
