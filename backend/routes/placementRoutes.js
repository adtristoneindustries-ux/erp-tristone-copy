const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createCompany,
  getCompanies,
  updateCompany,
  deleteCompany,
  createDrive,
  getDrives,
  updateDrive,
  deleteDrive,
  applyToDrive,
  getApplications,
  updateApplicationStatus,
  getApplicationHistory,
  getAdminStats,
  getStudentStats,
  updateStudentProfile
} = require('../controllers/placementController');

// Company routes (Admin only)
router.post('/companies', protect, authorize('admin'), createCompany);
router.get('/companies', protect, getCompanies);
router.put('/companies/:id', protect, authorize('admin'), updateCompany);
router.delete('/companies/:id', protect, authorize('admin'), deleteCompany);

// Placement Drive routes
router.post('/drives', protect, authorize('admin', 'staff'), createDrive);
router.get('/drives', protect, getDrives);
router.put('/drives/:id', protect, authorize('admin', 'staff'), updateDrive);
router.delete('/drives/:id', protect, authorize('admin'), deleteDrive);

// Application routes
router.post('/applications', protect, authorize('student'), applyToDrive);
router.get('/applications', protect, getApplications);
router.put('/applications/:id/status', protect, authorize('staff'), updateApplicationStatus);
router.get('/applications/:id/history', protect, getApplicationHistory);

// Dashboard stats
router.get('/stats/admin', protect, authorize('admin'), getAdminStats);
router.get('/stats/student', protect, authorize('student'), getStudentStats);

// Student profile
router.put('/profile/student', protect, authorize('student'), updateStudentProfile);

module.exports = router;
