const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  applyScholarship,
  getScholarships,
  verifyScholarship,
  approveScholarship,
  getScholarshipById,
  getScholarshipAnalytics,
  bulkVerify,
  revokeScholarship,
  getScholarshipHistory,
  exportScholarships
} = require('../controllers/scholarshipController');

router.post('/apply', protect, authorize('student'), applyScholarship);
router.get('/', protect, getScholarships);
router.get('/analytics', protect, authorize('admin'), getScholarshipAnalytics);
router.get('/export', protect, authorize('admin', 'staff'), exportScholarships);
router.get('/history/:studentId', protect, authorize('admin', 'staff'), getScholarshipHistory);
router.get('/:id', protect, getScholarshipById);
router.put('/:id/verify', protect, authorize('staff', 'admin'), verifyScholarship);
router.put('/:id/approve', protect, authorize('admin'), approveScholarship);
router.put('/:id/revoke', protect, authorize('admin'), revokeScholarship);
router.post('/bulk-verify', protect, authorize('staff', 'admin'), bulkVerify);

module.exports = router;
