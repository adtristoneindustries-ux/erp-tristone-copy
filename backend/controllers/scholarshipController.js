const { Scholarship, ScholarshipApplication } = require('../models/Scholarship');
const Finance = require('../models/Finance');
const User = require('../models/User');

// Admin: Create scholarship
exports.createScholarship = async (req, res) => {
  try {
    const scholarship = await Scholarship.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: scholarship });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all scholarships (admin gets all, student gets active ones)
exports.getScholarships = async (req, res) => {
  try {
    const query = req.user.role === 'student' ? { status: 'Active' } : {};
    const scholarships = await Scholarship.find(query).sort('-createdAt');
    res.json({ success: true, data: scholarships });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateScholarship = async (req, res) => {
  try {
    const scholarship = await Scholarship.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: scholarship });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteScholarship = async (req, res) => {
  try {
    await Scholarship.findByIdAndDelete(req.params.id);
    await ScholarshipApplication.deleteMany({ scholarship: req.params.id });
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Student: Apply for a scholarship
exports.applyScholarship = async (req, res) => {
  try {
    const { scholarshipId, reason, familyIncome, previousScholarship } = req.body;
    const existing = await ScholarshipApplication.findOne({ scholarship: scholarshipId, student: req.user._id });
    if (existing) return res.status(400).json({ success: false, message: 'Already applied for this scholarship' });

    const scholarship = await Scholarship.findById(scholarshipId);
    if (!scholarship || scholarship.status !== 'Active') {
      return res.status(400).json({ success: false, message: 'Scholarship not available' });
    }

    const application = await ScholarshipApplication.create({
      scholarship: scholarshipId,
      student: req.user._id,
      academicYear: scholarship.academicYear,
      reason,
      familyIncome,
      previousScholarship,
      appliedDate: new Date()
    });

    res.status(201).json({ success: true, data: application });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Student: Get my applications
exports.getMyApplications = async (req, res) => {
  try {
    const applications = await ScholarshipApplication.find({ student: req.user._id })
      .populate('scholarship', 'name type amount amountType academicYear description eligibilityCriteria')
      .sort('-appliedDate');
    res.json({ success: true, data: applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin/Staff: Get all applications
exports.getAllApplications = async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const applications = await ScholarshipApplication.find(query)
      .populate('scholarship', 'name type amount amountType')
      .populate('student', 'name email rollNumber class section')
      .sort('-appliedDate');
    res.json({ success: true, data: applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Approve or Reject application
exports.reviewApplication = async (req, res) => {
  try {
    const { status, adminRemarks, approvedAmount, approvedAmountType, validFrom, validTo } = req.body;
    const application = await ScholarshipApplication.findById(req.params.id)
      .populate('scholarship')
      .populate('student');

    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    application.status = status;
    application.adminRemarks = adminRemarks;
    application.approvedDate = new Date();

    if (status === 'Approved') {
      application.approvedAmount = approvedAmount || application.scholarship.amount;
      application.approvedAmountType = approvedAmountType || application.scholarship.amountType;
      application.validFrom = validFrom;
      application.validTo = validTo;

      // Update student's Finance record
      const finance = await Finance.findOne({ student: application.student._id, academicYear: application.academicYear });
      if (finance) {
        let discountAmount = application.approvedAmount;
        if (application.approvedAmountType === 'Percentage') {
          discountAmount = (finance.totalFee * application.approvedAmount) / 100;
        }
        finance.scholarshipDiscount += discountAmount;
        finance.finalPayableFee = finance.totalFee - finance.scholarshipDiscount;
        finance.pendingAmount = finance.finalPayableFee - finance.paidAmount;
        finance.transactions.push({
          type: 'Scholarship',
          amount: discountAmount,
          description: `Scholarship Approved: ${application.scholarship.name}`,
          paymentMethod: 'N/A'
        });
        await finance.save();
      }
    }

    await application.save();

    if (req.app.get('io')) {
      req.app.get('io').emit('scholarshipUpdate', { studentId: application.student._id, status });
    }

    res.json({ success: true, data: application });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Analytics
exports.getAnalytics = async (req, res) => {
  try {
    const total = await ScholarshipApplication.countDocuments();
    const pending = await ScholarshipApplication.countDocuments({ status: 'Pending' });
    const verified = await ScholarshipApplication.countDocuments({ status: 'Verified' });
    const approved = await ScholarshipApplication.countDocuments({ status: 'Approved' });
    const rejected = await ScholarshipApplication.countDocuments({ status: 'Rejected' });
    const totalScholarships = await Scholarship.countDocuments();

    const approvedApps = await ScholarshipApplication.find({ status: 'Approved' });
    const totalAmount = approvedApps.reduce((sum, a) => sum + (a.approvedAmount || 0), 0);

    res.json({ success: true, data: { total, pending, verified, approved, rejected, totalScholarships, totalAmount } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
