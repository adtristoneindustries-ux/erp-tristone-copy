const express = require('express');
const router = express.Router();
const {
  getScholarships, createScholarship, updateScholarship, deleteScholarship,
  applyScholarship, getMyApplications, getAllApplications, reviewApplication, getAnalytics
} = require('../controllers/scholarshipController');
const { protect, authorize } = require('../middleware/auth');

router.get('/analytics', protect, authorize('admin', 'staff'), getAnalytics);
router.get('/applications', protect, authorize('admin', 'staff'), getAllApplications);
router.get('/my-applications', protect, authorize('student'), getMyApplications);
router.post('/apply', protect, authorize('student'), applyScholarship);
router.put('/applications/:id/review', protect, authorize('admin'), reviewApplication);

router.get('/', protect, getScholarships);
router.post('/', protect, authorize('admin'), createScholarship);
router.put('/:id', protect, authorize('admin'), updateScholarship);
router.delete('/:id', protect, authorize('admin'), deleteScholarship);

module.exports = router;
