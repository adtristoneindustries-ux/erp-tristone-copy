const Company = require('../models/Company');
const PlacementDrive = require('../models/PlacementDrive');
const Application = require('../models/Application');
const ApplicationStatusHistory = require('../models/ApplicationStatusHistory');
const User = require('../models/User');

// Company Management
exports.createCompany = async (req, res) => {
  try {
    const company = await Company.create({ ...req.body, created_by: req.user.id });
    res.status(201).json({ success: true, data: company });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getCompanies = async (req, res) => {
  try {
    const query = {};
    if (req.user.role === 'staff') {
      query.assigned_officer_id = req.user.id;
    }
    const companies = await Company.find(query).populate('created_by', 'name email').sort('-created_at');
    res.json({ success: true, data: companies });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: company });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteCompany = async (req, res) => {
  try {
    await Company.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Company deleted' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Placement Drive Management
exports.createDrive = async (req, res) => {
  try {
    // Auto-assign to current user if staff
    if (req.user.role === 'staff' && !req.body.assigned_officer_id) {
      req.body.assigned_officer_id = req.user.id;
    }
    
    const drive = await PlacementDrive.create(req.body);
    
    // Grant placement access to assigned officer
    if (req.body.assigned_officer_id) {
      await User.findByIdAndUpdate(req.body.assigned_officer_id, { hasPlacementAccess: true });
    }
    
    res.status(201).json({ success: true, data: drive });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getDrives = async (req, res) => {
  try {
    const query = {};
    if (req.user.role === 'staff') {
      query.assigned_officer_id = req.user.id;
    }
    if (req.query.status) query.status = req.query.status;
    
    const drives = await PlacementDrive.find(query)
      .populate('company_id')
      .populate('assigned_officer_id', 'name email')
      .sort('-drive_date');
    res.json({ success: true, data: drives });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateDrive = async (req, res) => {
  try {
    const drive = await PlacementDrive.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    // Grant placement access to newly assigned officer
    if (req.body.assigned_officer_id) {
      await User.findByIdAndUpdate(req.body.assigned_officer_id, { hasPlacementAccess: true });
    }
    
    res.json({ success: true, data: drive });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteDrive = async (req, res) => {
  try {
    await PlacementDrive.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Drive deleted' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Application Management
exports.applyToDrive = async (req, res) => {
  try {
    const { drive_id } = req.body;
    const student = await User.findById(req.user.id);
    const drive = await PlacementDrive.findById(drive_id);

    if (!drive) return res.status(404).json({ success: false, message: 'Drive not found' });
    
    // Check application deadline
    if (new Date() > new Date(drive.application_deadline)) {
      return res.status(400).json({ success: false, message: 'Application deadline has passed' });
    }
    
    // Check eligibility
    if (student.cgpa < drive.eligibility_cgpa) {
      return res.status(400).json({ success: false, message: 'CGPA not eligible' });
    }
    if (student.arrears_count > drive.arrears_limit) {
      return res.status(400).json({ success: false, message: 'Arrears exceed limit' });
    }
    
    // Check department eligibility
    if (drive.eligible_departments && drive.eligible_departments.length > 0) {
      if (!drive.eligible_departments.includes(student.department)) {
        return res.status(400).json({ success: false, message: 'Your department is not eligible' });
      }
    }
    
    // Check year eligibility
    if (drive.eligible_years && drive.eligible_years.length > 0) {
      if (!drive.eligible_years.includes(student.year)) {
        return res.status(400).json({ success: false, message: 'Your year is not eligible' });
      }
    }

    const application = await Application.create({
      student_id: req.user.id,
      drive_id
    });

    await ApplicationStatusHistory.create({
      application_id: application._id,
      status: 'Applied',
      changed_by: req.user.id
    });

    res.status(201).json({ success: true, data: application });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Already applied' });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getApplications = async (req, res) => {
  try {
    const query = {};
    if (req.user.role === 'student') {
      query.student_id = req.user.id;
    }
    if (req.query.drive_id) query.drive_id = req.query.drive_id;
    if (req.query.status) query.current_status = req.query.status;

    const applications = await Application.find(query)
      .populate('student_id', 'name email department year cgpa arrears_count resume_url skills rollNumber')
      .populate({
        path: 'drive_id',
        populate: { path: 'company_id' }
      })
      .sort('-applied_date');
    
    res.json({ success: true, data: applications });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { current_status: status, updated_at: Date.now() },
      { new: true }
    );

    await ApplicationStatusHistory.create({
      application_id: application._id,
      status,
      changed_by: req.user.id
    });

    // Emit socket event for real-time update
    if (req.app.get('io')) {
      req.app.get('io').emit('applicationStatusUpdate', {
        applicationId: application._id,
        studentId: application.student_id,
        status
      });
    }

    res.json({ success: true, data: application });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getApplicationHistory = async (req, res) => {
  try {
    const history = await ApplicationStatusHistory.find({ application_id: req.params.id })
      .populate('changed_by', 'name email')
      .sort('-changed_at');
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Dashboard Analytics
exports.getAdminStats = async (req, res) => {
  try {
    const totalCompanies = await Company.countDocuments();
    const totalDrives = await PlacementDrive.countDocuments();
    const totalApplications = await Application.countDocuments();
    const shortlisted = await Application.countDocuments({ current_status: 'Shortlisted' });
    const selected = await Application.countDocuments({ current_status: 'Selected' });
    const rejected = await Application.countDocuments({ current_status: 'Rejected' });
    const ongoing = await PlacementDrive.countDocuments({ status: 'ongoing' });

    res.json({
      success: true,
      data: {
        totalCompanies,
        totalDrives,
        totalApplications,
        shortlisted,
        selected,
        rejected,
        ongoing
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getStudentStats = async (req, res) => {
  try {
    const totalApplications = await Application.countDocuments({ student_id: req.user.id });
    const shortlisted = await Application.countDocuments({ student_id: req.user.id, current_status: 'Shortlisted' });
    const selected = await Application.countDocuments({ student_id: req.user.id, current_status: 'Selected' });
    const rejected = await Application.countDocuments({ student_id: req.user.id, current_status: 'Rejected' });

    res.json({
      success: true,
      data: {
        totalApplications,
        shortlisted,
        selected,
        rejected
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update student profile
exports.updateStudentProfile = async (req, res) => {
  try {
    const { cgpa, arrears_count, resume_url, skills, portfolio_link, year, department } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { cgpa, arrears_count, resume_url, skills, portfolio_link, year, department },
      { new: true }
    );
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
