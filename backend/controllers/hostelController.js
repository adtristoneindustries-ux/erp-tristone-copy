const Hostel = require('../models/Hostel');
const HostelIssue = require('../models/HostelIssue');

// Get student's hostel details
exports.getMyHostel = async (req, res) => {
  try {
    const hostel = await Hostel.findOne({ student: req.user.id }).populate('student', 'name email rollNumber');
    
    if (!hostel) {
      return res.status(404).json({ success: false, message: 'No hostel assigned' });
    }

    res.json({ success: true, data: hostel });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Raise a hostel issue
exports.raiseIssue = async (req, res) => {
  try {
    const { issueType, description, priority } = req.body;

    const issue = await HostelIssue.create({
      student: req.user.id,
      issueType,
      description,
      priority: priority || 'Medium'
    });

    res.status(201).json({ success: true, data: issue, message: 'Issue raised successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get student's issues
exports.getMyIssues = async (req, res) => {
  try {
    const issues = await HostelIssue.find({ student: req.user.id })
      .sort({ createdAt: -1 })
      .populate('student', 'name email');

    res.json({ success: true, data: issues });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get all hostels
exports.getAllHostels = async (req, res) => {
  try {
    const hostels = await Hostel.find().populate('student', 'name email rollNumber class');
    res.json({ success: true, data: hostels });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Create hostel assignment
exports.createHostel = async (req, res) => {
  try {
    const hostel = await Hostel.create(req.body);
    res.status(201).json({ success: true, data: hostel });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Update hostel
exports.updateHostel = async (req, res) => {
  try {
    const hostel = await Hostel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: hostel });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get all issues
exports.getAllIssues = async (req, res) => {
  try {
    const issues = await HostelIssue.find()
      .sort({ createdAt: -1 })
      .populate('student', 'name email rollNumber');
    res.json({ success: true, data: issues });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Update issue status
exports.updateIssueStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updateData = { status };
    
    if (status === 'Resolved' || status === 'Closed') {
      updateData.resolvedAt = new Date();
      updateData.resolvedBy = req.user.id;
    }

    const issue = await HostelIssue.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json({ success: true, data: issue });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
