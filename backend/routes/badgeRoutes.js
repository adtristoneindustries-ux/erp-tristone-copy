const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const badgeController = require('../controllers/badgeController');

// Student routes
router.get('/student', protect, authorize('student'), badgeController.getStudentBadges);
router.post('/upload-certificate', protect, authorize('student'), badgeController.uploadCertificate);

// Admin routes
router.get('/', protect, authorize('admin'), badgeController.getAllBadges);
router.post('/', protect, authorize('admin'), badgeController.createBadge);
router.put('/:id', protect, authorize('admin'), badgeController.updateBadge);
router.delete('/:id', protect, authorize('admin'), badgeController.deleteBadge);
router.get('/pending', protect, authorize('admin'), badgeController.getPendingApprovals);
router.put('/approve/:id', protect, authorize('admin'), badgeController.approveCertificate);
router.post('/assign', protect, authorize('admin'), badgeController.assignBadge);

module.exports = router;
