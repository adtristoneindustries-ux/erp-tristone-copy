const Badge = require('../models/Badge');
const StudentBadge = require('../models/StudentBadge');
const StudentAttendance = require('../models/StudentAttendance');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for certificate uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/certificates';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `cert-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|pdf/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) cb(null, true);
    else cb(new Error('Only PDF, JPG, PNG files allowed'));
  }
}).single('certificate');

// Calculate Perfect Attendance
const calculatePerfectAttendance = async (studentId) => {
  const currentMonth = new Date();
  const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

  const attendance = await StudentAttendance.find({
    student: studentId,
    date: { $gte: startOfMonth, $lte: endOfMonth }
  });

  const totalDays = attendance.length;
  const presentDays = attendance.filter(a => a.status === 'present').length;
  
  return totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
};

// Auto-assign Perfect Attendance badge
const autoAssignPerfectAttendance = async (studentId, io) => {
  const badge = await Badge.findOne({ calculationType: 'perfect_attendance', isActive: true });
  if (!badge) return;

  const progress = await calculatePerfectAttendance(studentId);
  
  let studentBadge = await StudentBadge.findOne({ student: studentId, badge: badge._id });
  
  if (progress === 100) {
    if (studentBadge) {
      if (studentBadge.status !== 'earned') {
        studentBadge.status = 'earned';
        studentBadge.earnedDate = new Date();
        studentBadge.progress = 100;
        await studentBadge.save();
        io.emit('badgeUpdate', { studentId });
      }
    } else {
      studentBadge = new StudentBadge({
        student: studentId,
        badge: badge._id,
        status: 'earned',
        earnedDate: new Date(),
        progress: 100
      });
      await studentBadge.save();
      io.emit('badgeUpdate', { studentId });
    }
  } else {
    if (studentBadge) {
      studentBadge.progress = progress;
      studentBadge.status = progress > 0 ? 'locked' : 'locked';
      await studentBadge.save();
    } else {
      studentBadge = new StudentBadge({
        student: studentId,
        badge: badge._id,
        progress,
        status: 'locked'
      });
      await studentBadge.save();
    }
  }
};

// Get all badges
exports.getAllBadges = async (req, res) => {
  try {
    const badges = await Badge.find({ isActive: true });
    res.json({ success: true, data: badges });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get student badges with progress
exports.getStudentBadges = async (req, res) => {
  try {
    const studentId = req.user.role === 'student' ? req.user.id : req.query.studentId;
    
    // Auto-calculate Perfect Attendance
    await autoAssignPerfectAttendance(studentId, req.io);
    
    const badges = await Badge.find({ isActive: true });
    const studentBadges = await StudentBadge.find({ student: studentId }).populate('badge');
    
    const result = badges.map(badge => {
      const studentBadge = studentBadges.find(sb => sb.badge._id.toString() === badge._id.toString());
      return {
        _id: badge._id,
        name: badge.name,
        icon: badge.icon,
        category: badge.category,
        description: badge.description,
        status: studentBadge?.status || 'locked',
        progress: studentBadge?.progress || 0,
        certificateUrl: studentBadge?.certificateUrl,
        earnedDate: studentBadge?.earnedDate,
        studentBadgeId: studentBadge?._id,
        autoCalculate: badge.autoCalculate,
        calculationType: badge.calculationType
      };
    });

    const earned = result.filter(b => b.status === 'earned').length;
    const total = badges.length;
    const percentage = total > 0 ? Math.round((earned / total) * 100) : 0;

    res.json({ success: true, data: result, stats: { earned, total, percentage } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Upload certificate
exports.uploadCertificate = (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    
    try {
      const { badgeId } = req.body;
      const studentId = req.user.id;
      const certificateUrl = `/uploads/certificates/${req.file.filename}`;

      let studentBadge = await StudentBadge.findOne({ student: studentId, badge: badgeId });
      
      if (studentBadge) {
        studentBadge.certificateUrl = certificateUrl;
        studentBadge.status = 'pending';
      } else {
        studentBadge = new StudentBadge({
          student: studentId,
          badge: badgeId,
          certificateUrl,
          status: 'pending'
        });
      }
      
      await studentBadge.save();
      req.io.emit('badgeUpdate', { studentId });
      
      res.json({ success: true, message: 'Certificate uploaded successfully', data: studentBadge });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });
};

// Get pending approvals (Admin)
exports.getPendingApprovals = async (req, res) => {
  try {
    const pending = await StudentBadge.find({ status: 'pending' })
      .populate('student', 'name email rollNumber class')
      .populate('badge');
    res.json({ success: true, data: pending });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Approve/Reject certificate (Admin)
exports.approveCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'approve' or 'reject'
    
    const studentBadge = await StudentBadge.findById(id);
    if (!studentBadge) return res.status(404).json({ success: false, message: 'Not found' });
    
    if (action === 'approve') {
      studentBadge.status = 'earned';
      studentBadge.earnedDate = new Date();
      studentBadge.approvedBy = req.user.id;
      studentBadge.progress = 100;
    } else {
      studentBadge.status = 'locked';
      studentBadge.certificateUrl = null;
    }
    
    await studentBadge.save();
    req.io.emit('badgeUpdate', { studentId: studentBadge.student });
    
    res.json({ success: true, message: `Certificate ${action}d successfully`, data: studentBadge });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create badge (Admin)
exports.createBadge = async (req, res) => {
  try {
    const badge = new Badge(req.body);
    await badge.save();
    res.json({ success: true, message: 'Badge created successfully', data: badge });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update badge (Admin)
exports.updateBadge = async (req, res) => {
  try {
    const badge = await Badge.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, message: 'Badge updated successfully', data: badge });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete badge (Admin)
exports.deleteBadge = async (req, res) => {
  try {
    await Badge.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Badge deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get approved badges history (Admin)
exports.getApprovedBadges = async (req, res) => {
  try {
    const approved = await StudentBadge.find({ status: 'earned' })
      .populate('student', 'name email rollNumber class')
      .populate('badge')
      .populate('approvedBy', 'name')
      .sort({ earnedDate: -1 });
    res.json({ success: true, data: approved });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Assign badge to student (Admin)
exports.assignBadge = async (req, res) => {
  try {
    const { studentId, badgeId } = req.body;
    
    let studentBadge = await StudentBadge.findOne({ student: studentId, badge: badgeId });
    
    if (studentBadge) {
      studentBadge.status = 'earned';
      studentBadge.earnedDate = new Date();
      studentBadge.approvedBy = req.user.id;
      studentBadge.progress = 100;
    } else {
      studentBadge = new StudentBadge({
        student: studentId,
        badge: badgeId,
        status: 'earned',
        earnedDate: new Date(),
        approvedBy: req.user.id,
        progress: 100
      });
    }
    
    await studentBadge.save();
    req.io.emit('badgeUpdate', { studentId });
    
    res.json({ success: true, message: 'Badge assigned successfully', data: studentBadge });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
