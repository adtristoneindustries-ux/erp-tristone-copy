const Company = require('../models/Company');
const PlacementDrive = require('../models/PlacementDrive');
const PlacementApplication = require('../models/PlacementApplication');
const User = require('../models/User');

// ============ ADMIN STATS ============
exports.getAdminStats = async (req, res) => {
  try {
    const totalCompanies = await Company.countDocuments();
    const totalDrives = await PlacementDrive.countDocuments();
    const totalApplications = await PlacementApplication.countDocuments();
    
    const statusCounts = await PlacementApplication.aggregate([
      {
        $group: {
          _id: '$current_status',
          count: { $sum: 1 }
        }
      }
    ]);

    const stats = {
      totalCompanies,
      totalDrives,
      totalApplications,
      shortlisted: statusCounts.find(s => s._id === 'Shortlisted')?.count || 0,
      selected: statusCounts.find(s => s._id === 'Selected')?.count || 0,
      rejected: statusCounts.find(s => s._id === 'Rejected')?.count || 0,
      ongoing: await PlacementDrive.countDocuments({ status: 'ongoing' })
    };

    res.json({ data: stats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ STUDENT STATS ============
exports.getStudentStats = async (req, res) => {
  try {
    const studentId = req.user._id;
    
    const totalApplications = await PlacementApplication.countDocuments({ student_id: studentId });
    
    const statusCounts = await PlacementApplication.aggregate([
      { $match: { student_id: studentId } },
      {
        $group: {
          _id: '$current_status',
          count: { $sum: 1 }
        }
      }
    ]);

    const stats = {
      totalApplications,
      shortlisted: statusCounts.find(s => s._id === 'Shortlisted')?.count || 0,
      selected: statusCounts.find(s => s._id === 'Selected')?.count || 0,
      rejected: statusCounts.find(s => s._id === 'Rejected')?.count || 0,
      pending: statusCounts.find(s => s._id === 'Applied')?.count || 0
    };

    res.json({ data: stats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ COMPANIES ============
exports.getCompanies = async (req, res) => {
  try {
    const companies = await Company.find()
      .populate('assigned_officer_id', 'name email department')
      .populate('created_by', 'name email')
      .sort({ createdAt: -1 });
    res.json({ data: companies });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createCompany = async (req, res) => {
  try {
    const company = new Company({
      ...req.body,
      created_by: req.user._id
    });
    await company.save();
    
    // Update staff hasPlacementAccess if assigned
    if (req.body.assigned_officer_id) {
      await User.findByIdAndUpdate(req.body.assigned_officer_id, { hasPlacementAccess: true });
    }
    
    res.status(201).json({ data: company, message: 'Company created successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('assigned_officer_id', 'name email department')
      .populate('created_by', 'name email');
    
    // Update staff hasPlacementAccess if assigned
    if (req.body.assigned_officer_id) {
      await User.findByIdAndUpdate(req.body.assigned_officer_id, { hasPlacementAccess: true });
    }
    
    res.json({ data: company, message: 'Company updated successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteCompany = async (req, res) => {
  try {
    await Company.findByIdAndDelete(req.params.id);
    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ DRIVES ============
exports.getDrives = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    // If staff, show only their assigned drives
    if (req.user.role === 'staff') {
      query.assigned_officer_id = req.user._id;
    }
    
    // For students, show all open drives (no filter by officer)
    // Admin sees all drives
    
    const drives = await PlacementDrive.find(query)
      .populate('company_id')
      .populate('assigned_officer_id', 'name email department')
      .sort({ createdAt: -1 });
    
    res.json({ data: drives });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createDrive = async (req, res) => {
  try {
    const driveData = {
      ...req.body,
      assigned_officer_id: req.user.role === 'staff' ? req.user._id : req.body.assigned_officer_id
    };
    
    const drive = new PlacementDrive(driveData);
    await drive.save();
    
    // Update staff hasPlacementAccess if assigned
    if (drive.assigned_officer_id) {
      await User.findByIdAndUpdate(drive.assigned_officer_id, { hasPlacementAccess: true });
    }
    
    // Populate before sending response
    await drive.populate('company_id');
    await drive.populate('assigned_officer_id', 'name email department');
    
    res.status(201).json({ data: drive, message: 'Drive created successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateDrive = async (req, res) => {
  try {
    const drive = await PlacementDrive.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('company_id')
      .populate('assigned_officer_id', 'name email department');
    
    // Update staff hasPlacementAccess if assigned
    if (req.body.assigned_officer_id) {
      await User.findByIdAndUpdate(req.body.assigned_officer_id, { hasPlacementAccess: true });
    }
    
    res.json({ data: drive, message: 'Drive updated successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteDrive = async (req, res) => {
  try {
    await PlacementDrive.findByIdAndDelete(req.params.id);
    // Also delete all applications for this drive
    await PlacementApplication.deleteMany({ drive_id: req.params.id });
    res.json({ message: 'Drive deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============ APPLICATIONS ============
exports.getApplications = async (req, res) => {
  try {
    const { drive_id } = req.query;
    const query = {};
    
    if (drive_id) {
      query.drive_id = drive_id;
    }
    
    // If student, show only their applications
    if (req.user.role === 'student') {
      query.student_id = req.user._id;
    }
    
    const applications = await PlacementApplication.find(query)
      .populate({
        path: 'drive_id',
        populate: { path: 'company_id' }
      })
      .populate('student_id', 'name email rollNumber department year cgpa arrears_count skills resume_url')
      .sort({ applied_date: -1 });
    
    res.json({ data: applications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createApplication = async (req, res) => {
  try {
    const { drive_id } = req.body;
    const student_id = req.user._id;
    
    // Check if already applied
    const existing = await PlacementApplication.findOne({ drive_id, student_id });
    if (existing) {
      return res.status(400).json({ message: 'You have already applied to this drive' });
    }
    
    // Check eligibility
    const drive = await PlacementDrive.findById(drive_id);
    const student = await User.findById(student_id);
    
    if (student.cgpa < drive.eligibility_cgpa) {
      return res.status(400).json({ message: 'CGPA requirement not met' });
    }
    
    if (student.arrears_count > drive.arrears_limit) {
      return res.status(400).json({ message: 'Arrears exceed limit' });
    }
    
    if (drive.eligible_departments && drive.eligible_departments.length > 0 && !drive.eligible_departments.includes(student.department)) {
      return res.status(400).json({ message: 'Department not eligible' });
    }
    
    if (drive.eligible_years && drive.eligible_years.length > 0 && !drive.eligible_years.includes(student.year)) {
      return res.status(400).json({ message: 'Year not eligible' });
    }
    
    const application = new PlacementApplication({
      drive_id,
      student_id,
      status_history: [{
        status: 'Applied',
        updated_at: new Date()
      }]
    });
    
    await application.save();
    
    res.status(201).json({ data: application, message: 'Application submitted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const application = await PlacementApplication.findById(req.params.id);
    
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    application.current_status = status;
    application.status_history.push({
      status,
      updated_by: req.user._id,
      updated_at: new Date(),
      remarks: req.body.remarks || ''
    });
    
    await application.save();
    
    res.json({ data: application, message: 'Status updated successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
