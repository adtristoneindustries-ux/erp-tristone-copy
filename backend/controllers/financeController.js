const Finance = require('../models/Finance');
const FeeStructure = require('../models/FeeStructure');
const User = require('../models/User');

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
      return res.status(400).json({ success: false, message: 'Fee structure already exists for this class and year' });
    }

    const feeStructure = await FeeStructure.create({ class: className, academicYear, components, totalAmount });
    
    const students = await User.find({ 
      class: new RegExp(`^${className}-`, 'i'),
      role: 'student' 
    });
    
    const financeRecords = students.map(student => ({
      student: student._id,
      academicYear,
      totalFee: totalAmount,
      finalPayableFee: totalAmount,
      pendingAmount: totalAmount,
      transactions: [{ type: 'Fee', amount: totalAmount, description: `Fee Structure Applied for Class ${className}` }]
    }));

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
      class: new RegExp(`^${feeStructure.class}-`, 'i'),
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
