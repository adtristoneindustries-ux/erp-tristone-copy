const Badge = require('../models/Badge');
const StudentBadge = require('../models/StudentBadge');
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
        studentBadgeId: studentBadge?._id
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
