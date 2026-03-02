const Scholarship = require('../models/Scholarship');
const Finance = require('../models/Finance');
const Mark = require('../models/Mark');
const Attendance = require('../models/Attendance');

exports.applyScholarship = async (req, res) => {
  try {
    const { scholarshipType, academicYear, reason, familyIncome, previousScholarship, documents } = req.body;
    const eligibility = await checkEligibility(req.user.id);
    
    const scholarship = new Scholarship({
      student: req.user.id,
      scholarshipType,
      academicYear,
      reason,
      familyIncome,
      previousScholarship,
      documents,
      eligibilityScore: eligibility.score,
      autoEligible: eligibility.eligible,
      renewalStatus: previousScholarship ? 'Renewal' : 'New',
      auditLog: [{ action: 'Application Submitted', performedBy: req.user.id, remarks: 'Student applied' }]
    });

    await scholarship.save();
    req.app.get('io').emit('scholarshipUpdate', { studentId: req.user.id, status: 'Pending' });
    res.status(201).json({ success: true, data: scholarship });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getScholarships = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'student') query.student = req.user.id;
    else if (req.user.role === 'staff') query.status = { $in: ['Pending', 'Verified', 'Rejected'] };
    else if (req.user.role === 'admin' && req.query.status === 'Verified') query.status = 'Verified';

    const scholarships = await Scholarship.find(query)
      .populate('student', 'name email rollNumber class')
      .populate('staffVerifiedBy', 'name')
      .populate('adminApprovedBy', 'name')
      .sort('-createdAt');

    res.json({ success: true, data: scholarships });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifyScholarship = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const scholarship = await Scholarship.findById(id);
    if (!scholarship) return res.status(404).json({ success: false, message: 'Scholarship not found' });

    scholarship.status = status;
    scholarship.staffRemarks = remarks;
    scholarship.staffVerifiedBy = req.user.id;
    scholarship.staffVerifiedDate = new Date();
    scholarship.auditLog.push({ action: `Staff ${status}`, performedBy: req.user.id, remarks });

    await scholarship.save();
    req.app.get('io').emit('scholarshipUpdate', { studentId: scholarship.student, status: scholarship.status });
    res.json({ success: true, data: scholarship });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.approveScholarship = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, amount, amountType, validFrom, validTo, remarks } = req.body;

    const scholarship = await Scholarship.findById(id).populate('student');
    if (!scholarship) return res.status(404).json({ success: false, message: 'Scholarship not found' });

    scholarship.status = status;
    scholarship.adminRemarks = remarks;
    scholarship.adminApprovedBy = req.user.id;
    scholarship.adminApprovedDate = new Date();
    
    if (status === 'Approved') {
      scholarship.amount = amount;
      scholarship.amountType = amountType;
      scholarship.validFrom = validFrom;
      scholarship.validTo = validTo;
      await updateFinance(scholarship);
    }

    scholarship.auditLog.push({ action: `Admin ${status}`, performedBy: req.user.id, remarks });
    await scholarship.save();
    
    req.app.get('io').emit('scholarshipUpdate', { studentId: scholarship.student._id, status, amount });
    res.json({ success: true, data: scholarship });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getScholarshipById = async (req, res) => {
  try {
    const scholarship = await Scholarship.findById(req.params.id)
      .populate('student', 'name email rollNumber class')
      .populate('staffVerifiedBy', 'name')
      .populate('adminApprovedBy', 'name')
      .populate('auditLog.performedBy', 'name');

    if (!scholarship) return res.status(404).json({ success: false, message: 'Scholarship not found' });
    res.json({ success: true, data: scholarship });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getScholarshipAnalytics = async (req, res) => {
  try {
    const total = await Scholarship.countDocuments();
    const pending = await Scholarship.countDocuments({ status: 'Pending' });
    const verified = await Scholarship.countDocuments({ status: 'Verified' });
    const approved = await Scholarship.countDocuments({ status: 'Approved' });
    const rejected = await Scholarship.countDocuments({ status: 'Rejected' });

    const totalAmount = await Scholarship.aggregate([
      { $match: { status: 'Approved' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const byType = await Scholarship.aggregate([
      { $group: { _id: '$scholarshipType', count: { $sum: 1 } } }
    ]);

    const byClass = await Scholarship.aggregate([
      { $match: { status: 'Approved' } },
      { $lookup: { from: 'users', localField: 'student', foreignField: '_id', as: 'studentInfo' } },
      { $unwind: '$studentInfo' },
      { $group: { _id: '$studentInfo.class', count: { $sum: 1 }, totalAmount: { $sum: '$amount' } } }
    ]);

    res.json({
      success: true,
      data: { total, pending, verified, approved, rejected, totalAmount: totalAmount[0]?.total || 0, byType, byClass }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.bulkVerify = async (req, res) => {
  try {
    const { scholarshipIds, status, remarks } = req.body;
    
    await Scholarship.updateMany(
      { _id: { $in: scholarshipIds }, status: 'Pending' },
      { 
        $set: { 
          status, 
          staffRemarks: remarks, 
          staffVerifiedBy: req.user.id, 
          staffVerifiedDate: new Date() 
        },
        $push: { auditLog: { action: `Bulk ${status}`, performedBy: req.user.id, remarks } }
      }
    );

    res.json({ success: true, message: `${scholarshipIds.length} scholarships ${status.toLowerCase()}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.revokeScholarship = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const scholarship = await Scholarship.findById(id).populate('student');
    if (!scholarship || scholarship.status !== 'Approved') {
      return res.status(400).json({ success: false, message: 'Cannot revoke this scholarship' });
    }

    // Revert finance
    const finance = await Finance.findOne({ student: scholarship.student._id, academicYear: scholarship.academicYear });
    if (finance) {
      const discountAmount = scholarship.amountType === 'Percentage'
        ? (finance.totalFee * scholarship.amount) / 100 : scholarship.amount;
      
      finance.scholarshipDiscount -= discountAmount;
      finance.finalPayableFee = finance.totalFee - finance.scholarshipDiscount;
      finance.pendingAmount = finance.finalPayableFee - finance.paidAmount;
      finance.scholarships = finance.scholarships.filter(s => s.scholarshipId.toString() !== id);
      finance.transactions.push({ type: 'Refund', amount: discountAmount, description: `Scholarship Revoked: ${reason}`, reference: id });
      await finance.save();
    }

    scholarship.status = 'Rejected';
    scholarship.adminRemarks = `Revoked: ${reason}`;
    scholarship.auditLog.push({ action: 'Scholarship Revoked', performedBy: req.user.id, remarks: reason });
    await scholarship.save();

    req.app.get('io').emit('scholarshipUpdate', { studentId: scholarship.student._id, status: 'Rejected' });
    res.json({ success: true, message: 'Scholarship revoked successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getScholarshipHistory = async (req, res) => {
  try {
    const { studentId } = req.params;
    const scholarships = await Scholarship.find({ student: studentId })
      .populate('staffVerifiedBy', 'name')
      .populate('adminApprovedBy', 'name')
      .sort('-createdAt');

    res.json({ success: true, data: scholarships });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.exportScholarships = async (req, res) => {
  try {
    const scholarships = await Scholarship.find()
      .populate('student', 'name email rollNumber class')
      .populate('staffVerifiedBy', 'name')
      .populate('adminApprovedBy', 'name');

    const csvData = scholarships.map(s => ({
      StudentName: s.student?.name,
      RollNumber: s.student?.rollNumber,
      Class: s.student?.class,
      Type: s.scholarshipType,
      Year: s.academicYear,
      Status: s.status,
      Amount: s.amount || 0,
      EligibilityScore: s.eligibilityScore,
      ApplicationDate: new Date(s.applicationDate).toLocaleDateString(),
      StaffRemarks: s.staffRemarks || '',
      AdminRemarks: s.adminRemarks || ''
    }));

    res.json({ success: true, data: csvData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

async function checkEligibility(studentId) {
  try {
    const marks = await Mark.find({ student: studentId }).sort('-createdAt').limit(5);
    const avgMarks = marks.length > 0 ? marks.reduce((sum, m) => sum + m.marks, 0) / marks.length : 0;

    const attendance = await Attendance.find({ student: studentId });
    const attendanceRate = attendance.length > 0
      ? (attendance.filter(a => a.status === 'Present').length / attendance.length) * 100 : 0;

    const score = (avgMarks * 0.7) + (attendanceRate * 0.3);
    return { score: score.toFixed(2), eligible: score >= 60 };
  } catch (error) {
    return { score: 0, eligible: false };
  }
}

async function updateFinance(scholarship) {
  try {
    let finance = await Finance.findOne({ student: scholarship.student._id, academicYear: scholarship.academicYear });
    const discountAmount = scholarship.amountType === 'Percentage'
      ? (finance?.totalFee || 50000) * scholarship.amount / 100 : scholarship.amount;

    if (!finance) {
      finance = new Finance({
        student: scholarship.student._id,
        academicYear: scholarship.academicYear,
        totalFee: 50000,
        scholarshipDiscount: discountAmount,
        finalPayableFee: 50000 - discountAmount,
        pendingAmount: 50000 - discountAmount,
        scholarships: [{ scholarshipId: scholarship._id, amount: discountAmount, appliedDate: new Date() }],
        transactions: [{ type: 'Scholarship', amount: discountAmount, description: `${scholarship.scholarshipType} Scholarship`, reference: scholarship._id }]
      });
    } else {
      finance.scholarshipDiscount += discountAmount;
      finance.finalPayableFee = finance.totalFee - finance.scholarshipDiscount;
      finance.pendingAmount = finance.finalPayableFee - finance.paidAmount;
      finance.scholarships.push({ scholarshipId: scholarship._id, amount: discountAmount, appliedDate: new Date() });
      finance.transactions.push({ type: 'Scholarship', amount: discountAmount, description: `${scholarship.scholarshipType} Scholarship`, reference: scholarship._id });
    }
    await finance.save();
  } catch (error) {
    console.error('Finance update error:', error);
  }
}
