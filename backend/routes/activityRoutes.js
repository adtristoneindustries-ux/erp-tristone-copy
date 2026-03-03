const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getActivities,
  getActivity,
  createActivity,
  updateActivity,
  deleteActivity,
  enrollActivity,
  getMyEnrollments
} = require('../controllers/activityController');

router.get('/', protect, getActivities);
router.get('/my-enrollments', protect, getMyEnrollments);
router.get('/:id', protect, getActivity);
router.post('/', protect, authorize('admin'), createActivity);
router.put('/:id', protect, authorize('admin'), updateActivity);
router.delete('/:id', protect, authorize('admin'), deleteActivity);
router.post('/enroll', protect, authorize('student'), enrollActivity);

module.exports = router;
